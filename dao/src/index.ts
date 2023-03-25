import express from "express";
import { FileMetadataServerDAO } from "./fileDAO";
import { UserDAO } from "./userDAO";

const app = express();

app.listen(5100, () => {
    console.log("server started, listening at port 5100");
  });
  
  

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
