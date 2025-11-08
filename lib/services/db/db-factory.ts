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
			console.warn("Using mock datastore. Some functionality may be limited.");
			alert("[MOCK SITE] Mock Database is deprecated. Some functionality may be limited. Consider using Firestore instead.");
            datastore = new MockDBService();
		} else { // default to firestore
            console.warn(`Unknown datastore option "${datastoreOption}", defaulting to 'firestore'`);
            datastore = new FirestoreDBService();
		}
		
		return datastore;
	}

}

export const db = DBServiceFactory.getDatastore(process.env.NEXT_PUBLIC_DB_SERVICE || DBServiceType.FIRESTORE);