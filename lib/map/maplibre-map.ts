import maplibregl from "maplibre-gl"
import type { MapOptions, MarkerOptions, BoundaryOptions, RouteOptions } from "./types"

export class MapLibreMap {
  private map: maplibregl.Map | null = null
  private markers: Map<string, maplibregl.Marker> = new Map()
  private layers: Set<string> = new Set()

  async initialize(container: HTMLElement, options: MapOptions): Promise<void> {
    this.map = new maplibregl.Map({
      container,
      style: "https://demotiles.maplibre.org/style.json",
      center: options.center,
      zoom: options.zoom,
    })

    this.map.addControl(new maplibregl.NavigationControl(), "top-right")

    return new Promise((resolve) => {
      this.map!.on("load", () => {
        resolve()
      })
    })
  }

  destroy(): void {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
    this.markers.clear()
    this.layers.clear()
  }

  setCenter(lng: number, lat: number, zoom?: number): void {
    if (!this.map) return
    this.map.flyTo({
      center: [lng, lat],
      zoom: zoom || this.map.getZoom(),
      duration: 1000,
    })
  }

  setZoom(zoom: number): void {
    if (!this.map) return
    this.map.setZoom(zoom)
  }

  fitBounds(bounds: [number, number, number, number]): void {
    if (!this.map) return
    this.map.fitBounds(bounds as [number, number, number, number], {
      padding: 50,
      duration: 1000,
    })
  }

  addMarker(options: MarkerOptions): void {
    if (!this.map) return

    if (this.markers.has(options.id)) {
      this.removeMarker(options.id)
    }

    const el = document.createElement("div")
    el.className = "map-marker"
    el.style.width = "32px"
    el.style.height = "32px"
    el.style.borderRadius = "50%"
    el.style.backgroundColor = "#ef4444"
    el.style.border = "2px solid white"
    el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
    el.style.cursor = "pointer"

    if (options.title) {
      const label = document.createElement("div")
      label.textContent = options.title
      label.style.position = "absolute"
      label.style.left = "40px"
      label.style.top = "50%"
      label.style.transform = "translateY(-50%)"
      label.style.backgroundColor = "white"
      label.style.padding = "4px 8px"
      label.style.borderRadius = "4px"
      label.style.fontSize = "12px"
      label.style.fontWeight = "500"
      label.style.whiteSpace = "nowrap"
      label.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)"
      el.appendChild(label)
    }

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat(options.coordinates)
      .addTo(this.map)

    if (options.onClick) {
      el.addEventListener("click", options.onClick)
    }

    if (options.popup) {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(options.popup)
      marker.setPopup(popup)
    }

    this.markers.set(options.id, marker)
  }

  removeMarker(id: string): void {
    const marker = this.markers.get(id)
    if (marker) {
      marker.remove()
      this.markers.delete(id)
    }
  }

  clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove())
    this.markers.clear()
  }

  addBoundary(options: BoundaryOptions): void {
    if (!this.map) return

    const { northeast, southwest } = options.bounds

    const coordinates = [
      [southwest.lng, southwest.lat],
      [northeast.lng, southwest.lat],
      [northeast.lng, northeast.lat],
      [southwest.lng, northeast.lat],
      [southwest.lng, southwest.lat],
    ]

    if (this.map.getSource(options.id)) {
      this.removeBoundary(options.id)
    }

    this.map.addSource(options.id, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [coordinates],
        },
      },
    })

    this.map.addLayer({
      id: `${options.id}-fill`,
      type: "fill",
      source: options.id,
      paint: {
        "fill-color": "#ef4444",
        "fill-opacity": 0.1,
      },
    })

    this.map.addLayer({
      id: `${options.id}-outline`,
      type: "line",
      source: options.id,
      paint: {
        "line-color": "#ef4444",
        "line-width": 2,
      },
    })

    this.layers.add(`${options.id}-fill`)
    this.layers.add(`${options.id}-outline`)
  }

  removeBoundary(id: string): void {
    if (!this.map) return

    const fillId = `${id}-fill`
    const outlineId = `${id}-outline`

    if (this.map.getLayer(fillId)) this.map.removeLayer(fillId)
    if (this.map.getLayer(outlineId)) this.map.removeLayer(outlineId)
    if (this.map.getSource(id)) this.map.removeSource(id)

    this.layers.delete(fillId)
    this.layers.delete(outlineId)
  }

  addRoute(options: RouteOptions): void {
    if (!this.map) return

    if (this.map.getSource(options.id)) {
      this.removeRoute(options.id)
    }

    this.map.addSource(options.id, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: options.coordinates,
        },
      },
    })

    this.map.addLayer({
      id: options.id,
      type: "line",
      source: options.id,
      paint: {
        "line-color": options.color || "#3b82f6",
        "line-width": options.width || 4,
      },
    })

    this.layers.add(options.id)
  }

  removeRoute(id: string): void {
    if (!this.map) return

    if (this.map.getLayer(id)) this.map.removeLayer(id)
    if (this.map.getSource(id)) this.map.removeSource(id)

    this.layers.delete(id)
  }

  clearAll(): void {
    this.clearMarkers()
    this.layers.forEach((layerId) => {
      if (this.map?.getLayer(layerId)) {
        this.map.removeLayer(layerId)
      }
    })
    this.layers.clear()
  }

  getCenter(): { lng: number; lat: number } {
    if (!this.map) return { lng: 0, lat: 0 }
    const center = this.map.getCenter()
    return { lng: center.lng, lat: center.lat }
  }

  getZoom(): number {
    if (!this.map) return 0
    return this.map.getZoom()
  }
}
