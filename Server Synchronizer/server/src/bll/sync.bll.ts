import { createReadStream, ReadStream } from 'fs';

export interface IReadStreamAction {
	type: string;
	payload: any;
}

export abstract class SyncBLL {
	public static async streamFiles(socket: SocketIO.Socket, fileResult: any): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			const filePath = fileResult.path;
			const subDirs = fileResult.subDirs;
			const fileName = fileResult.file;
			// console.log(filePath);
			// console.log(fileName);
			socket.emit('file-name', { fileName, subDirs });
			const cRS = createReadStream(filePath);
			socket.on('file-chunk-acknowledged', (chunkNumber, callback) => {
				// console.log('file-chunk-acknowledged', chunkNumber);
				cRS.resume();
				callback('resumed transfer');
			});
			const done = await this.readFileStream(cRS, socket);
			if (done) {
				resolve(`done with ${fileName}`);
			}
		});
	}
	private static readFileStream(readStream: ReadStream, socket: SocketIO.Socket): Promise<IReadStreamAction> {
		return new Promise<IReadStreamAction>((resolve, reject) => {
			let chunkCount = 0;
			readStream.on('data', (chunk) => {
				chunkCount++;
				// console.log('chunk stream');
				socket.emit('file-chunk', { chunkNumber: chunkCount, chunk });
				// console.log('emitted chunk number', chunkCount);
				readStream.pause();
				// console.log('paused chunk transfer');
			});
			readStream.on('end', () => {
				// console.log('end file stream');
				socket.emit('last-file-chunk', chunkCount);
				readStream.destroy();
				socket.removeAllListeners('file-chunk-acknowledged');
				resolve({ type: 'end', payload: { chunkCount } });
			});
		});
	}
}
