var mysql = require('mysql2');
export class UserDAO{

    dbConnection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "dfs123",
        port:'3310',
        database: 'userDB'
      });

    constructor() {
        this.dbConnection.connect(function(err: string) {   
            if (err){
                throw err;
            }  
            console.log('connected to user db');});
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
        console.log(q);
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