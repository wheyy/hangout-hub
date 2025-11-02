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

interface MapRendererProps {
  members: Array<{ id: string; name: string }>
  memberLocations: Map<string, [number, number] | null>
  destination: { name: string; coordinates: [number, number] }
  currentUserId: string | undefined
}

function MapRenderer({ members, memberLocations, destination, currentUserId }: MapRendererProps) {
  const { map, isLoaded } = useMap()

  const getMemberColorForIndex = (memberId: string, members: Array<{ id: string; name: string }>) => {
    if (memberId === currentUserId) {
      return CURRENT_USER_COLOR
    }

    const nonCurrentUserMembers = members.filter(m => m.id !== currentUserId)
    const memberIndex = nonCurrentUserMembers.findIndex(m => m.id === memberId)
    return getMemberColor(memberIndex)
  }

  useEffect(() => {
    if (!map || !isLoaded) return

    map.clearAll()

    map.addMarker({
      id: "destination",
      coordinates: destination.coordinates,
      title: destination.name,
      color: DESTINATION_COLOR,
    })

    members.forEach((member) => {
      const location = memberLocations.get(member.id)
      if (!location) return

      const color = getMemberColorForIndex(member.id, members)
      const isCurrentUser = member.id === currentUserId

      map.addMarker({
        id: `member-${member.id}`,
        coordinates: location,
        title: member.name,
        color: color,
        isSelected: isCurrentUser,
      })
    })

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
  }, [map, isLoaded, members, memberLocations, destination, currentUserId])

  useEffect(() => {
    if (!map || !isLoaded) return

    const fetchRoutes = async () => {
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
            const color = getMemberColorForIndex(member.id, members)

            map.addRoute({
              id: `route-${member.id}`,
              coordinates: route.geometry.coordinates,
              color: color,
              width: 3,
            })
          }
        } catch (error) {
          console.error(`Failed to fetch route for ${member.name}:`, error)
        }
      }
    }

    fetchRoutes()
  }, [map, isLoaded, members, memberLocations, destination, currentUserId])

  return null
}

export function LiveMapView({ meetup }: LiveMapViewProps) {
  const currentUser = useUserStore((s) => s.user)
  const router = useRouter()
  const { toast } = useToast()

  const [memberLocations, setMemberLocations] = useState<Map<string, [number, number] | null>>(new Map())
  const [isLocationSharing, setIsLocationSharing] = useState(false)
  const [isArriveModalOpen, setIsArriveModalOpen] = useState(false)
  const [isAllArrivedModalOpen, setIsAllArrivedModalOpen] = useState(false)
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

  const activeMemberCount = useMemo(() => {
    return Array.from(memberLocations.values()).filter((loc) => loc !== null).length
  }, [memberLocations])

  useEffect(() => {
    if (!members.length) return

    const locationServiceInstance = new LocationTrackingService()
    const memberIds = members.map((m) => m.id)

    const cleanup = locationServiceInstance.subscribeToMemberLocations(memberIds, (locations) => {
      setMemberLocations(locations)
    })

    return () => cleanup()
  }, [members])

  useEffect(() => {
    if (!currentUser || !currentMemberStatus) return

    const firestoreLocationSharing = currentMemberStatus.locationSharingEnabled
    setIsLocationSharing(firestoreLocationSharing)

    if (firestoreLocationSharing && !isArrived) {
      requestLocationPermission().then((granted) => {
        if (granted) {
          locationService.startTrackingOwnLocation(currentUser.id)
        }
      })
    }
  }, [currentUser, currentMemberStatus?.locationSharingEnabled, isArrived])

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

  useEffect(() => {
    if (!currentUser || isArrived) return

    const userLocation = memberLocations.get(currentUser.getId())
    if (!userLocation) return

    const distance = haversineDistance(userLocation, destination.coordinates)
    setIsNearDestination(distance <= ARRIVAL_RADIUS_METERS)
  }, [memberLocations, currentUser, destination, isArrived])

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" })

      if (permission.state === "granted") {
        return true
      }

      if (permission.state === "denied") {
        setError("Location permission denied. Please enable it in browser settings.")
        return false
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            setError(null)
            resolve(true)
          },
          (error) => {
            console.error("Location permission denied:", error)
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
    } catch (error) {
      console.error("Error checking permission:", error)
      setError("Failed to check location permissions")
      return false
    }
  }

  const handleLocationToggle = async (enabled: boolean) => {
    if (!currentUser) return

    try {
      setError(null)

      if (enabled) {
        const granted = await requestLocationPermission()
        if (!granted) {
          return
        }

        const success = await meetup.updateLocationSharing(currentUser.getId(), true)
        if (!success) {
          throw new Error("Failed to enable location sharing")
        }

        setIsLocationSharing(true)
      } else {
        await locationService.stopTrackingOwnLocation(currentUser.id)

        const success = await meetup.updateLocationSharing(currentUser.getId(), false)
        if (!success) {
          throw new Error("Failed to disable location sharing")
        }

        setIsLocationSharing(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update location sharing"
      setError(errorMessage)
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
        const firestoreEnabled = meetup.getMemberStatus(currentUser.getId())?.locationSharingEnabled
        if (firestoreEnabled) {
          setIsLocationSharing(true)
        }
      }

      setIsArriveModalOpen(false)

      if (isCreator && meetup.allMembersArrived() && meetup.getMemberCount() > 1) {
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
      <div className="p-4 bg-white border-b shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Live Group Map</h2>
          <Badge className="bg-green-100 text-green-800">
            {activeMemberCount} {activeMemberCount === 1 ? "member" : "members"} active
          </Badge>
        </div>
        <div className="text-sm text-gray-600">Destination: {destination.name}</div>
      </div>

      <div className="flex-1 relative min-h-0">
        <MapProviderComponent
          options={{
            center: meetup.destination.coordinates,
            zoom: 13,
          }}
          className="w-full h-full"
        >
          <MapRenderer
            members={members}
            memberLocations={memberLocations}
            destination={destination}
            currentUserId={currentUser?.getId()}
          />
        </MapProviderComponent>
      </div>

      <div className="bg-white border-t p-4 space-y-3 shrink-0">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {isNearDestination && !isArrived && (
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              You're within 200m of the destination! Mark yourself as arrived when ready.
            </AlertDescription>
          </Alert>
        )}

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