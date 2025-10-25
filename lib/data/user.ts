import { Meetup } from "./meetup"
import { db } from "../firebase"
import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    documentId,
} from "firebase/firestore"

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
    async addMeetup(meetup: Meetup): Promise<void> {
        if (!this.meetups.find((m) => m.id === meetup.id)) {
            this.meetups.push(meetup)
        }
        const ref = doc(db, "users", this.id)
        await updateDoc(ref, {
            meetupIds: arrayUnion(meetup.id),
            updatedAt: serverTimestamp(),
        } as any)
    }

    async removeMeetup(meetup: Meetup): Promise<void> {
            this.meetups = this.meetups.filter((m) => m.id !== meetup.id)
            const ref = doc(db, "users", this.id)
        await updateDoc(ref, {
            meetupIds: arrayRemove(meetup.id),
            updatedAt: serverTimestamp(),
        } as any)
    }

    getMeetups(): Array<Meetup> {
        //check to ensure user is still a member of the meetups
        this.meetups = this.meetups.filter((m) => m.getMemberIds().includes(this.id))
        return this.meetups
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
        const ref = doc(db, "users", this.id)
        const payload: Partial<UserDoc> = {
            name: this.name,
            email: this.email,
            currentLocation: this.currentLocation ?? null,
            meetupIds: this.getMeetupIds(),
            updatedAt: serverTimestamp(),
        }
        await updateDoc(ref, payload as any)
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
            const ref = doc(db, "users", args.id)
        const docData: UserDoc = {
                id: args.id,
            name: args.name,
            email: args.email,
            currentLocation: args.currentLocation ?? null,
            meetupIds: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }
        await setDoc(ref, docData as any)
            return User.fromDoc(args.id, docData)
    }

    // without meetups loaded
    static async loadFromFirestore(id: string): Promise<User | null> {
            const ref = doc(db, "users", id)
        const snap = await getDoc(ref)
        if (!snap.exists()) return null
        const data = snap.data() as UserDoc
            const user = User.fromDoc(id, data)

            console.log("user returned at loadFromFirestore: ", user)
            return user
    }

    // with meetups loaded
    static async loadFromFirestoreFull(id: string): Promise<User | null> {
            const ref = doc(db, "users", id)
        const snap = await getDoc(ref)
        if (!snap.exists()) return null
        const data = snap.data() as UserDoc
            const user = User.fromDoc(id, data)

            // Hydrate meetups during load using Meetup.load (single-item loader)
            const ids = data.meetupIds
            console.log(`User ${id} has meetup IDs: `, ids)
            if (ids.length > 0) {
                const constructed: Meetup[] = []
                for (const mid of ids) {
                    try {
                        console.log(`Loading meetup ${mid} for user ${id}`)
                        const meetup = await Meetup.load(mid)
                        console.log("Meetup Loaded: ", meetup)
                        if (meetup) constructed.push(meetup)
                        console.log(`Loaded meetup ${mid} for user ${id}: `, meetup)
                    } catch {
                        // skip failed loads
                        console.log(`Failed to load meetup ${mid} for user ${id}`)
                    }
                }
                console.log("constructed: ", constructed)
                ;(user as any).meetups = constructed
            }


            console.log("user returned at loadFromFirestoreFull: ", user)
            return user
    }
    
    static async updateCurrentLocation(id: string, loc:[longitude: number, latitude: number] | null,
    ): Promise<void> {
        const ref = doc(db, "users", id)
        await updateDoc(ref, {
            currentLocation: loc ?? null,
            updatedAt: serverTimestamp(),
        } as any)
    }

    static async updateFields(
        id: string,
        patch: Partial<Pick<UserDoc, "name" | "email" | "currentLocation">>,
    ): Promise<void> {
        const ref = doc(db, "users", id)
        await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() } as any)
    }

    
}