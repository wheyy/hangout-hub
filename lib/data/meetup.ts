import { HangoutSpot } from "./hangoutspot"
import { User } from "./user"


// Feel free to update this class, I did not vet the behaviours
export class Meetup {
    private members: User[] = []

    constructor(
        public id: string,
        public title: String,
        public dateTime: Intl.DateTimeFormat,
        public destination: HangoutSpot,
        public leader: User
    ) {
        this.members.push(leader) // Leader is automatically a member
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

    updateDateTime(newDateTime: Intl.DateTimeFormat): boolean {
        this.dateTime = newDateTime
        return true
    }

    updateLeader(newLeader: User): boolean {
        if (this.members.find(member => member.id === newLeader.id)) {
            this.leader = newLeader
            return true
        }
        return false
    }

    updateDestination(newHangoutSpot: HangoutSpot): boolean {
        this.destination = newHangoutSpot
        return true
    }

    updateTitle(newTitle: String): boolean {
        this.title = newTitle
        return true
    }
}