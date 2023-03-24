import client, {Connection, Channel, ConsumeMessage} from 'amqplib';
import { createWriteStream } from 'fs';
import { NAME } from '..';
import { STORAGE_PATH } from '../constants';
var path = require("path");
import * as fs from "fs";
import axios from 'axios';

var channel: Channel, connection: Connection;
const RabbitMQ_ADDR = "amqp://rabbitmq:5672";
const FILE_EXCHANGE = "fileExchange";
const EXCHANGE_TYPE = "fanout";
const ROUTING_KEY = "";
const OPTIONS = {};
const QUEUE = NAME;

export async function connectQueue() {
	try {
		connection = await client.connect(RabbitMQ_ADDR);
		channel = await connection.createChannel();
		await channel.assertExchange(FILE_EXCHANGE, EXCHANGE_TYPE, OPTIONS);
		// connect to 'test-queue', create one if doesnot exist already
		const { queue } = await channel.assertQueue(QUEUE, {exclusive: true});
		await channel.bindQueue(queue, FILE_EXCHANGE, ROUTING_KEY);
		channel.consume(queue, (data: any) => {
			// console.log(data)
			console.log("Data received : ", JSON.parse(`${Buffer.from(data.content)}`));
			handleMessage(JSON.parse(`${Buffer.from(data.content)}`));
			channel.ack(data);
		});
	} catch (error) {
		console.log(error);
	}
}

export const sendMessage = async (data: any) => {
	// send data to queue
	// await channel.sendToQueue(FILE_QUEUE, Buffer.from(JSON.stringify(data)));
	channel.publish(
		FILE_EXCHANGE,
		ROUTING_KEY,
		Buffer.from(JSON.stringify(data)),
		OPTIONS
	);

	// close the channel and connection
	// await channel.close();
	// await connection.close();
};

//{task: "NewFile", id: rows.insertId, fileObj, address: `http://${ACCESS_URL}`}
const handleMessage = async (msg: any) => {
	if(msg.source == NAME) {
		return;
	}
	if(msg.task === "NewFile") {
		downloadFile(msg.address, msg);
	};
	if(msg.task === 'DeleteFile'){
		deleteFile(path.join(STORAGE_PATH, msg.fileObj.name));
	}
};


async function downloadFile(fileUrl: string, msg: any) {
	try {
		fs.mkdirSync(STORAGE_PATH, { recursive: true });
		let outputLocationPath = path.join(STORAGE_PATH, msg.fileObj.name);
		const writer = createWriteStream(outputLocationPath);
  
		axios({
			method: 'get',
			url: fileUrl,
			responseType: 'stream',
		}).then(response => {
  
	  //ensure that the user can call `then()` only when the file has
	  //been downloaded entirely.
  
		return new Promise((resolve, reject) => {
			response.data.pipe(writer);
			let error: Error | null = null;
			writer.on('error', err => {
			error = err;
			writer.close();
			reject(err);
			});
			writer.on('close', () => {
			if (!error) {
				console.log(NAME+ " saved file: ", outputLocationPath);
				resolve(true);
			}
			//no need to call the reject here, as it will have been called in the
			//'error' stream;
				});
			});
		});
	} catch(ex) {
		console.log("exception: ", ex);
	}
	
  }

  const deleteFile = async (filePath: string) => {
	fs.unlink(filePath, (err) => {
		if(err) {
			console.log("Couldn't delete file: " +filePath);
			console.log("MQ del err: " +err);
		} else {
			console.log(NAME +" deleted " +filePath);
		}
	});
  }