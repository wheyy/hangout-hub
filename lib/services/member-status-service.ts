import { doc, onSnapshot, Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { MemberStatus } from "@/lib/data/meetup"

export class MemberStatusService {
  private listener: Unsubscribe | null = null

  /**
   * Subscribe to member status updates for a meetup
   */
  subscribeTomemberStatuses(
    meetupId: string,
    onUpdate: (statuses: Map<string, MemberStatus>) => void
  ): () => void {
    this.listener = onSnapshot(
      doc(db, "meetups", meetupId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          const statusesMap = new Map<string, MemberStatus>()
          
          if (data.members) {
            Object.entries(data.members).forEach(([userId, statusData]: [string, any]) => {
              statusesMap.set(userId, {
                userId,
                status: statusData.status || "traveling",
                locationSharingEnabled: statusData.locationSharingEnabled ?? true,
                arrivedAt: statusData.arrivedAt || null,
                joinedAt: statusData.joinedAt
              })
            })
          }
          
          onUpdate(statusesMap)
        }
      },
      (error) => {
        console.error(`Error listening to meetup ${meetupId}:`, error)
      }
    )

    return () => this.cleanup()
  }

  /**
   * Cleanup listener
   */
  cleanup(): void {
    if (this.listener) {
      this.listener()
      this.listener = null
    }
  }
}
