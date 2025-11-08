// lib/services/db/mock-db.ts
import { DBInterface } from "./db-service";
import { Meetup, MemberStatus } from "@/lib/models/meetup";
import { User } from "@/lib/models/user";
import { HangoutSpot } from "@/lib/models/hangoutspot";
import { DocumentData } from "firebase/firestore";

/**
 * Mock implementation of database service for testing
 * Uses in-memory Maps and mirrors the FirestoreDBService API & document shapes.
 */
export class MockDBService implements DBInterface {
  private meetups: Map<string, Meetup> = new Map();
  private users: Map<string, User> = new Map();

  // simple metadata storage for createdAt / updatedAt like Firestore
  private userMeta: Map<string, { createdAt: string; updatedAt: string }> = new Map();

  private seeded = false;

  constructor() {
    // NOTE:
    // We DON'T call seedMockData() here to avoid circular-initialisation issues
    // with the global `db` from db-factory. We seed lazily instead.
  }

  /** Ensure we only seed once */
  private ensureSeeded() {
    if (!this.seeded) {
      this.seeded = true;
      this.seedMockData();
    }
  }

  /** Seed some example users + meetups (mirrors Firestore document shapes) */
  private seedMockData() {
    const now = new Date().toISOString();

    // ---- Mock users ----
    const alice = new User(
      "mock-user-1",
      "Alice Mock",
      "alice@mock.com",
      [103.8198, 1.3521] // Singapore-ish coords
    );

    const bob = new User(
      "mock-user-2",
      "Bob Mock",
      "bob@mock.com",
      [103.8198, 1.3600]
    );

    this.users.set(alice.id, alice);
    this.users.set(bob.id, bob);

    this.userMeta.set(alice.id, { createdAt: now, updatedAt: now });
    this.userMeta.set(bob.id, { createdAt: now, updatedAt: now });

    // ---- Mock hangout spot (same fields used in firestore-db.ts) ----
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

    // ---- Mock meetup ----
    const mockMeetup = new Meetup(
      "mock-meetup-1",
      "Mock Coffee Meetup",
      new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      mockSpot,
      alice // creator
    );

    // Add Bob as an additional member WITHOUT touching Firestore / db
    mockMeetup.addMemberWithoutStatus(bob);

    // Give Bob a member status without calling meetup.save()
    // (setMemberStatus is async and calls db -> we don’t want that here)
    // So we just rely on the default "traveling" behaviour for creator,
    // and Bob will be in memberIds but have no explicit MemberStatus;
    // that's fine for most mock usage.

    this.meetups.set(mockMeetup.id, mockMeetup);
  }

  // ===== MEETUP OPERATIONS =====

  async getMeetupById(id: string): Promise<Meetup | null> {
    this.ensureSeeded();
    return this.meetups.get(id) ?? null;
  }

  async createMeetup(
    title: string,
    dateTime: Date,
    destination: HangoutSpot,
    creator: User
  ): Promise<Meetup> {
    this.ensureSeeded();
    console.log("[MOCK DB] Creating meetup:", title);

    const newId = `mock-meetup-${this.meetups.size + 1}`;

    const meetup = new Meetup(
      newId,
      title,
      dateTime,
      destination,
      creator
    );

    this.meetups.set(meetup.id, meetup);
    return meetup;
  }

  async saveMeetup(meetup: Meetup): Promise<boolean> {
    this.ensureSeeded();
    console.log("[MOCK DB] Saving meetup:", meetup.id);
    this.meetups.set(meetup.id, meetup);
    return true;
  }

  async deleteMeetup(id: string): Promise<boolean> {
    this.ensureSeeded();
    console.log("[MOCK DB] Deleting meetup:", id);
    const existed = this.meetups.delete(id);
    // We *could* also prune user.meetups here in memory; not critical for tests.
    return existed;
  }

  /**
   * Returns a Firestore-like "meetup document".
   * Mirrors the structure used in FirestoreDBService:
   * {
   *   title,
   *   dateTime,
   *   destination: { id, name, category, priceRange, rating, reviewCount, coordinates, address, thumbnailUrl, openingHours },
   *   creatorId,
   *   memberIds,
   *   members: { [userId]: { status, locationSharingEnabled, arrivedAt, joinedAt } }
   * }
   */
  async getMeetupDoc(id: string): Promise<DocumentData | null> {
    this.ensureSeeded();

    const meetup = this.meetups.get(id);
    if (!meetup) return null;

    const members: Record<string, Omit<MemberStatus, "userId">> = {};
    meetup.getAllMemberStatuses().forEach((status, userId) => {
      members[userId] = {
        status: status.status,
        locationSharingEnabled: status.locationSharingEnabled,
        arrivedAt: status.arrivedAt,
        joinedAt: status.joinedAt,
      };
    });

    return {
      title: meetup.title,
      dateTime: meetup.dateTime.toISOString(),
      destination: {
        id: meetup.destination.id,
        name: meetup.destination.name,
        category: meetup.destination.category,
        priceRange: meetup.destination.priceRange,
        rating: meetup.destination.rating,
        reviewCount: meetup.destination.reviewCount,
        coordinates: meetup.destination.coordinates,
        address: meetup.destination.address,
        thumbnailUrl: meetup.destination.thumbnailUrl,
        openingHours: meetup.destination.openingHours,
      },
      creatorId: meetup.creator.id,
      memberIds: meetup.getMemberIds(),
      members,
    };
  }

