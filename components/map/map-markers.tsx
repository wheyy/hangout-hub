"use client"

import { useEffect } from "react"
import { useMap } from "@/lib/map/map-provider"
import type { HangoutSpot } from "@/lib/models/hangoutspot"

interface MapMarkersProps {
  spots?: HangoutSpot[]
}

export function MapMarkers({ spots = [] }: MapMarkersProps) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || spots.length === 0) return

    spots.forEach((spot) => {
      map.addMarker({
        id: `spot-${spot.id}`,
        coordinates: spot.coordinates,
        title: spot.name,
        popup: `
          <div class="p-2 min-w-48">
            <h3 class="font-semibold text-sm">${spot.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${spot.category} • ${spot.priceRange}</p>
            <div class="flex items-center gap-1 text-xs">
              <span class="text-yellow-500">★</span>
              <span>${spot.rating}</span>
              <span class="text-gray-500">(${spot.reviewCount})</span>
            </div>
          </div>
        `,
      })
    })

    return () => {
      spots.forEach((spot) => {
        map.removeMarker(`spot-${spot.id}`)
      })
    }
  }, [map, isLoaded, spots])

  return null
}
