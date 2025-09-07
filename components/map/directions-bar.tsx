"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowUpDown, X, Car, Bus, PersonStanding, Clock, Route } from "lucide-react"
import { DirectionsService, type DirectionsRequest, type DirectionsResult } from "@/lib/directions/directions-service"
import { useMap } from "@/lib/map/map-provider"
import { useIsMobile } from "@/hooks/use-mobile"

interface DirectionsBarProps {
  onClose: () => void
}

export function DirectionsBar({ onClose }: DirectionsBarProps) {
  const isMobile = useIsMobile()
  const { map } = useMap()
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [travelMode, setTravelMode] = useState<"driving" | "transit" | "walking">("driving")
  const [directions, setDirections] = useState<DirectionsResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const travelModes = [
    { id: "driving" as const, label: "Drive", icon: Car },
    { id: "transit" as const, label: "Transit", icon: Bus },
    { id: "walking" as const, label: "Walk", icon: PersonStanding },
  ]

  const handleSwapLocations = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  const handleUseCurrentLocation = (field: "origin" | "destination") => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationText = "Current Location"
        if (field === "origin") {
          setOrigin(locationText)
        } else {
          setDestination(locationText)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
      },
    )
  }

  const getDirections = async () => {
    if (!origin || !destination || !map) return

    setIsLoading(true)

    try {
      // Mock coordinates - in real app, would geocode the addresses
      const originCoords: [number, number] = [103.8198, 1.3521] // Singapore center
      const destCoords: [number, number] = [103.8591, 1.2834] // Marina Bay

      const request: DirectionsRequest = {
        origin: originCoords,
        destination: destCoords,
        travelMode,
      }

      const result = await DirectionsService.getDirections(request)
      setDirections(result)

      // Draw route on map
      map.addLayer({
        id: "directions-route",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: result.route.coordinates,
            },
          },
        },
        paint: {
          "line-color": "#0891b2",
          "line-width": 4,
          "line-opacity": 0.8,
        },
      })

      // Fit map to route bounds
      map.fitBounds(result.route.bounds)
    } catch (error) {
      console.error("Directions error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearDirections = () => {
    setDirections(null)
    if (map) {
      try {
        map.removeLayer("directions-route")
      } catch (e) {
        // Layer might not exist
      }
    }
  }

  const handleClose = () => {
    clearDirections()
    onClose()
  }

  return (
    <div className={`absolute top-4 left-4 right-4 z-20 ${isMobile ? "left-4 right-4" : "left-84 right-84"}`}>
      {/* Directions Container */}
      <div className="floating-panel p-4 space-y-3">
        {/* Header with close button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Directions</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Origin Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full"></div>
          <Input
            placeholder="From"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="pl-10 pr-24 bg-background border-border"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUseCurrentLocation("origin")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 text-xs text-primary"
          >
            Current
          </Button>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={handleSwapLocations} className="h-8 w-8 p-0">
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Destination Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
          <Input
            placeholder="To"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="pl-10 pr-24 bg-background border-border"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUseCurrentLocation("destination")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2 text-xs text-primary"
          >
            Current
          </Button>
        </div>

        {/* Travel Mode Toggles */}
        <div className="flex items-center gap-2">
          {travelModes.map((mode) => {
            const Icon = mode.icon
            return (
              <Button
                key={mode.id}
                variant={travelMode === mode.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTravelMode(mode.id)}
                className="flex items-center gap-1"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{mode.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Get Directions Button */}
        <Button onClick={getDirections} disabled={!origin || !destination || isLoading} className="w-full" size="sm">
          {isLoading ? "Getting directions..." : "Get Directions"}
        </Button>

        {/* Route Info */}
        {directions && (
          <Card className="p-3 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">
                  {DirectionsService.formatDuration(directions.route.duration)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({DirectionsService.formatDistance(directions.route.distance)})
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearDirections} className="h-6 w-6 p-0">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
