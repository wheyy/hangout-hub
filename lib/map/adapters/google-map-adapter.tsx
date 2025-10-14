// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* global google */
// // "use client";

// // import type { MapAdapter, MapOptions, MarkerOptions, LayerOptions } from "../types";

// // type AnyOverlay =
// //   | google.maps.Circle
// //   | google.maps.Polyline
// //   | google.maps.Polygon
// //   | google.maps.marker.AdvancedMarkerElement
// //   | google.maps.Marker;

// // type ListenerMap = Map<
// //   string,
// //   Map<(data: any) => void, google.maps.MapsEventListener>
// // >;

// // const DEFAULT_LIBRARIES: string[] = ["marker", "geometry", "places"]; // was google.maps.Library (but this seems to fix it temporarily)

// // function loadGoogleMaps(apiKey: string, libraries = DEFAULT_LIBRARIES): Promise<void> {
// //   if (typeof window === "undefined") return Promise.resolve(); // SSR no-op

// //   const w = window as any;
// //   if (w.__gmaps_loaded) return Promise.resolve();
// //   if (w.__gmaps_loading) return w.__gmaps_loading;

// //   const params = new URLSearchParams({
// //     key: apiKey,
// //     v: "weekly",
// //     libraries: libraries.join(","),
// //     // language/region could be added here if needed
// //   });

// //   w.__gmaps_loading = new Promise<void>((resolve, reject) => {
// //     const script = document.createElement("script");
// //     script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
// //     script.async = true;
// //     script.defer = true;
// //     script.onerror = () => reject(new Error("Failed to load Google Maps JS API"));
// //     script.onload = () => {
// //       w.__gmaps_loaded = true;
// //       resolve();
// //     };
// //     document.head.appendChild(script);
// //   });

// //   return w.__gmaps_loading;
// // }

// // export class GoogleMapAdapter implements MapAdapter {
// //   private container: HTMLElement | null = null;
// //   private map: google.maps.Map | null = null;

// //   private markers = new Map<string, AnyOverlay>();
// //   private overlays = new Map<string, AnyOverlay>();
// //   private listeners: ListenerMap = new Map();

// //   private apiKey: string;
// //   private mapId?: string;

// //   constructor(opts?: { apiKey?: string; mapId?: string }) {
// //     this.apiKey = opts?.apiKey ?? (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string);
// //     this.mapId = opts?.mapId ?? (process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID as string | undefined);
// //   }

// //   async initialize(container: HTMLElement, options: MapOptions): Promise<void> {
// //     this.container = container;

// //     if (!this.apiKey) {
// //       throw new Error(
// //       );
// //     }

// //     await loadGoogleMaps(this.apiKey);

// //     // Build Google Maps options from your MapOptions
// //     const gmOptions: google.maps.MapOptions = {
// //       center: { lng: options.center[0], lat: options.center[1] },
// //       zoom: options.zoom,
// //       mapId: this.mapId,
// //       disableDefaultUI: options.interactive === false ? true : undefined,
// //       draggable: options.dragPan ?? true,
// //       scrollwheel: options.scrollZoom ?? true,
// //       gestureHandling: options.interactive === false ? "none" : "greedy",
// //       // Google uses "disableDoubleClickZoom" (inverse)
// //       disableDoubleClickZoom: options.doubleClickZoom === false ? true : undefined,
// //       // touch zoom is covered by gestureHandling on mobile; no direct flag
// //     };

// //     this.map = new google.maps.Map(container, gmOptions);
// //   }

// //   destroy(): void {
// //     // Remove markers/overlays
// //     for (const [, m] of this.markers) (m as any).map && (m as any).setMap(null);
// //     for (const [, o] of this.overlays) (o as any).map && (o as any).setMap(null);
// //     this.markers.clear();
// //     this.overlays.clear();

// //     // Remove listeners
// //     for (const [, cbMap] of this.listeners) {
// //       for (const [, l] of cbMap) l.remove();
// //     }
// //     this.listeners.clear();

