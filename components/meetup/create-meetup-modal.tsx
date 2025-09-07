"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, X, Users } from "lucide-react"
import { MeetupService } from "@/lib/meetup/meetup-service"

interface CreateMeetupModalProps {
  onClose: () => void
  onSessionCreated: (sessionId: string) => void
}

export function CreateMeetupModal({ onClose, onSessionCreated }: CreateMeetupModalProps) {
  const [title, setTitle] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!title || !destination || !date || !time) return

    setIsCreating(true)

    try {
      const scheduledTime = new Date(`${date}T${time}`)
      const session = await MeetupService.createSession({
        title,
        destination: {
          name: destination,
          coordinates: [103.8591, 1.2834], // Marina Bay (mock)
          address: "Marina Bay, Singapore",
        },
        scheduledTime,
      })

      // Add mock members for demo
      await MeetupService.addMockMembers(session.id)

      onSessionCreated(session.id)
    } catch (error) {
      console.error("Failed to create meetup:", error)
    } finally {
      setIsCreating(false)
    }
  }

  // Set default values
  const today = new Date()
  const defaultDate = today.toISOString().split("T")[0]
  const defaultTime = new Date(today.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5) // 1 hour from now

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Create Meet-Up
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meet-up Title</Label>
            <Input
              id="title"
              placeholder="e.g., Coffee at Marina Bay"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="destination"
                placeholder="Where are you meeting?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={date || defaultDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time || defaultTime}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title || !destination || isCreating} className="flex-1">
              {isCreating ? "Creating..." : "Create Meet-Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
