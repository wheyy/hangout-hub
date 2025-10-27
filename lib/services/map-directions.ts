import { MapLibreMap } from "@/lib/map/maplibre-map"
import { getDirections, DirectionsRoute } from "@/lib/services/osrm-directions"
import { fetchCarparkAvailability, getCarparksWithinRadiusAsync, CarparkInfo, CarparkAvailability } from "@/lib/services/carpark-api"

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
 * @returns Array of carparks with availability data
 */
export async function fetchAndDisplayCarparks(
  map: MapLibreMap,
  destination: [number, number],
  radiusMeters: number = 500,
  onCarparkSelect: (info: CarparkInfo, availability?: CarparkAvailability) => void
): Promise<Array<{ info: CarparkInfo; availability?: CarparkAvailability }>> {
  try {
    const carparkAvailabilities = await fetchCarparkAvailability()
    const carparkInfos = await getCarparksWithinRadiusAsync(destination, radiusMeters)

    // Merge info and availability
    const carparksWithAvail = carparkInfos.map((info) => ({
      info,
      availability: carparkAvailabilities.find((a) => a.carpark_number === info.carpark_number),
    }))

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
        onClick: () => onCarparkSelect(info, availability),
      })
    })

    return carparksWithAvail
  } catch (error) {
    console.error("Error fetching carparks:", error)
    return []
  }
}