// //     // Clear container
// //     if (this.container) this.container.innerHTML = "";
// //     this.map = null;
// //     this.container = null;
// //   }
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* global google */
// "use client";

// import type { MapAdapter, MapOptions, MarkerOptions, LayerOptions } from "../types";

// type AnyOverlay =
//   | google.maps.Circle
//   | google.maps.Polyline
//   | google.maps.Polygon
//   | google.maps.marker.AdvancedMarkerElement
//   | google.maps.Marker;

// type ListenerMap = Map<
//   string,
//   Map<(data: any) => void, google.maps.MapsEventListener>
// >;

// export class GoogleMapAdapter implements MapAdapter {
//   private container: HTMLElement | null = null;
//   private map: google.maps.Map | null = null;

//   private markers = new Map<string, AnyOverlay>();
//   private overlays = new Map<string, AnyOverlay>();
//   private listeners: ListenerMap = new Map();

//   // The constructor is now much simpler.
//   // We no longer need to read environment variables here.
//   constructor() {}

//   // The initialize method no longer needs to load the script.
//   // It assumes the APIProvider has already done so.
//   async initialize(container: HTMLElement, options: MapOptions): Promise<void> {
//     this.container = container;

//     // Check if the Google Maps API is available
//     if (!window.google || !window.google.maps) {
//       throw new Error("Google Maps JavaScript API is not loaded. Make sure to wrap your component in an APIProvider.");
//     }
    
//     // Build Google Maps options from your MapOptions
//     const gmOptions: google.maps.MapOptions = {
//       center: { lng: options.center[0], lat: options.center[1] },
//       zoom: options.zoom,
//       // IMPORTANT: Pass the mapId from the options
//       mapId: options.mapId,
//       disableDefaultUI: options.interactive === false ? true : undefined,
//       draggable: options.dragPan ?? true,
//       scrollwheel: options.scrollZoom ?? true,
//       gestureHandling: options.interactive === false ? "none" : "greedy",
//       disableDoubleClickZoom: options.doubleClickZoom === false ? true : undefined,
//     };

//     this.map = new google.maps.Map(container, gmOptions);
//   }

//   destroy(): void {
//     // (The rest of this file remains exactly the same as you had it)
//     // ...
//     for (const [, m] of this.markers) (m as any).map && (m as any).setMap(null);
//     for (const [, o] of this.overlays) (o as any).map && (o as any).setMap(null);
//     this.markers.clear();
//     this.overlays.clear();

//     for (const [, cbMap] of this.listeners) {
//       for (const [, l] of cbMap) l.remove();
//     }
//     this.listeners.clear();

//     if (this.container) this.container.innerHTML = "";
//     this.map = null;
//     this.container = null;
//   }

//   setCenter(lng: number, lat: number): void {
//     this.map?.setCenter({ lng, lat });
//   }

//   setZoom(zoom: number): void {
//     this.map?.setZoom(zoom);
//   }

//   fitBounds(bounds: [number, number, number, number]): void {
//     if (!this.map) return;
//     const [west, south, east, north] = bounds;
//     const b = new google.maps.LatLngBounds(
//       new google.maps.LatLng({ lat: south, lng: west }),
//       new google.maps.LatLng({ lat: north, lng: east })
//     );
//     this.map.fitBounds(b);
//   }

//   addMarker(options: MarkerOptions): string {
//     if (!this.map) return options.id;

//     const position = { lng: options.lng, lat: options.lat };

//     // Prefer AdvancedMarker for HTML content / custom element
//     let overlay: AnyOverlay;

//     const canUseAdvanced =
//       (google.maps as any).marker?.AdvancedMarkerElement !== undefined;

