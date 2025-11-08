import { db } from "../services/db/db-factory";
import { HangoutSpot } from "./hangoutspot"
import { User } from "./user"
import { firestoreDB } from "@/lib/config/firebase";
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs,
    deleteDoc,
    query,
    where,
    updateDoc
  } from "firebase/firestore"; 

export interface MemberStatus {
    userId: string
    status: "traveling" | "arrived"
    locationSharingEnabled: boolean
    arrivedAt: string | null
    joinedAt: string
}

export class Meetup {
    private members: User[] = []
    private memberStatuses: Map<string, MemberStatus> = new Map()
    
    
    constructor(
        public id: string,
        public title: string,
        public dateTime: Date,
        public destination: HangoutSpot,
        public creator: User
    ) {
        this.members.push(creator)
        this.memberStatuses.set(creator.id, {
            userId: creator.id,
            status: "traveling",
            locationSharingEnabled: false,
            arrivedAt: null,
            joinedAt: new Date().toISOString()
        })
    }

    
    // ✅ Create a new meetup and store to Firebase w auto-generated ID
    static async create(
        title: string,
        dateTime: Date,
        destination: HangoutSpot,
        creator: User
    ): Promise<Meetup> {
        const meetup = await db.createMeetup(title, dateTime, destination, creator)
        creator.addMeetup(meetup)
        console.log(`Meetup ${meetup.title} created by ${creator.name}`)
        return meetup

    }
    // Load a single meetup from Firestore
    static async load(meetupId: string): Promise<Meetup | null> {
        return await db.getMeetupById(meetupId)
    }

    // Update meetup in db 
    async save(): Promise<boolean> {
        return await db.saveMeetup(this)
    }

    // Delete meetup from local and db
    async deleteMeetup(): Promise<boolean> {
        try {
            console.log("Deleting meetup:", this.id);
            
            // Remove Meetup from all members
            for (const member of this.members) {
                console.log("Removing meetup for member:", member.getId());
                member.removeMeetup(this);
            }
            this.members = [];
            console.log("All members removed from meetup.");
            
            // Delete from Firestore
            await db.deleteMeetup(this.id);
            
            console.log(`Meetup ${this.title} deleted.`);
            return true;
        } catch (error) {
            console.error("Error while deleting meetup:", error);
            return false;
        }
    }

    // Add member and update Firestore
    async addMember(user: User): Promise<void> {
        if (!this.members.find(member => member.id === user.id)) {
            this.members.push(user);
            this.memberStatuses.set(user.id, {
                userId: user.id,
                status: "traveling",
                locationSharingEnabled: false,
                arrivedAt: null,
                joinedAt: new Date().toISOString()
            })
            await this.save(); // Sync to Firestore
        }
    }

    // Add member without updating status (used when loading from Firebase)
    addMemberWithoutStatus(user: User): void {
        if (!this.members.find(member => member.id === user.id)) {
            this.members.push(user);
        }
    }

    // ✅ Remove member and update Firestore
    async removeMember(user: User): Promise<void> {
        this.members = this.members.filter(member => member.id !== user.id);
        await user.removeMeetup(this);
        await this.save(); // Sync to Firestore
        console.log(`User ${user.name} removed from meetup ${this.title}.`);
    }

    start(): void {
        console.log(`Meetup ${this.title} has started.`)
    }

    end(): void {
        console.log(`Meetup ${this.title} has ended.`)
    }

    getMembers(): Array<User> {
        return this.members
    }

    getMemberCount(): number {
        return this.members.length
    }

    getTitle(): string {
        return this.title
    }

    getDateTime(): Date {
        return this.dateTime
    }

    getDateString(): string {
        return this.dateTime.toLocaleDateString()
    }

    getTimeString(): string {
        return this.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    getDestination(): HangoutSpot {
        return this.destination
    }

    getStatus(): "active" | "past" {
        const now = new Date()
        return now < this.dateTime ? "active" : "past"
    }

    getMemberIds(): string[] {
        return this.members.map(member => member.id)
    }

    getMemberStatus(userId: string): MemberStatus | undefined {
        return this.memberStatuses.get(userId)
    }

    getAllMemberStatuses(): Map<string, MemberStatus> {
        return new Map(this.memberStatuses)
    }

    async setMemberStatus(userId: string, status: MemberStatus): Promise<boolean> {
        this.memberStatuses.set(userId, status)
        return await this.save()
    }

    async updateMemberStatus(userId: string, status: "traveling" | "arrived"): Promise<boolean> {
        const memberStatus = this.memberStatuses.get(userId)
        if (memberStatus) {
            memberStatus.status = status
            if (status === "arrived") {
                memberStatus.arrivedAt = new Date().toISOString()
                memberStatus.locationSharingEnabled = false
            } else {
                memberStatus.arrivedAt = null
            }
            this.memberStatuses.set(userId, memberStatus)
            return await this.save()
        }
        return false
    }

    async updateLocationSharing(userId: string, enabled: boolean): Promise<boolean> {
        const memberStatus = this.memberStatuses.get(userId)
        if (memberStatus) {
            memberStatus.locationSharingEnabled = enabled
            this.memberStatuses.set(userId, memberStatus)
            return await this.save()
        }
        return false
    }

    async updateMemberArrivalTime(userId: string, arrivedAt: Date | null): Promise<boolean> {
        const memberStatus = this.memberStatuses.get(userId)
        if (memberStatus) {
            memberStatus.arrivedAt = arrivedAt ? arrivedAt.toISOString() : null
            this.memberStatuses.set(userId, memberStatus)
            return await this.save()
        }
        return false
    }

    async updateMemberJoinedTime(userId: string, joinedAt: Date): Promise<boolean> {
        const memberStatus = this.memberStatuses.get(userId)
        if (memberStatus) {
            memberStatus.joinedAt = joinedAt.toISOString()
            this.memberStatuses.set(userId, memberStatus)
            return await this.save()
        }
        return false
    }

    allMembersArrived(): boolean {
        return Array.from(this.memberStatuses.values()).every(status => status.status === "arrived")
    }

    getArrivedMemberCount(): number {
        return Array.from(this.memberStatuses.values()).filter(status => status.status === "arrived").length
    }


    updateDetails(newTitle: string, newDateTime: Date, newDestination: HangoutSpot): boolean {
        if (this.updateTitle(newTitle) && this.updateDateTime(newDateTime) && this.updateDestination(newDestination)) {
            this.save();
            return true
        }
        return false
    }
    updateDateTime(newDateTime: Date): boolean {
        this.dateTime = newDateTime
        return true
    }

    updateCreator(newCreator: User): boolean {
        if (this.members.find(member => member.id === newCreator.id)) {
            this.creator = newCreator
            return true
        }
        return false
    }

    updateDestination(newDestination: HangoutSpot): boolean {
        this.destination = newDestination
        return true
    }

    updateTitle(newTitle: string): boolean {
        this.title = newTitle
        return true
    }

    async endMeetup(): Promise<boolean> {
        try {
        const meetupRef = doc(firestoreDB, "meetups", this.id)
        await updateDoc(meetupRef, {
            status: "ended",
            endedAt: new Date(),
        })
        return true
        } catch (error) {
        console.error("Error ending meetup:", error)
        return false
        }
    }
    
}