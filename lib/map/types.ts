export interface MapOptions {
  center: [number, number]
  zoom: number
}

export interface MarkerOptions {
  id: string
  coordinates: [number, number]
  title?: string
  popup?: string
  onClick?: () => void
  isSelected?: boolean
  color?: string // base color for unselected state (e.g., carparks)
}

export interface BoundaryOptions {
  id: string
  bounds: {
    northeast: { lat: number; lng: number }
    southwest: { lat: number; lng: number }
  }
}

export interface RouteOptions {
  id: string
  coordinates: [number, number][]
  color?: string
  width?: number
}
