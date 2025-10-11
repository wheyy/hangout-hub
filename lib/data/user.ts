import { Meetup } from "./meetup"


export class User {

    private meetups: Meetup[] = []
    

    constructor(
        public id: string,
        public name: string,
        public email: string,
        public currentLocation: GeolocationCoordinates,
    ) {
        this.meetups = []
    }

    addMeetup(meetup: Meetup): void {
        if (!this.meetups.find(m => m.id === meetup.id)) {
            this.meetups.push(meetup)
        }
    }

    removeMeetup(meetup: Meetup): void {
        this.meetups = this.meetups.filter(m => m.id !== meetup.id)
    }

    getMeetups(): Array<Meetup> {
        return this.meetups
    }

    getUsername(): string {
        return this.name
    }

    getId(): string {
        return this.id
    }
}