import express, { NextFunction, Request, Response } from "express";
import { MainServer } from "./MainServer";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import { UserDAO_1 } from "./UserDB/db_1";
import bodyParser from "body-parser";
import { brotliDecompress } from "zlib";
import { UserDAO_2 } from "./UserDB/db_2";
import { UserDAO_3 } from "./UserDB/db_3";

const bcrypt = require("bcrypt");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const jwt = require("jsonwebtoken");

//file handlding
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, __dirname); // setting path
  },
  filename: (req: any, file: any, cb: any) => {
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
const ms = new MainServer();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const FILE_SERVER_TARGET = "nginx:80/fs";

app.listen(3002, () => {
  console.log("server started, listening at port 5000");
});

app.get("/", (req, res) => {
  console.log("hello world");
  res.send("hello world");
});

app.use(
  "/checkApi",
  createProxyMiddleware({
    target: `http://${FILE_SERVER_TARGET}`,
    changeOrigin: true,
    // pathRewrite: {
    //     [`^/getByFileName`]: '/getByFileName',
    // },
  })
);


app.use(
  "/getByFileName",
  createProxyMiddleware({
    target: `http://${FILE_SERVER_TARGET}`,
    changeOrigin: true,
    // pathRewrite: {
    //     [`^/getByFileName`]: '/getByFileName',
    // },
  })
);

app.use(
  "/getByFileId",
  createProxyMiddleware({
    target: `http://${FILE_SERVER_TARGET}`,
    changeOrigin: true,
  })
);

app.use(
  "/upload",
  createProxyMiddleware({
    target: `http://${FILE_SERVER_TARGET}`,
    changeOrigin: true,
    // pathRewrite: {
    //   [`^/addFile`]: "/upload",
    // },
  })
);

app.use(
  "/getFileList",
  createProxyMiddleware({
    target: `http://${FILE_SERVER_TARGET}`,
    changeOrigin: true,
    // pathRewrite: {
    //     [`^/getFileList`]: '/upload',
    // },
  })
);

app.use(
  "/getFileById",
  createProxyMiddleware({
    target: `http://${FILE_SERVER_TARGET}`,
    changeOrigin: true,
    // pathRewrite: {
    //     [`^/getFileList`]: '/upload',
    // },
  })
);

app.use(
  "/deleteFileById",
  createProxyMiddleware({
    target: `http://${FILE_SERVER_TARGET}`,
    changeOrigin: true,
    // pathRewrite: {
    //     [`^/getFileList`]: '/upload',
    // },
  })
);

// app.get('/getFileById/:id',(req, res) => {
// // res.download(__dirname + '/testdownload.txt')
//     let id:number = parseInt(req.params.id)
//     let rows = ms.getByFileID(id)
//     res.json(rows)
// })

// app.get('/getByFileName/',(req, res) => {
//     let name: string = req.query.fileName as string;
//     console.log("getByFileName:"+ name);
//         ms.getByFileName(name,res)
//         // res.download(__dirname + '/'+ name)
//         // ms.removeFileFromMainServer(__dirname+'/'+name)
//     })

app.get("/getFileServerById/:id", (req, res) => {
  // res.download(__dirname + '/testdownload.txt')
  // db.getByFileServerId(parseInt(req.params.id), (rows: any) => {
  //     res.json(rows);
  // });
});

app.delete("/deleteByFileId/:id", (req, res) => {
  //call main server method to generate response
  // db.deleteByFileId(parseInt(req.params.id), (rows: any) => {
  //     res.json(rows);
  // });
});

app.delete("/deleteByFilename/", (req, res) => {
  let name: string = req.query.fileName as string;
  console.log("deleteFileByname:" + name);
  ms.deleteByFileName(name, res);
});

// app.post('/addFile',upload.single('file'), (req, res) => {
//     console.log(req);
//     if (!req.file) {
//         res.status(400).send('No file uploaded');
//         return;
//     }
//     const name = req.file.originalname;
//     // let data = req.body;
//     //call main server method to save the file
//     // db.addFile(data, (rows: any) => {
//     //     res.json(rows);
//     // });
//     const filePath = req.file.path;
//     console.log(filePath);
//     fs.readFile(filePath,(err,data)=>{
//         if(err){
//             res.status(500).send('Error reading file');
//         }else{
//             ms.addFile(name,res)
//         }
//     })
// })

app.post("/addFileServer", (req, res) => {
  let data = req.body;
  //call main server method to save the file
  // db.addFileServer(data, (rows: any) => {
  //     res.json(rows);
  // });
});


// AUTH START
//FORCE TALK TO dao1 by now, fix after dealing with nginx
import axios from 'axios';
const dbAdd = 'http://dao_1:5100/'
//FORCE TALK TO dao1 by now, fixed after dealing with nginx
app.use("/registerUser",async(req,res)=>{
  try{
    const response = await axios.post(dbAdd+'registerUser',req.body);
    res.json(response.data);
  }catch(error){
    res.status(500).json({message:"error\n"+error});
  }
})

app.use("/login",async(req,res)=>{
  try{
    const response = await axios.post(dbAdd+'login',req.body);
    res.json(response.data);
  }catch(error){
    res.status(500).json({message:"error\n"+error});
  }

})

app.use("/logout",async(req,res)=>{
  try{
    console.log("backendlogout:##########################");
    console.log(req.body);
    console.log("##########################");
    console.log(req.body.id);
    console.log("##########################");
    const response = await axios.post(dbAdd+'logout',req.body);
    res.json(response.data);
  }catch(error){
    res.status(500).json({message:"error\n"+error});
  }
})

app.use("/token",async(req,res)=>{
  try{
    const response = await axios.post(dbAdd+'token',req.body);
    res.json(response.data);
  }catch(error){
    res.status(500).json({message:"error\n"+error});
  }
})



// put below programs to other server (file managing)
// sample usage of authenticateToken function

const files = [
  {
    ID: "lf00ryrg-uy2tqe",
    filename: "adamtest.txt",
  },
  {
    ID: "lf00ryrg-uy2tqe",
    filename: "adamtest2.txt",
  },
  {
    ID: "lf01cbnq-s0fjk6",
    filename: "bentest2.txt",
  },
];

app.get("/fetchFiles", authenticateToken, (req, res) => {
  // @ts-ignore
  res.json(files.filter((files) => files.ID === req.payload.id));
});

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("no access token provided");

  jwt.verify(token, "secretKey", (err: any, payload: any) => {
    if (err) return res.status(403).send(err);
    // @ts-ignore
    req.payload = payload;
    next();
  });
}
