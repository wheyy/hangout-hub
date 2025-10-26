"use client"

import { HangoutSpot } from "@/lib/models/hangoutspot"
import { Star, MapPin, ArrowLeft, Users, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/hooks/user-store"

interface HangoutSpotCardProps {
  spot: HangoutSpot
  variant: "compact" | "expanded"
  onClick?: () => void
  onBack?: () => void
  onGetDirections?: (spot: HangoutSpot) => void
  onOpenCreateMeetup?: (spot: HangoutSpot) => void
}

function getPriceRangeColor(priceRange: string) {
  switch (priceRange) {
    case "$":
      return "bg-green-100 text-green-800 border-green-200"
    case "$$":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "$$$":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "$$$$":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getOpenStatus(openingHours: string) {
  const isOpen = openingHours.toLowerCase().includes("open")
  return {
    status: isOpen ? "Open" : "Closed",
    color: isOpen ? "text-green-600" : "text-red-600"
  }
}

export function HangoutSpotCard({ spot, variant, onClick, onBack, onGetDirections, onOpenCreateMeetup }: HangoutSpotCardProps) {
  const [imageError, setImageError] = useState(false)
  const router = useRouter()
  const currentUser = useUserStore((s) => s.user)

  const handleCreateMeetup = () => {
    if (!currentUser) {
      router.push('/auth/register')
      return
    }

    onOpenCreateMeetup?.(spot)
  }

  if (variant === "compact") {
    const openStatus = getOpenStatus(spot.openingHours)
    
    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all"
      >
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-1">{spot.name}</h3>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {spot.category}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium">{spot.priceRange}</span>
            <span className={`font-medium ${openStatus.color}`}>
              {openStatus.status}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{spot.rating}</span>
            <span className="text-gray-500">({spot.reviewCount})</span>
          </div>

          <div className="flex items-start gap-1 text-xs text-gray-600">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{spot.address}</span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="bg-white h-full overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Back to list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
          {!imageError && spot.thumbnailUrl && spot.thumbnailUrl !== "/placeholder.svg" ? (
            <img
              src={spot.thumbnailUrl}
              alt={spot.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image available</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">{spot.name}</h3>
          
          <div className="flex items-center gap-2 text-sm mb-3">
            <span className="font-medium">{spot.priceRange}</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {spot.category}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{spot.rating}</span>
            <span className="text-gray-500 text-sm">({spot.reviewCount} reviews)</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2">Opening Hours</h4>
            <div className="text-sm text-gray-600">
              <p>{spot.openingHours}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Address</h4>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{spot.address}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleCreateMeetup}>
            <Users className="w-4 h-4 mr-2" />
            Create Meetup
          </Button>
          <Button className="w-full" onClick={() => onGetDirections?.(spot)}>
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </div>
      </div>
    </div>
  )
}

export function HangoutSpotCardSkeleton() {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-4">
      <div className="space-y-2 animate-pulse">
        <div className="flex items-start justify-between gap-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-12"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>

        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  )
}
