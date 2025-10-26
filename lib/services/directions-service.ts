import { haversineDistance } from "@/lib/utils/distance"

export interface DirectionsRequest {
  origin: [number, number]
  destination: [number, number]
  travelMode: "driving" | "transit" | "walking"
}

export interface DirectionsResult {
  route: {
    coordinates: [number, number][]
    distance: number // in meters
    duration: number // in seconds
    bounds: [number, number, number, number]
  }
  steps?: {
    instruction: string
    distance: number
    duration: number
    coordinates: [number, number][]
  }[]
}

export class DirectionsService {
  static async getDirections(request: DirectionsRequest): Promise<DirectionsResult> {
    // Mock directions service - in real app, this would call Google Directions API, etc.
    const { origin, destination, travelMode } = request

    // Calculate straight-line distance for mock
    const distance = haversineDistance(origin, destination)

    // Mock travel times based on mode
    let duration: number
    switch (travelMode) {
      case "driving":
        duration = Math.max(300, distance / 15) // ~15 m/s average with traffic
        break
      case "transit":
        duration = Math.max(600, distance / 8) // ~8 m/s average with stops
        break
      case "walking":
        duration = Math.max(300, distance / 1.4) // ~1.4 m/s walking speed
        break
      default:
        duration = distance / 10
    }

    // Create a simple curved route (mock)
    const route = this.generateMockRoute(origin, destination)

    return {
      route: {
        coordinates: route,
        distance: Math.round(distance),
        duration: Math.round(duration),
        bounds: this.getBoundsFromCoordinates(route),
      },
    }
  }

  private static generateMockRoute(origin: [number, number], destination: [number, number]): [number, number][] {
    const [originLng, originLat] = origin
    const [destLng, destLat] = destination

    // Create a simple route with some waypoints for a more realistic path
    const route: [number, number][] = [origin]

    // Add intermediate points (mock road following)
    const steps = 8
    for (let i = 1; i < steps; i++) {
      const progress = i / steps
      const lng = originLng + (destLng - originLng) * progress
      const lat = originLat + (destLat - originLat) * progress

      // Add some curve to make it look more like a real route
      const curve = Math.sin(progress * Math.PI) * 0.002
      route.push([lng + curve, lat + curve * 0.5])
    }

    route.push(destination)
    return route
  }

  private static getBoundsFromCoordinates(coordinates: [number, number][]): [number, number, number, number] {
    let minLng = Number.POSITIVE_INFINITY,
      minLat = Number.POSITIVE_INFINITY,
      maxLng = Number.NEGATIVE_INFINITY,
      maxLat = Number.NEGATIVE_INFINITY

    coordinates.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng)
      minLat = Math.min(minLat, lat)
      maxLng = Math.max(maxLng, lng)
      maxLat = Math.max(maxLat, lat)
    })

    // Add padding
    const padding = 0.01
    return [minLng - padding, minLat - padding, maxLng + padding, maxLat + padding]
  }

  static formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.round((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  static formatDistance(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
  }
}
