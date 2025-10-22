"use client"

import { useEffect } from "react"
import { useMap } from "@/lib/map/map-provider"
import type { MeetupSession } from "@/lib/meetup/meetup-types"
import { MeetupService } from "@/lib/meetup/meetup-service"

interface SessionMapMarkersProps {
  session: MeetupSession
}

export function SessionMapMarkers({ session }: SessionMapMarkersProps) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    // Clear existing markers
    session.members.forEach((member) => {
      map.removeMarker(`member-${member.id}`)
    })
    map.removeMarker("destination")

    // Add destination marker
    map.addMarker({
      id: "destination",
      coordinates: session.destination.coordinates,
      title: session.destination.name,
      color: "#EF4444"
    })

    // Add member markers
    session.members.forEach((member) => {
      if (!member.location) return

      const color = MeetupService.getStatusColor(member.status)

      map.addMarker({
        id: `member-${member.id}`,
        coordinates: member.location,
        title: member.name,
        color: color
      })
    })

    return () => {
      // Cleanup markers
      session.members.forEach((member) => {
        map.removeMarker(`member-${member.id}`)
      })
      map.removeMarker("destination")
    }
  }, [map, isLoaded, session])

  return null
}
