/**
 * Singapore Boundary Validation Utilities
 *
 * Validates that coordinates fall within Singapore's official subzone boundaries
 * using GeoJSON data from data.gov.sg
 */

// Cache for Singapore boundary data (loaded once, reused)
let singaporeBoundaryCache: any = null

/**
 * Load Singapore subzone boundary GeoJSON data
 * Uses browser fetch API (client-side only)
 */
export async function loadSingaporeBoundary(): Promise<any> {
  if (singaporeBoundaryCache) return singaporeBoundaryCache

  try {
    const response = await fetch('/SubZoneBoundary.geojson')
    singaporeBoundaryCache = await response.json()
    return singaporeBoundaryCache
  } catch (error) {
    console.error("Failed to load Singapore boundary:", error)
    return null
  }
}

/**
 * Point-in-polygon algorithm using Ray Casting
 * Determines if a point is inside a polygon
 *
 * @param point - [longitude, latitude]
 * @param polygon - Array of polygon rings (GeoJSON format)
 */
export function pointInPolygon(point: [number, number], polygon: number[][][]): boolean {
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

/**
 * Check if a point is within any Singapore subzone
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @param boundaryData - Singapore boundary GeoJSON data
 */
export function isPointInSingapore(lat: number, lng: number, boundaryData: any): boolean {
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

/**
 * Convenience function: Check if coordinates are within Singapore
 * Automatically loads boundary data and validates
 * Falls back to simple bounding box if GeoJSON fails to load
 *
 * @param lat - Latitude
 * @param lng - Longitude
 */
export async function isInSingapore(lat: number, lng: number): Promise<boolean> {
  const boundaryData = await loadSingaporeBoundary()

  if (!boundaryData) {
    // Fallback: Simple bounding box (Singapore approximate boundaries)
    return lat >= 1.15 && lat <= 1.50 && lng >= 103.6 && lng <= 104.05
  }

  return isPointInSingapore(lat, lng, boundaryData)
}
