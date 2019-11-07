import express from 'express';
import http from 'http';
import { createReadStream } from 'fs';
import socketIO from 'socket.io';
import { json as bodyParseJSON } from 'body-parser';
import cors from 'cors';
import { join } from 'path';
import autoRoutes from 'express-auto-routes';
import { Clients, generateMessage, isRealString } from './utils';
import { eSocketEvent } from './enums/socket-event.enum';
import { FilesBLL } from './bll/files.bll';
import { SyncBLL } from './bll/sync.bll';

const app = express(),
	port = process.env.PORT || 5000;
// register dependencies
app.use(cors())
	.use(bodyParseJSON())
	.use(express.static(join(__dirname, 'angular-dist')));

// auto route controllers
autoRoutes(app)(join(__dirname, './controllers'));

const server = http.createServer(app);
const io = socketIO(server);

const clients = new Clients();

io.on(eSocketEvent.Connection, (socket) => {
	console.log('[CONNECTED] - START');
	console.log('TIME', new Date());
	console.log('client connected', socket.id);
	console.log('[CONNECTED] - END');

	const fromRootDir = `C:\\Users\\User\\Desktop\\Development\\NodeJS\\Playground`;
	// const fromRootDir = `C:\\Users\\User\\Desktop\\Development\\Server Synchronizer Outgoing`;
	socket.on('sync', async () => {
		const filePaths = await FilesBLL.getOutgoingFilePaths(fromRootDir);
		// console.log(filePaths);
		for (let index = 0; index < filePaths.length; index++) {
			const filePath = filePaths[index];
			const lastItem = index === (filePaths.length - 1);
			const doneWith = await SyncBLL.streamFiles(socket, filePath);
			console.log(doneWith);
			if (doneWith && lastItem) {
				socket.emit('sync-finished');
			}
		}
	});

	socket.on(eSocketEvent.Join, (params, callback) => {
		console.log('[JOIN] - START');
		console.log(params);

		socket.join(params.room);
		clients.removeClient(socket.id);
		clients.addClient(socket.id, params.name, params.room);

		io.to(params.room).emit(eSocketEvent.UpdateClientList, clients.getClientList(params.room));
		socket.emit(eSocketEvent.NewMessage, generateMessage('Admin', 'Welcome to the chat :]'));
		socket.broadcast.to(params.room)
			.emit(eSocketEvent.NewMessage, generateMessage('Admin', `${params.name} has joined.`));
		callback(`${socket.id} joined successfuly`);
		console.log('[JOIN] - END');
	});

	socket.on(eSocketEvent.CreateMessage, (message, callback) => {
		console.log('[CREATE-MESSAGE] - START');
		const client = clients.getClient(socket.id);

		if (client && isRealString(message)) {
			io.to(client.room).emit(eSocketEvent.NewMessage, generateMessage(client.name, message));
		}

		callback();
		console.log('[CREATE-MESSAGE] - END');
	});

	socket.on(eSocketEvent.Disconnect, () => {
		const client = clients.removeClient(socket.id);
		console.log('[DISCONNECTED] - START');
		console.log(client);

		if (client) {
			io.to(client.room).emit(eSocketEvent.UpdateClientList, clients.getClientList(client.room));
			io.to(client.room).emit(eSocketEvent.NewMessage, generateMessage('Admin', `${client.name} has left.`));
		}
		console.log('[DISCONNECTED] - END');
	});
});

server.listen(port, () => {
	console.log(`Socket IO Server-Synchronizer listening on socketIoPort: ${port}`);
});

// serve angular ui
app.get('*', (req, res) => {
	res.sendFile(join(__dirname, 'angular-dist/index.html'));
});
