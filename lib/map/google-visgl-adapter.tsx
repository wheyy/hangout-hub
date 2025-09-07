// Let me try to implement this


// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client"

// import React, { useEffect, useMemo } from "react"
// import { createRoot, type Root } from "react-dom/client"
// import { APIProvider, Map as GMap, useMap } from "@vis.gl/react-google-maps"
// import type { MapAdapter, MapOptions, MarkerOptions, LayerOptions } from "./types"
// // Use the global `google` object provided by the Google Maps JavaScript API

// type AnyOverlay =
//   | google.maps.Circle
//   | google.maps.Polyline
//   | google.maps.Polygon
//   | google.maps.marker.AdvancedMarkerElement
//   | google.maps.Marker

// function MapBridge({
//   onReady,
//   options,
// }: {
//   onReady: (m: google.maps.Map) => void
//   options: MapOptions
// }) {
//   // We render the Map and then expose the google.maps.Map via useMap
//   const map = useMap()

//   useEffect(() => {
//     if (map) onReady(map)
//   }, [map, onReady])

//   const center = useMemo(() => ({ lng: options.center[0], lat: options.center[1] }), [options.center])

//   return (
//     <GMap
//       defaultCenter={center}
//       defaultZoom={options.zoom}
//       gestureHandling={options.interactive === false ? "none" : "greedy"}
//       disableDefaultUI={options.interactive === false}
//       // Vis.gl handles scroll/touch/drag via gestureHandling; Google doesn't expose all flags separately
//       // Style will be controlled by the mount container; give it 100% here
//       style={{ width: "100%", height: "100%" }}
//       mapId={process.env.GOOGLE_MAPS_MAP_ID}
//     />
//   )
// }

// export class GoogleVisGLAdapter implements MapAdapter {
//   private container: HTMLElement | null = null
//   private root: Root | null = null
//   private map: google.maps.Map | null = null

//   private markers = new Map<string, AnyOverlay>()
//   private overlays = new Map<string, AnyOverlay>()
//   private listeners = new Map<string, Map<(data: any) => void, google.maps.MapsEventListener>>()

//   async initialize(container: HTMLElement, options: MapOptions): Promise<void> {
//     this.container = container
//     // Ensure mount surface
//     container.innerHTML = `<div id="gmaps-mount" style="width:100%;height:100%"></div>`
//     const mount = container.querySelector("#gmaps-mount") as HTMLDivElement

//     const apiKey = process.env.GOOGLE_MAPS_API_KEY!
//     console.log("GMAPS_KEY: ", process.env.PORT)
//     if (!apiKey) throw new Error("Missing GOOGLE_MAPS_API_KEY")

//     this.root = createRoot(mount)
//     await new Promise<void>((resolve) => {
//       const onReady = (m: google.maps.Map) => {
//         this.map = m
//         resolve()
//       }
//       this.root!.render(
//         <React.StrictMode>
//           <APIProvider apiKey={apiKey} libraries={["marker", "geometry", "places"]}>
//             <MapBridge onReady={onReady} options={options} />
//           </APIProvider>
//         </React.StrictMode>,
//       )
//     })
//   }

//   destroy(): void {
//     for (const [, m] of this.markers) (m as any).setMap?.(null)
//     for (const [, o] of this.overlays) (o as any).setMap?.(null)
//     this.markers.clear()
//     this.overlays.clear()

//     for (const [, map] of this.listeners) {
//       for (const [, l] of map) l.remove()
//     }
//     this.listeners.clear()

//     if (this.root) this.root.unmount()
//     if (this.container) this.container.innerHTML = ""
//     this.root = null
//     this.map = null
//     this.container = null
//   }

//   setCenter(lng: number, lat: number): void {
//     this.map?.setCenter({ lng, lat })
//   }

//   setZoom(zoom: number): void {
//     this.map?.setZoom(zoom)
//   }

//   fitBounds(bounds: [number, number, number, number]): void {
//     if (!this.map) return
//     const [w, s, e, n] = bounds
//     const b = new google.maps.LatLngBounds(
//       new google.maps.LatLng({ lat: s, lng: w }),
//       new google.maps.LatLng({ lat: n, lng: e }),
//     )
//     this.map.fitBounds(b)
//   }

//   addMarker(options: MarkerOptions): string {
//     if (!this.map) return options.id
//     const pos = { lng: options.lng, lat: options.lat }

//     const canAdvanced = (google.maps as any).marker?.AdvancedMarkerElement !== undefined

//     let overlay: AnyOverlay
//     if (canAdvanced && (options.element || options.className)) {
//       const AdvancedMarker = (google.maps as any).marker.AdvancedMarkerElement
//       const content =
//         options.element ??
//         (() => {
//           const el = document.createElement("div")
//           el.className = options.className ?? "w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow"
//           return el
//         })()
//       overlay = new AdvancedMarker({ map: this.map!, position: pos, content })
//     } else {
//       overlay = new google.maps.Marker({ map: this.map!, position: pos })
//     }

