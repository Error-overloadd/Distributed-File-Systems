import express from "express";
import { FileMetadataServerDAO } from "./fileDAO";
import { UserDAO } from "./userDAO";
//USER IMPORT
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser"
import {stringify} from "querystring";
import { connectQueue, sendMessage} from "./rabbitmq/userandfilebroker";
//#############
const app = express();
//#############
const bcrypt = require("bcrypt");
const cors = require("cors");
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '1gb',extended: false }));
//#############


// Create the rabbitmqserver Namer
export const CONTAINER_NAME = process.env.CONTAINER_NAME || "Unknow USERANDFILE"

connectQueue().then(()=>{
  app.listen(5100,()=>{
        console.log("Dao server started");
        console.log(CONTAINER_NAME);
    })
})



//########################################################################
//USER DB
//########################################################################
app.post("/registerUser", async (req, res) => {
    let user = req.body;
    console.log(user);
    // generate userID
    const dateStr: any = Date.now().toString(36); // convert num to base 36 and stringify
    const randomStr: any = Math.random().toString(36).substring(2, 8); // start at index 2 to skip decimal point
    const id = `${dateStr}-${randomStr}`;
    user.id = id;

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedpw = await bcrypt.hash(user.password, salt);
    user.password = hashedpw;

    console.log(user);

    try {
        const udb = new UserDAO();
        udb.addUser(user, (rows: any) => {
            res.status(200).json(rows);
        });
        sendMessage({task:"adduser", user:user,source:CONTAINER_NAME })
        udb.end();
    } catch (ex) {
        res
            .status(500)
            .send({ error: "Could not upload file", message: ex || "Unknown" });
        console.log("err: " + ex || "undefined");
    }
});

function generateAccessToken(payload: any) {
    return jwt.sign(payload, "secretKey", { expiresIn: "600s" });
}

// checks if user exists in the userDB
app.post("/login", async (req, res) => {
    let user = req.body;
    try {
        const udb = new UserDAO();
        udb.getUser(user.email, async (rows: any) => {
            const result = rows[0];
            // check if user exists
            if (!result) return res.status(404).json("user not found");
            console.log("user exists");

            //check if password is valid
            const validpw = await bcrypt.compare(user.password, result.password);
            if (!validpw) return res.status(400).json("invalid pw");
            console.log("valid pw");

            const payload = { id: result.id };
            const accessToken = generateAccessToken(payload);
            const refreshToken = jwt.sign(payload, "refreshSecretKey");
            console.log("try adding refresh token to db || "+ result.id + "||" + refreshToken);

            // const udb2 = new UserDAO();
            udb.addRefreshToken(result.id, refreshToken, (rows: any) => {
                res.status(200).json({
                    userID: result.id,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                });
            })
            sendMessage({task:"login",id:result.id,refreshToken:refreshToken,rows:rows,source:CONTAINER_NAME})
            udb.end();
        });

        udb.end();
    } catch (ex) {
        res
            .status(403)
            .send({ error: "Could not login", message: ex || "Unknown" });
        console.log("err: " + ex || "undefined");
    }
});

app.delete("/logout", (req, res) => {
    // refreshTokens = refreshTokens.filter((token:any) => token !== req.body.token)
    try {
        const udb = new UserDAO();
        udb.removeRefreshToken(req.body.id, (rows: any) => {
            res
                .status(200)
                .send({ message: "logout successful, refresh token deleted" });
        });
        sendMessage({task:"logout", id:req.body.id,source:CONTAINER_NAME})
        udb.end();
    } catch (ex) {
        res
            .status(500)
            .send({ error: "Could not logout", message: ex || "Unknown" });
        console.log("err: " + ex || "undefined");
    }
});

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;
    const userID = req.body.userID;
    if (refreshToken == null)
        return res.status(401).send({ error: "no refresh token provided" });
    try {
        const udb = new UserDAO();
        udb.getRefreshToken(userID, (rows: any) => {
            if (rows[0].refreshToken == null)
                return res.status(403).send({ error: "invalid refresh token" });
            jwt.verify(refreshToken, "refreshSecretKey", (err: any, user: any) => {
                if (err)
                    return res.status(403).send({ error: "invalid refresh token" });

                const accessToken = generateAccessToken({ id: userID });
                res.status(200).json({ accessToken: accessToken });
            });
            sendMessage({task:"token", id:userID, source:CONTAINER_NAME})
        });
        udb.end();
    } catch (ex) {
        res.status(500).send({
            error: "Could not generate refresh token",
            message: ex || "Unknown",
        });
        console.log("err: " + ex || "undefined");
    }
});

