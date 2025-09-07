"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Clock, MapPin, MessageCircle, Bell } from "lucide-react"

interface SessionUpdate {
  id: string
  type: "join" | "leave" | "message" | "location_update" | "status_change"
  userId: string
  userName: string
  message?: string
  timestamp: string
}

interface RealTimeSessionStatusProps {
  sessionId: string
  participants: Array<{
    id: string
    user: {
      id: string
      name: string
      avatar_url?: string
    }
    status: string
  }>
}

export function RealTimeSessionStatus({ sessionId, participants }: RealTimeSessionStatusProps) {
  const [updates, setUpdates] = useState<SessionUpdate[]>([])
  const [onlineParticipants, setOnlineParticipants] = useState<string[]>([])

  // Mock real-time updates
  useEffect(() => {
    const mockUpdates: SessionUpdate[] = [
      {
        id: "1",
        type: "join",
        userId: "user2",
        userName: "Jane Smith",
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      },
      {
        id: "2",
        type: "location_update",
        userId: "user1",
        userName: "John Doe",
        message: "Started sharing location",
        timestamp: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
      },
      {
        id: "3",
        type: "message",
        userId: "user2",
        userName: "Jane Smith",
        message: "Running 5 minutes late, see you soon!",
        timestamp: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
      },
    ]

    setUpdates(mockUpdates)
    setOnlineParticipants(["user1", "user2"])

    // Simulate real-time updates
    const interval = setInterval(() => {
      const randomUpdate: SessionUpdate = {
        id: Date.now().toString(),
        type: Math.random() > 0.5 ? "location_update" : "message",
        userId: "user" + Math.floor(Math.random() * 3 + 1),
        userName: ["John Doe", "Jane Smith", "Mike Johnson"][Math.floor(Math.random() * 3)],
        message: Math.random() > 0.5 ? "Location updated" : "Just arrived at the venue!",
        timestamp: new Date().toISOString(),
      }

      setUpdates((prev) => [randomUpdate, ...prev.slice(0, 9)]) // Keep last 10 updates
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [sessionId])

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    return time.toLocaleDateString()
  }

  const getUpdateIcon = (type: SessionUpdate["type"]) => {
    switch (type) {
      case "join":
        return <Users className="w-4 h-4 text-green-600" />
      case "leave":
        return <Users className="w-4 h-4 text-red-600" />
      case "message":
        return <MessageCircle className="w-4 h-4 text-blue-600" />
      case "location_update":
        return <MapPin className="w-4 h-4 text-purple-600" />
      case "status_change":
        return <Clock className="w-4 h-4 text-orange-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getUpdateColor = (type: SessionUpdate["type"]) => {
    switch (type) {
      case "join":
        return "bg-green-50 border-green-200"
      case "leave":
        return "bg-red-50 border-red-200"
      case "message":
        return "bg-blue-50 border-blue-200"
      case "location_update":
        return "bg-purple-50 border-purple-200"
      case "status_change":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* Online Participants */}
      <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Online Now ({onlineParticipants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {participants
              .filter((p) => onlineParticipants.includes(p.user.id))
              .map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={participant.user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{participant.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-green-700">{participant.user.name}</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Updates */}
      <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Live Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {updates.map((update) => (
              <div key={update.id} className={`p-3 rounded-lg border ${getUpdateColor(update.type)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getUpdateIcon(update.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">{update.userName}</span>
                      <span className="text-xs text-gray-500">{formatTimeAgo(update.timestamp)}</span>
                    </div>
                    {update.message && <p className="text-sm text-gray-700">{update.message}</p>}
                    {update.type === "join" && <p className="text-sm text-gray-700">Joined the session</p>}
                    {update.type === "leave" && <p className="text-sm text-gray-700">Left the session</p>}
                  </div>
                </div>
              </div>
            ))}

            {updates.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No recent updates</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