//     if (options.popup) {
//       const info = new google.maps.InfoWindow({ content: options.popup })
//       ;(overlay as any).addListener?.("click", () => {
//         info.open({ map: this.map!, anchor: overlay as any })
//       })
//       ;(overlay as any).addListener?.("gmp-click", () => {
//         info.open({ map: this.map!, anchor: overlay as any })
//       })
//     }

//     this.markers.set(options.id, overlay)
//     return options.id
//   }

//   removeMarker(id: string): void {
//     const m = this.markers.get(id)
//     ;(m as any)?.setMap?.(null)
//     this.markers.delete(id)
//   }

//   addLayer(layer: LayerOptions): void {
//     if (!this.map) return
//     let overlay: AnyOverlay | null = null

//     if (layer.type === "circle") {
//       const { center, radiusMeters } = layer.source as {
//         center: [number, number]
//         radiusMeters: number
//       }
//       overlay = new google.maps.Circle({
//         map: this.map,
//         center: { lng: center[0], lat: center[1] },
//         radius: radiusMeters,
//         strokeColor: layer.paint?.strokeColor ?? "#2563eb",
//         strokeOpacity: layer.paint?.strokeOpacity ?? 0.8,
//         strokeWeight: layer.paint?.strokeWidth ?? 2,
//         fillColor: layer.paint?.fillColor ?? "#3b82f6",
//         fillOpacity: layer.paint?.fillOpacity ?? 0.15,
//       })
//     } else if (layer.type === "line") {
//       const { path } = layer.source as { path: [number, number][] }
//       overlay = new google.maps.Polyline({
//         map: this.map,
//         path: path.map(([lng, lat]) => ({ lng, lat })),
//         strokeColor: layer.paint?.color ?? "#10b981",
//         strokeOpacity: layer.paint?.opacity ?? 0.9,
//         strokeWeight: layer.paint?.width ?? 3,
//       })
//     } else if (layer.type === "fill") {
//       const src = layer.source as { paths: [number, number][] } | { rings: [[number, number][]] }
//       const paths =
//         "rings" in src
//           ? src.rings.map((ring) => ring.map(([lng, lat]) => ({ lng, lat })))
//           : [src.paths.map(([lng, lat]) => ({ lng, lat }))]
//       overlay = new google.maps.Polygon({
//         map: this.map,
//         paths,
//         strokeColor: layer.paint?.strokeColor ?? "#f59e0b",
//         strokeOpacity: layer.paint?.strokeOpacity ?? 0.9,
//         strokeWeight: layer.paint?.strokeWidth ?? 2,
//         fillColor: layer.paint?.fillColor ?? "#fbbf24",
//         fillOpacity: layer.paint?.fillOpacity ?? 0.2,
//       })
//     }

//     if (overlay) this.overlays.set(layer.id, overlay)
//   }

//   removeLayer(id: string): void {
//     const o = this.overlays.get(id) as any
//     o?.setMap?.(null)
//     this.overlays.delete(id)
//   }

//   on(event: string, callback: (data: any) => void): void {
//     if (!this.map) return
//     const m = this.map

//     const listener =
//       event === "click"
//         ? m.addListener("click", (e: google.maps.MapMouseEvent) => callback({ lngLat: { lng: e.latLng?.lng(), lat: e.latLng?.lat() } }))
//         : event === "zoom" || event === "zoom_changed"
//           ? m.addListener("zoom_changed", () => callback({ zoom: m.getZoom() }))
//           : event === "idle" || event === "moveend"
//             ? m.addListener("idle", () => {
//                 const b = m.getBounds()
//                 const c = m.getCenter()
//                 callback({
//                   center: c?.toJSON(),
//                   zoom: m.getZoom(),
//                   bounds: b
//                     ? [
//                         b.getSouthWest()?.lng(),
//                         b.getSouthWest()?.lat(),
//                         b.getNorthEast()?.lng(),
//                         b.getNorthEast()?.lat(),
//                       ]
//                     : undefined,
//                 })
//               })
//             : m.addListener(event as any, callback as any)

//     if (!this.listeners.has(event)) this.listeners.set(event, new Map())
//     this.listeners.get(event)!.set(callback, listener)
//   }

//   off(event: string, callback: (data: any) => void): void {
//     const map = this.listeners.get(event)
//     const l = map?.get(callback)
//     if (l) {
//       l.remove()
//       map!.delete(callback)
//     }
//   }

//   getCenter(): { lng: number; lat: number } {
//     const c = this.map?.getCenter()
//     return { lng: c?.lng() ?? 103.8198, lat: c?.lat() ?? 1.3521 }
//   }

//   getZoom(): number {
//     return this.map?.getZoom() ?? 12
//   }

//   getBounds(): [number, number, number, number] {
//     const b = this.map?.getBounds()
//     if (!b) return [103.6, 1.2, 104.0, 1.5]
//     const sw = b.getSouthWest()
//     const ne = b.getNorthEast()
//     return [sw.lng(), sw.lat(), ne.lng(), ne.lat()]
//   }
// }
