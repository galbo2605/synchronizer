export class Clients {
	clients: IClients = {};

	addClient(id, name, room) {
		const client = { id, name, room };
		this.clients[id] = client;
		return client;
	}

	getClient(id): IClient {
		return this.clients[id];
	}

	removeClient(id): IClient {
		try {
			const foundClient = this.getClient(id);
			if (foundClient) {
				this.clients = this.filterClients(client => client.id !== id);
			}
			return foundClient;
		} catch (error) {
			console.log('removeClient', error);
			return null;
		}

	}

	getClientList(room): string[] {
		try {
			const clients = this.filterClients((client) => client.room === room);
			const namesArray = this.mapClients(clients, client => client.name);

			return namesArray;
		} catch (error) {
			console.log('getClientList', error);
			return [];
		}
	}

	private filterClients(conditionCB: (item: IClient) => boolean): IClients {
		return Object.keys(this.clients).reduce((acc, clientID) => {
			const client = this.clients[clientID];
			if (conditionCB(client)) {
				acc[clientID] = client;
			}
			return acc;
		}, <IClients>{});
	}
	private mapClients(clients: IClients, conditionCB: (item: any) => string): string[] {
		return Object.keys(clients).reduce((acc, clientID) => {
			const client = clients[clientID];
			acc.push(conditionCB(client));
			return acc;
		}, <string[]>[]);
	}
}

export interface IClients {
	[id: string]: IClient;
}

export interface IClient {
	id: string;
	name: string;
	room: string;
}
