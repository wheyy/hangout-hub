
import { HangoutSpot } from "./hangoutspot"

export interface Invitation {
  id: string
  meetupId: string
  meetupTitle: string
  destination: string, 
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
