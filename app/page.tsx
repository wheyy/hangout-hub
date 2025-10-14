"use client"

import { MapProviderComponent } from "@/lib/map/map-provider"
import { MapControls } from "@/components/map/map-controls"
import { MapMarkers } from "@/components/map/map-markers"
import { SearchBar } from "@/components/map/search-bar"
import { ExploreDrawer } from "@/components/map/explore-drawer"
import { ParkingDrawer } from "@/components/map/parking-drawer"
import { BottomSheet } from "@/components/map/bottom-sheet"
import { CreateMeetupFAB } from "@/components/map/create-meetup-fab"
import { useIsMobile } from "@/hooks/use-mobile"
import { Nav } from "react-day-picker"
import { Navbar } from "@/components/navbar"

import { useMemo } from "react"
import { APIProvider } from "@vis.gl/react-google-maps"

export default function HomePage() {
  const isMobile = useIsMobile()

  const libraries = useMemo(() => ['places'], []);

  const mapOptions = useMemo(() => ({
    center: [103.8198, 1.3521] as [number, number], // Singapore center
    zoom: 11,
    mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!,
  }), []);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
    libraries={libraries}
    >
    <div className="h-screen w-full overflow-hidden">
      <Navbar/>
      {/* <MapProviderComponent provider="mock" options={mapOptions} className="relative"> */}
      <MapProviderComponent provider="google" options={mapOptions} className="relative">
        <MapMarkers />

        {/* Map Controls */}
        <MapControls />

        {/* Search Bar - Always visible at top */}
        <SearchBar />

        {/* Desktop Layout */}
        {!isMobile && (
          <>
            <ExploreDrawer />
            <ParkingDrawer />
          </>
        )}

        {/* Mobile Layout */}
        {isMobile && <BottomSheet />}

        {/* Create Meetup FAB */}
        <CreateMeetupFAB />
      </MapProviderComponent>
    </div>
    </APIProvider>
  );
}
