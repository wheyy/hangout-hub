// export interface User {
//   id: string
//   name: string
//   email: string
// }

import { HangoutSpot } from "./hangoutspot"

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

// export interface Meetup {
//   id: string
//   title: string
//   destination: string
//   date: string
//   time: string
//   status: string
//   memberCount: number
//   creator: string
//   creatorId: string
//   members: string[] // Array of user IDs
// }