import { Meetup } from "./meetup"
import { db } from "@/lib/services/db/db-factory"

// Firestore user document shape
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
        // Keep meetups as in-memory objects for app logic
        
    private meetups: Meetup[] = [];
    public notifyUpdate?: () => void; // optional callback injected by Zustand


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
        //check to ensure user is still a member of the meetups
        // console.log("getMeetups before filter: ", this.meetups)
        // this.meetups = this.meetups.filter((m) => m.getMemberIds().includes(this.id))
        // console.log("getMeetups after filter: ", this.meetups)
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

    // === Mapping helpers ===
    private static toDoc(user: User): UserDoc {
        return {
                id: user.id,
            name: user.name,
            email: user.email,
            currentLocation: user.currentLocation ?? null,
            meetupIds: user.getMeetupIds(),
            createdAt: undefined,
            updatedAt: undefined,
        }
    }

        private static fromDoc(id: string, data: UserDoc): User {
            const u = new User(id, data.name, data.email, data.currentLocation ?? null)
            return u
    }

    // === Repository helpers (colocated) ===
    static async createInFirestore(args: {
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
    static async loadFromFirestore(id: string): Promise<User | null> {
        const dbi = db
        return await dbi.getUserById(id)
    }

    // with meetups loaded
    static async loadFromFirestoreFull(id: string): Promise<User | null> {
        const dbi = db
        return await dbi.getUserByIdFull(id)
    }
    
    static async updateCurrentLocation(id: string, loc:[longitude: number, latitude: number] | null,
    ): Promise<void> {
        // static updateCurrentLocation removed; use instance updateCurrentLocation instead
        throw new Error("Use instance method updateCurrentLocation on a User instance")
    }

    static async updateFields(
        id: string,
        patch: Partial<Pick<UserDoc, "name" | "email" | "currentLocation">>,
    ): Promise<void> {
        // static updateFields removed; use instance updateFields instead
        throw new Error("Use instance method updateFields on a User instance")
    }

    
}