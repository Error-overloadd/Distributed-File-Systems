import axios from "axios"
import { FileMetadataServerController } from "./Controller/FileMetadataServerController"

export class MainServer {

    fsc: FileMetadataServerController
    constructor(){
        this.fsc = new FileMetadataServerController()
        
    }

    getByFileName(name: string){
        // return this.fsc.getByFileName(name)
        let data = axios.get('http://localhost:4000/getByFileName', {
            params: {
                Name: name
            }
        })

    }
    
    deleteByFileName(){

    }
    
    saveFile(){

    }


    

}