  // ===== USER OPERATIONS =====

  async getUserById(id: string): Promise<User | null> {
    this.ensureSeeded();
    console.log("[MOCK DB] Getting user:", id);
    return this.users.get(id) ?? null;
  }

  /**
   * Returns a user with the in-memory meetups loaded.
   * Implementation is similar in spirit to FirestoreDBService.getUserByIdFull,
   * but we derive meetups by scanning the in-memory meetups map.
   */
  async getUserByIdFull(id: string): Promise<User | null> {
    this.ensureSeeded();
    console.log("[MOCK DB] Getting full user:", id);

    const user = this.users.get(id);
    if (!user) return null;

    const meetups = Array.from(this.meetups.values()).filter((m) =>
      m.getMemberIds().includes(id)
    );

    // Same trick used in FirestoreDBService: set private `meetups` via `as any`
    (user as any).meetups = meetups;

    return user;
  }

  async createUser(user: User): Promise<void> {
    this.ensureSeeded();
    console.log("[MOCK DB] Creating user:", user.id);
    const now = new Date().toISOString();
    this.users.set(user.id, user);
    this.userMeta.set(user.id, { createdAt: now, updatedAt: now });
  }

  async saveUser(user: User): Promise<void> {
    this.ensureSeeded();
    console.log("[MOCK DB] Saving user:", user.id);
    const existingMeta = this.userMeta.get(user.id);
    const createdAt = existingMeta?.createdAt ?? new Date().toISOString();
    const updatedAt = new Date().toISOString();

    this.users.set(user.id, user);
    this.userMeta.set(user.id, { createdAt, updatedAt });
  }

  async deleteUser(id: string): Promise<void> {
    this.ensureSeeded();
    console.log("[MOCK DB] Deleting user:", id);
    this.users.delete(id);
    this.userMeta.delete(id);
    // Optionally, you could also clean the userId out of all meetups here.
  }

  /**
   * Returns a Firestore-like "user document".
   * Mirrors the setDoc in FirestoreDBService.createUser / saveUser:
   * {
   *   name,
   *   email,
   *   currentLocation,
   *   meetupIds,
   *   createdAt?,
   *   updatedAt?
   * }
   */
  async getUserDoc(id: string): Promise<DocumentData | null> {
    this.ensureSeeded();

    const user = this.users.get(id);
    if (!user) return null;

    const meta = this.userMeta.get(id);

    const doc: DocumentData = {
      name: user.name,
      email: user.email,
      currentLocation: user.currentLocation ?? null,
      meetupIds: user.getMeetupIds ? user.getMeetupIds() : [],
    };

    if (meta?.createdAt) doc.createdAt = meta.createdAt;
    if (meta?.updatedAt) doc.updatedAt = meta.updatedAt;

    return doc;
  }

  // ===== QUERY OPERATIONS =====

  async getMeetupsByUserId(userId: string): Promise<Meetup[]> {
    this.ensureSeeded();
    console.log("[MOCK DB] Getting meetups for user:", userId);
    return Array.from(this.meetups.values()).filter((meetup) =>
      meetup.getMemberIds().includes(userId)
    );
  }

  async getUsersByMeetupId(meetupId: string): Promise<User[]> {
    this.ensureSeeded();
    console.log("[MOCK DB] Getting users for meetup:", meetupId);

    const meetup = this.meetups.get(meetupId);
    if (!meetup) return [];

    return meetup
      .getMemberIds()
      .map((id) => this.users.get(id))
      .filter((user): user is User => user !== undefined);
  }

  // ===== Helper methods for tests / debugging (not in DBInterface) =====

  getAllMeetups(): Meetup[] {
    this.ensureSeeded();
    return Array.from(this.meetups.values());
  }

  getAllUsers(): User[] {
    this.ensureSeeded();
    return Array.from(this.users.values());
  }

  clear() {
    this.meetups.clear();
    this.users.clear();
    this.userMeta.clear();
    this.seeded = false;
  }
}
