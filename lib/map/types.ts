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
