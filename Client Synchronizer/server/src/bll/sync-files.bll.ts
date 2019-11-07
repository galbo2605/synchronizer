import { SocketClientBll } from './socket-client.bll';
import { createWriteStream, statSync, mkdirSync, existsSync, mkdir } from 'fs';
import { dirname, join } from 'path';

export abstract class SyncFilesBLL {
	public static async syncFiles(): Promise<boolean> {
		// const fileName = await SocketClientBll.getNewFile();
		// console.log('syncFiles: ', fileName);
		return new Promise<any>((resolve, reject) => {
			SocketClientBll.socket.on('file-name', async ({ fileName, subDirs }) => {
				try {
					// console.log('syncFiles: fileName', fileName);
					const path = `C:\\Users\\User\\Desktop\\Development\\Client Synchronizer Incoming`;
					if (subDirs && subDirs.length !== 0) {
						await this.makeSubDirs(path, subDirs);
					}
					const fileWriteStream = createWriteStream(`${path}\\${fileName}`);
					fileWriteStream.on('error', (e) => console.log(e));
					const done = await SocketClientBll.writeFileChunks(fileName, fileWriteStream);
					console.log('syncFiles', done);
					SocketClientBll.socket
						.removeListener('file-chunk')
						.removeListener('last-file-chunk')
						.removeListener('file-chunk-acknowledged');
				} catch (error) {
					throw error;
				}
			}).once('sync-finished', () => {
				resolve(true);
			});
		}).catch(e => console.log(e));
	}

	public static startSync() {
		const socket = SocketClientBll.socket;
		if (!socket || !socket.connected) {
			SocketClientBll.initSocket();
		}
		socket.removeAllListeners();
		socket.emit('sync');
	}

	private static async makeSubDirs(path: string, subDirs: string[]): Promise<void> {
		try {
			// console.log('subDirs', subDirs);
			return new Promise<void>(async (resolve, reject) => {
				let rootSubDir = '';
				for (let index = 0; index < subDirs.length; index++) {
					const dir = subDirs[index];
					rootSubDir = join(rootSubDir, dir);
					const dirToMake = join(path, rootSubDir);
					if (!existsSync(dirToMake)) {
						await new Promise<void>((res, rej) => {
							mkdir(dirToMake, (e) => {
								if (e) {
									rej(e);
								}
								res();
							});
						});
					}
				}
				console.log('validate Dir end');
				resolve();
			});
		} catch (error) {
			throw error;
		}
	}
}
