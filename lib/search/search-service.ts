export interface SearchSuggestion {
  id: string
  name: string
  type: "place" | "area"
  coordinates?: [number, number]
  bounds?: [number, number, number, number] // [west, south, east, north]
  category?: string
  address?: string
}

export interface SearchFilters {
  priceRange?: string[]
  minRating?: number
  maxTravelTime?: number
  hasParking?: boolean
  categories?: string[]
}

export interface SearchResult {
  spots: any[]
  bounds: [number, number, number, number]
  center: [number, number]
  searchType: "place" | "area"
  radius?: number // in meters for place searches
}

// Mock Singapore places and areas
const singaporePlaces: SearchSuggestion[] = [
  {
    id: "marina-bay",
    name: "Marina Bay",
    type: "place",
    coordinates: [103.8591, 1.2834],
    category: "landmark",
    address: "Marina Bay, Singapore",
  },
  {
    id: "orchard-road",
    name: "Orchard Road",
    type: "place",
    coordinates: [103.8198, 1.3048],
    category: "shopping",
    address: "Orchard Road, Singapore",
  },
  {
    id: "chinatown",
    name: "Chinatown",
    type: "area",
    bounds: [103.8414, 1.2797, 103.8476, 1.2853],
    category: "district",
    address: "Chinatown, Singapore",
  },
  {
    id: "sentosa",
    name: "Sentosa Island",
    type: "area",
    bounds: [103.8067, 1.2424, 103.8365, 1.2614],
    category: "island",
    address: "Sentosa Island, Singapore",
  },
  {
    id: "clarke-quay",
    name: "Clarke Quay",
    type: "place",
    coordinates: [103.8467, 1.2884],
    category: "entertainment",
    address: "Clarke Quay, Singapore",
  },
]

export class SearchService {
  static async searchSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query || query.length < 2) return []

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return singaporePlaces.filter((place) => place.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
  }

  static async searchSpots(
    destination: SearchSuggestion,
    origin?: [number, number],
    filters?: SearchFilters,
  ): Promise<SearchResult> {
    // Import spots data
    const { singaporeSpots } = await import("@/lib/data/hangoutspot")

    let filteredSpots = [...singaporeSpots]

    // Apply filters
    if (filters) {
      if (filters.priceRange && filters.priceRange.length > 0) {
        filteredSpots = filteredSpots.filter((spot) => filters.priceRange!.includes(spot.priceRange))
      }

      if (filters.minRating) {
        filteredSpots = filteredSpots.filter((spot) => spot.rating >= filters.minRating!)
      }

      // if (filters.hasParking) {
      //   filteredSpots = filteredSpots.filter((spot) => spot.parkingInfo?.available)
      // }

      if (filters.categories && filters.categories.length > 0) {
        filteredSpots = filteredSpots.filter((spot) => filters.categories!.includes(spot.category))
      }
    }

    // Filter by geographic bounds
    if (destination.type === "place" && destination.coordinates) {
      // 1km radius around the place
      const radius = 1000 // meters
      const [destLng, destLat] = destination.coordinates

      filteredSpots = filteredSpots.filter((spot) => {
        const distance = this.calculateDistance(destLat, destLng, spot.coordinates[1], spot.coordinates[0])
        return distance <= radius
      })

      return {
        spots: filteredSpots,
        bounds: this.getBoundsFromCenter(destination.coordinates, radius),
        center: destination.coordinates,
        searchType: "place",
        radius,
      }
    } else if (destination.type === "area" && destination.bounds) {
      // Filter by area bounds
      const [west, south, east, north] = destination.bounds

      filteredSpots = filteredSpots.filter((spot) => {
        const [lng, lat] = spot.coordinates
        return lng >= west && lng <= east && lat >= south && lat <= north
      })

      return {
        spots: filteredSpots,
        bounds: destination.bounds,
        center: [(west + east) / 2, (south + north) / 2],
        searchType: "area",
      }
    }

    // Fallback: return all spots
    return {
      spots: filteredSpots,
      bounds: [103.6, 1.2, 104.0, 1.5], // Singapore bounds
      center: [103.8198, 1.3521],
      searchType: "area",
    }
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  private static getBoundsFromCenter(center: [number, number], radiusMeters: number): [number, number, number, number] {
    const [lng, lat] = center
    const latOffset = radiusMeters / 111320 // Rough conversion: 1 degree lat ≈ 111,320 meters
    const lngOffset = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))

    return [lng - lngOffset, lat - latOffset, lng + lngOffset, lat + latOffset]
  }
}
