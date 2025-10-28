import { MapLibreMap } from "@/lib/map/maplibre-map"
import { getDirections, DirectionsRoute } from "@/lib/services/osrm-directions"
import { fetchCarparkAvailability, getCarparksWithinRadiusAsync } from "@/lib/services/carpark-api"
import { ParkingSpot } from "@/lib/models/parkingspot"

export interface RouteResult {
  route: DirectionsRoute
  distance: number
  duration: number
}

/**
 * Draws a route on the map from start to destination.
 * Clears existing markers/routes, adds new markers, draws the route, and fits bounds.
 *
 * @param map - MapLibre map instance
 * @param startCoords - Starting coordinates [lng, lat]
 * @param endCoords - Destination coordinates [lng, lat]
 * @param startLabel - Label for the start marker (default: 'Start')
 * @param endLabel - Label for the destination marker (default: 'Destination')
 * @returns RouteResult with route data, distance, and duration
 * @throws Error if directions request fails
 */
export async function drawRouteOnMap(
  map: MapLibreMap,
  startCoords: [number, number],
  endCoords: [number, number],
  startLabel: string = 'Start',
  endLabel: string = 'Destination'
): Promise<RouteResult> {
  // Get directions from OSRM
  const response = await getDirections({
    coordinates: [startCoords, endCoords],
    profile: 'car',
    overview: 'full',
    steps: true,
    alternatives: true
  })

  if (!response.routes || response.routes.length === 0) {
    throw new Error("No route found")
  }

  const route = response.routes[0]

  // Clear existing markers and routes
  map.clearAll()

  // Add start marker (blue)
  map.addMarker({
    id: 'route-start',
    coordinates: startCoords,
    title: startLabel,
    color: '#3B82F6'
  })

  // Add end marker (red)
  map.addMarker({
    id: 'route-end',
    coordinates: endCoords,
    title: endLabel,
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

  return {
    route,
    distance: route.distance,
    duration: route.duration
  }
}

/**
 * Fetches carparks near a destination and displays them on the map.
 *
 * @param map - MapLibre map instance
 * @param destination - Destination coordinates [lng, lat]
 * @param radiusMeters - Search radius in meters (default: 500)
 * @param onCarparkSelect - Callback when a carpark marker is clicked
 * @returns Array of ParkingSpot objects
 */
export async function fetchAndDisplayCarparks(
  map: MapLibreMap,
  destination: [number, number],
  radiusMeters: number = 500,
  onCarparkSelect: (spot: ParkingSpot) => void
): Promise<ParkingSpot[]> {
  try {
    const carparkAvailabilities = await fetchCarparkAvailability()
    const carparks = await getCarparksWithinRadiusAsync(destination, radiusMeters, carparkAvailabilities)

    // Add carpark markers to the map
    carparks.forEach((spot) => {
      map.addMarker({
        id: `carpark-${spot.id}`,
        coordinates: spot.coordinates,
        title: spot.address,
        type: "parking",
        availabilityPercentage: spot.hasAvailabilityData() ? spot.getAvailabilityPercentage() : undefined,
        onClick: () => onCarparkSelect(spot),
      })
    })

    return carparks
  } catch (error) {
    console.error("Error fetching carparks:", error)
    return []
  }
}
