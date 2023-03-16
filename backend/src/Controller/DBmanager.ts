var mysql = require("mysql2");
import { Connection } from "mysql2";
export class DBmanager {
  database: string;

  db_1 = {
    host: "dfs_db_1",
    user: "root",
    password: "dfs123",
    port: "3306",
    isPrimary: false,
  };

  db_2 = {
    host: "dfs_db_2",
    user: "root",
    password: "dfs123",
    port: "3306",
    isPrimary: false,
  };

  db_3 = {
    host: "dfs_db_3",
    user: "root",
    password: "dfs123",
    port: "3306",
    isPrimary: false,
  };

  constructor(db: string) {
    this.database = db;
  }

  getConnection_db1(): Connection {
    return mysql.createConnection({
      host: this.db_1.host,
      user: this.db_1.user,
      password: this.db_1.password,
      port: this.db_1.port,
      database: this.database,
    });
  }

  getConnection_db2(): Connection {
    return mysql.createConnection({
      host: this.db_2.host,
      user: this.db_2.user,
      password: this.db_2.password,
      port: this.db_2.port,
      database: this.database,
    });
  }

  getConnection_db3(): Connection {
    return mysql.createConnection({
      host: this.db_3.host,
      user: this.db_3.user,
      password: this.db_3.password,
      port: this.db_3.port,
      database: this.database,
    });
  }

  async getRunningConnections(): Promise<Connection[]> {
    let running_connections: Connection[] = [];
    let success = true;
    let connection = mysql.createConnection({
      host: this.db_1.host,
      user: this.db_1.user,
      password: this.db_1.password,
      port: this.db_1.port,
      database: this.database,
    });

    await connection.connect(function (err: string) {
      if (err) {
        throw err;
      }
    });

    console.log("db 1 available");
    running_connections.push(connection);

    connection = mysql.createConnection({
      host: this.db_2.host,
      user: this.db_2.user,
      password: this.db_2.password,
      port: this.db_2.port,
      database: this.database,
    });

    await connection.connect(function (err: string) {
      if (err) {
        throw err;
      }
    });

    console.log("db 2 available");
    running_connections.push(connection);

    connection = mysql.createConnection({
      host: this.db_3.host,
      user: this.db_3.user,
      password: this.db_3.password,
      port: this.db_3.port,
      database: this.database,
    });

    await connection.connect(function (err: string) {
      if (err) {
        throw err;
      }
    });

    console.log("db 3 available");
    running_connections.push(connection);

    return running_connections;
  }
}
