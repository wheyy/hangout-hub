export interface User {
  id: string
  name: string
  email: string
}

export interface Invitation {
  id: string
  meetupId: string
  meetupTitle: string
  destination: string
  date: string
  time: string
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

export interface Meetup {
  id: string
  title: string
  destination: string
  date: string
  time: string
  status: string
  memberCount: number
  creator: string
  creatorId: string
  members: string[] // Array of user IDs
}