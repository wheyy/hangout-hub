"use client"

import { Button } from "@/components/ui/button"
import { Plus, Minus, Navigation, RotateCcw, Layers } from "lucide-react"
import { useMap } from "@/lib/map/map-provider"
import { useState } from "react"

export function MapControls() {
  const { map, isLoaded } = useMap()
  const [showLayers, setShowLayers] = useState(false)

  const handleZoomIn = () => {
    if (!map) return
    const currentZoom = map.getZoom()
    map.setZoom(currentZoom + 1)
  }

  const handleZoomOut = () => {
    if (!map) return
    const currentZoom = map.getZoom()
    map.setZoom(Math.max(0, currentZoom - 1))
  }

  const handleRecenter = () => {
    if (!map) return
    // Default to Singapore center
    map.setCenter(103.8198, 1.3521)
    map.setZoom(11)
  }

  const handleMyLocation = () => {
    if (!navigator.geolocation || !map) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setCenter(position.coords.longitude, position.coords.latitude)
        map.setZoom(15)
      },
      (error) => {
        console.error("Geolocation error:", error)
      },
    )
  }

  if (!isLoaded) return null

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      {/* Zoom Controls */}
      <div className="floating-panel p-1">
        <Button variant="ghost" size="sm" onClick={handleZoomIn} className="w-8 h-8 p-0 hover:bg-muted">
          <Plus className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleZoomOut} className="w-8 h-8 p-0 hover:bg-muted">
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Controls */}
      <div className="floating-panel p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRecenter}
          className="w-8 h-8 p-0 hover:bg-muted"
          title="Recenter"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMyLocation}
          className="w-8 h-8 p-0 hover:bg-muted"
          title="My Location"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Layer Controls */}
      <div className="floating-panel p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLayers(!showLayers)}
          className="w-8 h-8 p-0 hover:bg-muted"
          title="Layers"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
