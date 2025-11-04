// lib/services/db/db-service.ts
import { Meetup } from "@/lib/models/meetup";
import { User } from "@/lib/models/user";
import { DocumentData } from "firebase/firestore";

/**
 * Database service interface
 * Defines contract for all database implementations
 */
export interface DBInterface {

  // Meetup operations
  getMeetupById(id: string): Promise<Meetup | null>;
  createMeetupId(meetup: Meetup): Promise<number>;
  saveMeetup(meetup: Meetup): Promise<boolean>;
  deleteMeetup(id: string): Promise<boolean>;
  getMeetupDoc(id: string): Promise<DocumentData | null>;
  
  // User operations
  getUserById(id: string): Promise<User | null>;
  getUserByIdFull(id: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  saveUser(user: User): Promise<void>;
  deleteUser(id: string): Promise<void>;
  getUserDoc(id: string): Promise<DocumentData | null>;
  
  // Query operations
  getMeetupsByUserId(userId: string): Promise<Meetup[]>;
  getUsersByMeetupId(meetupId: string): Promise<User[]>;
}