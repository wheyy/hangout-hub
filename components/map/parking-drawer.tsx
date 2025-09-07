"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, ChevronRight, MapPin, Clock, DollarSign } from "lucide-react"
import { singaporeSpots } from "@/lib/data/singapore-spots"

export function ParkingDrawer() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showParkingLayer, setShowParkingLayer] = useState(true)

  const parkingSpots = singaporeSpots.filter((spot) => spot.parkingInfo?.available)

  const getAvailabilityColor = (occupied: number, capacity: number) => {
    const percentage = (occupied / capacity) * 100
    if (percentage >= 80) return "bg-red-100 text-red-800"
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getAvailabilityText = (occupied: number, capacity: number) => {
    const available = capacity - occupied
    const percentage = ((capacity - occupied) / capacity) * 100
    return `${available}/${capacity} (${Math.round(percentage)}%)`
  }

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 z-10 transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-80"
      } bg-background/95 backdrop-blur-sm border-l border-border`}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-6 h-8 p-0 bg-background border border-border rounded-l-md z-20"
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>

      {!isCollapsed && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Parking</h2>
              <Switch checked={showParkingLayer} onCheckedChange={setShowParkingLayer} />
            </div>
            <p className="text-sm text-muted-foreground">{parkingSpots.length} parking areas</p>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Limited</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Full</span>
              </div>
            </div>
          </div>

          {/* Parking List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {parkingSpots.map((spot) => {
              const parking = spot.parkingInfo!
              return (
                <Card key={spot.id} className="cursor-pointer transition-all hover:shadow-md">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-medium">{spot.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {parking.type}
                      </Badge>
                      {parking.capacity && parking.occupied && (
                        <Badge className={`text-xs ${getAvailabilityColor(parking.occupied, parking.capacity)}`}>
                          {getAvailabilityText(parking.occupied, parking.capacity)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{spot.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{spot.openingHours}</span>
                      </div>
                      {parking.pricePerHour && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>${parking.pricePerHour}/hour</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2 text-xs bg-transparent">
                      Show on Map
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
