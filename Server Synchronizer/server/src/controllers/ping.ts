import { Request, Response } from 'express';

exports.get = async (req: Request, res: Response) => {
	try {
		res.status(200).send(`PONG! from Server Synchronizer- Socket IO`);
	} catch (error) {
		res.status(404).send(`Failed to pong :-( ${error.message}`);
	}
};
