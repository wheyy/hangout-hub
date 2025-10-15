import { HangoutSpot } from "@/lib/data/hangoutspot"
import { getCache, setCache } from "@/lib/utils/cache"

const HANGOUT_CATEGORIES = [
  "cafe",
  "restaurant",
  "bar",
  "night_club",
  "park",
  "shopping_mall",
  "movie_theater",
  "museum",
  "tourist_attraction",
  "bowling_alley",
  "amusement_park",
]

const AREA_TYPES = ["locality", "sublocality", "neighborhood", "administrative_area_level_1", "postal_code"]

export interface PlaceSearchResult {
  placeId: string
  name: string
  types: string[]
  geometry: {
    location: { lat: number; lng: number }
    viewport?: {
      northeast: { lat: number; lng: number }
      southwest: { lat: number; lng: number }
    }
  }
}

export interface AutocompleteResult {
  placeId: string
  description: string
}

export class GooglePlacesService {
  static async searchPlace(query: string): Promise<PlaceSearchResult | null> {
    const cacheKey = `search:${query.toLowerCase().replace(/\s+/g, "-")}`
    const cached = getCache<PlaceSearchResult>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(query)}`)

      if (!response.ok) {
        return null
      }

      const result: PlaceSearchResult = await response.json()
      setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error("Error searching place:", error)
      throw new Error("Failed to search for place")
    }
  }

  static async nearbySearch(
    center: [number, number],
    radius: number
  ): Promise<HangoutSpot[]> {
    const [lng, lat] = center
    const cacheKey = `nearby:${lat.toFixed(4)},${lng.toFixed(4)}:${radius}`
    const cached = getCache<HangoutSpot[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)

      if (!response.ok) {
        throw new Error("Failed to fetch nearby places")
      }

      const places = await response.json()
      const spots: HangoutSpot[] = []

      for (const place of places) {
        const spot = this.convertToHangoutSpot(place)
        if (spot) {
          spots.push(spot)
        }
      }

      setCache(cacheKey, spots)
      return spots
    } catch (error) {
      console.error("Error in nearby search:", error)
      throw new Error("Failed to fetch nearby places")
    }
  }

  static async getPlaceDetails(placeId: string): Promise<HangoutSpot | null> {
    const cacheKey = `place:${placeId}`
    const cached = getCache<HangoutSpot>(cacheKey)
    if (cached) return cached

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,opening_hours,photos,types&key=${API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status !== "OK" || !data.result) {
        return null
      }

      const spot = await this.convertToHangoutSpot(data.result)
      if (spot) {
        setCache(cacheKey, spot)
      }

      return spot
    } catch (error) {
      console.error("Error getting place details:", error)
      throw new Error("Failed to fetch place details")
    }
  }

  static async autocomplete(input: string): Promise<AutocompleteResult[]> {
    if (!input || input.length < 2) return []

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&location=1.3521,103.8198&radius=50000&components=country:sg&key=${API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status !== "OK" || !data.predictions) {
        return []
      }

      return data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
      }))
    } catch (error) {
      console.error("Error in autocomplete:", error)
      return []
    }
  }

  static isAreaSearch(types: string[]): boolean {
    return types.some(type => AREA_TYPES.includes(type))
  }

  static isSpecificPlace(types: string[]): boolean {
    return types.some(type => HANGOUT_CATEGORIES.includes(type))
  }

  private static convertToHangoutSpot(place: any): HangoutSpot | null {
    try {
      const priceLevel = place.price_level || 0
      const priceRange = this.getPriceRange(priceLevel)

      const thumbnailUrl = place.photos && place.photos.length > 0
        ? place.photos[0].photo_reference
        : "/placeholder.svg"

      const openingHours = place.opening_hours?.open_now !== undefined
        ? place.opening_hours.open_now ? "Open now" : "Closed"
        : "Hours not available"

      const category = place.types?.find((type: string) => HANGOUT_CATEGORIES.includes(type)) || "place"

      return new HangoutSpot(
        place.place_id,
        place.name,
        category,
        priceRange,
        place.rating || 0,
        place.user_ratings_total || 0,
        [place.geometry.location.lng, place.geometry.location.lat],
        place.formatted_address || place.vicinity || "",
        thumbnailUrl,
        openingHours
      )
    } catch (error) {
      console.error("Error converting place to HangoutSpot:", error)
      return null
    }
  }

  private static getPriceRange(priceLevel: number): "$" | "$$" | "$$$" | "$$$$" {
    switch (priceLevel) {
      case 0:
      case 1:
        return "$"
      case 2:
        return "$$"
      case 3:
        return "$$$"
      case 4:
        return "$$$$"
      default:
        return "$"
    }
  }
}
