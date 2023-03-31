import express, { NextFunction, Request, response, Response } from "express";
import path from "path";
import * as fs from "fs";
import { FileMetadataServerDAO_1 } from "./FileDB/db_1";
import { FileMetadataServerDAO_2 } from "./FileDB/db_2";
import { FileMetadataServerDAO_3 } from "./FileDB/db_3";
import { connectQueue, sendMessage } from "./rabbitmq/broker";
import { STORAGE_PATH } from "./constants";
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    // const path = "./storage/";
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
    cb(null, STORAGE_PATH); // setting path
  },
  filename: (req: any, file: any, cb: any) => {
    const extname = path.extname(file.originalname);
    cb(null, file.originalname); // setting file name
  },
});
const upload = multer({ storage });
// declare global {
//     namespace Express {
//         interface Request {
//             file: any;
//         }
//     }
// }
export const NAME = process.env.NAME || "Unknown FS";
const ACCESS_URL = process.env.ACCESS_URL || "";

connectQueue().then(() => {
  app.listen(4000, () => {
    console.log("server started");
    console.log(NAME);
  });
});

//FORCE TALK TO dao1 by now, fix after dealing with nginx
import axios from 'axios';
import {stringify} from "querystring";
const dbAdd = 'http://dao_1:5100/'

//FORCE TALK TO dao1 by now, fixed after dealing with nginx
app.get("/checkApi", (req: Request, res: Response) => {
  res.status(200).send("API running");
  console.log('sending');
  sendMessage(JSON.stringify({ message: "checkApi Hit"}));
});

app.get("/getFileList", async(req: Request, res: Response) => {
  try{
    const response = await axios.get(dbAdd+'getFileList');
    res.json(response.data);
  }catch(error){
    res.status(500).json({message:"error\n"+error});
  }
});

app.get("/getFileById/:id", async(req: Request, res: Response) => {
  // res.download(__dirname + '/testdownload.txt')

  let id: number = parseInt(req.params.id);
  console.log("GET THE CURRENT ID:"+id);

  try {
    const response = await axios.get(dbAdd+'getFileById/'+id);
    let filePath: string = response.data.path;
    console.log("getFileById path@"+filePath);
      //allow client to get fileName under CORS
      res.set('Access-Control-Expose-Headers', 'Content-Disposition');
      //res.setHeader('Content-Disposition', 'attachment; filename="test.test"');
      res.download(filePath);
  }catch (ex: any) {
    res.status(500).send({
      error: ex || ex.Message.toString() || "undefined",
      Message: "Error",
    });
  }
});

app.get("/getByFileName", (req: Request, res: Response) => {
  console.log("request made");
  let filename = req.query.fileName;

  const directory = "./src";
  const fs = require("fs");
  const path = require("path");
  fs.readdirSync(directory).forEach((file: string) => {
    if (filename == file) {
      console.log(file);
      let absolutePath = path.resolve(directory, file);
      console.log(file);
      res.download(absolutePath);
      // fileToBase64(absolutePath).then((base64)=>{
      //     res.send(base64)
      // })
    }
  });
});

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

app.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
  console.log("This is test breakpoint"+req);
  if (!req.file) {
    res.status(400).send({ error: "No file attached" });
    return;
  }
  const fileObj = {
    name: req.file?.filename,
    size: req.file?.size,
    content_type: req.file?.mimetype,
    serverId: 1,
    path: req.file?.path,
  };
  console.log("upload file Obj###############");
  console.log(fileObj);
  console.log("################################")
  try {
    const response = await axios.post(dbAdd+'upload/',{
      name: req.file?.filename,
      size: req.file?.size,
      content_type: req.file?.mimetype,
      serverId: 1,
      path: req.file?.path,
    });
    const fileId = response.data.id;
    res.status(200).send({id:fileId});
    sendMessage({task: "NewFile", id: fileId, fileObj, address: `http://${ACCESS_URL}/getFileById/${fileId}`, source: NAME});

  } catch (ex: any) {
    res
        .status(500)
        .send({ error: "Could not upload file", message: ex || "Unknown" });
    console.log("err: " + ex || ex.Message || "undefined");
    fs.unlink(`${req.file.destination}/${req.file.filename}`, (err: any) => {
      // if(err) throw err;
    });
  }
});

app.post("/deleteByFileName", (req: Request, res: Response) => {
  let filename: string = req.body.Filename;

  const directory = "./src/";

  fs.readdirSync(directory).forEach((file: string) => {
    if (filename == file) {
      let filepath = directory + filename;
      fs.unlink(filepath, (err: any) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("File has been deleted!");
      });
    }
  });
});

app.delete("/deleteFileById/:id", authenticateToken, async(req: Request, res: Response) => {
  let id: number = parseInt(req.params.id);
  console.log("GET THE CURRENT ID:"+id);
  try {
    const response = await axios.get(dbAdd+'getFileById/'+id);
    if (response.status === 404){
      res
          .status(400)
          .send({ error: "Bad Request", message: "No file object found" });
      return;
    }
      let filePath: string = response.data.path;
      console.log(response.data)
      let fileObj:any = response.data;

      await fs.unlink(filePath, (err: any) => {
        if (err) {
          res.status(500).send({
            error: "Error deleting File from server",
            message: err.Message || "undefined",
          });
          return;
        }
      });

    try {
      const response = await axios.delete(dbAdd+'deleteFileById/'+id);
      if (response.status === 200){
        res.status(200).send({ message: "Deleted file" });
        sendMessage({task: "DeleteFile", fileObj: fileObj, source: NAME});
      }
    } catch (err: any) {
      console.log("Error deleting in fs: " + err || "undefined");
      res.status(500).send({
        message: "an error occured when trying to delete file from db",
      });
    }
  } catch (ex) {
    res.status(500).send({
      message: "an error occured when trying to delete file",
      exception: ex,
    });
  }

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
});

// authenticate JWT token provided
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("no access token provided");

  jwt.verify(token, "secretKey", (err: any, payload: any) => {
    if (err) return res.status(403).send(err);
    // @ts-ignore
    req.payload = payload;
    console.log("from authenticateToken: access granted");

    next();
  });
}