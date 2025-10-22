import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

// Cache for Singapore boundary data
let singaporeBoundaryCache: any = null

// Load Singapore subzone boundary
async function loadSingaporeBoundary() {
  if (singaporeBoundaryCache) return singaporeBoundaryCache
  
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'public', 'SubZoneBoundary.geojson')
    const data = await fs.readFile(filePath, 'utf-8')
    singaporeBoundaryCache = JSON.parse(data)
    return singaporeBoundaryCache
  } catch (error) {
    console.error("Failed to load Singapore boundary:", error)
    return null
  }
}

// Point-in-polygon algorithm (Ray Casting)
function pointInPolygon(point: [number, number], polygon: number[][][]): boolean {
  const [lng, lat] = point
  let inside = false

  for (const ring of polygon) {
    let j = ring.length - 1
    for (let i = 0; i < ring.length; i++) {
      const [xi, yi] = ring[i]
      const [xj, yj] = ring[j]

      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)
      
      if (intersect) inside = !inside
      j = i
    }
  }
  
  return inside
}

// Check if point is within any Singapore subzone
function isPointInSingapore(lat: number, lng: number, boundaryData: any): boolean {
  if (!boundaryData || !boundaryData.features) return false

  for (const feature of boundaryData.features) {
    if (!feature.geometry) continue

    if (feature.geometry.type === 'Polygon') {
      if (pointInPolygon([lng, lat], [feature.geometry.coordinates[0]])) {
        return true
      }
    } else if (feature.geometry.type === 'MultiPolygon') {
      for (const polygon of feature.geometry.coordinates) {
        if (pointInPolygon([lng, lat], [polygon[0]])) {
          return true
        }
      }
    }
  }

  return false
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  console.log("Search API called with query:", query)
  console.log("API Key present:", !!API_KEY)

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Using NEW Places API (Text Search)
    const url = `https://places.googleapis.com/v1/places:searchText`

    console.log("Calling NEW Google Places API...")
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY || "",
        "X-Goog-FieldMask": "places.id,places.displayName,places.types,places.location,places.viewport"
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: {
            center: {
              latitude: 1.3521,
              longitude: 103.8198
            },
            radius: 25000.0  // Reduced to 25km to keep within Singapore
          }
        },
        regionCode: "SG"  // Restrict to Singapore
      })
    })

    const data = await response.json()
    console.log("Google API response:", data)

    if (response.status === 403 || data.error) {
      console.error("API error:", data.error?.message)
      return NextResponse.json({ 
        error: data.error?.message || "API request denied" 
      }, { status: 403 })
    }

    if (!data.places || data.places.length === 0) {
      console.log("No results found")
      return NextResponse.json({ error: "No results found" }, { status: 404 })
    }

    const place = data.places[0]
    
    // Validate that the place is within Singapore boundaries
    const lat = place.location?.latitude || 0
    const lng = place.location?.longitude || 0
    
    // Singapore approximate boundaries - slightly expanded for full coverage
    const isInSingapore = lat >= 1.15 && lat <= 1.50 && lng >= 103.6 && lng <= 104.05
    
    if (!isInSingapore) {
      console.log("Result outside the boundary:", { lat, lng })
      return NextResponse.json({ error: "No results found in Singapore" }, { status: 404 })
    }
    
    // Convert to our expected format
    const result = {
      placeId: place.id,
      name: place.displayName?.text || place.displayName,
      types: place.types || [],
      geometry: {
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0
        },
        viewport: place.viewport ? {
          northeast: {
            lat: place.viewport.high?.latitude || 0,
            lng: place.viewport.high?.longitude || 0
          },
          southwest: {
            lat: place.viewport.low?.latitude || 0,
            lng: place.viewport.low?.longitude || 0
          }
        } : undefined
      }
    }

    console.log("Returning result:", result.name)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search" }, { status: 500 })
  }
}
