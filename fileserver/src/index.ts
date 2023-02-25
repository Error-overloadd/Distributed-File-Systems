import express, { NextFunction, Request, response, Response } from "express";
import * as fs from 'fs';

const app = express();

app.listen(4000, () => {
    console.log("server started")
});

app.get('/getByFileName',(req: Request, res: Response) => {
    console.log("request made")
    let filename = req.query.Name
    console.log(filename)
        

    const directory = './src';
    const fs = require('fs');
    const path = require( "path" );

    fs.readdirSync(directory).forEach((file: string) => {
        let absolutePath = path.resolve( directory, file );
        console.log(file)
        if (filename == file) 
        {
            console.log(file)
            res.download(absolutePath)
        }
    });
})

app.post('/saveFile', (req, res) => {
    res.send("saved")
})

app.delete('/deleteByFileName',(req: Request, res:Response) => {
    let filename:string = req.body.name
    
    const directory = './';
    const fs = require('fs');

    fs.readdirSync(directory).forEach((file: string) => {
        let path:string = './'
        if (filename == file) 
        {
            path = path + filename
            fs.unlinkSync(path)
        }
    });
})