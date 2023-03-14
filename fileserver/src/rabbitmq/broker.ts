import client, {Connection, Channel, ConsumeMessage} from 'amqplib';

var channel: Channel, connection: Connection;
var QUEUE = "FileQueue";
var RabbitMQ_ADDR = "amqp://rabbitmq:5672";


export async function connectQueue() {
	try {
		connection = await client.connect(RabbitMQ_ADDR);
		channel = await connection.createChannel();

		// connect to 'test-queue', create one if doesnot exist already
		await channel.assertQueue(QUEUE);
		channel.consume(QUEUE, (data: any) => {
			// console.log(data)
			console.log("Data received : ", `${Buffer.from(data.content)}`);
			channel.ack(data);
		});
	} catch (error) {
		console.log(error);
	}
}

export const sendMessage = async (data: any) => {
	// send data to queue
	await channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(data)));

	// close the channel and connection
	// await channel.close();
	// await connection.close();
};
