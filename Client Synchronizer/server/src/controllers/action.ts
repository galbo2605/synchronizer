import { Request, Response } from 'express';
import { SocketClientBll } from '../bll/socket-client.bll';
import { SyncFilesBLL } from '../bll/sync-files.bll';

exports.get = async (req: Request, res: Response) => {
	try {
		switch (req.query['is']) {
			case 'connect':
				SocketClientBll.initSocket();
				break;
			case 'disconnect':
				SocketClientBll.disconnect();
				break;
			case 'join':
				SocketClientBll.setNameAndRoom('office', 'vessel1');
				break;
			case 'sync':
				SyncFilesBLL.startSync();
				const isFinished = await SyncFilesBLL.syncFiles();
				console.log('isFinished', isFinished);
				break;
			default:
				break;
		}
		res.status(200).send(`Action! from Client Synchronizer- Socket IO, is ${req.query['is']}`);
	} catch (error) {
		res.status(404).send(`Failed to Action :-( ${error.message}`);
	}
};
