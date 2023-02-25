import express from "express";

// jwt
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes";
import deserializeUser from "./Middleware/DecserializeUser";

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



app.listen(3001, () => {
    console.log("server started, listening at port 3001")
});

app.get('/', (req, res) => {
    res.send('hello world')
  })


app.get('/getByFileName',(req, res) => {


// res.download(__dirname + '/testdownload.txt')    
    res.send("Testing getByFileName")
})

app.delete('/deleteByFileName',(req,res) => {
    //call main server method to generate response
    res.send("Testing deleteByFileName")
})

app.post('/saveFile', (req, res) => {
    
    //call main server method to save the file
    res.send("Testing saveFile")
})

app.post('/registerUser', (req,res) =>{
    //call main server to save new user
    res.send("Testing registerUser")
})

app.get('/authenticateUser', (req,res) => {
    res.send("Testing authenticateUser")
})

routes(app);