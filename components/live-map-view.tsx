"use client"

import { useEffect, useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { MapProviderComponent, useMap } from "@/lib/map/map-provider"
import { Meetup } from "@/lib/data/meetup"
import { LocationTrackingService } from "@/lib/services/location-tracking"
import { useUserStore } from "@/hooks/user-store"
import { getMemberColor } from "@/lib/constants/meetup-colors"
import { getDirections } from "@/lib/services/osrm-directions"

interface LiveMapViewProps {
  meetup: Meetup
}

function LiveMapContent({ meetup }: LiveMapViewProps) {
  const { map, isLoaded } = useMap()
  const currentUser = useUserStore((s) => s.user)
  const [memberLocations, setMemberLocations] = useState<Map<string, [number, number] | null>>(new Map())
  const [routes, setRoutes] = useState<Map<string, any>>(new Map())

  const members = meetup.getMembers()
  const destination = meetup.destination

  // Count active members (those with location)
  const activeMemberCount = useMemo(() => {
    return Array.from(memberLocations.values()).filter((loc) => loc !== null).length
  }, [memberLocations])

  // Subscribe to member location updates
  useEffect(() => {
    if (!members.length) return

    const locationService = new LocationTrackingService()
    const memberIds = members.map((m) => m.id)

    const cleanup = locationService.subscribeToMemberLocations(memberIds, (locations) => {
      setMemberLocations(locations)
    })

    return () => cleanup()
  }, [members])

  // Start tracking own location
  useEffect(() => {
    if (!currentUser) return

    const locationService = new LocationTrackingService()

    locationService.startTrackingOwnLocation(currentUser.id).then((cleanup) => {
      return () => cleanup()
    })
  }, [currentUser])

  // Render markers and routes on map
  useEffect(() => {
    if (!map || !isLoaded) return

    // Clear existing markers and routes
    map.clearAll()

    // Add destination marker (blue pin)
    map.addMarker({
      id: "destination",
      coordinates: destination.coordinates,
      title: destination.name,
      color: "#3B82F6",
    })

    // Add member markers
    members.forEach((member, index) => {
      const location = memberLocations.get(member.id)
      if (!location) return

      const color = getMemberColor(index)
      const isCurrentUser = member.id === currentUser?.id

      map.addMarker({
        id: `member-${member.id}`,
        coordinates: location,
        title: member.name,
        color: color,
        isSelected: isCurrentUser, // This will make it pulse
      })
    })

    // Fit bounds to show all markers
    const allCoords: [number, number][] = [destination.coordinates]
    memberLocations.forEach((loc) => {
      if (loc) allCoords.push(loc)
    })

    if (allCoords.length > 1) {
      const lngs = allCoords.map((c) => c[0])
      const lats = allCoords.map((c) => c[1])
      const bounds: [number, number, number, number] = [
        Math.min(...lngs),
        Math.min(...lats),
        Math.max(...lngs),
        Math.max(...lats),
      ]
      map.fitBounds(bounds)
    }
  }, [map, isLoaded, members, memberLocations, destination, currentUser])

  // Fetch and draw routes
  useEffect(() => {
    if (!map || !isLoaded) return

    const fetchRoutes = async () => {
      const newRoutes = new Map()

      for (let i = 0; i < members.length; i++) {
        const member = members[i]
        const location = memberLocations.get(member.id)
        if (!location) continue

        try {
          const response = await getDirections({
            coordinates: [location, destination.coordinates],
            profile: "car",
            overview: "full",
          })

          if (response.routes && response.routes.length > 0) {
            const route = response.routes[0]
            const color = getMemberColor(i)

            // Draw route on map
            map.addRoute({
              id: `route-${member.id}`,
              coordinates: route.geometry.coordinates,
              color: color,
              width: 3,
            })

            newRoutes.set(member.id, route)
          }
        } catch (error) {
          console.error(`Failed to fetch route for ${member.name}:`, error)
        }
      }

      setRoutes(newRoutes)
    }

    fetchRoutes()
  }, [map, isLoaded, members, memberLocations, destination])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Live Group Map</h2>
          <Badge className="bg-green-100 text-green-800">
            {activeMemberCount} {activeMemberCount === 1 ? "member" : "members"} active
          </Badge>
        </div>
        <div className="text-sm text-gray-600">Destination: {destination.name}</div>
      </div>

      {/* Map fills the rest */}
      <div className="flex-1 relative">
        {/* Map is rendered by MapProviderComponent */}
      </div>
    </div>
  )
}

export function LiveMapView({ meetup }: LiveMapViewProps) {
  return (
    <MapProviderComponent
      options={{
        center: meetup.destination.coordinates,
        zoom: 13,
      }}
      className="h-full w-full"
    >
      <LiveMapContent meetup={meetup} />
    </MapProviderComponent>
  )
}
