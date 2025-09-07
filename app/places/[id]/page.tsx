"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Star,
  Clock,
  Car,
  Share2,
  Heart,
  ArrowLeft,
  Coffee,
  UtensilsCrossed,
  TreePine,
  ShoppingBag,
  Gamepad2,
  Dumbbell,
  Palette,
  Calendar,
  Navigation,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

// Mock place data
const mockPlace = {
  id: "1",
  name: "Marina Bay Sands SkyPark",
  description:
    "Experience breathtaking 360-degree views of Singapore from the iconic SkyPark Observation Deck, located 200 meters above ground. This architectural marvel offers unparalleled vistas of the city skyline, Marina Bay, and beyond.",
  address: "10 Bayfront Ave, Singapore 018956",
  category: "entertainment",
  rating: 4.5,
  price_range: "expensive",
  parking_info: { available: true, type: "paid", details: "Valet parking available at $15/hour" },
  opening_hours: {
    monday: "09:30-22:00",
    tuesday: "09:30-22:00",
    wednesday: "09:30-22:00",
    thursday: "09:30-22:00",
    friday: "09:30-22:00",
    saturday: "09:30-22:00",
    sunday: "09:30-22:00",
  },
  images: ["/marina-bay-sands-skypark-observation-deck.jpg", "/singapore-city-skyline-view-from-skypark.jpg", "/marina-bay-sands-infinity-pool-area.jpg"],
  amenities: ["observation deck", "photography", "city views", "gift shop", "cafe"],
}

const categoryIcons = {
  cafe: Coffee,
  restaurant: UtensilsCrossed,
  park: TreePine,
  mall: ShoppingBag,
  entertainment: Gamepad2,
  sports: Dumbbell,
  cultural: Palette,
}

const priceRangeLabels = {
  free: "Free",
  budget: "$",
  moderate: "$$",
  expensive: "$$$",
}

export default function PlaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [place, setPlace] = useState(mockPlace)
  const [loading, setLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  const CategoryIcon = categoryIcons[place.category as keyof typeof categoryIcons]

  const handleCreateSession = () => {
    // Navigate to session creation with this place pre-selected
    router.push(`/sessions/create?placeId=${place.id}`)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: place.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("[v0] Share cancelled")
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  const handleGetDirections = () => {
    const encodedAddress = encodeURIComponent(place.address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()} className="text-gray-700 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Hangout Hub</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleShare} className="text-gray-700 hover:text-blue-600">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsFavorited(!isFavorited)}
                className={`${isFavorited ? "text-red-500 hover:text-red-600" : "text-gray-700 hover:text-red-500"}`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Image Gallery */}
        <div className="mb-6">
          <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-200">
            <img
              src={place.images[currentImageIndex] || "/placeholder.svg"}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            {place.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {place.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Place Info */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        {place.category}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                        {priceRangeLabels[place.price_range as keyof typeof priceRangeLabels]}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{place.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{place.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{place.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{place.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {place.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(place.opening_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center py-1">
                      <span className="capitalize font-medium text-gray-700">{day}</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Plan Your Visit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleCreateSession} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Meetup Session
                </Button>
                <Button
                  onClick={handleGetDirections}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            {/* Parking Info */}
            {place.parking_info?.available && (
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Parking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available</span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Yes</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Type</span>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 capitalize">
                        {place.parking_info.type}
                      </Badge>
                    </div>
                    {place.parking_info.details && (
                      <p className="text-sm text-gray-600 mt-2">{place.parking_info.details}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map Placeholder */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Interactive map coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