//########################################################################
//FILE DB
//########################################################################

app.get("/getFileList", (req, res) => {
    try {
        const fdb = new FileMetadataServerDAO();
        fdb.getAllFiles((rows: any) => {
            res.status(200).send(rows);
        });
        fdb.end();
    } catch (ex: any) {
        console.log(ex);
        res
            .status(500)
            .send({ message: "Something went wrong while getFileList.", error: ex || "undefined" });
    }
});

app.get("/getFileById/:id", (req, res) => {
    let id: number = parseInt(req.params.id);
    try {
        const fdb = new FileMetadataServerDAO();
        fdb.getByFileId(id, (rows: any) => {
            if (rows.length === 0) {
                res
                    .status(404)
                    .send({error: "File Not found", message: "No file object found"});
                return;
            }
            const fileObj = {
                name: rows[0]["filename"],
                size: rows[0]["size"],
                content_type:rows[0]["content_type"],
                serverId: rows[0]["serverId"],
                path: rows[0]["path"]
            };
            res.status(200).json(fileObj);
        });
        fdb.end()
        }catch (ex: any) {
        res.status(500).send({
            error: ex || ex.Message.toString() || "undefined",
            Message: "Error while getFIleByID",
        });
    }
});


app.post("/upload", (req, res) => {

    const fileObj = {
        name: req.body.name,
        size: req.body.size,
        content_type: req.body.content_type,
        serverId: req.body.serverId,
        path: req.body.path
    };
    console.log(fileObj);

    try{
        const fdb = new FileMetadataServerDAO();
        fdb.addFile(fileObj, (rows: any) => {
            res.status(200).json({id: rows.insertId});
        });
        sendMessage({task:"upload", fileObj:fileObj, source:CONTAINER_NAME})
        fdb.end();
    } catch (ex: any) {
        res
            .status(500)
            .send({ error: "Could not upload file", message: ex || "Unknown" });
        console.log("err: " + ex || ex.Message || "undefined");
    }

});
app.delete("/deleteFileById/:id",(req,res)=>{
    let id: number = parseInt(req.params.id);
    try{
        const fdb = new FileMetadataServerDAO();
        fdb.deleteByFileId(id, (rows: any) => {
            res.status(200).send({ message: "Deleted file" });
        });
        sendMessage({task:"delete", id:id, source:CONTAINER_NAME})
        fdb.end();
    } catch (err: any) {
        console.log("Error deleting in fs: " + err || "undefined");
        res.status(500).send({
            message: "an error occured when trying to delete file from db",
        });
    }
});
//########################################################################
//OTHERS
//########################################################################
  app.get("/", (req, res) => {
    const ud = new UserDAO()
    const fd = new FileMetadataServerDAO()
    console.log("Hi this is database service");
    let connectionValid = true
    ud.test((result: any) => {
        console.log(result)
        if (result==true){
            console.log("Database service is connected to user DB and ready");
        }
        else{
            console.log("Connection Error")
            connectionValid=false
        }
    })


    fd.test((result: any) => {
        console.log(result)
        if (result==true){
           console.log("Database service is connected to file DB and ready")
        }
        else{
            res.send("Connection error")
            connectionValid=false
        }
    })

    if(connectionValid=false){
        res.send("Connection error")
    }
    else{
        res.send("Database service is connected to both DBs and ready");
    }

    
  });
