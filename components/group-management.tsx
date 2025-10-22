
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MapPin, Users, Navigation, Shield, Clock, AlertCircle, CheckCircle, Mail, UserX } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "./ui/input"


interface GroupMember {
  id: string
  name: string
  avatar?: string
  location?: {
    lat: number
    lng: number
    timestamp: number
  }
  isSharing: boolean
  status: "online" | "offline" | "arrived"
}

interface GroupManagementProps {
  meetupId: string
  meetup: any
  isActive: boolean
  onLocationShare: (enabled: boolean) => void
  isCreator: boolean
  canInvite: boolean
  onInvite: () => void
  onDelete: () => void
}

export function GroupManagement({ 
  meetupId, 
  meetup,
  isActive, 
  onLocationShare,
  isCreator,
  canInvite,
  onInvite,
  onDelete
}: GroupManagementProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)

  const handleGenerateLink = () => {
    // Generate invite link logic
    console.log("Generating invite link for:", inviteEmail)
  }

  const handleKickUser = (memberId: string, memberName: string) => {
    console.log(`Kicking user ${memberName} (${memberId}) from meetup`)
    // Here you would implement the actual kick logic
    // For now, just showing the action in console
  }

  const [groupMembers] = useState<GroupMember[]>([
    {
      id: "1",
      name: "Alex Chen",
      isSharing: true,
      location: { lat: 1.2966, lng: 103.8547, timestamp: Date.now() },
      status: "online",
    },
    {
      id: "2",
      name: "Sarah Kim",
      isSharing: true,
      location: { lat: 1.2976, lng: 103.8557, timestamp: Date.now() - 30000 },
      status: "online",
    },
    {
      id: "3",
      name: "Mike Johnson",
      isSharing: false,
      status: "offline",
    },
  ])

  const requestLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" })
      setHasPermission(permission.state === "granted")

      if (permission.state === "prompt") {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setHasPermission(true)
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          () => setHasPermission(false),
        )
      }
    } catch (error) {
      setHasPermission(false)
    }
  }

  const startLocationSharing = async () => {
    if (!hasPermission) {
      await requestLocationPermission()
      return
    }

    setIsSharing(true)
    onLocationShare(true)

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLastUpdate(new Date())
        },
        (error) => {
          console.error("Location error:", error)
        },
      )
    }, 5000)

    return () => clearInterval(interval)
  }

  const stopLocationSharing = () => {
    setIsSharing(false)
    onLocationShare(false)
    setCurrentLocation(null)
    setLastUpdate(null)
  }

  useEffect(() => {
    requestLocationPermission()
  }, [])

  if (!isActive) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Location Sharing Inactive</h3>
          <p className="text-gray-600">Join an active meetup to start sharing your location with the group.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Meetup Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Meetup Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{meetup.getDateString()} at {meetup.getTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{meetup.destination.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4" />
              <span className="text-sm">{meetup.getMemberCount()} / 10 members</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{meetup.getArrivedMemberCount()} members arrived</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Invite Section - Only for creator if can invite */}
      {isCreator && canInvite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5" />
              Invite Members
            </CardTitle>
            <p className="text-sm text-gray-600">Add more friends to this meetup</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onInvite}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Group Members Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Members ({groupMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {groupMembers.map((member) => (
              <div
                key={member.id}
                className="relative flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100"
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={member.status === "online" ? "default" : "secondary"}
                        className={`text-xs ${
                          member.status === "online"
                            ? "bg-green-100 text-green-800"
                            : member.status === "arrived"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.status === "online" ? "Online" : member.status === "arrived" ? "Arrived" : "Offline"}
                      </Badge>
                      {member.isSharing && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>Sharing location</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member.location && (
                    <div className="text-xs text-gray-500">
                      <div>Updated {Math.floor((Date.now() - member.location.timestamp) / 1000)}s ago</div>
                    </div>
                  )}

                  {hoveredMember === member.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleKickUser(member.id, member.name)}
                      className="ml-2 h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    >
                      <UserX className="w-4 h-4" />
                      <span className="ml-1 text-xs">Kick</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* End/Leave Meetup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meetup Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isCreator ? (
            <Button
              onClick={onDelete}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              End Meetup
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <UserX className="w-4 h-4 mr-2" />
              Leave Meetup
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