//     if (options.element && canUseAdvanced) {
//       const AdvancedMarker = (google.maps as any).marker.AdvancedMarkerElement;
//       overlay = new AdvancedMarker({
//         map: this.map,
//         position,
//         content: options.element,
//         // zIndex, title, etc. can be passed via options.data if desired
//       });
//     } else if (canUseAdvanced && options.className) {
//       // Build a default pin with a class for styling
//       const el = document.createElement("div");
//       el.className = options.className;
//       el.innerHTML =
//         '<div style="width:24px;height:24px;border-radius:12px;background:#ef4444;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>';
//       const AdvancedMarker = (google.maps as any).marker.AdvancedMarkerElement;
//       overlay = new AdvancedMarker({ map: this.map, position, content: el });
//     } else {
//       // Fallback to classic Marker API
//       overlay = new google.maps.Marker({
//         map: this.map,
//         position,
//         title: options.id,
//       });
//     }

//     if (options.popup) {
//       const info = new google.maps.InfoWindow({ content: options.popup });
//       const target = (overlay as any);
//       (target as google.maps.Marker).addListener?.("click", () => {
//         info.open({ map: this.map!, anchor: overlay as any });
//       });
//       (target as any).addListener?.("gmp-click", () => {
//         // AdvancedMarker click event
//         info.open({ map: this.map!, anchor: overlay as any });
//       });
//     }

//     this.markers.set(options.id, overlay);
//     return options.id;
//   }

//   removeMarker(id: string): void {
//     const m = this.markers.get(id);
//     if (m && (m as any).setMap) (m as any).setMap(null);
//     this.markers.delete(id);
//   }

//   addLayer(layer: LayerOptions): void {
//     if (!this.map) return;
//     let overlay: AnyOverlay | null = null;

//     if (layer.type === "circle") {
//       // Expect source: { center: [lng,lat], radiusMeters: number }
//       const { center, radiusMeters } = layer.source as {
//         center: [number, number];
//         radiusMeters: number;
//       };
//       overlay = new google.maps.Circle({
//         map: this.map,
//         center: { lng: center[0], lat: center[1] },
//         radius: radiusMeters,
//         strokeColor: layer.paint?.strokeColor ?? "#2563eb",
//         strokeOpacity: layer.paint?.strokeOpacity ?? 0.8,
//         strokeWeight: layer.paint?.strokeWidth ?? 2,
//         fillColor: layer.paint?.fillColor ?? "#3b82f6",
//         fillOpacity: layer.paint?.fillOpacity ?? 0.15,
//       });
//     }

//     if (layer.type === "line") {
//       // Expect source: { path: [ [lng,lat], ... ] }
//       const { path } = layer.source as { path: [number, number][] };
//       overlay = new google.maps.Polyline({
//         map: this.map,
//         path: path.map(([lng, lat]) => ({ lng, lat })),
//         strokeColor: layer.paint?.color ?? "#10b981",
//         strokeOpacity: layer.paint?.opacity ?? 0.9,
//         strokeWeight: layer.paint?.width ?? 3,
//       });
//     }

//     if (layer.type === "fill") {
//       // Expect source: { paths: [ [lng,lat], ... ] } or { rings: [ [lng,lat][], ... ] }
//       const src = layer.source as
//         | { paths: [number, number][] }
//         | { rings: [ [number, number][] ] };

//       const paths =
//         "rings" in src
//           ? src.rings.map((ring) => ring.map(([lng, lat]) => ({ lng, lat })))
//           : [src.paths.map(([lng, lat]) => ({ lng, lat }))];

//       overlay = new google.maps.Polygon({
//         map: this.map,
//         paths,
//         strokeColor: layer.paint?.strokeColor ?? "#f59e0b",
//         strokeOpacity: layer.paint?.strokeOpacity ?? 0.9,
//         strokeWeight: layer.paint?.strokeWidth ?? 2,
//         fillColor: layer.paint?.fillColor ?? "#fbbf24",
//         fillOpacity: layer.paint?.fillOpacity ?? 0.2,
//       });
//     }

//     // 'symbol' can be represented as markers; you can extend as needed.

//     if (overlay) this.overlays.set(layer.id, overlay);
//     else console.warn("[GoogleMapAdapter] Unsupported layer or bad source:", layer);
//   }

