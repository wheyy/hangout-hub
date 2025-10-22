"use client"

import { useEffect } from "react"
import { useMap } from "@/lib/map/map-provider"
import type { HangoutSpot } from "@/lib/data/hangoutspot"

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
        type: "spot",
        data: spot,
      })
    })

    // Add parking markers
    const parkingSpots = mockParkingSpots.filter((spot) => spot.isAvailable() ==true)
    parkingSpots.forEach((spot) => {
      const parking = spot
      const occupancyRate = parking.getTotalCapacity() && parking.getOccupied() ? parking.getOccupied() / parking.getTotalCapacity() : 0

      let color = "#22c55e" // green (available)
      if (occupancyRate >= 0.8)
        color = "#ef4444" // red (full)
      else if (occupancyRate >= 0.5)
        color = "#f59e0b" // amber (limited)
      else if (!parking.getTotalCapacity()) color = "#6b7280" // gray (unknown)

      const markerElement = document.createElement("div")
      markerElement.className =
        "w-6 h-6 rounded border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-white text-xs font-bold"
      markerElement.style.backgroundColor = color
      markerElement.textContent = "P"

      map.addMarker({
        id: `parking-${spot.getCarparkCode()}`,
        lng: spot.coordinates[0] + 0.001, // Slight offset to avoid overlap
        lat: spot.coordinates[1] + 0.001,
        element: markerElement,
        popup: `
          <div class="p-2 min-w-48">
            <h3 class="font-semibold text-sm">${spot.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${parking.getParkingType()} parking</p>
            ${
              parking.getTotalCapacity() && parking.getOccupied()
                ? `<p class="text-xs"><span class="font-medium">${parking.getTotalCapacity() - parking.getOccupied()}/${
                    parking.getTotalCapacity()
                  }</span> spaces available</p>`
                : ""
            }
            ${parking.getRate() ? `<p class="text-xs">$${parking.getRate()}/hour</p>` : ""}
          </div>
        `,
        type: "parking",
        data: spot,
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
