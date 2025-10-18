import { Meetup } from "./meetup"


export class User {

    private meetups: Meetup[] = [];
    public notifyUpdate?: () => void; // optional callback injected by Zustand
  
    constructor(
      public id: string,
      public name: string,
      public email: string,
      public currentLocation: [longitude: number, latitude: number] | null,
    ) {}
  
    addMeetup(meetup: Meetup): void {
      if (!this.meetups.find((m) => m.id === meetup.id)) {
        this.meetups.push(meetup);
        console.log("Meetup added to user meetups.");
        this.notifyUpdate?.(); 
      } else {
        console.log("Meetup already exists in user's meetups.");
      }
    }
  
    removeMeetup(meetup: Meetup): void {
        console.log("Before removal:", this.meetups);
        this.meetups = this.meetups.filter((m) => m.id !== meetup.id);
        console.log("After removal:", this.meetups);
        this.notifyUpdate?.(); // trigger update
      }
  
    getMeetups(): Array<Meetup> {
      console.log("Retrieving user meetups in getMeetups():", this.meetups);
      
      return this.meetups;
    }

    getUsername(): string {
        return this.name
    }

    getId(): string {
        return this.id
    }
}