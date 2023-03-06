import express, { NextFunction, Request, response, Response } from "express";
import path from 'path';
import * as fs from 'fs';
import { base64ToFile, fileToBase64 } from "./fileUtil";
import {FileMetadataServerDAO} from './DAO/FileMetadataServerDAO';

const bodyParser = require('body-parser')
const app = express();
const db = new FileMetadataServerDAO();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req:any, file:any, cb:any) => {
        cb(null, __dirname); // setting path
    },
    filename: (req:any, file:any, cb:any) => {
        const extname = path.extname(file.originalname);
        cb(null, file.originalname); // setting file name
    },
});
const upload = multer({ storage });
declare global {
    namespace Express {
        interface Request {
            file: any;
        }
    }
}

app.listen(4000, () => {
    console.log("server started")
});

app.get('/checkApi', (req: Request, res: Response) => {
    res.status(200).send("API running");
})

app.get('/getFileList', (req : Request, res: Response) => {
    try {
        db.getAllFiles((rows: any) => {
        res.status(200).send(rows);
        })
    } catch (ex: any) {
        console.log(ex);
        res.status(500).send({message: "Something went wrong."})
    }
})

app.get('/getFileById/:id',(req: Request, res: Response) => {
    // res.download(__dirname + '/testdownload.txt')    
        let id:number = parseInt(req.params.id)    
        try {
            db.getByFileId(id, (rows : any) => {
                if(rows.length === 0) {
                    res.status(404).send({error: "File Not found", message: "No file object found"})
                }
                let filePath: string = rows[0]["path"];
                res.download(filePath);
            })
        } catch (ex : any) {
            res.status(500).send({error: ex.Message.toString(), Message: "Error"});
        }
    })

app.get('/getByFileName',(req: Request, res: Response) => {
    console.log("request made")
    let filename = req.query.fileName
    console.log(filename)
        

    const directory = './src';
    const fs = require('fs');
    const path = require( "path" );
        fs.readdirSync(directory).forEach((file: string) => {
        
            if (filename == file) 
            {
                console.log(file)
                let absolutePath = path.resolve( directory, file );
                console.log(file)
                res.download(absolutePath);
                // fileToBase64(absolutePath).then((base64)=>{
                //     res.send(base64)
                // })
            }
        });

})

// app.post('/saveFile', upload.single('file'), async (req, res) => {
//     const filename = req.body.Name
//     const base64String = req.body.base64

//     const filepath = path.join(__dirname,filename)
//     base64ToFile(base64String,filepath).then(()=>{
//         console.log(filename+"saved");
//         // db.addFile(data, (rows: any) => {
//         //     res.json(rows);
//         // });
//         res.send("ok");
//     })
// })

app.post('/upload', upload.single('file'), async (req, res) => {
    const fileObj = {
        name: req.file.filename,
        size: req.file.size,
        content_type: req.file.mimetype,
        serverId: 1,
        path: `${req.file.destination}/${req.file.filename}`
    }
    try {
        db.addFile(fileObj, (rows: any) => {
            res.status(200).send(rows);
        });
    } catch (ex: any) {
        console.log('err: '+ ex.Message);
        fs.unlink(`${req.file.destination}/${req.file.filename}`, (err : any) => {
            if(err) throw err;
            res.status(500).send({ error : "Could not upload file", message: err.Message || "Unknown"})
        })
    }
  });

app.post('/deleteByFileName',(req: Request, res:Response) => {
    let filename:string = req.body.Filename
    
    const directory = './src/';

    fs.readdirSync(directory).forEach((file: string) => {
        if (filename == file) 
        {
            let filepath = directory+filename
            fs.unlink(filepath, (err:any) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('File has been deleted!');
                });
        }
    });
})

app.delete('/deleteFileById/:id',(req: Request, res:Response) => {
    let id:number = parseInt(req.params.id);
    db.getByFileId(id, (rows: any) => {
            console.log(rows);
            if(rows.length === 0) {
                res.status(400).send({error: "Bad Request", message: "No file object found"})
            }
            let filePath: string = rows[0]["path"];
            fs.unlink(filePath, (err : any) => {
                if(err) {
                    res.status(500).send({error : "Error deleting File from server", message: err.Message || "undefined"});
                }
                try {
                    db.deleteByFileId(id, (rows: any) => {
                       res.status(200).send({message: "Deleted file"}); 
                    });
                } catch (err : any) {
                    console.log("Error deleting in fs: " +err.Message || "undefined");
                    res.status(500).send({message: "an error occured when trying to delete file from db"});
                }
            })
    })

    
    // const directory = './src/';

    // fs.readdirSync(directory).forEach((file: string) => {
    //     if (filename == file) 
    //     {
    //         let filepath = directory+filename
    //         fs.unlink(filepath, (err:any) => {
    //             if (err) {
    //                 console.error(err);
    //                 return;
    //             }
    //             console.log('File has been deleted!');
    //             });
    //     }
    // });
})