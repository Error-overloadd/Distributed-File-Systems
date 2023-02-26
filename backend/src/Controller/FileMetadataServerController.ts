import { FileMetadataServerDAO } from "../DAO/FileMetadataServerDAO";

export class FileMetadataServerController {

    file_metadata_serverDAO: FileMetadataServerDAO
    
    constructor(){
        this.file_metadata_serverDAO = new FileMetadataServerDAO()
    }

    // getByFileName(name: string){
    //     return this.file_metadata_serverDAO.getByFileName(name)
    // }

    getByFileId(id: number){
        this.file_metadata_serverDAO.getByFileId(id, (rows: any) => {
            return rows;
        });
    }
    
    deleteByFileName(){

    }
    
    saveFile(){

    }

}