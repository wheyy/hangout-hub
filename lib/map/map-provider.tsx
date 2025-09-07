"use client"

import type React from "react"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { MapAdapter, MapOptions, MapProvider } from "./types"
import {APIProvider} from '@vis.gl/react-google-maps';
import { MockMapAdapter } from "./adapters/mock-map"
import { GoogleMapAdapter } from "./adapters/google-map-adapter";


interface MapContextValue {
  map: MapAdapter | null
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
  provider?: MapProvider
  options: MapOptions
  className?: string
}

export function MapProviderComponent({ children, provider = "mock", options, className = "" }: MapProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<MapAdapter | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const initializeMap = async () => {
      try {
        setError(null)

        let adapter: MapAdapter        

        switch (provider) {
          case "google":
            // TODO: Implement Google Maps adapter
            throw new Error("Google Maps adapter not implemented yet")
            // adapter = new GoogleMapAdapter();
          default:
            adapter = new MockMapAdapter()
        }

        await adapter.initialize(containerRef.current!, options)
        setMap(adapter)
        setIsLoaded(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize map")
        console.error("Map initialization error:", err)
      }
    }

    initializeMap()

    return () => {
      if (map) {
        map.destroy()
      }
    }
  }, [provider, options])

  return (
    <MapContext.Provider value={{ map, isLoaded, error }}>
      <div className={`map-container ${className}`}>
        <div ref={containerRef} className="absolute inset-0" />
        {children}
      </div>
    </MapContext.Provider>
  )
}
