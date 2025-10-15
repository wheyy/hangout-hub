"use client"

import { useState, useEffect } from "react"
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
  const [dragDebounceTimer, setDragDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [searchBarValue, setSearchBarValue] = useState("")
  const [hasSearchPin, setHasSearchPin] = useState(false)

  useEffect(() => {
    if (!map) return

    spots.forEach((spot) => {
      map.updateMarkerSelection(`spot-${spot.id}`, selectedSpot?.id === spot.id)
    })
  }, [selectedSpot, spots, map])

  const performAreaSearch = async (lng: number, lat: number) => {
    if (!map) return

    setLoading(true)
    setError(null)

    try {
      const fetchedSpots = await GooglePlacesService.searchNearbyInArea([lng, lat], 500)
      
      setSpots(fetchedSpots)
      
      map.clearMarkers()
      fetchedSpots.forEach((spot) => {
        map.addMarker({
          id: `spot-${spot.id}`,
          coordinates: spot.coordinates,
          title: spot.name,
          onClick: () => handleCardClick(spot),
        })
      })
    } catch (err) {
      console.error("Area search error:", err)
      setError(err instanceof Error ? err.message : "Failed to search for places")
      setSpots([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchPinDragEnd = (coords: [number, number]) => {
    if (dragDebounceTimer) {
      clearTimeout(dragDebounceTimer)
    }

    setSearchBarValue(`${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`)

    const timer = setTimeout(() => {
      performAreaSearch(coords[0], coords[1])
    }, 1000)

    setDragDebounceTimer(timer)
  }

  const handleSearch = async (result: PlaceSearchResult, isArea: boolean) => {
    if (!map || !isLoaded) return

    map.clearAll()
    setSpots([])
    setSelectedSpot(null)
    setError(null)
    setHasSearchPin(false)
    setHangoutDrawerOpen(true)
    setSearchBarValue(result.name)

    const { lat, lng } = result.geometry.location

    if (isArea) {
      map.addSearchPin(lng, lat, handleSearchPinDragEnd)
      setHasSearchPin(true)
      map.fitCircleBounds(lng, lat, 500)
      
      await performAreaSearch(lng, lat)
    } else {
      setLoading(true)
      
      try {
        const spot = await GooglePlacesService.getPlaceDetails(result.placeId)
        
        if (spot) {
          setSpots([spot])
          setSelectedSpot(spot)
          
          map.addMarker({
            id: `spot-${spot.id}`,
            coordinates: spot.coordinates,
            onClick: () => handleCardClick(spot),
            isSelected: true,
          })
          
          map.setCenter(spot.coordinates[0], spot.coordinates[1], 17)
        } else {
          setError("Could not load place details")
        }
      } catch (err) {
        console.error("Specific place search error:", err)
        setError(err instanceof Error ? err.message : "Failed to load place")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCardClick = (spot: HangoutSpot) => {
    if (!map) return
    
    setSelectedSpot(spot)
    map.setCenter(spot.coordinates[0], spot.coordinates[1], 17)
  }

  const handleBack = () => {
    setSelectedSpot(null)
  }

  const handlePinButtonClick = async () => {
    if (!map) return

    const center = map.getCenter()
    const lng = center.lng
    const lat = center.lat

    map.addSearchPin(lng, lat, handleSearchPinDragEnd)
    setHasSearchPin(true)

    setSearchBarValue(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)

    map.fitCircleBounds(lng, lat, 500)
    
    await performAreaSearch(lng, lat)
    setHangoutDrawerOpen(true)
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
      <MapSearchBar 
        onSearch={handleSearch}
        value={searchBarValue}
        onValueChange={setSearchBarValue}
        showPinButton={!hasSearchPin}
        onPinButtonClick={handlePinButtonClick}
      />
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
