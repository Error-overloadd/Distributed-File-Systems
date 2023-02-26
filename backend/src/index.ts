import express from "express";

// jwt
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes";
import deserializeUser from "./Middleware/DecserializeUser";
import { FileMetadataServerDAO } from "./DAO/FileMetadataServerDAO";
import bodyParser from 'body-parser';

const app = express();

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
    console.log("server started, listening at port 3001")
});

app.get('/', (req, res) => {
    res.send('hello world')
  })


  app.get('/getFileById/:id',(req, res) => {
    // res.download(__dirname + '/testdownload.txt')    
        db.getByFileId(parseInt(req.params.id), (rows: any) => {
            res.json(rows);
        });
    })
    
    app.get('/getFileServerById/:id',(req, res) => {
        // res.download(__dirname + '/testdownload.txt')    
            db.getByFileServerId(parseInt(req.params.id), (rows: any) => {
                res.json(rows);
            });
        })
    
    app.delete('/deleteByFileId/:id',(req,res) => {
        //call main server method to generate response
        db.deleteByFileId(parseInt(req.params.id), (rows: any) => {
            res.json(rows);
        });
    })
    
    app.post('/addFile', (req, res) => {
        let data = req.body;    
        //call main server method to save the file
        db.addFile(data, (rows: any) => {
            res.json(rows);
        });
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