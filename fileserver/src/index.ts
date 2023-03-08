import express, { NextFunction, Request, response, Response } from "express";
import path from 'path';
import * as fs from 'fs';
import { base64ToFile, fileToBase64 } from "./fileUtil";

const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.listen(4000, () => {
    console.log("server started")
});

app.get('/getByFileName',(req: Request, res: Response) => {
    console.log("request made")
    let filename = req.query.Name
    console.log(filename)
        

    const directory = './storage';
    const fs = require('fs');
    const path = require( "path" );

    fs.readdirSync(directory).forEach((file: string) => {
        
        console.log(file)
        if (filename == file) 
        {
            let absolutePath = path.resolve( directory, file );
            console.log(file)
            fileToBase64(absolutePath).then((base64)=>{
                res.send(base64)
            })
        }
    });
})

app.post('/saveFile', (req, res) => {
    const filename = req.body.Name
    const base64String = req.body.base64
    const directory = './storage/';
    const filepath = directory+filename
    base64ToFile(base64String,filepath).then(()=>{
        console.log(filename+"saved")
        res.send("ok");
    })
})

app.delete('/deleteByFileName',(req: Request, res:Response) => {
    let filename:string = req.body.Filename
    console.log("deleting "+filename);
    const directory = './storage/';
    const fs = require('fs');
    let counter = 0;
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
            counter ++;
        }
    });
    if (counter == 0){
        console.log('Nothing deleted');
    }else{
        console.log("delete "+ filename +" with number " + counter )
    }
})