"use client"

import { useEffect, useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MapProviderComponent, useMap } from "@/lib/map/map-provider"
import { Meetup } from "@/lib/models/meetup"
import { LocationTrackingService } from "@/lib/services/location-tracking"
import { useUserStore } from "@/hooks/user-store"
import { getMemberColor, DESTINATION_COLOR, CURRENT_USER_COLOR } from "@/lib/constants/meetup-colors"
import { getDirections } from "@/lib/services/osrm-directions"
import { ArriveConfirmationModal } from "@/components/meetup/arrive-confirmation-modal"
import { AllArrivedModal } from "@/components/meetup/all-arrived-modal"
import { Navigation, MapPin, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { haversineDistance } from "@/lib/utils/distance"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface LiveMapViewProps {
  meetup: Meetup
}

function LiveMapContent({ meetup }: LiveMapViewProps) {
  const { map, isLoaded } = useMap()
  const currentUser = useUserStore((s) => s.user)
  const router = useRouter()
  const { toast } = useToast()
  const [memberLocations, setMemberLocations] = useState<Map<string, [number, number] | null>>(new Map())
  const [routes, setRoutes] = useState<Map<string, any>>(new Map())
  const [isLocationSharing, setIsLocationSharing] = useState(true)
  const [locationService] = useState(() => new LocationTrackingService())
  const [isArriveModalOpen, setIsArriveModalOpen] = useState(false)
  const [isAllArrivedModalOpen, setIsAllArrivedModalOpen] = useState(false)
  const [hasShownAllArrivedModal, setHasShownAllArrivedModal] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const members = meetup.getMembers()
  const destination = meetup.destination
  const isCreator = currentUser?.getId() === meetup.creator.getId()
  const currentMemberStatus = currentUser ? meetup.getMemberStatus(currentUser.getId()) : undefined
  const isArrived = currentMemberStatus?.status === "arrived"
  const [isNearDestination, setIsNearDestination] = useState(false)
  const ARRIVAL_RADIUS_METERS = 200

  // Check if user is near destination
  useEffect(() => {
    if (!currentUser || isArrived) return

    const userLocation = memberLocations.get(currentUser.getId())
    if (!userLocation) return

    const distance = haversineDistance(userLocation, destination.coordinates)
    setIsNearDestination(distance <= ARRIVAL_RADIUS_METERS)
  }, [memberLocations, currentUser, destination, isArrived])

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
    if (!currentUser || !isLocationSharing || isArrived) return

    let cleanup: (() => void) | null = null

    locationService.startTrackingOwnLocation(currentUser.id).then((cleanupFn) => {
      cleanup = cleanupFn
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [currentUser, isLocationSharing, isArrived, locationService])

  // Check if all members arrived (for creator)
  useEffect(() => {
    if (!isCreator || hasShownAllArrivedModal) return

    if (meetup.allMembersArrived() && meetup.getMemberCount() > 1) {
      setIsAllArrivedModalOpen(true)
      setHasShownAllArrivedModal(true)
    }
  }, [meetup, isCreator, hasShownAllArrivedModal])

  // // Handle location sharing toggle (there's a duplicate and this is not in use)
  // const handleLocationToggle = async (enabled: boolean) => {
  //   if (!currentUser) return

  //   try {
  //     setError(null)
  //     setIsLocationSharing(enabled)

  //     if (enabled) {
  //       const success = await meetup.updateLocationSharing(currentUser.getId(), true)
  //       if (!success) {
  //         throw new Error("Failed to enable location sharing")
  //       }
  //     } else {
  //       await locationService.stopTrackingOwnLocation(currentUser.id)
  //       const success = await meetup.updateLocationSharing(currentUser.getId(), false)
  //       if (!success) {
  //         throw new Error("Failed to disable location sharing")
  //       }
  //     }
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : "Failed to update location sharing"
  //     setError(errorMessage)
  //     setIsLocationSharing(!enabled) // Revert on error
  //     toast({
  //       title: "Error",
  //       description: errorMessage,
  //       variant: "destructive",
  //     })
  //     console.error("Location toggle error:", err)
  //   }
  // }

  // Handle arrive button
  const handleArriveClick = () => {
    setIsArriveModalOpen(true)
  }

  const handleArriveConfirm = async () => {
    if (!currentUser) return

    try {
      setError(null)
      setIsUpdatingStatus(true)

      const newStatus = isArrived ? "traveling" : "arrived"
      const success = await meetup.updateMemberStatus(currentUser.getId(), newStatus)
      
      if (!success) {
        throw new Error("Failed to update arrival status")
      }

      if (newStatus === "arrived") {
        setIsLocationSharing(false)
        await locationService.stopTrackingOwnLocation(currentUser.id)
      } else {
        setIsLocationSharing(true)
      }

      setIsArriveModalOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update arrival status"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Arrive confirmation error:", err)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleEndMeetup = async () => {
    try {
      setError(null)
      setIsUpdatingStatus(true)

      const success = await meetup.deleteMeetup()
      if (success) {
        router.push("/meetups")
      } else {
        throw new Error("Failed to end meetup")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to end meetup"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("End meetup error:", err)
      setIsAllArrivedModalOpen(false)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Render markers and routes on map
  useEffect(() => {
    if (!map || !isLoaded) return

    // Clear existing markers and routes
    map.clearAll()

    // Add destination marker (red)
    map.addMarker({
      id: "destination",
      coordinates: destination.coordinates,
      title: destination.name,
      color: DESTINATION_COLOR,
    })

    // Add member markers
    let colorIndex = 0
    members.forEach((member) => {
      const location = memberLocations.get(member.id)
      if (!location) return

      const isCurrentUser = member.id === currentUser?.id
      const color = isCurrentUser ? CURRENT_USER_COLOR : getMemberColor(colorIndex)
      
      // Only increment color index for non-current users
      if (!isCurrentUser) {
        colorIndex++
      }

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
      let colorIndex = 0

      for (const member of members) {
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
            const isCurrentUser = member.id === currentUser?.id
            const color = isCurrentUser ? CURRENT_USER_COLOR : getMemberColor(colorIndex)
            
            // Only increment color index for non-current users
            if (!isCurrentUser) {
              colorIndex++
            }

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
  }, [map, isLoaded, members, memberLocations, destination, currentUser])

  return null
}

function LiveMapViewLayout({ meetup }: LiveMapViewProps) {
  const currentUser = useUserStore((s) => s.user)
  const [memberLocations, setMemberLocations] = useState<Map<string, [number, number] | null>>(new Map())
  const [isLocationSharing, setIsLocationSharing] = useState(true)
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false)
  const [isArriveModalOpen, setIsArriveModalOpen] = useState(false)
  const [isAllArrivedModalOpen, setIsAllArrivedModalOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationService] = useState(() => new LocationTrackingService())

  const members = meetup.getMembers()
  const destination = meetup.destination
  const isCreator = currentUser?.getId() === meetup.creator.getId()
  const currentMemberStatus = currentUser ? meetup.getMemberStatus(currentUser.getId()) : undefined
  const isArrived = currentMemberStatus?.status === "arrived"
  const [isNearDestination, setIsNearDestination] = useState(false)
  const ARRIVAL_RADIUS_METERS = 200

  // Count active members
  const activeMemberCount = useMemo(() => {
    return Array.from(memberLocations.values()).filter((loc) => loc !== null).length
  }, [memberLocations])

  // Subscribe to member location updates
  useEffect(() => {
    if (!members.length) return

    const locationServiceInstance = new LocationTrackingService()
    const memberIds = members.map((m) => m.id)

    const cleanup = locationServiceInstance.subscribeToMemberLocations(memberIds, (locations) => {
      setMemberLocations(locations)
    })

    return () => cleanup()
  }, [members])

  // Start tracking own location
  useEffect(() => {
    if (!currentUser || !isLocationSharing || isArrived) return

    let cleanup: (() => void) | null = null

    locationService.startTrackingOwnLocation(currentUser.id).then((cleanupFn) => {
      cleanup = cleanupFn
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [currentUser, isLocationSharing, isArrived, locationService])

  // Check if user is near destination
  useEffect(() => {
    if (!currentUser || isArrived) return

    const userLocation = memberLocations.get(currentUser.getId())
    if (!userLocation) return

    const distance = haversineDistance(userLocation, destination.coordinates)
    setIsNearDestination(distance <= ARRIVAL_RADIUS_METERS)
  }, [memberLocations, currentUser, destination, isArrived])

  // ✅ Request location permission with better UX
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      // Check current permission state
      const permission = await navigator.permissions.query({ name: "geolocation" })
      
      console.log("📍 Permission state:", permission.state)
      
      if (permission.state === "granted") {
        setHasLocationPermission(true)
        return true
      }
      
      if (permission.state === "denied") {
        setHasLocationPermission(false)
        setError("Location permission denied. Please enable it in browser settings.")
        return false
      }
      
      // Permission is "prompt" - request it
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("✅ Location permission granted")
            setHasLocationPermission(true)
            setError(null)
            resolve(true)
          },
          (error) => {
            console.error("❌ Location permission denied:", error)
            setHasLocationPermission(false)
            setError("Location access denied. Please enable location services.")
            resolve(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        )
      })
      handleLocationToggle(hasLocationPermission)
    } catch (error) {
      console.error("Error checking permission:", error)
      setHasLocationPermission(false)
      setError("Failed to check location permissions")
      return false
    }
  }

  // ✅ Initialize - check permission on mount
  useEffect(() => {
    const initializeLocation = async () => {
      const granted = await requestLocationPermission()
      
      // If permission granted and user wants to share, start sharing
      if (granted && currentMemberStatus?.locationSharingEnabled) {
        handleLocationToggle(true)
      } else {
        handleLocationToggle(false)
      }
    }
    
    initializeLocation()
  }, [])
  
  // Handle location sharing toggle
  const handleLocationToggle = async (enabled: boolean) => {
    if (!currentUser) return

    try {
      setError(null)
      setIsLocationSharing(enabled)

      if (enabled) {
        if(hasLocationPermission === false) {
          const granted = await requestLocationPermission()
          if (!granted) {
            handleLocationToggle(false)
            return
          }
        }
        const success = await meetup.updateLocationSharing(currentUser.getId(), true)
        if (!success) {
          throw new Error("Failed to enable location sharing")
        }
      } else {
        requestLocationPermission()
        await locationService.stopTrackingOwnLocation(currentUser.id)
        const success = await meetup.updateLocationSharing(currentUser.getId(), false)
        if (!success) {
          throw new Error("Failed to disable location sharing")
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update location sharing"
      setError(errorMessage)
      setIsLocationSharing(!enabled)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Location toggle error:", err)
    }
  }

  const handleArriveClick = () => {
    setIsArriveModalOpen(true)
  }

  const handleArriveConfirm = async () => {
    if (!currentUser) return

    try {
      setError(null)
      setIsUpdatingStatus(true)

      const newStatus = isArrived ? "traveling" : "arrived"
      const success = await meetup.updateMemberStatus(currentUser.getId(), newStatus)
      
      if (!success) {
        throw new Error("Failed to update arrival status")
      }

      if (newStatus === "arrived") {
        setIsLocationSharing(false)
        await locationService.stopTrackingOwnLocation(currentUser.id)
      } else {
        setIsLocationSharing(true)
      }

      setIsArriveModalOpen(false)

      // Check if all members have arrived
      if (isCreator && meetup.allMembersArrived()) {
        setIsAllArrivedModalOpen(true)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update arrival status"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Arrive confirmation error:", err)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleEndMeetup = async () => {
    try {
      setError(null)
      setIsUpdatingStatus(true)
      
      // End the meetup
      const success = await meetup.endMeetup()
      
      if (!success) {
        throw new Error("Failed to end meetup")
      }

      toast({
        title: "Meetup ended",
        description: "The meetup has been ended successfully",
      })

      setIsAllArrivedModalOpen(false)
      router.push("/meetups")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to end meetup"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("End meetup error:", err)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Live Group Map</h2>
          <Badge className="bg-green-100 text-green-800">
            {activeMemberCount} {activeMemberCount === 1 ? "member" : "members"} active
          </Badge>
        </div>
        <div className="text-sm text-gray-600">Destination: {destination.name}</div>
      </div>

      {/* Map Container - takes remaining space */}
      <div className="flex-1 relative min-h-0">
        <MapProviderComponent
          options={{
            center: meetup.destination.coordinates,
            zoom: 13,
          }}
          className="w-full h-full"
        >
          <LiveMapContent meetup={meetup} />
        </MapProviderComponent>
      </div>

      {/* Footer with controls */}
      <div className="bg-white border-t p-4 space-y-3 shrink-0">
        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Near Destination Alert */}
        {isNearDestination && !isArrived && (
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              You're within 200m of the destination! Mark yourself as arrived when ready.
            </AlertDescription>
          </Alert>
        )}

        {/* Live Location Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Share My Live Location</div>
              <div className="text-sm text-gray-600">
                {isLocationSharing && !isArrived ? "Location sharing is on" : "Location sharing is off"}
              </div>
            </div>
          </div>
          <Switch
            checked={isLocationSharing && !isArrived}
            onCheckedChange={handleLocationToggle}
            disabled={isArrived}
          />
        </div>

        {/* Arrive Button */}
        <Button
          onClick={handleArriveClick}
          disabled={isUpdatingStatus}
          className={`w-full ${
            isArrived
              ? "bg-gray-600 hover:bg-gray-700"
              : isNearDestination
              ? "bg-green-600 hover:bg-green-700 animate-pulse"
              : "bg-green-600 hover:bg-green-700"
          }`}
          size="lg"
        >
          {isUpdatingStatus ? (
            <>
              <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Updating...
            </>
          ) : isArrived ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Not Arrived
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5 mr-2" />
              I've Arrived
            </>
          )}
        </Button>
      </div>

      {/* Modals */}
      <ArriveConfirmationModal
        isOpen={isArriveModalOpen}
        onClose={() => !isUpdatingStatus && setIsArriveModalOpen(false)}
        onConfirm={handleArriveConfirm}
        destinationName={destination.name}
        isArrived={isArrived}
        isLoading={isUpdatingStatus}
      />

      {isCreator && (
        <AllArrivedModal
          isOpen={isAllArrivedModalOpen}
          onClose={() => !isUpdatingStatus && setIsAllArrivedModalOpen(false)}
          onEndMeetup={handleEndMeetup}
          memberCount={meetup.getMemberCount()}
          isLoading={isUpdatingStatus}
        />
      )}
    </div>
  )
}

export function LiveMapView({ meetup }: LiveMapViewProps) {
  return <LiveMapViewLayout meetup={meetup} />
}
