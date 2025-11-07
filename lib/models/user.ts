import { Meetup } from "./meetup"
import { db } from "@/lib/services/db/db-factory"

// Database user document shape
export interface UserDoc {
    id: string
    name: string
    email: string
    currentLocation: [longitude: number, latitude: number] | null,
    meetupIds: string[]
    createdAt?: unknown
    updatedAt?: unknown
}

export class User {
        
    private meetups: Meetup[] = [];
    public notifyUpdate?: () => void;


    constructor(
        public id: string,
        public name: string,
        public email: string,
        public currentLocation: [longitude: number, latitude: number] | null,
    ) {}

    // === Instance methods ===
    async updateName(newName: string): Promise<void> {
        const name = (newName ?? "").trim()
        if (!name) throw new Error("Name cannot be empty.")
        this.name = name
        await this.save()
        this.notifyUpdate?.()
    }

    async updateCurrentLocation(
        loc: [longitude: number, latitude: number] | null,
    ): Promise<void> {
        this.currentLocation = loc ?? null
        await this.save()
        this.notifyUpdate?.()
    }

    async updateFields(
        patch: Partial<{ name: string; email: string; currentLocation: [longitude: number, latitude: number] | null }>,
    ): Promise<void> {
        if (patch.name !== undefined) this.name = patch.name ?? this.name
        if (patch.email !== undefined) this.email = patch.email ?? this.email
        if (patch.currentLocation !== undefined) this.currentLocation = patch.currentLocation ?? null
        await this.save()
        this.notifyUpdate?.()
    }

    async removeAccount(): Promise<void> {
        const dbi = db
        await dbi.deleteUser(this.id)
    }
    async addMeetup(meetup: Meetup): Promise<void> {
        if (!this.meetups.find((m) => m.id === meetup.id)) {
            this.meetups.push(meetup)
        }
        await this.save()
    }

    async removeMeetup(meetup: Meetup): Promise<void> {
        this.meetups = this.meetups.filter((m) => m.id !== meetup.id)
        await this.save()
    }

    getMeetups(): Array<Meetup> {
        return this.meetups.filter((m) => m.getMemberIds().includes(this.id))
    }

    getMeetupIds(): string[] {
            return this.meetups.map((m) => m.id)
    }

    getUsername(): string {
        return this.name
    }

    getId(): string {
            return this.id
    }

    // Save current fields to Firestore (replaces meetupIds with current in-memory list)
    async save(): Promise<void> {
        const dbi = db
        await dbi.saveUser(this)
    }
    
    // === Repository helpers ===
    static async createInDatabase(args: {
            id: string
        name: string
        email: string
        currentLocation: [longitude: number, latitude: number] | null,
    }): Promise<User> {
        const user = new User(args.id, args.name, args.email, args.currentLocation ?? null)
        const dbi = db
        await dbi.createUser(user)
        return user
    }

    // without meetups loaded
    static async loadFromDatabase(id: string): Promise<User | null> {
        const dbi = db
        return await dbi.getUserById(id)
    }

    // with meetups loaded
    static async loadFromDatabaseFull(id: string): Promise<User | null> {
        const dbi = db
        return await dbi.getUserByIdFull(id)
    }    
}