var mysql = require('mysql2');
const containerName = process.env.CONTAINER_NAME
export class UserDAO{

    dbConnection = mysql.createConnection({
        host: containerName,
        user: "root",
        password: "dfs123",
        port:'3306',
        database: 'userDB'
      });

    constructor() {
        this.dbConnection.connect(function(err: string) {   
            if (err){
                throw err;
            }  
            console.log('connected to user db');});
    }

    test(callback: Function){
        try {
            this.dbConnection.query(`SELECT 1 FROM user;`, (err: any,rows: any) => {
                if(err){
                    console.log(err);
                    callback(false) 
                } 
                else{
                    console.log(rows)
                    callback(true) 
                }
              });
        } catch (error) {
            console.log("connection failed")
        }
    }


    end(){
        this.dbConnection.end();
    }

    // sql query to add user to database for registration
    addUser(user: any, callback: Function){
        this.dbConnection.query(`INSERT INTO user(id, name, email, password, isAdmin) VALUES('${user.id}','${user.name}','${user.email}','${user.password}',${user.isAdmin});`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
          });
    }

    // sql query to retrieve user from database for login
    getUser(email:string, callback: Function){

        const q = `SELECT * FROM user WHERE email = '${email}'`;
     
        this.dbConnection.query(`SELECT * FROM user WHERE email = '${email}';`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
          });
    }

    // sql query to add a refresh token to a user
    addRefreshToken(id: any, refreshToken:any, callback: Function){
        this.dbConnection.query(`UPDATE user set refreshToken = '${refreshToken}' where id = '${id}';`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
        });
    }

    // sql query to add a refresh token to a user
    getRefreshToken(userID:any, callback: Function){
        this.dbConnection.query(`select refreshToken from user where id = '${userID}'`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
        });
    }
    getUserID(userID:any, callback:Function){
        this.dbConnection.query(`SELECT * FROM user WHERE id = '${userID}';`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
          });
    }
    

    // sql query to add a refresh token to a user
    removeRefreshToken(id: any, callback: Function){
        console.log("remove refresh token inDB:"+id);
        this.dbConnection.query(`UPDATE user set refreshToken = null where id = '${id}';`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
        });
    }

}