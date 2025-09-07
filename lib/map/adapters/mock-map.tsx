"use client"

import type { MapAdapter, MapOptions, MarkerOptions, LayerOptions } from "../types"

export class MockMapAdapter implements MapAdapter {
  private container: HTMLElement | null = null
  private markers: Map<string, HTMLElement> = new Map()
  private center: { lng: number; lat: number } = { lng: 103.8198, lat: 1.3521 }
  private zoom = 12
  private bounds: [number, number, number, number] = [103.6, 1.2, 104.0, 1.5]

  async initialize(container: HTMLElement, options: MapOptions): Promise<void> {
    this.container = container
    this.center = { lng: options.center[0], lat: options.center[1] }
    this.zoom = options.zoom

    // Create a simple mock map interface
    container.innerHTML = `
      <div class="w-full h-full bg-map-bg relative overflow-hidden">
        <!-- Singapore Map Background -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
          <!-- Mock Singapore coastline -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
            <path d="M50 150 Q100 120 150 140 Q200 160 250 150 Q300 140 350 160 L350 250 Q300 240 250 250 Q200 260 150 250 Q100 240 50 250 Z" 
                  fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
            <!-- Marina Bay area -->
            <circle cx="200" cy="180" r="8" fill="#0ea5e9" opacity="0.6"/>
            <!-- Sentosa -->
            <circle cx="180" cy="220" r="6" fill="#22c55e" opacity="0.6"/>
            <!-- East Coast -->
            <path d="M220 200 Q280 190 320 210" stroke="#0284c7" stroke-width="3" fill="none"/>
          </svg>
          
          <!-- Grid overlay -->
          <div class="absolute inset-0 opacity-10">
            <div class="grid grid-cols-8 grid-rows-6 w-full h-full">
              ${Array.from({ length: 48 }, (_, i) => `<div class="border border-gray-400"></div>`).join("")}
            </div>
          </div>
          
          <!-- Zoom level indicator -->
          <div class="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded text-xs font-mono">
            Zoom: ${this.zoom}
          </div>
          
          <!-- Center coordinates -->
          <div class="absolute bottom-4 left-4 bg-white/90 px-2 py-1 rounded text-xs font-mono">
            ${this.center.lat.toFixed(4)}, ${this.center.lng.toFixed(4)}
          </div>
        </div>
        
        <!-- Markers container -->
        <div id="markers-container" class="absolute inset-0 pointer-events-none"></div>
      </div>
    `

    // Simulate async loading
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  destroy(): void {
    this.markers.clear()
    if (this.container) {
      this.container.innerHTML = ""
    }
  }

  setCenter(lng: number, lat: number): void {
    this.center = { lng, lat }
    this.updateCenterDisplay()
  }

  setZoom(zoom: number): void {
    this.zoom = zoom
    this.updateZoomDisplay()
  }

  fitBounds(bounds: [number, number, number, number]): void {
    this.bounds = bounds
    // Calculate center from bounds
    const centerLng = (bounds[0] + bounds[2]) / 2
    const centerLat = (bounds[1] + bounds[3]) / 2
    this.setCenter(centerLng, centerLat)
  }

  addMarker(options: MarkerOptions): string {
    if (!this.container) return options.id

    const markersContainer = this.container.querySelector("#markers-container")
    if (!markersContainer) return options.id

    // Convert lat/lng to pixel position (mock calculation)
    const x = ((options.lng - this.center.lng + 0.1) / 0.2) * 100
    const y = ((this.center.lat - options.lat + 0.1) / 0.2) * 100

    const marker = document.createElement("div")
    marker.className = `absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full ${options.className || ""}`
    marker.style.left = `${Math.max(0, Math.min(100, x))}%`
    marker.style.top = `${Math.max(0, Math.min(100, y))}%`

    if (options.element) {
      marker.appendChild(options.element)
    } else {
      // Default marker
      marker.innerHTML = `
        <div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `
    }

    if (options.popup) {
      marker.addEventListener("click", () => {
        // Simple popup implementation
        const popup = document.createElement("div")
        popup.className =
          "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white p-2 rounded shadow-lg border text-sm whitespace-nowrap z-50"
        popup.innerHTML = options.popup!
        marker.appendChild(popup)

        // Remove popup after 3 seconds
        setTimeout(() => popup.remove(), 3000)
      })
    }

    markersContainer.appendChild(marker)
    this.markers.set(options.id, marker)
    return options.id
  }

  removeMarker(id: string): void {
    const marker = this.markers.get(id)
    if (marker) {
      marker.remove()
      this.markers.delete(id)
    }
  }

  addLayer(layer: LayerOptions): void {
    // Mock layer implementation - just log for now
    console.log("[v0] Mock map: Added layer", layer.id)
  }

  removeLayer(id: string): void {
    console.log("[v0] Mock map: Removed layer", id)
  }

  on(event: string, callback: (data: any) => void): void {
    // Mock event handling
    if (event === "click" && this.container) {
      this.container.addEventListener("click", (e) => {
        const rect = this.container!.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height

        // Convert pixel to lat/lng (mock calculation)
        const lng = this.center.lng + (x - 0.5) * 0.2
        const lat = this.center.lat - (y - 0.5) * 0.2

        callback({ lngLat: { lng, lat } })
      })
    }
  }

  off(event: string, callback: (data: any) => void): void {
    // Mock event removal
    console.log("[v0] Mock map: Removed event listener", event)
  }

  getCenter(): { lng: number; lat: number } {
    return this.center
  }

  getZoom(): number {
    return this.zoom
  }

  getBounds(): [number, number, number, number] {
    return this.bounds
  }

  private updateCenterDisplay(): void {
    if (!this.container) return
    const display = this.container.querySelector(".absolute.bottom-4.left-4")
    if (display) {
      display.textContent = `${this.center.lat.toFixed(4)}, ${this.center.lng.toFixed(4)}`
    }
  }

  private updateZoomDisplay(): void {
    if (!this.container) return
    const display = this.container.querySelector(".absolute.top-4.right-4")
    if (display) {
      display.textContent = `Zoom: ${this.zoom}`
    }
  }
}