//   removeLayer(id: string): void {
//     const o = this.overlays.get(id) as any;
//     if (o?.setMap) o.setMap(null);
//     this.overlays.delete(id);
//   }

//   on(event: string, callback: (data: any) => void): void {
//     if (!this.map) return;

//     const map = this.map;

//     // Map common event names to Google’s
//     const handler = (() => {
//       switch (event) {
//         case "click":
//           return map.addListener("click", (e: google.maps.MapMouseEvent) => {
//             callback({ lngLat: { lng: e.latLng?.lng(), lat: e.latLng?.lat() } });
//           });
//         case "idle":
//         case "moveend":
//           return map.addListener("idle", () => {
//             const b = map.getBounds();
//             const c = map.getCenter();
//             callback({
//               center: { lng: c?.lng(), lat: c?.lat() },
//               bounds: b
//                 ? [b.getSouthWest()?.lng(), b.getSouthWest()?.lat(), b.getNorthEast()?.lng(), b.getNorthEast()?.lat()]
//                 : undefined,
//               zoom: map.getZoom(),
//             });
//           });
//         case "zoom":
//         case "zoom_changed":
//           return map.addListener("zoom_changed", () => callback({ zoom: map.getZoom() }));
//         case "dragend":
//           return map.addListener("dragend", () => callback({ center: map.getCenter()?.toJSON() }));
//         case "bounds_changed":
//           return map.addListener("bounds_changed", () => callback({ bounds: map.getBounds()?.toJSON() }));
//         default:
//           // Fallback: try to attach directly
//           return map.addListener(event, callback);
//       }
//     })();

//     if (!this.listeners.has(event)) this.listeners.set(event, new Map());
//     this.listeners.get(event)!.set(callback, handler);
//   }

//   off(event: string, callback: (data: any) => void): void {
//     const cbMap = this.listeners.get(event);
//     const listener = cbMap?.get(callback);
//     if (listener) {
//       listener.remove();
//       cbMap!.delete(callback);
//     }
//   }

//   getCenter(): { lng: number; lat: number } {
//     const c = this.map?.getCenter();
//     return { lng: c?.lng() ?? 103.8198, lat: c?.lat() ?? 1.3521 };
//   }

//   getZoom(): number {
//     return this.map?.getZoom() ?? 12;
//   }

//   getBounds(): [number, number, number, number] {
//     const b = this.map?.getBounds();
//     if (!b) return [103.6, 1.2, 104.0, 1.5];
//     const sw = b.getSouthWest();
//     const ne = b.getNorthEast();
//     return [sw.lng(), sw.lat(), ne.lng(), ne.lat()];
//   }
// }



/* eslint-disable @typescript-eslint/no-explicit-any */
/* global google */
"use client";

import type { MapAdapter, MapOptions, MarkerOptions, LayerOptions } from "../types";

type AnyOverlay =
  | google.maps.Circle
  | google.maps.Polyline
  | google.maps.Polygon
  | google.maps.marker.AdvancedMarkerElement
  | google.maps.Marker;

type ListenerMap = Map<
  string,
  Map<(data: any) => void, google.maps.MapsEventListener>
>;

export class GoogleMapAdapter implements MapAdapter {
  private container: HTMLElement | null = null;
  private map: google.maps.Map | null = null;
  private markers = new Map<string, AnyOverlay>();
  private overlays = new Map<string, AnyOverlay>();
  private listeners: ListenerMap = new Map();

  constructor() {}

  async initialize(container: HTMLElement, options: MapOptions): Promise<void> {
    this.container = container;

    if (!window.google || !window.google.maps) {
      throw new Error("Google Maps JavaScript API is not loaded. Make sure to wrap your component in an APIProvider.");
    }
    
    const gmOptions: google.maps.MapOptions = {
      center: { lng: options.center[0], lat: options.center[1] },
      zoom: options.zoom,
      mapId: options.mapId, // Use the mapId from options
      disableDefaultUI: options.interactive === false ? true : undefined,
      draggable: options.dragPan ?? true,
      scrollwheel: options.scrollZoom ?? true,
      gestureHandling: options.interactive === false ? "none" : "greedy",
      disableDoubleClickZoom: options.doubleClickZoom === false ? true : undefined,
    };

    this.map = new google.maps.Map(container, gmOptions);
  }

