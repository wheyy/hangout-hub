"use client"

import { useState, useEffect, useRef } from "react"
import { MapProviderComponent, useMap } from "@/lib/map/map-provider"
import { MapSearchBar } from "@/components/map/map-search-bar"
import { HangoutDrawer } from "@/components/map/hangout-drawer"
import { ParkingDrawer } from "@/components/map/parking-drawer"
import { MobileBottomDrawer } from "@/components/map/mobile-bottom-drawer"
import { ParkingSpot } from "@/lib/models/parkingspot"
import { ErrorPopup } from "@/components/map/error-popup"
import { HangoutSpot } from "@/lib/models/hangoutspot"
import { GooglePlacesService, PlaceSearchResult } from "@/lib/services/google-places"
import { DirectionsRoute, formatDistance, formatDuration } from "@/lib/services/osrm-directions"
import { drawRouteOnMap, fetchAndDisplayCarparks } from "@/lib/services/map-directions"
import { AppHeader } from "@/components/layout/app-header"
import { authService } from "@/lib/auth/auth-service"
import { CreateMeetupModalWithDestination } from "@/components/meetup/create-meetup-modal-with-destination"
import { loadSingaporeBoundary, isPointInSingapore } from "@/lib/utils/singapore-boundary"

interface MapInterfaceProps {
  onOpenCreateMeetup: (hangout: HangoutSpot) => void
}

