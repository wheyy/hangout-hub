"use client"

import { useEffect } from "react"
import { useMap } from "@/lib/map/map-provider"
import { singaporeSpots } from "@/lib/data/hangoutspot"

export function MapMarkers() {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    // Add spot markers
    singaporeSpots.forEach((spot) => {
      const markerElement = document.createElement("div")
      markerElement.className =
        "w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
      markerElement.innerHTML = `
        <div class="w-3 h-3 bg-white rounded-full"></div>
      `

      // Add rating color accent
      const rating = spot.rating
      let accentColor = "#0891b2" // default primary
      if (rating >= 4.5)
        accentColor = "#22c55e" // green
      else if (rating >= 4.0)
        accentColor = "#3b82f6" // blue
      else if (rating >= 3.5)
        accentColor = "#f59e0b" // amber
      else accentColor = "#ef4444" // red

      markerElement.style.backgroundColor = accentColor

      map.addMarker({
        id: `spot-${spot.id}`,
        lng: spot.coordinates[0],
        lat: spot.coordinates[1],
        element: markerElement,
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
    const parkingSpots = singaporeSpots.filter((spot) => spot.parkingInfo?.available)
    parkingSpots.forEach((spot) => {
      const parking = spot.parkingInfo!
      const occupancyRate = parking.capacity && parking.occupied ? parking.occupied / parking.capacity : 0

      let color = "#22c55e" // green (available)
      if (occupancyRate >= 0.8)
        color = "#ef4444" // red (full)
      else if (occupancyRate >= 0.5)
        color = "#f59e0b" // amber (limited)
      else if (!parking.capacity) color = "#6b7280" // gray (unknown)

      const markerElement = document.createElement("div")
      markerElement.className =
        "w-6 h-6 rounded border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-white text-xs font-bold"
      markerElement.style.backgroundColor = color
      markerElement.textContent = "P"

      map.addMarker({
        id: `parking-${spot.id}`,
        lng: spot.coordinates[0] + 0.001, // Slight offset to avoid overlap
        lat: spot.coordinates[1] + 0.001,
        element: markerElement,
        popup: `
          <div class="p-2 min-w-48">
            <h3 class="font-semibold text-sm">${spot.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${parking.type} parking</p>
            ${
              parking.capacity && parking.occupied
                ? `<p class="text-xs"><span class="font-medium">${parking.capacity - parking.occupied}/${
                    parking.capacity
                  }</span> spaces available</p>`
                : ""
            }
            ${parking.pricePerHour ? `<p class="text-xs">$${parking.pricePerHour}/hour</p>` : ""}
          </div>
        `,
        type: "parking",
        data: spot,
      })
    })

    return () => {
      // Cleanup markers
      singaporeSpots.forEach((spot) => {
        map.removeMarker(`spot-${spot.id}`)
        map.removeMarker(`parking-${spot.id}`)
      })
    }
  }, [map, isLoaded])

  return null
}
