import express from "express";
import { MainServer } from "./MainServer";
import fs from 'fs';
import path from 'path';
// jwt
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes";
import deserializeUser from "./Middleware/DecserializeUser";
import { FileMetadataServerDAO } from "./DAO/FileMetadataServerDAO";
import bodyParser from 'body-parser';
//file handlding
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
//file handling done


const app = express();
const ms = new MainServer()
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, delete');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    if (req.method == 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'content-type');
        res.status(200).end();
    }
    next();
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(deserializeUser);
app.use(
    cors({
        credentials: true,
        origin: "http://localhost:4001"
    })
);

const db = new FileMetadataServerDAO();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


app.listen(3002, () => {
    console.log("server started, listening at port 3002")
});

app.get('/', (req, res) => {
    res.send('hello world')
  })


    app.get('/getFileById/:id',(req, res) => {
    // res.download(__dirname + '/testdownload.txt')    
        let id:number = parseInt(req.params.id)    
        let rows = ms.getByFileID(id)
        res.json(rows)
    })

    app.get('/getByFileName/',(req, res) => {
        let name: string = req.query.fileName as string;
        console.log("getByFileName:"+ name);
            ms.getByFileName(name,res)
            // res.download(__dirname + '/'+ name)
            // ms.removeFileFromMainServer(__dirname+'/'+name)
        })
    
    app.get('/getFileServerById/:id',(req, res) => {
        // res.download(__dirname + '/testdownload.txt')    
            db.getByFileServerId(parseInt(req.params.id), (rows: any) => {
                res.json(rows);
            });
        })
    
    app.delete('/deleteByFileId/:id',(req,res) => {
        //call main server method to generate response
        // db.deleteByFileId(parseInt(req.params.id), (rows: any) => {
        //     res.json(rows);
        // });
    })

    app.delete('/deleteByFilename/',(req,res) => {
        let name = req.body.fileName
        ms.deleteByFileName(name,res)
    })
    
    app.post('/addFile',upload.single('file'), (req, res) => {
        if (!req.file) {
            res.status(400).send('No file uploaded');
            return;
        }
        const name = req.file.originalname;
        // let data = req.body;    
        //call main server method to save the file
        // db.addFile(data, (rows: any) => {
        //     res.json(rows);
        // });
        console.log("starting add file")
        const filePath = req.file.path;
        console.log(filePath);
        fs.readFile(filePath,(err,data)=>{
            if(err){
                res.status(500).send('Error reading file');
            }else{
                ms.addFile(name,res)
            }
        })
    })
    
    app.post('/addFileServer', (req, res) => {
        let data = req.body;    
        //call main server method to save the file
        db.addFileServer(data, (rows: any) => {
            res.json(rows);
        });
    })
    
    app.post('/registerUser', (req,res) =>{
        //call main server to save new user
        res.send("Testing registerUser")
    })
    
    app.get('/authenticateUser', (req,res) => {
        res.send("Testing authenticateUser")
    })

routes(app);