  destroy(): void {
    for (const [, m] of this.markers) (m as any).map && (m as any).setMap(null);
    for (const [, o] of this.overlays) (o as any).map && (o as any).setMap(null);
    this.markers.clear();
    this.overlays.clear();
    for (const [, cbMap] of this.listeners) {
      for (const [, l] of cbMap) l.remove();
    }
    this.listeners.clear();
    if (this.container) this.container.innerHTML = "";
    this.map = null;
    this.container = null;
  }

  setCenter(lng: number, lat: number): void {
    this.map?.setCenter({ lng, lat });
  }

  setZoom(zoom: number): void {
    this.map?.setZoom(zoom);
  }

  fitBounds(bounds: [number, number, number, number]): void {
    if (!this.map) return;
    const [west, south, east, north] = bounds;
    const b = new google.maps.LatLngBounds(
      new google.maps.LatLng({ lat: south, lng: west }),
      new google.maps.LatLng({ lat: north, lng: east })
    );
    this.map.fitBounds(b);
  }

  addMarker(options: MarkerOptions): string {
    if (!this.map) return options.id;
    const position = { lng: options.lng, lat: options.lat };
    let overlay: AnyOverlay;
    const canUseAdvanced = (google.maps as any).marker?.AdvancedMarkerElement !== undefined;

    if (options.element && canUseAdvanced) {
      const AdvancedMarker = (google.maps as any).marker.AdvancedMarkerElement;
      overlay = new AdvancedMarker({ map: this.map, position, content: options.element });
    } else {
      overlay = new google.maps.Marker({ map: this.map, position, title: options.id });
    }

    this.markers.set(options.id, overlay);
    return options.id;
  }

  removeMarker(id: string): void {
    const m = this.markers.get(id);
    if (m && (m as any).setMap) (m as any).setMap(null);
    this.markers.delete(id);
  }

  addLayer(layer: LayerOptions): void {
     // Your implementation here if needed
  }

  removeLayer(id: string): void {
    // Your implementation here if needed
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.map) return;
    const map = this.map;
    const handler = (() => {
      switch (event) {
        case "click":
          return map.addListener("click", (e: google.maps.MapMouseEvent) => {
            callback({ lngLat: { lng: e.latLng?.lng(), lat: e.latLng?.lat() } });
          });
        case "idle":
        case "moveend":
          return map.addListener("idle", () => {
            const b = map.getBounds();
            const c = map.getCenter();
            callback({
              center: { lng: c?.lng(), lat: c?.lat() },
              bounds: b ? [b.getSouthWest()?.lng(), b.getSouthWest()?.lat(), b.getNorthEast()?.lng(), b.getNorthEast()?.lat()] : undefined,
              zoom: map.getZoom(),
            });
          });
        default:
          return map.addListener(event, callback);
      }
    })();
    if (!this.listeners.has(event)) this.listeners.set(event, new Map());
    this.listeners.get(event)!.set(callback, handler);
  }

  off(event: string, callback: (data: any) => void): void {
    const cbMap = this.listeners.get(event);
    const listener = cbMap?.get(callback);
    if (listener) {
      listener.remove();
      cbMap!.delete(callback);
    }
  }

  getCenter(): { lng: number; lat: number } {
    const c = this.map?.getCenter();
    return { lng: c?.lng() ?? 103.8198, lat: c?.lat() ?? 1.3521 };
  }

  getZoom(): number {
    return this.map?.getZoom() ?? 12;
  }

  getBounds(): [number, number, number, number] {
    const b = this.map?.getBounds();
    if (!b) return [103.6, 1.2, 104.0, 1.5];
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    return [sw.lng(), sw.lat(), ne.lng(), ne.lat()];
  }
}