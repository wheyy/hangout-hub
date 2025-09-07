export interface MapAdapter {
  initialize(container: HTMLElement, options: MapOptions): Promise<void>
  destroy(): void
  setCenter(lng: number, lat: number): void
  setZoom(zoom: number): void
  fitBounds(bounds: [number, number, number, number]): void
  addMarker(marker: MarkerOptions): string
  removeMarker(id: string): void
  addLayer(layer: LayerOptions): void
  removeLayer(id: string): void
  on(event: string, callback: (data: any) => void): void
  off(event: string, callback: (data: any) => void): void
  getCenter(): { lng: number; lat: number }
  getZoom(): number
  getBounds(): [number, number, number, number]
}

export interface MapOptions {
  center: [number, number]
  zoom: number
  style?: string
  interactive?: boolean
  scrollZoom?: boolean
  doubleClickZoom?: boolean
  touchZoom?: boolean
  dragPan?: boolean
}

export interface MarkerOptions {
  id: string
  lng: number
  lat: number
  element?: HTMLElement
  popup?: string
  className?: string
  type?: "spot" | "parking" | "user"
  data?: any
}

export interface LayerOptions {
  id: string
  type: "circle" | "line" | "fill" | "symbol"
  source: any
  paint?: any
  layout?: any
}

export interface ClusterOptions {
  radius: number
  maxZoom: number
  minPoints: number
}

export type MapProvider = "mock" | "google"
