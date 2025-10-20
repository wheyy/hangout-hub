"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Clock } from "lucide-react"
// import { CURRENT_USER } from "@/lib/mock-data"
import { Meetup } from "@/lib/data/meetup"
// import { getMeetups, saveMeetups } from "@/lib/invitation-utils"
import { useRouter } from "next/navigation"
import { HangoutSpot } from "@/lib/data/hangoutspot"
import { on } from "events"
import { useUserStore } from "@/hooks/user-store"


interface CreateMeetupModalProps {
  isOpen: boolean
  onClose: () => void
  // onCreated: (meetup: Meetup) => void
}

export function CreateMeetupModal({ isOpen, onClose }: CreateMeetupModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    date: "",
    time: "10:00", // 24h HH:mm from <input type="time">
  })

  const CURRENT_USER = useUserStore((s) => s.user);
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);


  useEffect(() => {
    if (!CURRENT_USER) {
      // Countdown from 10 to 0
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/auth/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Update every second
  
      return () => clearInterval(interval);
    }
  }, [CURRENT_USER, router]);
  
  if (!CURRENT_USER) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg font-semibold">Unable to create meetup if not logged in.</p>
        <p className="text-sm text-gray-600 mt-2">
          Redirecting to login in {countdown} seconds...
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {

    const [year, month, day] = formData.date.split("-").map(Number)   // "YYYY-MM-DD"
    const [hour, minute]      = formData.time.split(":").map(Number)   // "HH:mm"

    const dateTime = new Date(year, month - 1, day, hour, minute)

    e.preventDefault()

    const newMeetup: Meetup = await Meetup.create(
      formData.title, // title
      //format dd/mm/yyyy
      dateTime, //dateTime
      formData.destination, // destination
      CURRENT_USER, // creator
    )
    // Meetup.saveMeetupToFirestore(newMeetup)

    // onCreated?.(newMeetup)

    // Reset form
    setFormData({ title: "", destination: "", date: "", time: "10:00" })
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

                // Trying to change the current placeholder of "--:-- --" 
                // because i feel like it's not very user friendly, I wouldn't know that I have to type AM/PM as the last part
                // BUT both methods dont seem to work so I'll just use default value of 10:00 AM for now
                // lang="en-GB"
                // placeholder="HH:MM AM"
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
            <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-700 text-white"> 
              {/* or bg-blue-600 hover: bg-blue-800 */}
              Create Meetup
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}