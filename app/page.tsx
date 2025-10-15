"use client"

import { useState } from "react"
import { MapProviderComponent, useMap } from "@/lib/map/map-provider"
import { Navbar } from "@/components/navbar"
import { MapSearchBar } from "@/components/map/map-search-bar"
import { HangoutDrawer } from "@/components/map/hangout-drawer"
import { ParkingDrawer } from "@/components/map/parking-drawer"
import { ErrorPopup } from "@/components/map/error-popup"
import { HangoutSpot } from "@/lib/data/hangoutspot"
import { GooglePlacesService, PlaceSearchResult } from "@/lib/services/google-places"

function MapInterface() {
  const { map, isLoaded } = useMap()
  const [spots, setSpots] = useState<HangoutSpot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<HangoutSpot | null>(null)
  const [hangoutDrawerOpen, setHangoutDrawerOpen] = useState(false)
  const [parkingDrawerOpen, setParkingDrawerOpen] = useState(false)

  const handleSearch = async (result: PlaceSearchResult, isArea: boolean) => {
    if (!map || !isLoaded) return

    setLoading(true)
    setError(null)
    setSelectedSpot(null)
    setHangoutDrawerOpen(true)

    try {
      const { lat, lng } = result.geometry.location

      map.clearAll()

      if (isArea && result.geometry.viewport) {
        const { northeast, southwest } = result.geometry.viewport
        
        map.addBoundary({
          id: "search-boundary",
          bounds: {
            northeast: { lat: northeast.lat, lng: northeast.lng },
            southwest: { lat: southwest.lat, lng: southwest.lng }
          }
        })

        map.addMarker({
          id: "area-center",
          coordinates: [lng, lat],
          title: result.name
        })

        const bounds: [number, number, number, number] = [
          southwest.lng,
          southwest.lat,
          northeast.lng,
          northeast.lat
        ]
        map.fitBounds(bounds)

        const centerLng = (northeast.lng + southwest.lng) / 2
        const centerLat = (northeast.lat + southwest.lat) / 2
        const radiusLat = (northeast.lat - southwest.lat) / 2
        const radiusLng = (northeast.lng - southwest.lng) / 2
        const radius = Math.max(radiusLat, radiusLng) * 111000

        const fetchedSpots = await GooglePlacesService.searchNearbyInArea(
          [centerLng, centerLat],
          Math.min(radius, 5000)
        )

        setSpots(fetchedSpots)

        fetchedSpots.forEach((spot) => {
          map.addMarker({
            id: `spot-${spot.id}`,
            coordinates: spot.coordinates,
            title: spot.name,
            onClick: () => handleCardClick(spot)
          })
        })
      } else {
        map.addMarker({
          id: "place-marker",
          coordinates: [lng, lat],
          title: result.name
        })

        map.setCenter(lng, lat, 15)

        const fetchedSpots = await GooglePlacesService.searchNearbyInArea(
          [lng, lat],
          1000
        )

        setSpots(fetchedSpots)

        fetchedSpots.forEach((spot) => {
          map.addMarker({
            id: `spot-${spot.id}`,
            coordinates: spot.coordinates,
            title: spot.name,
            onClick: () => handleCardClick(spot)
          })
        })
      }
    } catch (err) {
      console.error("Search error:", err)
      setError(err instanceof Error ? err.message : "Failed to search for places")
      setSpots([])
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (spot: HangoutSpot) => {
    if (!map) return
    
    setSelectedSpot(spot)
    map.setCenter(spot.coordinates[0], spot.coordinates[1], 16)
  }

  const handleBack = () => {
    setSelectedSpot(null)
  }

  const handleToggleHangoutDrawer = () => {
    setHangoutDrawerOpen(!hangoutDrawerOpen)
  }

  const handleToggleParkingDrawer = () => {
    setParkingDrawerOpen(!parkingDrawerOpen)
  }

  const handleDismissError = () => {
    setError(null)
  }

  if (!isLoaded) return null

  return (
    <>
      <MapSearchBar onSearch={handleSearch} />
      <HangoutDrawer
        spots={spots}
        loading={loading}
        selectedSpot={selectedSpot}
        isOpen={hangoutDrawerOpen}
        onToggle={handleToggleHangoutDrawer}
        onCardClick={handleCardClick}
        onBack={handleBack}
      />
      <ParkingDrawer
        isOpen={parkingDrawerOpen}
        onToggle={handleToggleParkingDrawer}
      />
      {error && (
        <ErrorPopup
          message={error}
          code="SEARCH_ERROR"
          onDismiss={handleDismissError}
        />
      )}
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
