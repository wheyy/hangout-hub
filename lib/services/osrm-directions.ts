/**
 * OSRM (Open Source Routing Machine) Directions Service
 * API Documentation: https://project-osrm.org/docs/v5.5.1/api/
 */

export interface DirectionsRequest {
  coordinates: [number, number][] // [lng, lat] format
  profile?: 'car' | 'bike' | 'foot' // Default: 'car'
  overview?: 'full' | 'simplified' | 'false' // Default: 'simplified'
  steps?: boolean // Include turn-by-turn instructions
  alternatives?: boolean // Return alternative routes
  geometries?: 'polyline' | 'polyline6' | 'geojson' // Default: 'polyline'
}

export interface DirectionsRoute {
  distance: number // meters
  duration: number // seconds
  geometry: {
    coordinates: [number, number][] // [lng, lat] format
    type: 'LineString'
  }
  legs: RouteLeg[]
}

export interface RouteLeg {
  distance: number // meters
  duration: number // seconds
  steps: RouteStep[]
  summary: string
}

export interface RouteStep {
  distance: number // meters
  duration: number // seconds
  geometry: {
    coordinates: [number, number][]
    type: 'LineString'
  }
  name: string
  mode: string
  maneuver: {
    bearing_after: number
    bearing_before: number
    location: [number, number]
    type: string
    modifier?: string
  }
  driving_side: string
}

export interface DirectionsResponse {
  code: string
  routes: DirectionsRoute[]
  waypoints: Array<{
    hint: string
    distance: number
    name: string
    location: [number, number]
  }>
}

const OSRM_BASE_URL = 'https://router.project-osrm.org'

/**
 * Get directions from OSRM API
 */
export async function getDirections(
  request: DirectionsRequest
): Promise<DirectionsResponse> {
  const {
    coordinates,
    profile = 'car',
    overview = 'simplified',
    steps = true,
    alternatives = true,
    geometries = 'geojson'
  } = request

  if (coordinates.length < 2) {
    throw new Error('At least 2 coordinates are required')
  }

  // Format coordinates as "lng,lat;lng,lat;..."
  const coordsString = coordinates
    .map(([lng, lat]) => `${lng},${lat}`)
    .join(';')

  // Build URL with query parameters
  const params = new URLSearchParams({
    overview,
    steps: steps.toString(),
    alternatives: alternatives.toString(),
    geometries
  })

  const url = `${OSRM_BASE_URL}/route/v1/${profile}/${coordsString}?${params}`

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status} ${response.statusText}`)
    }

    const data: DirectionsResponse = await response.json()

    if (data.code !== 'Ok') {
      throw new Error(`OSRM error: ${data.code}`)
    }

    return data
  } catch (error) {
    console.error('OSRM directions error:', error)
    throw error
  }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes} min`
}

/**
 * Get turn-by-turn instructions from a route
 */
export function getTurnByTurnInstructions(route: DirectionsRoute): string[] {
  const instructions: string[] = []
  
  for (const leg of route.legs) {
    for (const step of leg.steps) {
      const direction = step.maneuver.modifier 
        ? `${step.maneuver.type} ${step.maneuver.modifier}`
        : step.maneuver.type
      
      const distance = formatDistance(step.distance)
      const instruction = `${direction} onto ${step.name || 'unnamed road'} for ${distance}`
      
      instructions.push(instruction)
    }
  }
  
  return instructions
}
