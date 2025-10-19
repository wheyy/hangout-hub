"use client"

import { useState, useEffect } from "react"
import { MapProviderComponent, useMap } from "@/lib/map/map-provider"
import { Navbar } from "@/components/navbar"
import { MapSearchBar } from "@/components/map/map-search-bar"
import { HangoutDrawer } from "@/components/map/hangout-drawer"
import { ParkingDrawer } from "@/components/map/parking-drawer"
import { fetchCarparkAvailability, getCarparksWithinRadiusAsync, CarparkInfo, CarparkAvailability } from "@/lib/services/carpark-api"
import { ErrorPopup } from "@/components/map/error-popup"
import { HangoutSpot } from "@/lib/data/hangoutspot"
import { GooglePlacesService, PlaceSearchResult } from "@/lib/services/google-places"

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

export function MapInterface() {
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
  const [selectedCarparkId, setSelectedCarparkId] = useState<string | null>(null)

  useEffect(() => {
    if (!map) return

    spots.forEach((spot) => {
      map.updateMarkerSelection(`spot-${spot.id}`, selectedSpot?.id === spot.id)
    })
  }, [selectedSpot, spots, map])

  // Keep carpark marker highlight in sync with selection
  useEffect(() => {
    if (!map) return
    carparks.forEach(({ info }) => {
      map.updateMarkerSelection?.(`carpark-${info.carpark_number}`, selectedCarparkId === info.carpark_number)
    })
  }, [map, carparks, selectedCarparkId])

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
      setSelectedCarparkId(null)

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
        map.addMarker({
          id: `carpark-${info.carpark_number}`,
          coordinates: info.coordinates,
          title: `${info.address} (${availability?.lots_available ?? "?"} lots)`,
          color: "#04c7f8ff", // green for carparks
          onClick: () => {
            setSelectedCarparkId(info.carpark_number)
            map.setCenter(info.coordinates[0], info.coordinates[1], 17)
          },
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
        carparks={carparks}
        onSelect={(info) => {
          if (!map) return
          setSelectedCarparkId(info.carpark_number)
          const [lng, lat] = info.coordinates
          map.setCenter(lng, lat, 17)
        }}
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
