import { UserDAO } from "../UserDB/UserDAO";
import { DBmanager } from "./DBmanager";
import { Connection } from "mysql2";
import { Response } from "express";

var mysql = require('mysql2');
export class UserController{

    /* 
        when constructed should elect a db as primary

        will create a connection for each DAO method and send connection to DAO

        Checks periodically or everytime new connection is created if DB is alive or not

        Writes: writes are done to all dbs

        Reads: Are done from only the primary DB
    
    */

    
    
    selectPrimary(){

    }

    healthCheck(){

    }

    replicateDB(){

    }
    

    // sql query to add user to database for registration
    async addUser(res: Response, user: any){
        // let dbm = new DBmanager("userDB")
        
        // try {      

        //     let connections = dbm.getRunningConnections()
        //     connections.forEach(function(connection){
        //       let udb = new UserDAO(connection);
        //       let result_rows
              
        //       try{
                
        //         udb.addUser(user, (rows: any) => {
        //             console.log("DB updated")
        //             result_rows = rows
        //           });
        //           udb.end();
        //         }catch (ex) {
        //             console.log("userdb update err: " + ex || "undefined");
        //         }

                
        //         udb = new UserDAO(connection_2);
        //           // update replica dbs upon successful update to master db
        //         try {
        //             udb.addUser(user, (rows: any) => {
        //                 console.log("DB updated")
        //             });
        //             udb.end();
        //           } catch (ex) {
        //             console.log("userdb " + dbm.db_2.host + " update err: " + ex || "undefined");
        //           }
                
        //         udb = new UserDAO(connection_3);
        //         try {
        //             udb.addUser(user, (rows: any) => {
        //                 console.log("DB updated")
        //             });
        //             udb.end();
        //         } catch (ex) {
        //             console.log("userdb " + dbm.db_3.host + " update err: " + ex || "undefined");
        //         }
                
        //         res.status(200).json(result_rows);

        //       } catch (ex) {
        //         res
        //           .status(500)
        //           .send({ error: "Could not add user", message: ex || "Unknown" });
        //         console.log("err: " + ex || "undefined");
        //       }
        //     })
  
        let dbm = new DBmanager("userDB")
        let connections = await dbm.getRunningConnections()
        let result_rows
        
        console.log("\nlength = " + connections.length);
        

        connections.forEach(function(connection){
          let udb = new UserDAO(connection);
          
          try{
            udb.addUser(user, (rows: any) => {
                  console.log("DB updated")
                  result_rows = rows
                });
                udb.end();
              }catch (ex) {
                  console.log("userdb update err: " + ex || "undefined");
              }
        
        }) 
        
        res.status(200).json(result_rows)


    }

    // sql query to retrieve user from database for login
    getUser(email:string, callback: Function){

    }

    // sql query to add a refresh token to a user
    addRefreshToken(id: any, refreshToken:any, callback: Function){

    }

    // sql query to add a refresh token to a user
    getRefreshToken(userID:any, callback: Function){

    }
    getUserID(userID:any, callback:Function){

    }
    

    // sql query to add a refresh token to a user
    removeRefreshToken(id: any, callback: Function){

    }    
    

}