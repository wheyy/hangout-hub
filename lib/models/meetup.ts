import { HangoutSpot } from "./hangoutspot"
import { User } from "./user"
import { db } from "@/lib/config/firebase";
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
            locationSharingEnabled: true,
            arrivedAt: null,
            joinedAt: new Date().toISOString()
        })
        creator.addMeetup(this)
        console.log(`Meetup ${this.title} created by ${this.creator.name}`)
    }

    // ✅ Load a single meetup from Firestore
    static async load(meetupId: string): Promise<Meetup | null> {
        try {
            const meetupDoc = await getDoc(doc(db, "meetups", meetupId));
            
            if (!meetupDoc.exists()) {
                console.log("Meetup not found");
                return null;
            }
            
            const data = meetupDoc.data();
            const creator = await User.loadFromFirestore(data.creatorId);

            // ✅ Parse dateTime carefully
            let dateTime: Date;
            
            if (data.dateTime instanceof Date) {
            // Already a Date object
            dateTime = data.dateTime;
            } else if (typeof data.dateTime === 'string') {
            // ISO string
            dateTime = new Date(data.dateTime);
            } else if (data.dateTime?.seconds) {
            // Firestore Timestamp
            dateTime = new Date(data.dateTime.seconds * 1000);
            } else {
            console.error(`❌ Invalid dateTime format:`, data.dateTime);
            return null;
            }
            
            // ✅ Validate the date
            if (isNaN(dateTime.getTime())) {
            console.error(`❌ Invalid date after parsing:`, data.dateTime);
            throw new Error("Invalid date format");
            }
            
            console.log("✅ Parsed dateTime:", dateTime);

            if (!creator) {
                console.error(`❌ Creator ${data.creatorId} not found`);
                throw new Error("Creator not found");
            }

            // Parse destination as HangoutSpot
            const destinationData = data.destination
            const destination = new HangoutSpot(
                destinationData.id,
                destinationData.name,
                destinationData.category,
                destinationData.priceRange,
                destinationData.rating,
                destinationData.reviewCount,
                destinationData.coordinates,
                destinationData.address,
                destinationData.thumbnailUrl,
                destinationData.openingHours
            )

            const meetup = new Meetup(
                meetupDoc.id,
                data.title,
                dateTime,
                destination,
                creator!
            );
            
            // Load member statuses
            if (data.members) {
                Object.entries(data.members).forEach(([userId, statusData]: [string, any]) => {
                    meetup.memberStatuses.set(userId, {
                        userId,
                        status: statusData.status || "traveling",
                        locationSharingEnabled: statusData.locationSharingEnabled ?? true,
                        arrivedAt: statusData.arrivedAt || null,
                        joinedAt: statusData.joinedAt
                    })
                })
            }
            
            // Fetch users from user db
            data.memberIds.forEach(async (memberId: string) => {
                if (memberId !== meetup.creator.id) {
                    const member = await User.loadFromFirestore(memberId);
                    if (member) {
                        meetup.addMemberWithoutStatus(member);
                    }
                }
            });
            
            return meetup;
        } catch (e) {
            console.error("Error loading meetup:", e);
            return null;
        }
    }

    // ✅ Update meetup in Firestore
    async save(): Promise<boolean> {
        try {
            const memberStatusesObj: Record<string, Omit<MemberStatus, 'userId'>> = {}
            this.memberStatuses.forEach((status, userId) => {
                memberStatusesObj[userId] = {
                    status: status.status,
                    locationSharingEnabled: status.locationSharingEnabled,
                    arrivedAt: status.arrivedAt,
                    joinedAt: status.joinedAt
                }
            })

            console.log("Updating meetup in Firestore:", this.id);
            console.log("Members:", this.getMemberIds());
            await updateDoc(doc(db, "meetups", this.id), {
                title: this.title,
                dateTime: this.dateTime.toISOString(),
                destination: {
                    id: this.destination.id,
                    name: this.destination.name,
                    category: this.destination.category,
                    priceRange: this.destination.priceRange,
                    rating: this.destination.rating,
                    reviewCount: this.destination.reviewCount,
                    coordinates: this.destination.coordinates,
                    address: this.destination.address,
                    thumbnailUrl: this.destination.thumbnailUrl,
                    openingHours: this.destination.openingHours,
                },
                memberIds: this.getMemberIds(),
                members: memberStatusesObj,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (e) {
            console.error("Error updating meetup:", e);
            return false;
        }
    }

    // ✅ Delete meetup from Firestore
    async deleteMeetup(): Promise<boolean> {
        try {
            console.log("Deleting meetup:", this.id);
            
            // Remove from all members
            for (const member of this.members) {
                console.log("Removing meetup for member:", member.getId());
                member.removeMeetup(this);
            }
            this.members = [];
            
            // Delete from Firestore
            await deleteDoc(doc(db, "meetups", this.id));
            
            console.log(`Meetup ${this.title} deleted.`);
            return true;
        } catch (error) {
            console.error("Error while deleting meetup:", error);
            return false;
        }
    }

    // ✅ Add member and update Firestore
    async addMember(user: User): Promise<void> {
        if (!this.members.find(member => member.id === user.id)) {
            this.members.push(user);
            this.memberStatuses.set(user.id, {
                userId: user.id,
                status: "traveling",
                locationSharingEnabled: true,
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
        const meetupRef = doc(db, "meetups", this.id)
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