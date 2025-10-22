"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { MapOptions } from "./types"
import { MapLibreMap } from "./maplibre-map"

interface MapContextValue {
  map: MapLibreMap | null
  isLoaded: boolean
  error: string | null
}

const MapContext = createContext<MapContextValue>({
  map: null,
  isLoaded: false,
  error: null,
})

export const useMap = () => {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error("useMap must be used within a MapProvider")
  }
  return context
}

interface MapProviderProps {
  children: React.ReactNode
  options: MapOptions
  className?: string
}

export function MapProviderComponent({ children, options, className = "" }: MapProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<MapLibreMap | null>(null)
  const isInitializingRef = useRef(false)
  const [map, setMap] = useState<MapLibreMap | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    // Prevent re-initialization if map already exists or is being created
    if (mapInstanceRef.current || isInitializingRef.current) return

    const initializeMap = async () => {
      isInitializingRef.current = true
      try {
        setError(null)
        const mapInstance = new MapLibreMap()
        await mapInstance.initialize(containerRef.current!, options)
        mapInstanceRef.current = mapInstance
        setMap(mapInstance)
        setIsLoaded(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize map")
        console.error("Map initialization error:", err)
      } finally {
        isInitializingRef.current = false
      }
    }

    initializeMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
        setIsLoaded(false)
      }
    }
  }, [])

  return (
    <MapContext.Provider value={{ map, isLoaded, error }}>
      <div className={`map-container ${className}`}>
        <div ref={containerRef} className="absolute inset-0" />
        {isLoaded && children}
      </div>
    </MapContext.Provider>
  )
}
