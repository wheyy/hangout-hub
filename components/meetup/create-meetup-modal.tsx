"use client"

import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Clock, Loader2, X } from "lucide-react"
import { Meetup } from "@/lib/data/meetup"
import { useRouter } from "next/navigation"
import { HangoutSpot } from "@/lib/data/hangoutspot"
import { useUserStore } from "@/hooks/user-store"
import { GooglePlacesService } from "@/lib/services/google-places"


interface CreateMeetupModalProps {
  isOpen: boolean
  onClose: () => void
  // onCreated: (meetup: Meetup) => void
}

export function CreateMeetupModal({ isOpen, onClose }: CreateMeetupModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "10:00",
  })

  const [destinationQuery, setDestinationQuery] = useState("")
  const [selectedDestination, setSelectedDestination] = useState<HangoutSpot | null>(null)
  const [suggestions, setSuggestions] = useState<Array<{placeId: string, description: string}>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const CURRENT_USER = useUserStore((s) => s.user);
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);


  // Handle autocomplete for destination
  useEffect(() => {
    if (destinationQuery.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true)
      try {
        const results = await GooglePlacesService.autocomplete(destinationQuery)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch (error) {
        console.error("Autocomplete error:", error)
        setSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [destinationQuery])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!CURRENT_USER) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/auth/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

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

  const handleSuggestionClick = async (suggestion: {placeId: string, description: string}) => {
    setDestinationQuery(suggestion.description)
    setShowSuggestions(false)
    setIsLoadingSuggestions(true)

    try {
      const placeDetails = await GooglePlacesService.searchPlace(suggestion.description)
      if (placeDetails) {
        const hangoutSpot = new HangoutSpot(
          placeDetails.placeId,
          placeDetails.name,
          placeDetails.types[0] || "place",
          "$$", // Default price level
          0, // Default rating
          0, // Default review count
          [placeDetails.geometry.location.lng, placeDetails.geometry.location.lat],
          placeDetails.name, // Use name as address for now
          "", // No thumbnail
          "" // No opening hours
        )
        setSelectedDestination(hangoutSpot)
      }
    } catch (error) {
      console.error("Error fetching place details:", error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDestination) {
      alert("Please select a destination from the suggestions")
      return
    }

    const [year, month, day] = formData.date.split("-").map(Number)
    const [hour, minute] = formData.time.split(":").map(Number)
    const dateTime = new Date(year, month - 1, day, hour, minute)

    const newMeetup: Meetup = await Meetup.create(
      formData.title,
      dateTime,
      selectedDestination,
      CURRENT_USER!
    )

    // Reset form
    setFormData({ title: "", date: "", time: "10:00" })
    setDestinationQuery("")
    setSelectedDestination(null)
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

          <div className="relative" ref={suggestionsRef}>
            <Label htmlFor="destination" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destination
            </Label>
            <div className="relative mt-1">
              <Input
                id="destination"
                placeholder="Search for a place..."
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                required
                className={selectedDestination ? "border-green-500" : ""}
              />
              {isLoadingSuggestions && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
              {selectedDestination && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDestination(null)
                    setDestinationQuery("")
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.placeId}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {suggestion.description}
                  </button>
                ))}
              </div>
            )}

            {selectedDestination && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Selected: {selectedDestination.name}
              </p>
            )}
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