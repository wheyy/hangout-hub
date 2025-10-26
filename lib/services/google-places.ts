import { HangoutSpot } from "@/lib/models/hangoutspot"
import { getCache, setCache } from "@/lib/utils/cache"
import { isInSingapore } from "@/lib/utils/singapore-boundary"

// NEW: helper to turn "shopping_mall" -> "Shopping Mall"
function humanizeSnakeCase(s = "") {
  return s
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Helper to format minutes since midnight to 24-hour time (HH:MM)
function formatTime24(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Helper to get today's opening hours text
function getTodayHoursText(opening: OpeningHours): string {
  if (!opening.weekly) {
    // Try to extract from weekdayText if available
    if (opening.weekdayText && opening.weekdayText.length > 0) {
      const today = new Date().getDay() // 0=Sun, 1=Mon, ..., 6=Sat
      const todayText = opening.weekdayText[today]
      if (todayText) {
        // Extract just the hours part (remove day name)
        const hoursMatch = todayText.match(/:\s*(.+)$/)
        return hoursMatch ? hoursMatch[1] : todayText
      }
    }
    return ""
  }

  const today = new Date().getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const intervals = opening.weekly[today]
  
  if (!intervals || intervals.length === 0) {
    return "Closed"
  }

  // Format all intervals for today
  const formatted = intervals.map(interval => {
    const start = formatTime24(interval.startMin)
    const end = formatTime24(interval.endMin)
    return `${start} - ${end}`
  }).join(', ')

  return formatted
}

// NEW: numeric Opening Hours model (you can compute on this)
type DayInterval = { startMin: number; endMin: number } // minutes since midnight
type OpeningHours = {
  isOpenNow: boolean | null
  weekdayText?: string[]
  weekly?: Record<number, DayInterval[]> // 0=Sun..6=Sat, numeric minutes
}

// NEW: parse Google "periods" to numeric minutes (handles overnight & multiple intervals)
function parseOpeningHours(place: any): OpeningHours {
  // Try both new & legacy shapes from Google
  const oh =
    place?.currentOpeningHours ||
    place?.current_opening_hours ||
    place?.regularOpeningHours ||
    place?.regular_opening_hours ||
    place?.opening_hours ||
    null

  if (!oh) return { isOpenNow: null }

  const isOpenNow =
    typeof oh.open_now === "boolean"
      ? oh.open_now
      : typeof oh.openNow === "boolean"
      ? oh.openNow
      : null

  const weekdayText = Array.isArray(oh.weekday_text)
    ? oh.weekday_text
    : Array.isArray(oh.weekdayText)
    ? oh.weekdayText
    : Array.isArray(oh.weekdayDescriptions)
    ? oh.weekdayDescriptions
    : undefined

  // Helper: "HHMM" -> minutes since midnight
  const toMinutes = (t?: string): number | null => {
    if (!t || !/^\d{4}$/.test(t)) return null
    const hh = Number(t.slice(0, 2))
    const mm = Number(t.slice(2))
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null
    return hh * 60 + mm
  }

  const rawPeriods = oh.periods || []
  const weekly: Record<number, DayInterval[]> = {}

  // Helper to add intervals
  const push = (day: number, start: number, end: number) => {
    if (!weekly[day]) weekly[day] = []
    weekly[day].push({ startMin: start, endMin: end })
  }

  if (Array.isArray(rawPeriods) && rawPeriods.length > 0) {
    for (const p of rawPeriods) {
      // Legacy/new commonly seen fields
      const open = p.open || p.opens || p.start
      const close = p.close || p.closes || p.end

      // day indices are 0..6 (Sun..Sat) in Google legacy and new API
      const openDay: number | null = typeof open?.day === "number" ? open.day : null
      const closeDay: number | null = typeof close?.day === "number" ? close.day : openDay

      // Try different time formats: "HHMM" string or {hour, minute} object
      const oMin = open?.hour !== undefined && open?.minute !== undefined
        ? open.hour * 60 + open.minute
        : toMinutes(open?.time)
      const cMin = close?.hour !== undefined && close?.minute !== undefined
        ? close.hour * 60 + close.minute
        : toMinutes(close?.time)

      if (openDay == null || oMin == null) {
        continue
      }

      // Handle 24/7 places (no close time)
      if (cMin == null) {
        // Open 24 hours - set to full day
        push(openDay, oMin, 24 * 60)
        continue
      }

      // Normalize intervals; handle overnight (closeDay may differ or cMin < oMin)
      const sameDay = closeDay === openDay
      const overnight = !sameDay || cMin <= oMin

      if (!overnight) {
        // Simple same-day window e.g., 10:00–22:00
        push(openDay, oMin, cMin)
      } else {
        // Split across days: today oMin..24:00, nextDay 00:00..cMin
        push(openDay, oMin, 24 * 60)
        const nextDay = (openDay + 1) % 7
        push(nextDay, 0, cMin)
      }
    }
  }

  return {
    isOpenNow,
    weekdayText,
    weekly: Object.keys(weekly).length ? weekly : undefined,
  }
}

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

const AREA_TYPES = [
  "locality",
  "sublocality",
  "sublocality_level_1",
  "neighborhood",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "postal_code",
]

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
    
    // Validate that search center is within Singapore
    const inSingapore = await isInSingapore(lat, lng)
    if (!inSingapore) {
      console.warn("Search center outside the boundary:", { lat, lng })
      throw new Error("Search is outside the boundary")
    }
    
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
          // Check if spot is within Singapore boundaries
          const inBounds = await isInSingapore(spot.coordinates[1], spot.coordinates[0])
          if (inBounds) {
            spots.push(spot)
          }
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
      const response = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`)

      if (!response.ok) {
        return null
      }

      const place = await response.json()
      const spot = this.convertToHangoutSpot(place)
      
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
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`)
      
      if (!response.ok) {
        return []
      }

      const results: AutocompleteResult[] = await response.json()
      return results
    } catch (error) {
      console.error("Error in autocomplete:", error)
      return []
    }
  }

  static isAreaSearch(types: string[]): boolean {
    return types.some(type => AREA_TYPES.includes(type)) && 
           !types.some(type => HANGOUT_CATEGORIES.includes(type))
  }

  static isSpecificPlace(types: string[]): boolean {
    return types.some(type => HANGOUT_CATEGORIES.includes(type)) ||
           types.includes("establishment") ||
           types.includes("point_of_interest")
  }

  static async searchNearbyInArea(
    center: [number, number],
    radius: number
  ): Promise<HangoutSpot[]> {
    const [lng, lat] = center
    
    // Validate that search center is within Singapore
    const inSingapore = await isInSingapore(lat, lng)
    if (!inSingapore) {
      console.warn("Search center outside the boundary:", { lat, lng })
      throw new Error("Search is outside the boundary")
    }
    
    const cacheKey = `nearby:${lat.toFixed(4)},${lng.toFixed(4)}:${radius}`
    const cached = getCache<HangoutSpot[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(
        `/api/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch nearby places")
      }

      const places = await response.json()
      const spots: HangoutSpot[] = []

      for (const place of places) {
        const spot = this.convertToHangoutSpot(place)
        if (spot) {
          // Check if spot is within Singapore boundaries
          const inBounds = await isInSingapore(spot.coordinates[1], spot.coordinates[0])
          if (inBounds) {
            spots.push(spot)
          }
        }
      }

      setCache(cacheKey, spots)
      return spots
    } catch (error) {
      console.error("Error searching nearby:", error)
      throw error
    }
  }

  private static convertToHangoutSpot(place: any): HangoutSpot | null {
    try {
      const priceLevel = place.price_level || 0
      const priceRange = this.getPriceRange(priceLevel)

      // Generate proper photo URL from Google Places Photo API
      let thumbnailUrl = "/placeholder.svg"
      if (place.photos && place.photos.length > 0) {
        const photo = place.photos[0]
        // New API format uses photo.name
        if (photo.name) {
          const maxWidth = 400
          const maxHeight = 400
          thumbnailUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
        }
        // Legacy API format uses photo_reference
        else if (photo.photo_reference) {
          const maxWidth = 400
          thumbnailUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photo.photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
        }
      }

      const opening = parseOpeningHours(place)

      // Format opening hours with time display
      let openingHours: string
      if (opening.isOpenNow === null) {
        openingHours = "Hours not available"
      } else if (opening.isOpenNow) {
        openingHours = "Open now"
      } else {
        // Closed - show today's hours
        const todayHours = getTodayHoursText(opening)
        openingHours = todayHours ? `Closed - ${todayHours}` : "Closed"
      }
      
      const categorySlug =
        place.types?.find((type: string) => HANGOUT_CATEGORIES.includes(type)) ||
        "place"
      
      const categoryLabel = humanizeSnakeCase(categorySlug)

      const spot = new HangoutSpot(
        place.place_id,
        place.name,
        categoryLabel, //readable label
        priceRange,
        place.rating || 0,
        place.user_ratings_total || 0,
        [place.geometry.location.lng, place.geometry.location.lat],
        place.formatted_address || place.vicinity || "",
        thumbnailUrl,
        openingHours
      )

      // NEW: also attach structured data for later UI use
      ;(spot as any).categorySlug = categorySlug
      ;(spot as any).opening = opening     
      return spot

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
