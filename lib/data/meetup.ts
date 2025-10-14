import { HangoutSpot } from "./hangoutspot"
import { User } from "./user"


// Feel free to update this class, I did not vet the behaviours
export class Meetup {
    private members: User[] = []

    constructor(
        public id: string,
        public title: string,
        public dateTime: Date,
        // public destination: HangoutSpot,
        public destination: string, //TODO: CHANGE TO HANGOUT SPOT WHEN Location search by Map Team is done
        public creator: User
    ) {
        this.members.push(creator) // Creator is automatically a member
        this.creator.addMeetup(this)
    }

    static saveMeetup(meetup: Meetup): boolean {
        // Placeholder for saving to a database or external storage
        try {
            
        } catch (error) {
            console.error("Error saving meetup:", error)
            return false
        }
        console.log(`Meetup ${meetup.title} saved.`)
        return true
    }

    addMember(user: User): void {
        if (!this.members.find(member => member.id === user.id)) {
            this.members.push(user)
        }
    }

    removeMember(user: User): void {
        this.members = this.members.filter(member => member.id !== user.id)
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

    // updateDestination(newHangoutSpot: HangoutSpot): boolean {
    //     this.destination = newHangoutSpot
    //     return true
    // }

    updateTitle(newTitle: string): boolean {
        this.title = newTitle
        return true
    }
}