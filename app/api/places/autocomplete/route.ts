import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const input = searchParams.get("input")

  if (!input || input.length < 2) {
    return NextResponse.json([])
  }

  try {
    // Using NEW Places API (Autocomplete)
    const url = `https://places.googleapis.com/v1/places:autocomplete`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY || ""
      },
      body: JSON.stringify({
        input: input,
        locationBias: {
          circle: {
            center: {
              latitude: 1.3521,
              longitude: 103.8198
            },
            radius: 50000.0
          }
        },
        includedRegionCodes: ["SG"]
      })
    })

    const data = await response.json()

    if (response.status !== 200 || !data.suggestions) {
      console.error("Autocomplete error:", data)
      return NextResponse.json([])
    }

    const results = data.suggestions.map((suggestion: any) => ({
      placeId: suggestion.placePrediction?.placeId || "",
      description: suggestion.placePrediction?.text?.text || ""
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error("Autocomplete error:", error)
    return NextResponse.json({ error: "Failed to autocomplete" }, { status: 500 })
  }
}
