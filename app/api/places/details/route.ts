import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const placeId = searchParams.get("placeId")

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 })
  }

  try {
    // Using NEW Places API (Place Details)
    // Extract just the place ID without the "places/" prefix if present
    const cleanPlaceId = placeId.replace("places/", "")
    const url = `https://places.googleapis.com/v1/places/${cleanPlaceId}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": API_KEY || "",
        "X-Goog-FieldMask": "id,displayName,formattedAddress,location,rating,userRatingCount,priceLevel,currentOpeningHours,photos,types"
      }
    })

    const data = await response.json()

    if (response.status !== 200 || data.error) {
      console.error("Place details error:", data)
      return NextResponse.json({ error: "Place not found" }, { status: 404 })
    }

    // Convert to old format for compatibility
    const result = {
      place_id: data.id,
      name: data.displayName?.text || data.displayName,
      formatted_address: data.formattedAddress,
      geometry: {
        location: {
          lat: data.location?.latitude || 0,
          lng: data.location?.longitude || 0
        }
      },
      rating: data.rating || 0,
      user_ratings_total: data.userRatingCount || 0,
      price_level: data.priceLevel || 0,
      opening_hours: data.currentOpeningHours,
      photos: data.photos,
      types: data.types || []
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Place details error:", error)
    return NextResponse.json({ error: "Failed to get place details" }, { status: 500 })
  }
}
