export interface Invitation {
  id: string
  meetupId: string
  meetupTitle: string
  // destination: HangoutSpot
  destination: string, //TODO: CHANGE TO HANGOUT SPOT WHEN Location search by Map Team is done
  dateTime: Date
  senderId: string
  senderName: string
  senderEmail: string
  recipientId: string
  recipientEmail: string
  recipientName: string
  status: "pending" | "accepted" | "rejected"
  sentAt: string
  respondedAt?: string
}


// public getId(): string {
//   return this.id;
// }

// public setId(id: string): void {
//   this.id = id;
// }

// public getMeetup(): Meetup {
//   return this.meetup;
// }

// public setMeetup(meetup: Meetup): void {
//   this.meetup = meetup;
// }

// public getSender(): User {
//   return this.sender;
// }

// public setSender(sender: User): void {
//   this.sender = sender;
// }

// public getRecipient(): User {
//   return this.recipient;
// }

// public setRecipient(recipient: User): void {
//   this.recipient = recipient;
// }

// public getStatus(): "pending" | "accepted" | "rejected" {
//   return this.status;
// }

// public setStatus(status: "pending" | "accepted" | "rejected"): void {
//   this.status = status;
// }

