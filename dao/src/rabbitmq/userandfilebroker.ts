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
const localContainerName= process.env.CONTAINER_NAME ||'NA';


export async function connectQueue() {
	try {
		//create th
		connection = await client.connect(RabbitMQ_ADDR);
		channel = await connection.createChannel();
		await channel.assertExchange(DaoExchage, EXCHANGE_TYPE, OPTIONS);
		// declare the leader election queue
		const { queue } = await channel.assertQueue(DaoQUEUE);
		
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
		const udb =  new UserDAO();
		if(localContainerName != 'NA' && localContainerName != msg.source){
			udb.addUser(msg.user, (rows: any) => {
				console.log("addUser: "+msg.user);
			});
			return true;
		}

	} catch (ex) {
		return false;
	}
	
	
	}

	if(msg.task==="login"){
		try {
			const udb= new UserDAO();
			if(localContainerName != 'NA' && localContainerName != msg.source){
				udb.addRefreshToken(msg.id,msg.refreshToken, (rows: any) => {
					console.log("login add access token: "+msg.id);
					console.log(msg.refreshToken);
				});
				return true;
			}
		
		} catch (ex) {
			return false;
		}
	}
 // (Done)
	if(msg.task==="logout"){
		try {
			const udb = new UserDAO();
			if(localContainerName != 'NA' && localContainerName != msg.source){
				udb.removeRefreshToken(msg.id, (rows: any) => {
					console.log("logout done, remove refresh Token:"+msg.id);
				});
			}

		} catch (error) {
			console.log("logout error");
			console.log(error);
		}
	}

// FILE DATA DATABASE
	if(msg.task==="upload"){
		try {
			const fdb = new FileMetadataServerDAO();
			if(localContainerName != 'NA' && localContainerName != msg.source){
				fdb.addFile(msg.fileObj,(rows:any) => {
					console.log("upload done: "+msg.fileObj);
				});
			}

		} catch (error) {
			console.log("upload error");
			console.log(error);
		}



	}
	
	if(msg.task==="delete"){
		try {
			const fdb = new FileMetadataServerDAO();
			if(localContainerName != 'NA' && localContainerName != msg.source){
				fdb.deleteByFileId(msg.id, (rows: any) => {
					console.log("Delete File ID: "+msg.id);
				});
			}
				return true;
		} catch (error) {
			console.log("delete error");
			console.log(error);
			return false;
		}
	}


    return true;
}
