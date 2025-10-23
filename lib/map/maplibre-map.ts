import maplibregl from "maplibre-gl"
import type { MapOptions, MarkerOptions, BoundaryOptions, RouteOptions } from "./types"
import { createSearchPinElement, createHangoutSpotPinElement, createParkingSpotPinElement } from "./pin-icons"

export class MapLibreMap {
  private map: maplibregl.Map | null = null
  private markers: Map<string, maplibregl.Marker> = new Map()
  private layers: Set<string> = new Set()
  private searchPin: maplibregl.Marker | null = null
  private searchPinCoordinates: [number, number] | null = null

  async initialize(container: HTMLElement, options: MapOptions): Promise<void> {
    this.map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: options.center,
      zoom: options.zoom,
      minZoom: 8,
      maxZoom: 18,
    })

    // Add navigation controls only on desktop (>= 1000px)
    if (window.innerWidth >= 1000) {
      this.map.addControl(new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false
      }), "bottom-left")
    }

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

  setCenterWithOffset(lng: number, lat: number, offsetY: number, zoom?: number): void {
    if (!this.map) return

    // Convert the target coordinates to pixel space
    const targetPoint = this.map.project([lng, lat])

    // Apply the offset (negative Y moves up)
    targetPoint.y += offsetY

    // Convert back to geographic coordinates
    const offsetCenter = this.map.unproject(targetPoint)

    this.map.flyTo({
      center: [offsetCenter.lng, offsetCenter.lat],
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

    // Create appropriate pin element based on marker type
    const el = options.type === "parking"
      ? createParkingSpotPinElement(options.title, options.isSelected || false, options.availabilityPercentage)
      : createHangoutSpotPinElement(options.title, options.isSelected || false, options.color)

    const marker = new maplibregl.Marker({
      element: el,
      anchor: "center"
    })
      .setLngLat(options.coordinates)
      .addTo(this.map)

    if (options.onClick) {
      el.addEventListener("click", options.onClick)
    }

    this.markers.set(options.id, marker)
  }

  updateMarkerSelection(id: string, isSelected: boolean): void {
    const marker = this.markers.get(id)
    if (!marker) return

    const el = marker.getElement()
    const circle = el.querySelector(".pin-circle") as HTMLElement
    const square = el.querySelector(".parking-square") as HTMLElement
    const label = el.querySelector(".pin-label") as HTMLElement

    // Handle hangout spot markers (circles)
    if (circle) {
      if (isSelected) {
        el.style.zIndex = "150"
        circle.style.backgroundColor = "#F97316"
        circle.style.border = "3px solid white"
        circle.style.boxShadow = "0 0 0 2px #F97316, 0 4px 8px rgba(0,0,0,0.3)"
        if (label) {
          label.style.border = "2px solid #F97316"
        }
      } else {
        el.style.zIndex = "50"
        circle.style.backgroundColor = "#EF4444"
        circle.style.border = "2px solid white"
        circle.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
        if (label) {
          label.style.border = "2px solid transparent"
        }
      }
    }

    // Handle parking spot markers (squares)
    if (square) {
      const pLetter = square.querySelector(".parking-p-letter") as HTMLElement

      if (isSelected) {
        el.style.zIndex = "150"
        square.style.border = "3px solid #2563EB"
        square.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)"
        if (pLetter) {
          pLetter.style.fontSize = "16px"
        }
        if (label) {
          label.style.border = "2px solid #2563EB"
        }
      } else {
        el.style.zIndex = "50"
        square.style.border = "2px solid white"
        square.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
        if (pLetter) {
          pLetter.style.fontSize = "14px"
        }
        if (label) {
          label.style.border = "2px solid transparent"
        }
      }
    }
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

  addSearchPin(
    lng: number,
    lat: number,
    onDragEnd: (coords: [number, number]) => void,
    isLoading: boolean = false
  ): void {
    if (!this.map) return

    this.removeSearchPin()

    const el = createSearchPinElement(isLoading)
    this.searchPinCoordinates = [lng, lat]

    this.searchPin = new maplibregl.Marker({
      element: el,
      draggable: true,
      anchor: "bottom"
    })
      .setLngLat([lng, lat])
      .addTo(this.map)

    let isDragging = false

    el.addEventListener("mousedown", () => {
      el.style.cursor = "grabbing"
      isDragging = true
      this.setRadiusOpacity(0.5)
    })

    el.addEventListener("mouseup", () => {
      el.style.cursor = "grab"
      isDragging = false
      this.setRadiusOpacity(0.1)
    })

    this.searchPin.on("drag", () => {
      if (!this.searchPin) return
      const lngLat = this.searchPin.getLngLat()
      this.searchPinCoordinates = [lngLat.lng, lngLat.lat]
      this.updateRadiusCircle(lngLat.lng, lngLat.lat)
    })

    this.searchPin.on("dragend", () => {
      if (!this.searchPin) return
      const lngLat = this.searchPin.getLngLat()
      this.searchPinCoordinates = [lngLat.lng, lngLat.lat]
      setTimeout(() => this.setRadiusOpacity(0.1), 100)
      onDragEnd([lngLat.lng, lngLat.lat])
    })

    this.addRadiusCircle(lng, lat, 500)
  }

  addRadiusCircle(lng: number, lat: number, radiusMeters: number): void {
    if (!this.map) return

    const radiusId = "search-radius"
    
    if (this.map.getSource(radiusId)) {
      this.removeRadiusCircle()
    }

    const points = 64
    const coords: [number, number][] = []
    const distanceX = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))
    const distanceY = radiusMeters / 110574

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI)
      const x = distanceX * Math.cos(theta)
      const y = distanceY * Math.sin(theta)
      coords.push([lng + x, lat + y])
    }
    coords.push(coords[0])

    this.map.addSource(radiusId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [coords],
        },
      },
    })

    this.map.addLayer({
      id: `${radiusId}-fill`,
      type: "fill",
      source: radiusId,
      paint: {
        "fill-color": "#9CA3AF",
        "fill-opacity": 0.1,
      },
    })

    this.map.addLayer({
      id: `${radiusId}-outline`,
      type: "line",
      source: radiusId,
      paint: {
        "line-color": "#9CA3AF",
        "line-width": 2,
      },
    })

    this.layers.add(`${radiusId}-fill`)
    this.layers.add(`${radiusId}-outline`)
  }

  updateRadiusCircle(lng: number, lat: number): void {
    if (!this.map) return

    const radiusId = "search-radius"
    const source = this.map.getSource(radiusId) as maplibregl.GeoJSONSource

    if (!source) return

    const radiusMeters = 500
    const points = 64
    const coords: [number, number][] = []
    const distanceX = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))
    const distanceY = radiusMeters / 110574

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI)
      const x = distanceX * Math.cos(theta)
      const y = distanceY * Math.sin(theta)
      coords.push([lng + x, lat + y])
    }
    coords.push(coords[0])

    source.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
    })
  }

  setRadiusOpacity(opacity: number): void {
    if (!this.map) return
    
    const fillId = "search-radius-fill"
    if (this.map.getLayer(fillId)) {
      this.map.setPaintProperty(fillId, "fill-opacity", opacity)
    }
  }

  removeRadiusCircle(): void {
    if (!this.map) return

    const radiusId = "search-radius"
    const fillId = `${radiusId}-fill`
    const outlineId = `${radiusId}-outline`

    if (this.map.getLayer(fillId)) this.map.removeLayer(fillId)
    if (this.map.getLayer(outlineId)) this.map.removeLayer(outlineId)
    if (this.map.getSource(radiusId)) this.map.removeSource(radiusId)

    this.layers.delete(fillId)
    this.layers.delete(outlineId)
  }

  updateSearchPinLoading(isLoading: boolean): void {
    if (!this.searchPin) return

    const el = this.searchPin.getElement()

    // Clear existing content
    el.innerHTML = ''

    if (isLoading) {
      // Loading state: blue pin with spinner
      const svg = `
        <svg width="64" height="74" viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="search-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="3" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.4"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#search-shadow)">
            <path d="M32 4C23.163 4 16 11.163 16 20C16 32 32 68 32 68C32 68 48 32 48 20C48 11.163 40.837 4 32 4Z"
                  fill="#3B82F6" stroke="white" stroke-width="3"/>
          </g>
        </svg>
      `
      el.innerHTML = svg

      // Add CSS spinner in the center
      const spinner = document.createElement("div")
      spinner.className = "pin-spinner"
      spinner.style.position = "absolute"
      spinner.style.top = "14px"
      spinner.style.left = "50%"
      spinner.style.transform = "translateX(-50%)"
      spinner.style.width = "18px"
      spinner.style.height = "18px"
      spinner.style.border = "2.5px solid white"
      spinner.style.borderTopColor = "transparent"
      spinner.style.borderRadius = "50%"
      spinner.style.animation = "spin 1s linear infinite"
      spinner.style.pointerEvents = "none"

      // Add keyframes if not already added
      if (!document.querySelector('#spin-keyframes')) {
        const style = document.createElement('style')
        style.id = 'spin-keyframes'
        style.textContent = `
          @keyframes spin {
            0% { transform: translateX(-50%) rotate(0deg); }
            100% { transform: translateX(-50%) rotate(360deg); }
          }
        `
        document.head.appendChild(style)
      }

      el.appendChild(spinner)
    } else {
      // Normal state: blue pin with search icon
      const svg = `
        <svg width="64" height="74" viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="search-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="3" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.4"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#search-shadow)">
            <path d="M32 4C23.163 4 16 11.163 16 20C16 32 32 68 32 68C32 68 48 32 48 20C48 11.163 40.837 4 32 4Z"
                  fill="#3B82F6" stroke="white" stroke-width="3"/>

            <g transform="translate(32, 20)" class="pin-icon">
              <circle cx="0" cy="-2" r="7" stroke="white" stroke-width="2.5" fill="none"/>
              <line x1="5" y1="2.5" x2="8" y2="5.5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </g>
          </g>
        </svg>
      `
      el.innerHTML = svg
    }
  }

  removeSearchPin(): void {
    if (this.searchPin) {
      this.searchPin.remove()
      this.searchPin = null
      this.searchPinCoordinates = null
    }
    this.removeRadiusCircle()
  }

  fitCircleBounds(lng: number, lat: number, radiusMeters: number): void {
    if (!this.map) return

    const distanceX = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))
    const distanceY = radiusMeters / 110574

    const bounds: [number, number, number, number] = [
      lng - distanceX,
      lat - distanceY,
      lng + distanceX,
      lat + distanceY,
    ]

    this.map.fitBounds(bounds, {
      padding: 80,
      duration: 1000,
    })
  }

  clearAll(): void {
    this.clearMarkers()
    this.removeSearchPin()
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

  zoomIn(): void {
    if (!this.map) return
    this.map.zoomIn()
  }

  zoomOut(): void {
    if (!this.map) return
    this.map.zoomOut()
  }

  resetBearing(): void {
    if (!this.map) return
    this.map.setBearing(0)
    this.map.setPitch(0)
  }
}
