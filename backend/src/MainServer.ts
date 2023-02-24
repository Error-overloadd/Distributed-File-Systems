import { FileMetadataServerController } from "./Controller/FileMetadataServerController"

export class MainServer {

    fsc: FileMetadataServerController
    
    constructor(){
        this.fsc = new FileMetadataServerController()
    }

    getByFileName(name: string){
        return this.fsc.getByFileName(name)
    }
    
    deleteByFileName(){

    }
    
    saveFile(){

    }

}