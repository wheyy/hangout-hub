// "use client"

// import { useEffect, useState } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { MapProviderComponent } from "@/lib/map/map-provider"
// import { MapControls } from "@/components/map/map-controls"
// import { SessionHeader } from "@/components/meetup/session-header"
// import { MembersDrawer } from "@/components/meetup/members-drawer"
// import { SessionMapMarkers } from "@/components/meetup/session-map-markers"
// import { MeetupService } from "@/lib/meetup/meetup-service"
// import type { MeetupSession } from "@/lib/meetup/meetup-types"

// export default function SessionPage() {
//   const params = useParams()
//   const router = useRouter()
//   const sessionId = params.id as string
//   const [session, setSession] = useState<MeetupSession | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     const loadSession = async () => {
//       try {
//         const sessionData = await MeetupService.getSession(sessionId)
//         if (!sessionData) {
//           router.push("/")
//           return
//         }
//         setSession(sessionData)
//       } catch (error) {
//         console.error("Failed to load session:", error)
//         router.push("/")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     loadSession()
//   }, [sessionId, router])

//   useEffect(() => {
//     if (!session || session.status !== "active") return

//     // Start location simulation
//     const cleanup = MeetupService.simulateLocationUpdates(sessionId)

//     // Refresh session data every 5 seconds
//     const interval = setInterval(async () => {
//       const updatedSession = await MeetupService.getSession(sessionId)
//       if (updatedSession) {
//         setSession(updatedSession)
//       }
//     }, 5000)

//     return () => {
//       cleanup()
//       clearInterval(interval)
//     }
//   }, [session, sessionId])

//   if (isLoading) {
//     return (
//       <div className="h-screen w-full flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
//           <p className="text-muted-foreground">Loading session...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!session) {
//     return (
//       <div className="h-screen w-full flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-muted-foreground">Session not found</p>
//         </div>
//       </div>
//     )
//   }

//   const mapOptions = {
//     center: session.destination.coordinates,
//     zoom: 14,
//   }

//   return (
//     <div className="h-screen w-full overflow-hidden">
//       <MapProviderComponent options={mapOptions} className="relative">
//         <SessionMapMarkers session={session} />

//         {/* Map Controls */}
//         <MapControls />

//         {/* Session Header */}
//         <SessionHeader session={session} onSessionUpdate={setSession} />

//         {/* Members Drawer */}
//         <MembersDrawer session={session} />
//       </MapProviderComponent>
//     </div>
//   )
// }
