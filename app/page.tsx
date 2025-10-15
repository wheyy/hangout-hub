"use client"

import { MapProviderComponent, useMap } from "@/lib/map/map-provider"
import { Navbar } from "@/components/navbar"

function MapInterface() {
  const { isLoaded } = useMap()

  return (
    <>
      {isLoaded && (
        <div className="absolute bottom-4 right-4 z-10 bg-white px-3 py-2 rounded-lg shadow-lg text-xs text-gray-600">
          Map ready ✓
        </div>
      )}
    </>
  )
}

export default function HomePage() {
  const mapOptions = {
    center: [103.8198, 1.3521] as [number, number],
    zoom: 11,
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex-1 relative">
        <MapProviderComponent options={mapOptions} className="absolute inset-0">
          <MapInterface />
        </MapProviderComponent>
      </div>
    </div>
  )
}
