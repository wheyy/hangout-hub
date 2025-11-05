// lib/services/db-factory.ts
import { DBInterface } from "./db-service";
import { FirestoreDBService } from "./firestore-db";
import { MockDBService } from "./mock-db";

/**
 * Database service types
 */
export enum DBServiceType {
  FIRESTORE = "firestore",
  MOCK = "mock"
}

/**
 * Factory for creating database service instances
 */
export class DBServiceFactory {
	// static method to return appropriate DBInterface object based on user choice
	public static getDatastore(datastoreOption: string): DBInterface {
		let datastore: DBInterface | null = null;
		
		if(datastoreOption == DBServiceType.FIRESTORE) {
            datastore = new FirestoreDBService();
        } else if(datastoreOption == DBServiceType.MOCK) {
            datastore = new MockDBService();
		} else { // default to mock
            console.warn(`Unknown datastore option "${datastoreOption}", defaulting to 'mock'`);
            datastore = new MockDBService();
		}
		
		return datastore;
	}

}

export const db = DBServiceFactory.getDatastore(process.env.NEXT_PUBLIC_DB_SERVICE || DBServiceType.FIRESTORE);