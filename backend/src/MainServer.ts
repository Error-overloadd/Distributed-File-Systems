import axios from "axios"
import path from 'path';
import { FileMetadataServerController } from "./Controller/FileMetadataServerController"
import { base64ToFile, fileToBase64 } from "./Utils/fileUtil";
import fs from 'fs';
import { response, Response } from "express";
import { STATUS_CODES } from "http";


export class MainServer {

    fsc: FileMetadataServerController
    constructor(){
        this.fsc = new FileMetadataServerController()
        
    }

    async getByFileNameFromFileServer(name: string){
        // return this.fsc.getByFileName(name)
        let data = axios.get('http://localhost:4000/getByFileName', {
            params: {
                Name: name
            }
        })
        data.then((result)=>{
            const filepath = path.join(__dirname, name);
            base64ToFile(result.data,filepath).then(()=>{console.log("file saved")})
        })

    }

    async saveFileToFileServer(name: string){
        const filePath = path.join(__dirname, name);
        const base64String = await fileToBase64(filePath)

        axios.post('http://localhost:4000/saveFile', {
                Name: name,
                base64: base64String
            }
          ).then(function (response) {
            console.log("file saved");
          }).catch(error=>console.log(error))
    }

    async deleteFileFromFileServer(filename: string){
        

        axios.delete('http://localhost:4000/deleteByFileName/', {
            data: {
              Filename: filename
            }
          }).then(()=>{console.log("File deleted")})
    }


    async getByFileName(name: string, res:Response){
        console.log("getFileByName"+name)
        //todo: check in db if we have file and if the user is allowed to get file
        //if allowed run getByFileNameFromFileServer else raise error
        await this.getByFileNameFromFileServer(name).then(()=>{
            console.log("complete")
            // res.download(__dirname + '/'+ name)
            // this.removeFileFromMainServer(__dirname + '/'+ name)
        })

    }

    async addFile(name: string, res: Response){
        console.log("addFile"+name)
        //Todo: check if file already exists in for this user, if not save file otherwise dont
        console.log("mainserver attempting to save file")
        await this.saveFileToFileServer(name).then(()=>{
            res.send("ok")
        })
    }
    
    getByFileID(id: number){
        let rows = this.fsc.getByFileId(id)
        return rows
    }
    
    async deleteByFileName(filename: string, res: Response){
        //todo: delete file from database if the user has permission
        await this.deleteFileFromFileServer(filename).then(()=>{
            res.send("ok")
        })
    }
    

    removeFileFromMainServer(filepath: string){
        
        fs.unlink(filepath, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been deleted!');
        });
    }

    

}