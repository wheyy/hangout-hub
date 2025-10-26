import { doc, onSnapshot, Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/config/firebase"
import { User } from "@/lib/models/user"

const LOCATION_UPDATE_INTERVAL = 1 * 60 * 1000 // 1 minute

export interface MemberLocation {
  userId: string
  coordinates: [number, number] | null
  lastUpdated: Date
}

export class LocationTrackingService {
  private listeners: Map<string, Unsubscribe> = new Map()
  private locationUpdateTimer: NodeJS.Timeout | null = null
  private isTracking: boolean = false

  /**
   * Subscribe to location updates for a list of member IDs
   */
  subscribeToMemberLocations(
    memberIds: string[],
    onUpdate: (locations: Map<string, [number, number] | null>) => void
  ): () => void {
    const locations = new Map<string, [number, number] | null>()

    // Set up listener for each member
    memberIds.forEach((memberId) => {
      const unsubscribe = onSnapshot(
        doc(db, "users", memberId),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            locations.set(memberId, data.currentLocation || null)
            onUpdate(new Map(locations)) // Create new Map to trigger update
          }
        },
        (error) => {
          console.error(`Error listening to user ${memberId}:`, error)
        }
      )

      this.listeners.set(memberId, unsubscribe)
    })

    // Return cleanup function
    return () => {
      this.cleanup()
    }
  }

  /**
   * Start tracking and updating current user's location
   */
  async startTrackingOwnLocation(userId: string): Promise<() => void> {
    if (this.isTracking) {
      console.log("Already tracking location")
      return () => {}
    }

    this.isTracking = true

    // Get initial location
    await this.updateUserLocation(userId)

    // Set up periodic updates every 5 minutes
    this.locationUpdateTimer = setInterval(() => {
      this.updateUserLocation(userId)
    }, LOCATION_UPDATE_INTERVAL)

    // Return cleanup function
    return () => {
      this.stopTrackingOwnLocation(userId)
    }
  }

  /**
   * Stop tracking current user's location
   */
  async stopTrackingOwnLocation(userId: string): Promise<void> {
    if (this.locationUpdateTimer) {
      clearInterval(this.locationUpdateTimer)
      this.locationUpdateTimer = null
    }
    this.isTracking = false

    // Clear location in Firebase
    try {
      await User.updateCurrentLocation(userId, null)
      console.log(`Stopped tracking location for user ${userId}`)
    } catch (error) {
      console.error("Failed to clear location in Firestore:", error)
    }
  }

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking
  }

  /**
   * Get and update user's current location from browser geolocation API
   */
  private async updateUserLocation(userId: string): Promise<void> {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported")
      return
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ]

          try {
            await User.updateCurrentLocation(userId, coords)
            console.log(`Updated location for user ${userId}:`, coords)
            resolve()
          } catch (error) {
            console.error("Failed to update location in Firestore:", error)
            resolve()
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          resolve()
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000, // Cache location for 1 minute
        }
      )
    })
  }

  /**
   * Cleanup all listeners
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe())
    this.listeners.clear()

    if (this.locationUpdateTimer) {
      clearInterval(this.locationUpdateTimer)
      this.locationUpdateTimer = null
    }
  }
}
