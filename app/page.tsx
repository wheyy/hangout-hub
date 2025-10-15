"use client"

import { MapProviderComponent, useMap } from "@/lib/map/map-provider"
import { Navbar } from "@/components/navbar"
import { MapSearchBar } from "@/components/map/map-search-bar"
import { PlaceSearchResult } from "@/lib/services/google-places"

function MapInterface() {
  const { map, isLoaded } = useMap()

  const handleSearch = (result: PlaceSearchResult, isArea: boolean) => {
    if (!map || !isLoaded) return

    const { lat, lng } = result.geometry.location

    if (isArea && result.geometry.viewport) {
      // If it's an area with viewport, show boundary
      const { northeast, southwest } = result.geometry.viewport
      
      map.clearAll()
      
      map.addBoundary({
        id: "search-boundary",
        bounds: {
          northeast: { lat: northeast.lat, lng: northeast.lng },
          southwest: { lat: southwest.lat, lng: southwest.lng }
        }
      })

      // Add center marker
      map.addMarker({
        id: "area-center",
        coordinates: [lng, lat],
        title: result.name
      })

      // Fit map to bounds
      const bounds: [number, number, number, number] = [
        southwest.lng,
        southwest.lat,
        northeast.lng,
        northeast.lat
      ]
      map.fitBounds(bounds)
    } else {
      // Specific place - just show marker and zoom
      map.clearAll()
      
      map.addMarker({
        id: "place-marker",
        coordinates: [lng, lat],
        title: result.name
      })

      map.setCenter(lng, lat, 15)
    }
  }

  if (!isLoaded) return null

  return (
    <>
      <MapSearchBar onSearch={handleSearch} />
    </>
  )
}

export default function HomePage() {
  const mapOptions = {
    center: [103.8198, 1.3521] as [number, number],
    zoom: 12,
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex-1 relative">
        <MapProviderComponent options={mapOptions} className="absolute inset-0">
          <MapInterface />
        </MapProviderComponent>
      </div>
    </div>
  )
}
