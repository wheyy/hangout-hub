"use client"

import { useState, useEffect, useRef } from "react"
import { MapProviderComponent, useMap } from "@/lib/map/map-provider"
import { Navbar } from "@/components/navbar"
import { MapSearchBar } from "@/components/map/map-search-bar"
import { HangoutDrawer } from "@/components/map/hangout-drawer"
import { ParkingDrawer } from "@/components/map/parking-drawer"
import { MobileBottomDrawer } from "@/components/map/mobile-bottom-drawer"
import { fetchCarparkAvailability, getCarparksWithinRadiusAsync, CarparkInfo, CarparkAvailability } from "@/lib/services/carpark-api"
import { ErrorPopup } from "@/components/map/error-popup"
import { HangoutSpot } from "@/lib/data/hangoutspot"
import { GooglePlacesService, PlaceSearchResult } from "@/lib/services/google-places"
import { getDirections, DirectionsRoute, formatDistance, formatDuration } from "@/lib/services/osrm-directions"

// Cache for Singapore boundary data
let singaporeBoundaryCache: any = null

// Load Singapore subzone boundary
async function loadSingaporeBoundary() {
  if (singaporeBoundaryCache) return singaporeBoundaryCache
  
  try {
    const response = await fetch('/SubZoneBoundary.geojson')
    singaporeBoundaryCache = await response.json()
    return singaporeBoundaryCache
  } catch (error) {
    console.error("Failed to load Singapore boundary:", error)
    return null
  }
}

// Point-in-polygon algorithm (Ray Casting)
function pointInPolygon(point: [number, number], polygon: number[][][]): boolean {
  const [lng, lat] = point;
  let inside = false;

  for (const ring of polygon) {
    let j = ring.length - 1;
    for (let i = 0; i < ring.length; i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];

      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
      j = i;
    }
  }
  return inside;
}

