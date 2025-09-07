"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Play, Square, Clock, MapPin, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { MeetupService } from "@/lib/meetup/meetup-service"
import type { MeetupSession } from "@/lib/meetup/meetup-types"

interface SessionHeaderProps {
  session: MeetupSession
  onSessionUpdate: (session: MeetupSession) => void
}

export function SessionHeader({ session, onSessionUpdate }: SessionHeaderProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStartSession = async () => {
    setIsUpdating(true)
    try {
      await MeetupService.startSession(session.id)
      const updatedSession = await MeetupService.getSession(session.id)
      if (updatedSession) {
        onSessionUpdate(updatedSession)
      }
    } catch (error) {
      console.error("Failed to start session:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEndSession = async () => {
    setIsUpdating(true)
    try {
      await MeetupService.endSession(session.id)
      const updatedSession = await MeetupService.getSession(session.id)
      if (updatedSession) {
        onSessionUpdate(updatedSession)
      }
    } catch (error) {
      console.error("Failed to end session:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getLastUpdated = () => {
    const sharingMembers = session.members.filter((m) => m.status === "sharing" && m.lastUpdated)
    if (sharingMembers.length === 0) return null

    const lastUpdate = Math.max(...sharingMembers.map((m) => m.lastUpdated!.getTime()))
    const secondsAgo = Math.floor((Date.now() - lastUpdate) / 1000)

    if (secondsAgo < 60) return `${secondsAgo}s ago`
    const minutesAgo = Math.floor(secondsAgo / 60)
    return `${minutesAgo}m ago`
  }

  const getStatusBadge = () => {
    switch (session.status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      case "active":
        return <Badge className="bg-green-500 text-white">Live</Badge>
      case "ended":
        return <Badge variant="secondary">Ended</Badge>
      default:
        return null
    }
  }

  const isHost = session.hostId === "user-1" // Mock current user check

  return (
    <div className="absolute top-4 left-4 right-4 z-20">
      <Card className="floating-panel p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm">{session.title}</h1>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{session.destination.name}</span>
                </div>
                {session.status === "active" && getLastUpdated() && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {getLastUpdated()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Host Controls */}
          {isHost && (
            <div className="flex items-center gap-2">
              {session.status === "scheduled" && (
                <Button
                  size="sm"
                  onClick={handleStartSession}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              {session.status === "active" && (
                <Button size="sm" variant="destructive" onClick={handleEndSession} disabled={isUpdating}>
                  <Square className="w-4 h-4 mr-1" />
                  End
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Session ended banner */}
        {session.status === "ended" && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-2xl">🎉</div>
              <div>
                <p className="font-medium text-green-800 text-sm">Session completed!</p>
                <p className="text-green-600 text-xs">Everyone has arrived at the destination.</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
