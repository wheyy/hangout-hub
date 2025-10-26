"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Clock } from "lucide-react"
import { Meetup } from "@/lib/models/meetup"
import { useRouter } from "next/navigation"
import { HangoutSpot } from "@/lib/models/hangoutspot"
import { useUserStore } from "@/hooks/user-store"

interface CreateMeetupModalWithDestinationProps {
  isOpen: boolean
  onClose: () => void
  hangoutSpot: HangoutSpot | null
}

export function CreateMeetupModalWithDestination({
  isOpen,
  onClose,
  hangoutSpot
}: CreateMeetupModalWithDestinationProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "10:00",
  })

  const CURRENT_USER = useUserStore((s) => s.user)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hangoutSpot || !CURRENT_USER) {
      return
    }

    const [year, month, day] = formData.date.split("-").map(Number)
    const [hour, minute] = formData.time.split(":").map(Number)
    const dateTime = new Date(year, month - 1, day, hour, minute)

    const newMeetup: Meetup = await Meetup.create(
      formData.title,
      dateTime,
      hangoutSpot,
      CURRENT_USER
    )

    setFormData({ title: "", date: "", time: "10:00" })
    onClose()

    router.push(`/meetup/${newMeetup.id}`)
  }

  const handleClose = () => {
    setFormData({ title: "", date: "", time: "10:00" })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
              value={hangoutSpot?.name || ""}
              readOnly
              disabled
              className="mt-1 bg-gray-50 text-gray-700 cursor-not-allowed"
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
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-700 text-white">
              Create Meetup
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
