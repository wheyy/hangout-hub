export interface OSRMRoute {
  distance: number
  duration: number
  geometry: [number, number][]
}

export class OSRMService {
  private static readonly BASE_URL = "https://router.project-osrm.org"

  static async getRoute(
    start: [number, number],
    end: [number, number],
    profile: "car" | "bike" | "foot" = "car"
  ): Promise<OSRMRoute | null> {
    try {
      const [startLng, startLat] = start
      const [endLng, endLat] = end

      const url = `${this.BASE_URL}/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`

      const response = await fetch(url)
      const data = await response.json()

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        return null
      }

      const route = data.routes[0]

      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry.coordinates.map((coord: [number, number]) => [coord[0], coord[1]])
      }
    } catch (error) {
      console.error("Error fetching route from OSRM:", error)
      throw new Error("Failed to fetch route")
    }
  }

  static formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }
}
