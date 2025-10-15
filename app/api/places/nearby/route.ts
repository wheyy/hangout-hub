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
    const allPlaces = []

    for (const category of HANGOUT_CATEGORIES) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${category}&key=${API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results) {
        allPlaces.push(...data.results)
      }
    }

    const uniquePlaces = Array.from(
      new Map(allPlaces.map((place) => [place.place_id, place])).values()
    )

    return NextResponse.json(uniquePlaces)
  } catch (error) {
    console.error("Nearby search error:", error)
    return NextResponse.json({ error: "Failed to search nearby" }, { status: 500 })
  }
}