// Check if point is within any Singapore subzone
function isPointInSingapore(lat: number, lng: number, boundaryData: any): boolean {
  if (!boundaryData || !boundaryData.features) return false

  for (const feature of boundaryData.features) {
    if (!feature.geometry) continue

    if (feature.geometry.type === 'Polygon') {
      if (pointInPolygon([lng, lat], [feature.geometry.coordinates[0]])) {
        return true
      }
    } else if (feature.geometry.type === 'MultiPolygon') {
      for (const polygon of feature.geometry.coordinates) {
        if (pointInPolygon([lng, lat], [polygon[0]])) {
          return true
        }
      }
    }
  }

  return false
}

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
  const [carparks, setCarparks] = useState<Array<{ info: CarparkInfo; availability?: CarparkAvailability }>>([])
  const [selectedCarpark, setSelectedCarpark] = useState<{ info: CarparkInfo; availability?: CarparkAvailability } | null>(null)

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

    carparks.forEach(({ info }) => {
      map.updateMarkerSelection(
        `carpark-${info.carpark_number}`,
        selectedCarpark?.info.carpark_number === info.carpark_number
      )
    })
  }, [selectedCarpark, carparks, map])

  const performAreaSearch = async (lng: number, lat: number) => {
    if (!map) return

    setLoading(true)
    setError(null)

    try {
      // Hangout spots
      const fetchedSpots = await GooglePlacesService.searchNearbyInArea([lng, lat], 500)
      setSpots(fetchedSpots)

      // Carparks
  const carparkAvailabilities = await fetchCarparkAvailability()
  const carparkInfos = await getCarparksWithinRadiusAsync([lng, lat], 500)
      // Merge info and availability
      const carparksWithAvail = carparkInfos.map((info) => ({
        info,
        availability: carparkAvailabilities.find((a) => a.carpark_number === info.carpark_number),
      }))
      setCarparks(carparksWithAvail)

      map.clearMarkers()
      fetchedSpots.forEach((spot) => {
        map.addMarker({
          id: `spot-${spot.id}`,
          coordinates: spot.coordinates,
          title: spot.name,
          onClick: () => handleCardClick(spot),
        })
      })
      carparksWithAvail.forEach(({ info, availability }) => {
        const availabilityPercentage = availability && availability.total_lots > 0
          ? (availability.lots_available / availability.total_lots) * 100
          : undefined

        map.addMarker({
          id: `carpark-${info.carpark_number}`,
          coordinates: info.coordinates,
          title: info.address,
          type: "parking",
          availabilityPercentage,
          onClick: () => handleCarparkSelect(info, availability),
        })
      })
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

  const handleCarparkSelect = (info: CarparkInfo, availability?: CarparkAvailability) => {
    if (!map) return

    // Zoom to the selected carpark
    map.setCenter(info.coordinates[0], info.coordinates[1], 17)

    // Set as selected carpark and open the drawer
    setSelectedCarpark({ info, availability })
    setParkingDrawerOpen(true)
  }

  const handleCarparkBack = () => {
    setSelectedCarpark(null)
  }

  const handleCarparkGetDirections = async (info: CarparkInfo) => {
    // Enter directions mode with the carpark as destination
    setDirectionsMode(true)
    setToLocation(info.address)
    setToCoords(info.coordinates)
    
    // Try to use user's current location as starting point
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude]
          setFromCoords(coords)
          setFromLocation(`Current Location (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`)
          
          // Automatically trigger directions search
          if (!map) {
            setLoading(false)
            return
          }

          try {
            // Get directions from OSRM
            const response = await getDirections({
              coordinates: [coords, info.coordinates],
              profile: 'car',
              overview: 'full',
              steps: true,
              alternatives: true
            })

            if (response.routes && response.routes.length > 0) {
              const route = response.routes[0]
              setCurrentRoute(route)

              // Clear existing markers and routes
              map.clearAll()

              // Add start marker (blue)
              map.addMarker({
                id: 'route-start',
                coordinates: coords,
                title: 'Start',
                color: '#3B82F6'
              })

              // Add end marker (red)
              map.addMarker({
                id: 'route-end',
                coordinates: info.coordinates,
                title: 'Destination',
                color: '#EF4444'
              })

              // Draw the route
              map.addRoute({
                id: 'main-route',
                coordinates: route.geometry.coordinates,
                color: '#3B82F6',
                width: 5
              })

              // Fit map to show entire route
              const allCoords = route.geometry.coordinates
              const lngs = allCoords.map(c => c[0])
              const lats = allCoords.map(c => c[1])
              const bounds: [number, number, number, number] = [
                Math.min(...lngs),
                Math.min(...lats),
                Math.max(...lngs),
                Math.max(...lats)
              ]
              map.fitBounds(bounds)

              console.log(`Route to carpark: ${formatDistance(route.distance)}, ${formatDuration(route.duration)}`)
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
    } else {
      setError("Geolocation is not supported by your browser. Please enter a starting point manually.")
    }
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
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude]
          setFromCoords(coords)
          setFromLocation(`Current Location (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`)

          // Automatically trigger directions search
          if (!map) {
            setLoading(false)
            return
          }

          try {
            // Get directions from OSRM
            const response = await getDirections({
              coordinates: [coords, spot.coordinates],
              profile: 'car',
              overview: 'full',
              steps: true,
              alternatives: true
            })

            if (response.routes && response.routes.length > 0) {
              const route = response.routes[0]
              setCurrentRoute(route)

              // Clear existing markers and routes
              map.clearAll()

              // Add start marker (blue)
              map.addMarker({
                id: 'route-start',
                coordinates: coords,
                title: 'Start',
                color: '#3B82F6'
              })

              // Add end marker (red)
              map.addMarker({
                id: 'route-end',
                coordinates: spot.coordinates,
                title: 'Destination',
                color: '#EF4444'
              })

              // Draw the route
              map.addRoute({
                id: 'main-route',
                coordinates: route.geometry.coordinates,
                color: '#3B82F6',
                width: 5
              })

              // Fit map to show entire route
              const allCoords = route.geometry.coordinates
              const lngs = allCoords.map(c => c[0])
              const lats = allCoords.map(c => c[1])
              const bounds: [number, number, number, number] = [
                Math.min(...lngs),
                Math.min(...lats),
                Math.max(...lngs),
                Math.max(...lats)
              ]
              map.fitBounds(bounds)

              console.log(`Route to ${spot.name}: ${formatDistance(route.distance)}, ${formatDuration(route.duration)}`)

              // Fetch carparks near the destination
              try {
                const carparkAvailabilities = await fetchCarparkAvailability()
                const carparkInfos = await getCarparksWithinRadiusAsync(spot.coordinates, 500)

                // Merge info and availability
                const carparksWithAvail = carparkInfos.map((info) => ({
                  info,
                  availability: carparkAvailabilities.find((a) => a.carpark_number === info.carpark_number),
                }))

                setCarparks(carparksWithAvail)

                // Add carpark markers to the map
                carparksWithAvail.forEach(({ info, availability }) => {
                  const availabilityPercentage = availability && availability.total_lots > 0
                    ? (availability.lots_available / availability.total_lots) * 100
                    : undefined

                  map.addMarker({
                    id: `carpark-${info.carpark_number}`,
                    coordinates: info.coordinates,
                    title: info.address,
                    type: "parking",
                    availabilityPercentage,
                    onClick: () => handleCarparkSelect(info, availability),
                  })
                })

                // Open the parking drawer to show available parking
                setParkingDrawerOpen(true)
              } catch (carparkError) {
                console.error("Error fetching carparks:", carparkError)
                // Don't fail the entire direction request if carpark fetch fails
              }
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
    } else {
      setError("Geolocation is not supported by your browser. Please enter a starting point manually.")
    }
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

      // Get directions from OSRM
      const response = await getDirections({
        coordinates: [startCoords, endCoords],
        profile: 'car',
        overview: 'full',
        steps: true,
        alternatives: true
      })

      if (response.routes && response.routes.length > 0) {
        const route = response.routes[0]
        setCurrentRoute(route)

        // Clear existing markers and routes
        map.clearAll()

        // Add start marker (blue)
        map.addMarker({
          id: 'route-start',
          coordinates: startCoords,
          title: 'Start',
          color: '#3B82F6'
        })

        // Add end marker (red)
        map.addMarker({
          id: 'route-end',
          coordinates: endCoords,
          title: 'Destination',
          color: '#EF4444'
        })

        // Draw the route
        map.addRoute({
          id: 'main-route',
          coordinates: route.geometry.coordinates,
          color: '#3B82F6',
          width: 5
        })

        // Fit map to show entire route
        const allCoords = route.geometry.coordinates
        const lngs = allCoords.map(c => c[0])
        const lats = allCoords.map(c => c[1])
        const bounds: [number, number, number, number] = [
          Math.min(...lngs),
          Math.min(...lats),
          Math.max(...lngs),
          Math.max(...lats)
        ]
        map.fitBounds(bounds)

        console.log(`Route found: ${formatDistance(route.distance)}, ${formatDuration(route.duration)}`)

        // Fetch carparks near the destination
        try {
          const carparkAvailabilities = await fetchCarparkAvailability()
          const carparkInfos = await getCarparksWithinRadiusAsync(endCoords, 500)
          
          // Merge info and availability
          const carparksWithAvail = carparkInfos.map((info) => ({
            info,
            availability: carparkAvailabilities.find((a) => a.carpark_number === info.carpark_number),
          }))
          
          setCarparks(carparksWithAvail)
          
          // Add carpark markers to the map
          carparksWithAvail.forEach(({ info, availability }) => {
            const availabilityPercentage = availability && availability.total_lots > 0
              ? (availability.lots_available / availability.total_lots) * 100
              : undefined

            map.addMarker({
              id: `carpark-${info.carpark_number}`,
              coordinates: info.coordinates,
              title: info.address,
              type: "parking",
              availabilityPercentage,
              onClick: () => handleCarparkSelect(info, availability),
            })
          })

          // Open the parking drawer to show available parking
          setParkingDrawerOpen(true)
        } catch (carparkError) {
          console.error("Error fetching carparks:", carparkError)
          // Don't fail the entire direction request if carpark fetch fails
        }
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
        isOpen={hangoutDrawerOpen && !directionsMode}
        onToggle={handleToggleHangoutDrawer}
        onCardClick={handleCardClick}
        onBack={handleBack}
        onGetDirections={handleGetDirections}
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
