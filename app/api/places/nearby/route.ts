import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const radius = searchParams.get("radius")

  if (!lat || !lng || !radius) {
    return NextResponse.json({ error: "lat, lng, and radius are required" }, { status: 400 })
  }

  try {
    // Using NEW Places API (Nearby Search)
    const url = `https://places.googleapis.com/v1/places:searchNearby`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY || "",
        "X-Goog-FieldMask": "places.id,places.displayName,places.types,places.location,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.photos,places.formattedAddress"
      },
      body: JSON.stringify({
        includedTypes: HANGOUT_CATEGORIES,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: parseFloat(lat),
              longitude: parseFloat(lng)
            },
            radius: parseFloat(radius)
          }
        }
      })
    })

    const data = await response.json()

    if (response.status !== 200 || !data.places) {
      console.error("Nearby search error:", data)
      return NextResponse.json([])
    }

    // Convert to old format for compatibility
    const places = data.places.map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text || place.displayName,
      types: place.types || [],
      geometry: {
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0
        }
      },
      rating: place.rating || 0,
      user_ratings_total: place.userRatingCount || 0,
      price_level: place.priceLevel || 0,
      opening_hours: place.currentOpeningHours,
      photos: place.photos,
      formatted_address: place.formattedAddress || place.vicinity || ""
    }))

    return NextResponse.json(places)
  } catch (error) {
    console.error("Nearby search error:", error)
    return NextResponse.json({ error: "Failed to search nearby" }, { status: 500 })
  }
}
