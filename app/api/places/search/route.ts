import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      query
    )}&inputtype=textquery&fields=place_id,name,geometry,types&key=${API_KEY}&locationbias=circle:50000@1.3521,103.8198`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK" || !data.candidates || data.candidates.length === 0) {
      return NextResponse.json({ error: "No results found" }, { status: 404 })
    }

    return NextResponse.json(data.candidates[0])
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search" }, { status: 500 })
  }
}
