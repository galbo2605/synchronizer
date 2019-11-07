import io from 'socket.io-client';
import { createWriteStream, WriteStream } from 'fs';
export abstract class SocketClientBll {
	static messages: Message[] = [];
	static url = SocketClientBll.baseURI();
	static socket: SocketIOClient.Socket;

	static chat: Chat;

	static baseURI() {
		const protocol = 'http';
		const host = 'localhost';
		return `${protocol}://${host}:5000`;
	}

	static initSocket(): void {
		this.socket = io(this.url);
		this.socket.on('connect', () => {
			console.log('CONNECTED!', this.url);
		});
		this.socket.on('disconnect', () => {
			console.log('DISCONNECTED!');
		});
	}

	static setNameAndRoom(name: string, room: string) {
		this.chat = new Chat(room, name, [], []);
		this.socket.emit('join', { name, room }, (res) => {
			console.log(res);
		});
	}

	static storeMessage(message: Message) {
		this.chat.messages.push(message);
		this.messages.push(...this.chat.messages);
	}

	static setClientsList(clients) {
		this.chat.clients = clients;
	}

	static sendMessage(message: string) {
		this.socket.emit('createMessage', message, () => {
		});
	}

	static async recieveMessage(): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			this.socket.on('newMessage', cb => {
				return resolve(cb);
			});
		});
	}

	static async recieveClientList(): Promise<string[]> {
		return new Promise<any>((resolve, reject) => {
			this.socket.on('updateClientList', cb => {
				return resolve(cb);
			});
		});
	}

	static async writeFileChunks(fileName: string, fileWriteStream: WriteStream): Promise<string> {
		return new Promise<any>((resolve, reject) => {
			this.socket.on('file-chunk', ({ chunkNumber, chunk }) => {
				// console.log('writeFileChunks: received chunk number', chunkNumber);
				try {
					fileWriteStream.write(chunk, (e) => {
						if (e) {
							console.log('writeFileChunks error', e);
						}
						// console.log('writeFileChunks: acknowledgeChunk');
						this.acknowledgeChunk(chunkNumber);
					});
				} catch (error) {
					throw error;
				}
			});
			this.socket.once('last-file-chunk', (totalChunks) => {
				// console.log('writeFileChunks: last-file-chunk', totalChunks);
				// console.log('writeFileChunks: ', `${fileName} done ${totalChunks} chunks`);
				fileWriteStream.destroy();
				resolve(`${fileName} done ${totalChunks} chunks`);
			});
		}).catch(e => console.log(e));
	}

	private static acknowledgeChunk(chunkNumber: number) {
		this.socket.emit('file-chunk-acknowledged', chunkNumber, (cb) => {
			// console.log('acknowledgeChunk: file-chunk-acknowledged');
			// console.log('acknowledgeChunk response:', cb);
		});
	}

	static getChatDetails() {
		return this.chat;
	}

	static disconnect() {
		if (this.socket) {
			this.socket.disconnect();
		}
	}
}

export class Chat {
	constructor(public room: string,
		public client: string,
		public clients: string[],
		public messages?: Message[]) {
	}
}

export class Message {
	constructor(public client: string,
		public message: string,
		public time: string) {
	}
}
