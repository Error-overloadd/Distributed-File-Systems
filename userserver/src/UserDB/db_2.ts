var mysql = require('mysql2');
export class UserDAO_2{

    dbConnection = mysql.createConnection({
        //host: "dfs_db_2",
        host:"172.28.0.5",
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
            console.log('connected to user db 2');});
    }

    // the following piece of code extacts the # of rows in the user table (to be used for id generation)
    // output format: [ { 'COUNT(*)': 4 } ]
    // how to extract '4' from above?
    // this.dbConnection.query(`SELECT COUNT(*) FROM user;`, (err: any,rows: any) => {
    //     if(err) throw err;
      
    //     console.log('Data received from Db:');
    //     console.log(rows);
    //     callback(rows);
    //   });


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
        this.dbConnection.query(`UPDATE user set refreshToken = null where id = '${id}';`, (err: any,rows: any) => {
            if(err) throw err;
          
            console.log('Data received from Db:');
            console.log(rows);
            callback(rows);
        });
    }

}