function MapInterface({ onOpenCreateMeetup }: MapInterfaceProps) {
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
  const [carparks, setCarparks] = useState<ParkingSpot[]>([])
  const [selectedCarpark, setSelectedCarpark] = useState<ParkingSpot | null>(null)

  // Directions state
  const [directionsMode, setDirectionsMode] = useState(false)
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null)
  const [toCoords, setToCoords] = useState<[number, number] | null>(null)
  const [currentRoute, setCurrentRoute] = useState<DirectionsRoute | null>(null)

  // Watch for manual changes in location text to clear coordinates and route
  const previousFromLocation = useRef(fromLocation)
  const previousToLocation = useRef(toLocation)

  useEffect(() => {
    // Check if text was manually changed (not just set programmatically)
    if (previousFromLocation.current !== fromLocation && currentRoute) {
      // User changed FROM location - need to clear coordinates for re-geocoding
      setFromCoords(null)
      if (map) {
        map.clearAll()
      }
      setCurrentRoute(null)
    }
    previousFromLocation.current = fromLocation
  }, [fromLocation, currentRoute, map])

  useEffect(() => {
    // Check if text was manually changed (not just set programmatically)
    if (previousToLocation.current !== toLocation && currentRoute) {
      // User changed TO location - need to clear coordinates for re-geocoding
      setToCoords(null)
      if (map) {
        map.clearAll()
      }
      setCurrentRoute(null)
    }
    previousToLocation.current = toLocation
  }, [toLocation, currentRoute, map])

  useEffect(() => {
    if (!map) return

    spots.forEach((spot) => {
      map.updateMarkerSelection(`spot-${spot.id}`, selectedSpot?.id === spot.id)
    })
  }, [selectedSpot, spots, map])

  useEffect(() => {
    if (!map) return

    carparks.forEach((spot) => {
      map.updateMarkerSelection(
        `carpark-${spot.id}`,
        selectedCarpark?.id === spot.id
      )
    })
  }, [selectedCarpark, carparks, map])

  useEffect(() => {
    if (!map) return
    map.updateSearchPinLoading(loading)
  }, [loading, map])

  const performAreaSearch = async (lng: number, lat: number) => {
    if (!map) return

    setLoading(true)
    setError(null)

    try {
      // Hangout spots
      const fetchedSpots = await GooglePlacesService.searchNearbyInArea([lng, lat], 500)
      setSpots(fetchedSpots)

      // Clear existing markers before adding new ones
      map.clearMarkers()

      // Add hangout spot markers
      fetchedSpots.forEach((spot) => {
        map.addMarker({
          id: `spot-${spot.id}`,
          coordinates: spot.coordinates,
          title: spot.name,
          onClick: () => handleCardClick(spot),
        })
      })

      // Fetch carparks and add their markers (fetchAndDisplayCarparks adds markers internally)
      const parkingSpots = await fetchAndDisplayCarparks(map, [lng, lat], 500, handleCarparkSelect)
      setCarparks(parkingSpots)

      // Show the parking drawer when we have results
      setParkingDrawerOpen(true)
    } catch (err) {
      console.error("Area search error:", err)
      setError(err instanceof Error ? err.message : "Failed to search for places")
      setSpots([])
      setCarparks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchPinDragEnd = async (coords: [number, number]) => {
    if (dragDebounceTimer) {
      clearTimeout(dragDebounceTimer)
    }

    // Check if coordinates are within Singapore boundaries using GeoJSON
    const [lng, lat] = coords
    const boundaryData = await loadSingaporeBoundary()
    const inSingapore = boundaryData
      ? isPointInSingapore(lat, lng, boundaryData)
      : (lat >= 1.15 && lat <= 1.50 && lng >= 103.6 && lng <= 104.05) // Fallback
    
    if (!inSingapore) {
      setError("Search is outside the boundary")
      return
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
    setHangoutDrawerOpen(true)
    map.setCenter(spot.coordinates[0], spot.coordinates[1], 17)
  }

  const handleBack = () => {
    setSelectedSpot(null)
  }

  const handleCarparkSelect = (spot: ParkingSpot) => {
    if (!map) return

    // Zoom to the selected carpark
    map.setCenter(spot.coordinates[0], spot.coordinates[1], 17)

    // Set as selected carpark and open the drawer
    setSelectedCarpark(spot)
    setParkingDrawerOpen(true)
  }

  const handleCarparkBack = () => {
    setSelectedCarpark(null)
  }

  const handleCarparkGetDirections = async (spot: ParkingSpot) => {
    // Enter directions mode with the carpark as destination
    setDirectionsMode(true)
    setToLocation(spot.address)
    setToCoords(spot.coordinates)

    // Try to use user's current location as starting point
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please enter a starting point manually.")
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude]
        setFromCoords(coords)
        setFromLocation(`Current Location (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`)

        if (!map) {
          setLoading(false)
          return
        }

        try {
          const result = await drawRouteOnMap(map, coords, spot.coordinates, 'Start', 'Destination')
          setCurrentRoute(result.route)
          console.log(`Route to carpark: ${formatDistance(result.distance)}, ${formatDuration(result.duration)}`)
        } catch (err) {
          console.error("Directions error:", err)
          setError(err instanceof Error ? err.message : "Failed to get directions")
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        setError("Could not get your current location. Please enter a starting point manually.")
        setLoading(false)
      }
    )
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

  const handleGetDirections = async (spot: HangoutSpot) => {
    // Enter directions mode with the selected spot as destination
    setDirectionsMode(true)
    setToLocation(spot.name)
    setToCoords(spot.coordinates)

    // Try to use user's current location as starting point
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please enter a starting point manually.")
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude]
        setFromCoords(coords)
        setFromLocation(`Current Location (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`)

        if (!map) {
          setLoading(false)
          return
        }

        try {
          const result = await drawRouteOnMap(map, coords, spot.coordinates, 'Start', spot.name)
          setCurrentRoute(result.route)
          console.log(`Route to ${spot.name}: ${formatDistance(result.distance)}, ${formatDuration(result.duration)}`)

          // Fetch carparks near the destination
          const carparks = await fetchAndDisplayCarparks(map, spot.coordinates, 500, handleCarparkSelect)
          setCarparks(carparks)

          if (carparks.length > 0) {
            setParkingDrawerOpen(true)
          }
        } catch (err) {
          console.error("Directions error:", err)
          setError(err instanceof Error ? err.message : "Failed to get directions")
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        setError("Could not get your current location. Please enter a starting point manually.")
        setLoading(false)
      }
    )
  }

  const handleDirectionsSearch = async () => {
    if (!map || !fromLocation || !toLocation) return

    setLoading(true)
    setError(null)

    try {
      // If we don't have coordinates yet, geocode the addresses
      let startCoords = fromCoords
      let endCoords = toCoords

      if (!startCoords) {
        const fromResult = await GooglePlacesService.searchPlace(fromLocation)
        if (fromResult) {
          startCoords = [fromResult.geometry.location.lng, fromResult.geometry.location.lat]
          setFromCoords(startCoords)
        }
      }

      if (!endCoords) {
        const toResult = await GooglePlacesService.searchPlace(toLocation)
        if (toResult) {
          endCoords = [toResult.geometry.location.lng, toResult.geometry.location.lat]
          setToCoords(endCoords)
        }
      }

      if (!startCoords || !endCoords) {
        setError("Could not find one or both locations")
        return
      }

      const result = await drawRouteOnMap(map, startCoords, endCoords)
      setCurrentRoute(result.route)
      console.log(`Route found: ${formatDistance(result.distance)}, ${formatDuration(result.duration)}`)

      // Fetch carparks near the destination
      const carparks = await fetchAndDisplayCarparks(map, endCoords, 500, handleCarparkSelect)
      setCarparks(carparks)

      if (carparks.length > 0) {
        setParkingDrawerOpen(true)
      }
    } catch (err) {
      console.error("Directions error:", err)
      setError(err instanceof Error ? err.message : "Failed to get directions")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelDirections = () => {
    setDirectionsMode(false)
    setFromLocation("")
    setToLocation("")
    setFromCoords(null)
    setToCoords(null)
    setCurrentRoute(null)
    setHasSearchPin(false) // Ensure pin button returns
    if (map) {
      map.clearAll()
    }
  }

  const handleToggleDirectionsMode = () => {
    if (directionsMode) {
      // Cancel directions mode
      handleCancelDirections()
    } else {
      // Enter directions mode
      setDirectionsMode(true)
      
      // Try to use user's current location as starting point
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [position.coords.longitude, position.coords.latitude]
            setFromCoords(coords)
            setFromLocation(`${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`)
          },
          (error) => {
            console.error("Geolocation error:", error)
          }
        )
      }
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude]
          setFromCoords(coords)
          setFromLocation(`Current Location (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`)
          setLoading(false)
        },
        (error) => {
          console.error("Geolocation error:", error)
          setError("Could not get your current location. Please check your browser permissions.")
          setLoading(false)
        }
      )
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }

  const handleClearCoordinates = (field: 'from' | 'to') => {
    if (field === 'from') {
      setFromCoords(null)
    } else {
      setToCoords(null)
    }
    
    // Clear the route and markers when coordinates are cleared
    if (map) {
      map.clearAll()
    }
    setCurrentRoute(null)
  }

  if (!isLoaded) return null

  return (
    <>
      <MapSearchBar 
        onSearch={handleSearch}
        value={searchBarValue}
        onValueChange={setSearchBarValue}
        showPinButton={!hasSearchPin && !directionsMode}
        onPinButtonClick={handlePinButtonClick}
        directionsMode={directionsMode}
        fromValue={fromLocation}
        toValue={toLocation}
        onFromChange={setFromLocation}
        onToChange={setToLocation}
        onDirectionsSearch={handleDirectionsSearch}
        onCancelDirections={handleCancelDirections}
        onToggleDirectionsMode={handleToggleDirectionsMode}
        onUseCurrentLocation={handleUseCurrentLocation}
        onClearCoordinates={handleClearCoordinates}
      />
      <HangoutDrawer
        spots={spots}
        loading={loading}
        selectedSpot={selectedSpot}
        isOpen={hangoutDrawerOpen}
        onToggle={handleToggleHangoutDrawer}
        onCardClick={handleCardClick}
        onBack={handleBack}
        onGetDirections={handleGetDirections}
        onOpenCreateMeetup={onOpenCreateMeetup}
      />
      <ParkingDrawer
        isOpen={parkingDrawerOpen}
        onToggle={handleToggleParkingDrawer}
        carparks={carparks}
        onSelect={handleCarparkSelect}
        onGetDirections={handleCarparkGetDirections}
        selectedCarpark={selectedCarpark}
        onBack={handleCarparkBack}
      />
      <MobileBottomDrawer
        spots={spots}
        loadingSpots={loading}
        selectedSpot={selectedSpot}
        onSpotClick={handleCardClick}
        onSpotBack={handleBack}
        onSpotGetDirections={handleGetDirections}
        onOpenCreateMeetup={onOpenCreateMeetup}
        carparks={carparks}
        selectedCarpark={selectedCarpark}
        onCarparkSelect={handleCarparkSelect}
        onCarparkBack={handleCarparkBack}
        onCarparkGetDirections={handleCarparkGetDirections}
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCreateMeetupModalOpen, setIsCreateMeetupModalOpen] = useState(false)
  const [selectedHangoutForMeetup, setSelectedHangoutForMeetup] = useState<HangoutSpot | null>(null)

  const mapOptions = {
    center: [103.8198, 1.3521] as [number, number],
    zoom: 12,
  }

  useEffect(() => {
  authService.getCurrentUserFull().then((user) => {
      setIsAuthenticated(!!user)
    })
  }, [])

  const handleOpenCreateMeetup = (hangout: HangoutSpot) => {
    setSelectedHangoutForMeetup(hangout)
    setIsCreateMeetupModalOpen(true)
  }

  const handleCloseCreateMeetup = () => {
    setIsCreateMeetupModalOpen(false)
    setSelectedHangoutForMeetup(null)
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <AppHeader currentPage="map" isAuthenticated={isAuthenticated} />
      <div className="flex-1 relative">
        <MapProviderComponent options={mapOptions} className="absolute inset-0">
          <MapInterface onOpenCreateMeetup={handleOpenCreateMeetup} />
        </MapProviderComponent>
      </div>
      <CreateMeetupModalWithDestination
        isOpen={isCreateMeetupModalOpen}
        onClose={handleCloseCreateMeetup}
        hangoutSpot={selectedHangoutForMeetup}
      />
    </div>
  )
}
