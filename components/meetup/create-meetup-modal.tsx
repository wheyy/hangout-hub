"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Clock } from "lucide-react"
import { CURRENT_USER } from "@/lib/mock-data"
import { Meetup } from "@/types/invitation"
import { getMeetups, saveMeetups } from "@/lib/invitation-utils"
import { useRouter } from "next/navigation"

interface CreateMeetupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateMeetupModal({ isOpen, onClose }: CreateMeetupModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    date: "",
    time: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newMeetup: Meetup = {
      id: `meetup-${Date.now()}`,
      title: formData.title,
      destination: formData.destination,
      date: formData.date,
      time: formData.time,
      status: "active",
      memberCount: 1,
      creator: CURRENT_USER.name,
      creatorId: CURRENT_USER.id,
      members: [CURRENT_USER.id],
    }

    const existingMeetups = getMeetups()
    saveMeetups([...existingMeetups, newMeetup])

    // Reset form
    setFormData({ title: "", destination: "", date: "", time: "" })
    onClose()

    // Redirect to new meetup page
    router.push(`/meetup/${newMeetup.id}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Meetup</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Meetup Name
            </Label>
            <Input
              id="title"
              placeholder="e.g., Coffee at Marina Bay"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="destination" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destination
            </Label>
            <Input
              id="destination"
              placeholder="e.g., Marina Bay Sands SkyPark"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Create Meetup
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}