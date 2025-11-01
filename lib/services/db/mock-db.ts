// lib/services/db/mock-db.ts
import { DBInterface } from "./db-service";
import { Meetup } from "@/lib/models/meetup";
import { User } from "@/lib/models/user";
import { HangoutSpot } from "@/lib/models/hangoutspot";
import { DocumentData } from "firebase/firestore";

/**
 * Mock implementation of database service for testing
 */
export class MockDBService implements DBInterface {
  private meetups: Map<string, Meetup> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData() {
    // Mock users
    const user1 = new User(
      "mock-user-1",
      "Alice Mock",
      "alice@mock.com",
      [103.8198, 1.3521]
    );
    const user2 = new User(
      "mock-user-2",
      "Bob Mock",
      "bob@mock.com",
      [103.8198, 1.3521]
    );

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);

    // Mock hangout spot
    const mockSpot = new HangoutSpot(
      "mock-spot-1",
      "Mock Cafe",
      "Cafe",
      "$$",
      4.5,
      100,
      [103.8198, 1.3521],
      "123 Mock Street, Singapore",
      "https://via.placeholder.com/150",
      "monday: 9:00 AM - 10:00 PM" 
    );

    // Mock meetup
    const mockMeetup = new Meetup(
      "mock-meetup-1",
      "Mock Coffee Meetup",
      new Date(Date.now() + 86400000),
      mockSpot,
      user1
    );

    this.meetups.set(mockMeetup.id, mockMeetup);
  }

  async getMeetupById(id: string): Promise<Meetup | null> {
    console.log("[MOCK DB] Getting meetup:", id);
    return this.meetups.get(id) || null;
  }

  async saveMeetup(meetup: Meetup): Promise<void> {
    console.log("[MOCK DB] Saving meetup:", meetup.id);
    this.meetups.set(meetup.id, meetup);
  }

  async deleteMeetup(id: string): Promise<void> {
    console.log("[MOCK DB] Deleting meetup:", id);
    this.meetups.delete(id);
  }

  async getMeetupDoc(id: string): Promise<DocumentData | null> {
    const meetup = this.meetups.get(id);
    if (!meetup) return null;
    
    return {
      id: meetup.id,
      title: meetup.title,
      dateTime: meetup.dateTime.toISOString(),
      creatorId: meetup.creator.id,
      memberIds: meetup.getMemberIds()
    };
  }

  async getUserById(id: string): Promise<User | null> {
    console.log("[MOCK DB] Getting user:", id);
    return this.users.get(id) || null;
  }

  async saveUser(user: User): Promise<void> {
    console.log("[MOCK DB] Saving user:", user.id);
    this.users.set(user.id, user);
  }

  async deleteUser(id: string): Promise<void> {
    console.log("[MOCK DB] Deleting user:", id);
    this.users.delete(id);
  }

  async getUserDoc(id: string): Promise<DocumentData | null> {
    const user = this.users.get(id);
    if (!user) return null;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      currentLocation: user.currentLocation,
      meetupIds: user.getMeetupIds()
    };
  }

  async getMeetupsByUserId(userId: string): Promise<Meetup[]> {
    console.log("[MOCK DB] Getting meetups for user:", userId);
    return Array.from(this.meetups.values()).filter(meetup =>
      meetup.getMemberIds().includes(userId)
    );
  }

  async getUsersByMeetupId(meetupId: string): Promise<User[]> {
    console.log("[MOCK DB] Getting users for meetup:", meetupId);
    const meetup = this.meetups.get(meetupId);
    if (!meetup) return [];
    
    return meetup.getMemberIds()
      .map(id => this.users.get(id))
      .filter((user): user is User => user !== undefined);
  }

  // ✅ Helper methods for testing
  getAllMeetups(): Meetup[] {
    return Array.from(this.meetups.values());
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  clear() {
    this.meetups.clear();
    this.users.clear();
    this.seedMockData();
  }
}