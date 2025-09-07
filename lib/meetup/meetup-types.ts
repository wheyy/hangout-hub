export interface MeetupSession {
  id: string
  title: string
  hostId: string
  hostName: string
  destination: {
    name: string
    coordinates: [number, number]
    address: string
  }
  scheduledTime: Date
  status: "scheduled" | "active" | "ended"
  members: MeetupMember[]
  createdAt: Date
  startedAt?: Date
  endedAt?: Date
}

export interface MeetupMember {
  id: string
  name: string
  avatar: string
  status: "invited" | "accepted" | "on-the-way" | "arrived" | "sharing" | "paused"
  location?: [number, number]
  lastUpdated?: Date
  joinedAt?: Date
  arrivedAt?: Date
}

export interface LocationUpdate {
  memberId: string
  sessionId: string
  coordinates: [number, number]
  timestamp: Date
  accuracy?: number
}

export type MeetupStatus = "invited" | "accepted" | "on-the-way" | "arrived" | "sharing" | "paused"
