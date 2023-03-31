import client, {Connection, Channel, ConsumeMessage} from 'amqplib';
import { UserDAO} from "../userDAO";
import {CONTAINER_NAME} from '..'
import {FileMetadataServerDAO} from "../fileDAO"
var channel: Channel, connection: Connection;
// initial the rabbitmq server port
const RabbitMQ_ADDR = "amqp://rabbitmq:5672";
const DaoExchage = "DAOExchange";
const EXCHANGE_TYPE = "fanout";
const ROUTING_KEY = "";
const OPTIONS= {};
// node priority
const DaoQUEUE= process.env.CONTAINER_NAME || 'DAOQ';



export async function connectQueue() {
	try {
		//create th
		connection = await client.connect(RabbitMQ_ADDR);
		channel = await connection.createChannel();
		await channel.assertExchange(DaoExchage, EXCHANGE_TYPE, OPTIONS);
		// declare the leader election queue
		const { queue } = await channel.assertQueue(DaoQUEUE, {exclusive: true});
		
		await channel.bindQueue(queue, DaoExchage, ROUTING_KEY);
	
	
		channel.consume(queue,async (data: any) => {
			console.log(data)
			console.log("Message received : ", JSON.parse(`${Buffer.from(data.content)}`));
			const success = await handleMessage(JSON.parse(`${Buffer.from(data.content)}`));
			// const success= true;
			if(success) {
				channel.ack(data);
			}
		});
	} catch (error) {
		console.log(error);
	}
}

