import { FileMetadataServerDAO } from "../DAO/FileServerDAO";

export class FileMetadataServerController {

    file_metadata_serverDAO: FileMetadataServerDAO
    
    constructor(){
        this.file_metadata_serverDAO = new FileMetadataServerDAO()
    }

    getByFileName(name: string){
        return this.file_metadata_serverDAO.getByFileName(name)
    }
    
    deleteByFileName(){

    }
    
    saveFile(){

    }

}