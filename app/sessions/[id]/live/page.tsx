// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { MapPin, ArrowLeft, Users, Clock, MessageCircle, Phone } from "lucide-react"
// import Link from "next/link"
// import { useParams, useRouter } from "next/navigation"
// import { LiveLocationMap } from "@/components/live-location-map"
// import { RealTimeSessionStatus } from "@/components/real-time-session-status"

// // Mock active session data
// const mockActiveSession = {
//   id: "1",
//   title: "Weekend Brunch at Marina Bay",
//   description: "Let's enjoy the amazing city views while having brunch!",
//   place: {
//     id: "1",
//     name: "Marina Bay Sands SkyPark",
//     address: "10 Bayfront Ave, Singapore 018956",
//   },
//   creator: {
//     id: "user1",
//     name: "John Doe",
//     avatar_url: "/placeholder.svg?height=40&width=40",
//   },
//   scheduled_time: "2024-12-15T11:00:00Z",
//   status: "active" as const,
//   max_participants: 6,
//   is_location_sharing_enabled: true,
//   participants: [
//     {
//       id: "1",
//       user: {
//         id: "user1",
//         name: "John Doe",
//         avatar_url: "/placeholder.svg?height=40&width=40",
//       },
//       status: "accepted" as const,
//       joined_at: "2024-12-01T10:00:00Z",
//     },
//     {
//       id: "2",
//       user: {
//         id: "user2",
//         name: "Jane Smith",
//         avatar_url: "/placeholder.svg?height=40&width=40",
//       },
//       status: "accepted" as const,
//       joined_at: "2024-12-02T14:30:00Z",
//     },
//     {
//       id: "3",
//       user: {
//         id: "user3",
//         name: "Mike Johnson",
//         avatar_url: "/placeholder.svg?height=40&width=40",
//       },
//       status: "accepted" as const,
//       joined_at: "2024-12-03T09:15:00Z",
//     },
//   ],
//   created_at: "2024-12-01T10:00:00Z",
// }

// export default function LiveSessionPage() {
//   const params = useParams()
//   const router = useRouter()
//   const [session, setSession] = useState(mockActiveSession)
//   const [sessionStartTime] = useState(new Date())

//   const formatDuration = (startTime: Date): string => {
//     const now = new Date()
//     const diffInMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60))

//     if (diffInMinutes < 60) {
//       return `${diffInMinutes} minutes`
//     }

//     const hours = Math.floor(diffInMinutes / 60)
//     const minutes = diffInMinutes % 60
//     return `${hours}h ${minutes}m`
//   }

//   const handleEndSession = async () => {
//     console.log("[v0] Ending session")
//     // In a real app, this would update the session status
//     router.push(`/sessions/${session.id}`)
//   }

//   if (session.status !== "active") {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <Card className="bg-white/80 backdrop-blur-sm border-blue-200 max-w-md">
//           <CardContent className="text-center py-8">
//             <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//             <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Not Active</h2>
//             <p className="text-gray-600 mb-4">This session is not currently active for live tracking.</p>
//             <Link href={`/sessions/${session.id}`}>
//               <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Session</Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center gap-4">
//               <Button variant="ghost" onClick={() => router.back()} className="text-gray-700 hover:text-blue-600">
//                 <ArrowLeft className="w-5 h-5" />
//               </Button>
//               <Link href="/" className="flex items-center gap-2">
//                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                   <MapPin className="w-5 h-5 text-white" />
//                 </div>
//                 <span className="text-xl font-bold text-gray-900">Hangout Hub</span>
//               </Link>
//             </div>
//             <div className="flex items-center gap-2">
//               <Badge className="bg-green-100 text-green-700 animate-pulse">
//                 <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
//                 LIVE
//               </Badge>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Session Header */}
//         <Card className="bg-white/80 backdrop-blur-sm border-blue-200 mb-6">
//           <CardHeader>
//             <div className="flex items-start justify-between">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-2">
//                   <Badge className="bg-green-100 text-green-700">
//                     <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
//                     Active Session
//                   </Badge>
//                   <Badge variant="outline" className="border-blue-300 text-blue-700">
//                     Duration: {formatDuration(sessionStartTime)}
//                   </Badge>
//                 </div>
//                 <CardTitle className="text-2xl mb-1">{session.title}</CardTitle>
//                 <CardDescription className="text-gray-600 mb-3">{session.description}</CardDescription>
//                 <div className="flex items-center gap-4 text-sm text-gray-600">
//                   <div className="flex items-center gap-1">
//                     <MapPin className="w-4 h-4" />
//                     <span>{session.place.name}</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <Users className="w-4 h-4" />
//                     <span>{session.participants.length} participants</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 ml-4">
//                 <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
//                   <MessageCircle className="w-4 h-4 mr-2" />
//                   Chat
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
//                   onClick={handleEndSession}
//                 >
//                   End Session
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>
//         </Card>

//         {/* Live Features Grid */}
//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* Live Location Map */}
//           <div className="lg:col-span-2">
//             <LiveLocationMap
//               sessionId={session.id}
//               participants={session.participants}
//               isLocationSharingEnabled={session.is_location_sharing_enabled}
//             />
//           </div>

//           {/* Real-time Status */}
//           <div>
//             <RealTimeSessionStatus sessionId={session.id} participants={session.participants} />
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <Card className="bg-white/80 backdrop-blur-sm border-blue-200 mt-6">
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//               <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
//                 <MessageCircle className="w-4 h-4 mr-2" />
//                 Send Message
//               </Button>
//               <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent">
//                 <Phone className="w-4 h-4 mr-2" />
//                 Call Group
//               </Button>
//               <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent">
//                 <MapPin className="w-4 h-4 mr-2" />
//                 Share Location
//               </Button>
//               <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 bg-transparent">
//                 <Users className="w-4 h-4 mr-2" />
//                 Invite More
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Safety Notice */}
//         <Alert className="border-blue-200 bg-blue-50 mt-6">
//           <MapPin className="w-4 h-4" />
//           <AlertDescription className="text-blue-700">
//             <strong>Safety Reminder:</strong> Always meet in public places and let someone know your plans. Your
//             location data is encrypted and will be automatically deleted when the session ends.
//           </AlertDescription>
//         </Alert>
//       </div>
//     </div>
//   )
// }
