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
    const destElement = document.createElement("div")
    destElement.className =
      "w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center relative"
    destElement.innerHTML = `
      <div class="w-2 h-2 bg-white rounded-full"></div>
    `

    map.addMarker({
      id: "destination",
      lng: session.destination.coordinates[0],
      lat: session.destination.coordinates[1],
      element: destElement,
      popup: `
        <div class="p-2 min-w-48">
          <h3 class="font-semibold text-sm">${session.destination.name}</h3>
          <p class="text-xs text-gray-600">${session.destination.address}</p>
        </div>
      `,
      type: "spot",
    })

    // Add member markers
    session.members.forEach((member) => {
      if (!member.location) return

      const color = MeetupService.getStatusColor(member.status)
      const isSharing = member.status === "sharing"

      const memberElement = document.createElement("div")
      memberElement.className = `relative w-10 h-10 rounded-full border-3 border-white shadow-lg overflow-hidden ${
        isSharing ? "animate-pulse" : ""
      }`
      memberElement.style.borderColor = "white"

      // Avatar image
      memberElement.innerHTML = `
        <img src="${member.avatar}" alt="${member.name}" class="w-full h-full object-cover" />
        ${
          isSharing
            ? `<div class="absolute inset-0 rounded-full border-2 animate-ping" style="border-color: ${color}"></div>`
            : ""
        }
      `

      // Pulsing ring for sharing members
      if (isSharing) {
        const ringElement = document.createElement("div")
        ringElement.className = "absolute inset-0 rounded-full border-2 animate-ping"
        ringElement.style.borderColor = color
        memberElement.appendChild(ringElement)
      }

      map.addMarker({
        id: `member-${member.id}`,
        lng: member.location[0],
        lat: member.location[1],
        element: memberElement,
        popup: `
          <div class="p-2 min-w-32">
            <h3 class="font-semibold text-sm">${member.name}</h3>
            <p class="text-xs text-gray-600">${MeetupService.getStatusLabel(member.status)}</p>
            ${
              member.lastUpdated
                ? `<p class="text-xs text-gray-500">Updated ${Math.floor(
                    (Date.now() - member.lastUpdated.getTime()) / 1000,
                  )}s ago</p>`
                : ""
            }
          </div>
        `,
        type: "user",
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
