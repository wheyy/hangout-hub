"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Clock, GripHorizontal } from "lucide-react"
import { singaporeSpots } from "@/lib/data/hangoutspot"
import Image from "next/image"

export function BottomSheet() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedTab, setSelectedTab] = useState("spots")

  const parkingSpots = singaporeSpots.filter((spot) => spot.parkingInfo?.available)

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case "$":
        return "bg-green-100 text-green-800"
      case "$$":
        return "bg-yellow-100 text-yellow-800"
      case "$$$":
        return "bg-orange-100 text-orange-800"
      case "$$$$":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 ${
        isExpanded ? "h-3/4" : "h-1/2"
      } bg-background rounded-t-xl border-t border-border shadow-lg`}
    >
      {/* Drag Handle */}
      <div className="flex justify-center py-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <GripHorizontal className="w-6 h-6 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="h-full pb-2">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mb-2">
            <TabsTrigger value="spots">Spots ({singaporeSpots.length})</TabsTrigger>
            <TabsTrigger value="parking">Parking ({parkingSpots.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="spots" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto px-4 space-y-3">
              {singaporeSpots.map((spot) => (
                <Card key={spot.id} className="cursor-pointer transition-all hover:shadow-md">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                        <Image
                          src={spot.imageUrl || "/placeholder.svg"}
                          alt={spot.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium">{spot.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {spot.category}
                          </Badge>
                          <Badge className={`text-xs ${getPriceRangeColor(spot.priceRange)}`}>{spot.priceRange}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{spot.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>2.3 km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>8 min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="parking" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto px-4 space-y-3">
              {parkingSpots.map((spot) => {
                const parking = spot.parkingInfo!
                return (
                  <Card key={spot.id} className="cursor-pointer transition-all hover:shadow-md">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-medium">{spot.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {parking.type}
                        </Badge>
                        {parking.capacity && parking.occupied && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            {parking.capacity - parking.occupied}/{parking.capacity} available
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{spot.address}</p>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
