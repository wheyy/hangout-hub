"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Navigation, Users, Eye, EyeOff, AlertTriangle } from "lucide-react"

interface LocationData {
  userId: string
  userName: string
  avatar?: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
}

interface LiveLocationMapProps {
  sessionId: string
  participants: Array<{
    id: string
    user: {
      id: string
      name: string
      avatar_url?: string
    }
    status: string
  }>
  isLocationSharingEnabled: boolean
}

export function LiveLocationMap({ sessionId, participants, isLocationSharingEnabled }: LiveLocationMapProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null)
  const [participantLocations, setParticipantLocations] = useState<LocationData[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown")
  const [isVisible, setIsVisible] = useState(true)
  const watchIdRef = useRef<number | null>(null)

  // Mock participant locations for demonstration
  const mockLocations: LocationData[] = [
    {
      userId: "user1",
      userName: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      latitude: 1.2834,
      longitude: 103.8558,
      accuracy: 10,
      timestamp: new Date().toISOString(),
    },
    {
      userId: "user2",
      userName: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      latitude: 1.284,
      longitude: 103.8565,
      accuracy: 15,
      timestamp: new Date().toISOString(),
    },
  ]

  useEffect(() => {
    // Check geolocation permission status
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionStatus(result.state)
      })
    }

    // Simulate receiving real-time location updates
    if (isLocationSharingEnabled) {
      setParticipantLocations(mockLocations)
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [isLocationSharingEnabled])

  const startLocationSharing = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return
    }

    setLocationError(null)

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000, // 30 seconds
    }

    try {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("[v0] Got initial location:", position.coords)
          setCurrentLocation(position)
          setIsSharing(true)

          // Start watching position
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              console.log("[v0] Location updated:", position.coords)
              setCurrentLocation(position)
              // In a real app, this would send the location to the server
            },
            (error) => {
              console.error("[v0] Location watch error:", error)
              setLocationError(getLocationErrorMessage(error))
            },
            options,
          )
        },
        (error) => {
          console.error("[v0] Initial location error:", error)
          setLocationError(getLocationErrorMessage(error))
        },
        options,
      )
    } catch (error) {
      setLocationError("Failed to access location services")
    }
  }

  const stopLocationSharing = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsSharing(false)
    setCurrentLocation(null)
    console.log("[v0] Stopped location sharing")
  }

  const getLocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access denied. Please enable location permissions in your browser settings."
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable. Please check your GPS settings."
      case error.TIMEOUT:
        return "Location request timed out. Please try again."
      default:
        return "An unknown error occurred while accessing your location."
    }
  }

  const formatAccuracy = (accuracy: number): string => {
    if (accuracy < 10) return "Very accurate"
    if (accuracy < 50) return "Accurate"
    if (accuracy < 100) return "Moderate"
    return "Low accuracy"
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  if (!isLocationSharingEnabled) {
    return (
      <Alert className="border-gray-200 bg-gray-50">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>Live location sharing is not enabled for this session.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Live Location Map
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        {isVisible && (
          <CardContent>
            {/* Mock Map Display */}
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Interactive Map</p>
                  <p className="text-sm">Real-time participant locations</p>
                </div>
              </div>

              {/* Mock location pins */}
              {participantLocations.map((location, index) => (
                <div
                  key={location.userId}
                  className="absolute w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${30 + index * 10}%`,
                  }}
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              ))}

              {/* Current user location */}
              {currentLocation && (
                <div
                  className="absolute w-10 h-10 bg-green-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse"
                  style={{ left: "50%", top: "50%" }}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Location Sharing Controls */}
            <div className="space-y-3">
              {locationError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="text-red-700">{locationError}</AlertDescription>
                </Alert>
              )}

              {!isSharing ? (
                <Button onClick={startLocationSharing} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Navigation className="w-4 h-4 mr-2" />
                  Share My Location
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Sharing location</span>
                    </div>
                    <Button
                      onClick={stopLocationSharing}
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                    >
                      Stop Sharing
                    </Button>
                  </div>
                  {currentLocation && (
                    <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      <p>Accuracy: {formatAccuracy(currentLocation.coords.accuracy)}</p>
                      <p>Last updated: {new Date().toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Participant List */}
      <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Participant Locations ({participantLocations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participantLocations.map((location) => (
              <div key={location.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={location.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{location.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{location.userName}</p>
                    <p className="text-xs text-gray-600">
                      {currentLocation &&
                        `${calculateDistance(
                          currentLocation.coords.latitude,
                          currentLocation.coords.longitude,
                          location.latitude,
                          location.longitude,
                        ).toFixed(1)}km away`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700 text-xs">Online</Badge>
                  <p className="text-xs text-gray-500 mt-1">{new Date(location.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}

            {participantLocations.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No participants are sharing their location yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <MapPin className="w-4 h-4" />
        <AlertDescription className="text-blue-700">
          <strong>Privacy Notice:</strong> Your location is only shared with participants of this session and will be
          automatically deleted when the session ends. You can stop sharing at any time.
        </AlertDescription>
      </Alert>
    </div>
  )
}