export const sendMessage = async (data: any) => {
	channel.publish(
		DaoExchage,
		ROUTING_KEY,
		Buffer.from(JSON.stringify(data)),
		OPTIONS
	);
}
const handleMessage = async (msg: any): Promise<boolean>=> {
    
	if(msg.source==="CONTAINER_NAME"){
		return true;
	}
//  USER DATABASE
	if(msg.task==="adduser"){
	try {
		
		if(msg.source!="dfs_db_1"){

			const udb2= new UserDAO();
			udb2.dbConnection.host="dfs_db_2";
			udb2.addUser(msg.user, (rows: any) => {});
			const udb3=new UserDAO();
			udb3.dbConnection.host="dfs_db_3"
			udb3.addUser(msg.user,(row:any)=>{});
				return true;		
		}

		else if(msg.source!="dfs_db_2"){		
			const udb1= new UserDAO();
			udb1.dbConnection.host="dfs_db_1";
			udb1.addUser(msg.user, (rows: any) => {});
			const udb3=new UserDAO();
			udb3.dbConnection.host="dfs_db_3"
			udb3.addUser(msg.user,(row:any)=>{});
				return true;		
		}	


		else if(msg.source!="dfs_db_3"){		
			const udb1= new UserDAO();
			udb1.dbConnection.host="dfs_db_1";
			udb1.addUser(msg.user,(rows: any) => {});
			const udb2=new UserDAO();
			udb2.dbConnection.host="dfs_db_2"
			udb2.addUser(msg.user,(row:any)=>{});
			return true;		
		}	
	


	} catch (ex) {
		return false;
	}
	
	
	}
	 // (Done)
	if(msg.task==="token"){
		try {
			if(msg.source!="dfs_db_1"){

				const udb2= new UserDAO();
				udb2.dbConnection.host="dfs_db_2";
				udb2.getRefreshToken(msg.userID, (rows: any) => {});
				const udb3=new UserDAO();
				udb3.dbConnection.host="dfs_db_3"
				udb3.getRefreshToken(msg.userID,(row:any)=>{});
					return true;		
				}
	
				else if(msg.source!="dfs_db_2"){		
				const udb1= new UserDAO();
				udb1.dbConnection.host="dfs_db_1";
				udb1.getRefreshToken(msg.userID,(rows: any) => {});
				const udb3=new UserDAO();
				udb3.dbConnection.host="dfs_db_3"
				udb3.getRefreshToken(msg.userID,(row:any)=>{});
					return true;		
				}	
	
	
				else if(msg.source!="dfs_db_3"){		
					const udb1= new UserDAO();
					udb1.dbConnection.host="dfs_db_1";
					udb1.getRefreshToken(msg.userID, (rows: any) => {});
					const udb2=new UserDAO();
					udb2.dbConnection.host="dfs_db_2"
					udb2.getRefreshToken(msg.userID,(row:any)=>{});
					return true;		
				}	
			
			
		} catch (ex) {
			return false;
		}
	}
	 // (Done)
	if(msg.task==="login"){
		try {
			if(msg.source!="dfs_db_1"){

				const udb2= new UserDAO();
				udb2.dbConnection.host="dfs_db_2";
				udb2.addRefreshToken(msg.result.id,msg.refreshToken, (rows: any) => {});
				const udb3=new UserDAO();
				udb3.dbConnection.host="dfs_db_3"
				udb3.addRefreshToken(msg.result.id,msg.refreshToken,(row:any)=>{});
					return true;		
			}

			else if(msg.source!="dfs_db_2"){		
				const udb1= new UserDAO();
				udb1.dbConnection.host="dfs_db_1";
				udb1.addRefreshToken(msg.result.id,msg.refreshToken, (rows: any) => {});
				const udb3=new UserDAO();
				udb3.dbConnection.host="dfs_db_3"
				udb3.addRefreshToken(msg.result.id,msg.refreshToken,(row:any)=>{});
					return true;		
			}	


			else if(msg.source!="dfs_db_3"){		
				const udb1= new UserDAO();
				udb1.dbConnection.host="dfs_db_1";
				udb1.addRefreshToken(msg.result.id,msg.refreshToken, (rows: any) => {});
				const udb2=new UserDAO();
				udb2.dbConnection.host="dfs_db_2"
				udb2.addRefreshToken(msg.result.id,msg.refreshToken,(row:any)=>{});
				return true;		
			}	
		
		} catch (ex) {
			return false;
		}
	}
 // (Done)
	if(msg.task==="logout"){
		try {
			if(msg.source!="dfs_db_1"){

				const udb2= new UserDAO();
				udb2.dbConnection.host="dfs_db_2";
				udb2.removeRefreshToken(msg.req.body.id, (rows: any) => {});
				const udb3=new UserDAO();
				udb3.dbConnection.host="dfs_db_3"
				udb3.removeRefreshToken(msg.req.body.id,(row:any)=>{});
					return true;		
			}
	
			else if(msg.source!="dfs_db_2"){		
				const udb1= new UserDAO();
				udb1.dbConnection.host="dfs_db_1";
				udb1.removeRefreshToken(msg.req.body.id, (rows: any) => {});
				const udb3=new UserDAO();
				udb3.dbConnection.host="dfs_db_3"
				udb3.removeRefreshToken(msg.req.body.id,(row:any)=>{});
					return true;		

			}
			
			else if(msg.source!="dfs_db_3"){		
				const udb1= new UserDAO();
				udb1.dbConnection.host="dfs_db_1";
				udb1.removeRefreshToken(msg.req.body.id, (rows: any) => {});
				const udb2=new UserDAO();
				udb2.dbConnection.host="dfs_db_2"
				udb2.removeRefreshToken(msg.req.body.id,(row:any)=>{});
					return true;		

			}

		} catch (ex) {
			return false;
		}
	}

// DATA DATABASE
	if(msg.task==="upload"){
		try {
			

			if(msg.source!="dfs_db_1"){
				const fdb2= new FileMetadataServerDAO();
				fdb2.dbConnection.host="dfs_db_2";
				fdb2.addFile(msg.fileObj,(rows:any)=>{})
				const fdb3= new FileMetadataServerDAO();
				fdb3.dbConnection.host="dfs_db_2";
				fdb3.addFile(msg.fileObj,(rows:any)=>{})
				return true;
			}
			else if(msg.source!="dfs_db_2"){
				const fdb1= new FileMetadataServerDAO();
				fdb1.dbConnection.host="dfs_db_1";
				fdb1.addFile(msg.fileObj,(rows:any)=>{})
				const fdb3= new FileMetadataServerDAO();
				fdb3.dbConnection.host="dfs_db_3";
				fdb3.addFile(msg.fileObj,(rows:any)=>{})
				return true;
			}
			else if(msg.source!="dfs_db_3"){
				const fdb1= new FileMetadataServerDAO();
				fdb1.dbConnection.host="dfs_db_1";
				fdb1.addFile(msg.fileObj,(rows:any)=>{})
				const fdb2= new FileMetadataServerDAO();
				fdb2.dbConnection.host="dfs_db_2";
				fdb2.addFile(msg.fileObj,(rows:any)=>{})
				return true;
			}





		} catch (error) {
			return false;
		}



	}
	
	if(msg.task==="delete"){
		try {
			if(msg.source!="dfs_db_1"){
				const fdb2= new FileMetadataServerDAO();
				fdb2.dbConnection.host="dfs_db_2";
				fdb2.deleteByFileId(msg.id,(rows:any)=>{})
				const fdb3= new FileMetadataServerDAO();
				fdb3.dbConnection.host="dfs_db_2";
				fdb3.deleteByFileId(msg.id,(rows:any)=>{})
				return true;
			}
			else if(msg.source!="dfs_db_2"){
				const fdb1= new FileMetadataServerDAO();
				fdb1.dbConnection.host="dfs_db_1";
				fdb1.deleteByFileId(msg.id,(rows:any)=>{})
				const fdb3= new FileMetadataServerDAO();
				fdb3.dbConnection.host="dfs_db_3";
				fdb3.deleteByFileId(msg.id,(rows:any)=>{})
				return true;
			}
			else if(msg.source!="dfs_db_3"){
				const fdb1= new FileMetadataServerDAO();
				fdb1.dbConnection.host="dfs_db_1";
				fdb1.deleteByFileId(msg.id,(rows:any)=>{})
				const fdb2= new FileMetadataServerDAO();
				fdb2.dbConnection.host="dfs_db_2";
				fdb2.deleteByFileId(msg.id,(rows:any)=>{})
				return true;
			}
	
		} catch (error) {
			return false;
		}
	}








    return true;
}
