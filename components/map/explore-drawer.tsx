"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, MapPin, Clock } from "lucide-react"
import { singaporeSpots } from "@/lib/data/hangoutspot"
import Image from "next/image"
import { SearchBar } from "./search-bar"

export function ExploreDrawer() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null)

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
      className={`absolute left-0 top-0 bottom-0 z-10 transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-80"
      } bg-background/95 backdrop-blur-sm border-r border-border`}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-6 h-8 p-0 bg-background border border-border rounded-r-md z-20"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {!isCollapsed && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Explore Spots</h2>
            <p className="text-sm text-muted-foreground">{singaporeSpots.length} places found</p>
          </div>
          {/* <div className="p-2">
          <SearchBar />
          </div> */}
          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {singaporeSpots.map((spot) => (
              <Card
                key={spot.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSpot === spot.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedSpot(spot.id)}
              >
                <CardHeader className="p-3 pb-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate">{spot.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {spot.category}
                        </Badge>
                        <Badge className={`text-xs ${getPriceRangeColor(spot.priceRange)}`}>{spot.priceRange}</Badge>
                      </div>
                    </div>
                    <div className="relative w-12 h-12 rounded-md overflow-hidden ml-2 shrink-0">
                      <Image src={spot.imageUrl || "/placeholder.svg"} alt={spot.name} fill className="object-cover" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{spot.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{spot.rating}</span>
                      <span>({spot.reviewCount})</span>
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
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{spot.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
