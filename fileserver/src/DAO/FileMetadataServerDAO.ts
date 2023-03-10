var mysql = require('mysql2');
export class FileMetadataServerDAO{

    dbConnection = mysql.createConnection({
        host: "dfs_db_1",
        user: "root",
        password: "dfs123",
        port:'3306',
        database: 'fileDB'
      });

    constructor() {
        this.dbConnection.connect(function(err: string) {   
            if (err){
                throw err;
            }  
            console.log('connected to file db');});
    }

    end() {
      this.dbConnection.end();
    }
    
    getAllFiles(callback: Function){
        this.dbConnection.query(`SELECT * FROM dds_file`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
          });
        //sql statements
    }

    getByFileId(id:number, callback: Function){
        this.dbConnection.query(`SELECT * FROM dds_file WHERE fileId = ${id}`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
          });
        //sql statements
    }
    
    getByFileServerId(id:number, callback: Function){
        this.dbConnection.query(`SELECT * FROM dds_file_server WHERE id = ${id}`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
          });
        //sql statements
    }

    deleteByFileId(id: number, callback: Function){
        this.dbConnection.query(`DELETE FROM dds_file WHERE fileId = ${id}`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
          });
    }
    
    addFile(fileObject: any, callback: Function){
        this.dbConnection.query(`INSERT INTO dds_file(name, size, content_type, created_date, fileserver, path) VALUES ('${fileObject.name}', ${fileObject.size}, '${fileObject.content_type}', NOW(), ${fileObject.serverId}, '${fileObject.path}');`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
          });
    }

    addFileServer(fileServer: any, callback: Function) {
        var sql = `INSERT INTO dds_file_server(name, address, type, dds_store_path, dds_bin_path) VALUES ('${fileServer.name}', '${fileServer.address}', '${fileServer.type}', '${fileServer.dds_store_path}', '${fileServer.dds_bin_path}');`;
        this.dbConnection.query(sql, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
          });
    }


}