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
        creator.addMeetup(this)
        console.log(`Meetup ${this.title} created by ${this.creator.name}`)
    }

    static saveMeetupToFirestore(meetup: Meetup): boolean {
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

    tempGetDestination(): string {
        return this.destination
    }

    getStatus(): "active" | "completed" {
        const now = new Date()
        return now < this.dateTime ? "active" : "completed"
    }

    updateDetails(newTitle: string, newDateTime: Date, newDestination: string): boolean {
        if (this.updateTitle(newTitle) && this.updateDateTime(newDateTime) && this.tempUpdateDestination(newDestination)) {
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

    // updateDestination(newHangoutSpot: HangoutSpot): boolean {
    //     this.destination = newHangoutSpot
    //     return true
    // }

    tempUpdateDestination(newDestination: string): boolean {
        this.destination = newDestination
        return true
    }

    updateTitle(newTitle: string): boolean {
        this.title = newTitle
        return true
    }

    deleteMeetup(): boolean {
        try {
          console.log("Deleting meetup:", this.id);
          for (const member of this.members) {
            console.log("Removing meetup for member:", member.getId());
            member.removeMeetup(this);
          }
          this.members = [];
          console.log(`Meetup ${this.title} deleted.`);
          return true;
        } catch (error) {
          console.error("Error while deleting meetup:", error);
          return false;
        }
      }
    
}