"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar, Clock, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { LocationTracking } from "@/components/location-tracking"
import { LiveMapView } from "@/components/live-map-view"

interface MeetupPageProps {
  params: { id: string }
}

export default function MeetupPage({ params }: MeetupPageProps) {
  const [activeTab, setActiveTab] = useState<"map" | "tracking">("map")
  const [isLocationSharing, setIsLocationSharing] = useState(false)

  // Mock meetup data
  const meetup = {
    id: params.id,
    title: "Coffee at Marina Bay",
    destination: "Marina Bay Sands SkyPark",
    date: "2025-06-09",
    time: "08:21",
    status: "active",
    memberCount: 3,
    creator: "Alex Chen",
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/meetups">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{meetup.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-3 h-3" />
                <span>{meetup.destination}</span>
                <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3">
          <Button
            variant={activeTab === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("map")}
            className={activeTab === "map" ? "bg-blue-600 text-white" : ""}
          >
            <MapPin className="w-4 h-4 mr-1" />
            Live Map
          </Button>
          <Button
            variant={activeTab === "tracking" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tracking")}
            className={activeTab === "tracking" ? "bg-blue-600 text-white" : ""}
          >
            <Users className="w-4 h-4 mr-1" />
            Group Management
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "map" ? (
          <LiveMapView
            meetupId={meetup.id}
            destination={{
              lat: 1.2986,
              lng: 103.8567,
              name: meetup.destination,
            }}
          />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <LocationTracking
              meetupId={meetup.id}
              isActive={meetup.status === "active"}
              onLocationShare={setIsLocationSharing}
            />
          </div>
        )}
      </div>

      {/* Meetup Info Panel */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{meetup.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{meetup.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{meetup.memberCount} members</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
            End Meetup
          </Button>
        </div>
      </div>
    </div>
  )
}
