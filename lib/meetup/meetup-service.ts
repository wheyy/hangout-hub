import type { MeetupSession, MeetupMember } from "./meetup-types"
import { haversineDistance } from "@/lib/utils/distance"

export class MeetupService {
  private static sessions: Map<string, MeetupSession> = new Map()
  private static currentUserId = "user-1" // Mock current user

  static async createSession(data: {
    title: string
    destination: { name: string; coordinates: [number, number]; address: string }
    scheduledTime: Date
  }): Promise<MeetupSession> {
    const session: MeetupSession = {
      id: `session-${Date.now()}`,
      title: data.title,
      hostId: this.currentUserId,
      hostName: "You",
      destination: data.destination,
      scheduledTime: data.scheduledTime,
      status: "scheduled",
      members: [
        {
          id: this.currentUserId,
          name: "You",
          avatar: "/diverse-user-avatars.png",
          status: "accepted",
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
    }

    this.sessions.set(session.id, session)
    return session
  }

  static async getSession(sessionId: string): Promise<MeetupSession | null> {
    return this.sessions.get(sessionId) || null
  }

  static async startSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Session not found")

    session.status = "active"
    session.startedAt = new Date()

    // Start location sharing for host
    const hostMember = session.members.find((m) => m.id === session.hostId)
    if (hostMember) {
      hostMember.status = "sharing"
    }

    this.sessions.set(sessionId, session)
  }

  static async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Session not found")

    session.status = "ended"
    session.endedAt = new Date()

    // Stop location sharing for all members
    session.members.forEach((member) => {
      if (member.status === "sharing") {
        member.status = "arrived"
      }
    })

    this.sessions.set(sessionId, session)
  }

  static async updateMemberLocation(sessionId: string, memberId: string, coordinates: [number, number]): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Session not found")

    const member = session.members.find((m) => m.id === memberId)
    if (!member) throw new Error("Member not found")

    member.location = coordinates
    member.lastUpdated = new Date()

    // Check if member is within 50m of destination (auto-stop)
    const distance = haversineDistance(coordinates, session.destination.coordinates)

    if (distance <= 50 && member.status === "sharing") {
      member.status = "arrived"
      member.arrivedAt = new Date()
    }

    // Check if all members have arrived (auto-end)
    const allArrived = session.members.every((m) => m.status === "arrived")
    if (allArrived && session.status === "active") {
      await this.endSession(sessionId)
    }

    this.sessions.set(sessionId, session)
  }

  static async addMockMembers(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error("Session not found")

    const mockMembers: MeetupMember[] = [
      {
        id: "user-2",
        name: "Alice Chen",
        avatar: "/alice-avatar.png",
        status: "sharing",
        location: [103.8198, 1.3521], // Singapore center
        joinedAt: new Date(Date.now() - 300000), // 5 minutes ago
        lastUpdated: new Date(),
      },
      {
        id: "user-3",
        name: "Bob Kumar",
        avatar: "/bob-avatar.jpg",
        status: "on-the-way",
        location: [103.815, 1.348], // Nearby location
        joinedAt: new Date(Date.now() - 600000), // 10 minutes ago
        lastUpdated: new Date(),
      },
      {
        id: "user-4",
        name: "Carol Tan",
        avatar: "/carol-avatar.jpg",
        status: "accepted",
        joinedAt: new Date(Date.now() - 120000), // 2 minutes ago
      },
    ]

    session.members.push(...mockMembers)
    this.sessions.set(sessionId, session)
  }

  static simulateLocationUpdates(sessionId: string): () => void {
    const interval = setInterval(async () => {
      const session = this.sessions.get(sessionId)
      if (!session || session.status !== "active") {
        clearInterval(interval)
        return
      }

      // Simulate location updates for sharing members
      for (const member of session.members) {
        if (member.status === "sharing" && member.location) {
          // Move slightly towards destination
          const [destLng, destLat] = session.destination.coordinates
          const [currentLng, currentLat] = member.location

          const newLng = currentLng + (destLng - currentLng) * 0.1
          const newLat = currentLat + (destLat - currentLat) * 0.1

          await this.updateMemberLocation(sessionId, member.id, [newLng, newLat])
        }
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }


  static getStatusColor(status: string): string {
    switch (status) {
      case "invited":
        return "#6b7280" // gray
      case "accepted":
        return "#3b82f6" // blue
      case "on-the-way":
        return "#f59e0b" // amber
      case "sharing":
        return "#10b981" // emerald
      case "arrived":
        return "#22c55e" // green
      case "paused":
        return "#ef4444" // red
      default:
        return "#6b7280"
    }
  }

  static getStatusLabel(status: string): string {
    switch (status) {
      case "invited":
        return "Invited"
      case "accepted":
        return "Accepted"
      case "on-the-way":
        return "On the way"
      case "sharing":
        return "Sharing location"
      case "arrived":
        return "Arrived"
      case "paused":
        return "Paused"
      default:
        return "Unknown"
    }
  }
}
