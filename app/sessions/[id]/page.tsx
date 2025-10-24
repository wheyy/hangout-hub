// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   MapPin,
//   Calendar,
//   Users,
//   Clock,
//   Share2,
//   ArrowLeft,
//   Navigation,
//   UserCheck,
//   UserX,
//   UserPlus,
//   Settings,
//   MapIcon,
// } from "lucide-react"
// import Link from "next/link"
// import { useParams, useRouter } from "next/navigation"

// // Mock session data
// const mockSession = {
//   id: "1",
//   title: "Weekend Brunch at Marina Bay",
//   description:
//     "Let's enjoy the amazing city views while having brunch! We'll meet at the SkyPark observation deck and then head to one of the restaurants nearby. Perfect opportunity to catch up and enjoy Singapore's skyline.",
//   place: {
//     id: "1",
//     name: "Marina Bay Sands SkyPark",
//     address: "10 Bayfront Ave, Singapore 018956",
//     rating: 4.5,
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
//       status: "maybe" as const,
//       joined_at: "2024-12-03T09:15:00Z",
//     },
//     {
//       id: "4",
//       user: {
//         id: "user4",
//         name: "Sarah Wilson",
//         avatar_url: "/placeholder.svg?height=40&width=40",
//       },
//       status: "invited" as const,
//       joined_at: "2024-12-04T16:45:00Z",
//     },
//   ],
//   created_at: "2024-12-01T10:00:00Z",
// }

// const statusColors = {
//   planned: "bg-blue-100 text-blue-700",
//   active: "bg-green-100 text-green-700",
//   completed: "bg-gray-100 text-gray-700",
//   cancelled: "bg-red-100 text-red-700",
// }

// const participantStatusColors = {
//   accepted: "bg-green-100 text-green-700",
//   declined: "bg-red-100 text-red-700",
//   maybe: "bg-yellow-100 text-yellow-700",
//   invited: "bg-blue-100 text-blue-700",
// }

// const participantStatusIcons = {
//   accepted: UserCheck,
//   declined: UserX,
//   maybe: Clock,
//   invited: UserPlus,
// }

// export default function SessionDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const [session, setSession] = useState(mockSession)
//   const [loading, setLoading] = useState(false)
//   const [userParticipation, setUserParticipation] = useState<"accepted" | "declined" | "maybe" | "not_joined">(
//     "not_joined",
//   )

//   const currentUserId = "current_user" // Mock current user ID
//   const isCreator = session.creator.id === currentUserId

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString("en-SG", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     })
//   }

//   const formatTime = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleTimeString("en-SG", {
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   const getAcceptedParticipants = () => {
//     return session.participants.filter((p) => p.status === "accepted")
//   }

//   const handleJoinSession = async (status: "accepted" | "declined" | "maybe") => {
//     setLoading(true)
//     console.log("[v0] Updating participation status:", status)

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 500))
//       setUserParticipation(status)
//     } catch (error) {
//       console.error("[v0] Failed to update participation:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleShare = async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: session.title,
//           text: `Join me for ${session.title} at ${session.place.name}`,
//           url: window.location.href,
//         })
//       } catch (error) {
//         console.log("[v0] Share cancelled")
//       }
//     } else {
//       navigator.clipboard.writeText(window.location.href)
//     }
//   }

//   const handleGetDirections = () => {
//     const encodedAddress = encodeURIComponent(session.place.address)
//     window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank")
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
//               <Button variant="ghost" onClick={handleShare} className="text-gray-700 hover:text-blue-600">
//                 <Share2 className="w-5 h-5" />
//               </Button>
//               {isCreator && (
//                 <Link href={`/sessions/${session.id}/manage`}>
//                   <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
//                     <Settings className="w-5 h-5" />
//                   </Button>
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Session Info */}
//             <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-3">
//                       <Badge className={statusColors[session.status]}>{session.status}</Badge>
//                       {session.is_location_sharing_enabled && (
//                         <Badge variant="outline" className="border-green-300 text-green-700">
//                           Live Location Enabled
//                         </Badge>
//                       )}
//                     </div>
//                     <CardTitle className="text-2xl mb-2">{session.title}</CardTitle>
//                     <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
//                       <Avatar className="w-6 h-6">
//                         <AvatarImage src={session.creator.avatar_url || "/placeholder.svg"} />
//                         <AvatarFallback>{session.creator.name.charAt(0)}</AvatarFallback>
//                       </Avatar>
//                       <span>Created by {session.creator.name}</span>
//                     </div>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 leading-relaxed mb-6">{session.description}</p>

//                 {/* Date, Time, Location */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                   <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
//                     <Calendar className="w-5 h-5 text-blue-600" />
//                     <div>
//                       <p className="font-medium text-gray-900">{formatDate(session.scheduled_time)}</p>
//                       <p className="text-sm text-gray-600">{formatTime(session.scheduled_time)}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
//                     <MapPin className="w-5 h-5 text-green-600" />
//                     <div>
//                       <p className="font-medium text-gray-900">{session.place.name}</p>
//                       <p className="text-sm text-gray-600">{session.place.address}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <Button onClick={handleGetDirections} className="bg-blue-600 hover:bg-blue-700 text-white">
//                     <Navigation className="w-4 h-4 mr-2" />
//                     Get Directions
//                   </Button>
//                   <Link href={`/places/${session.place.id}`}>
//                     <Button
//                       variant="outline"
//                       className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
//                     >
//                       <MapIcon className="w-4 h-4 mr-2" />
//                       View Place Details
//                     </Button>
//                   </Link>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Participants */}
//             <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="w-5 h-5" />
//                   Participants ({getAcceptedParticipants().length}/{session.max_participants || "∞"})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   {session.participants.map((participant) => {
//                     const StatusIcon = participantStatusIcons[participant.status]
//                     return (
//                       <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                         <div className="flex items-center gap-3">
//                           <Avatar>
//                             <AvatarImage src={participant.user.avatar_url || "/placeholder.svg"} />
//                             <AvatarFallback>{participant.user.name.charAt(0)}</AvatarFallback>
//                           </Avatar>
//                           <div>
//                             <p className="font-medium text-gray-900">{participant.user.name}</p>
//                             <p className="text-sm text-gray-600">
//                               Joined {new Date(participant.joined_at).toLocaleDateString()}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <StatusIcon className="w-4 h-4" />
//                           <Badge className={participantStatusColors[participant.status]}>{participant.status}</Badge>
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Join Session */}
//             {!isCreator && (
//               <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
//                 <CardHeader>
//                   <CardTitle>Join This Session</CardTitle>
//                   <CardDescription>Let the organizer know if you're coming</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-3">
//                   <Button
//                     onClick={() => handleJoinSession("accepted")}
//                     disabled={loading}
//                     className="w-full bg-green-600 hover:bg-green-700 text-white"
//                   >
//                     <UserCheck className="w-4 h-4 mr-2" />
//                     I'm Going
//                   </Button>
//                   <Button
//                     onClick={() => handleJoinSession("maybe")}
//                     disabled={loading}
//                     variant="outline"
//                     className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
//                   >
//                     <Clock className="w-4 h-4 mr-2" />
//                     Maybe
//                   </Button>
//                   <Button
//                     onClick={() => handleJoinSession("declined")}
//                     disabled={loading}
//                     variant="outline"
//                     className="w-full border-red-300 text-red-700 hover:bg-red-50"
//                   >
//                     <UserX className="w-4 h-4 mr-2" />
//                     Can't Make It
//                   </Button>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Session Stats */}
//             <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
//               <CardHeader>
//                 <CardTitle>Session Info</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Status</span>
//                   <Badge className={statusColors[session.status]}>{session.status}</Badge>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Confirmed</span>
//                   <span className="font-medium">{getAcceptedParticipants().length} people</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Max Capacity</span>
//                   <span className="font-medium">{session.max_participants || "Unlimited"}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Location Sharing</span>
//                   <Badge variant={session.is_location_sharing_enabled ? "default" : "secondary"}>
//                     {session.is_location_sharing_enabled ? "Enabled" : "Disabled"}
//                   </Badge>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Live Location (if session is active) */}
//             {session.status === "active" && session.is_location_sharing_enabled && (
//               <Card className="bg-white/80 backdrop-blur-sm border-green-200">
//                 <CardHeader>
//                   <CardTitle className="text-green-700">Live Location</CardTitle>
//                   <CardDescription>Session is active - location sharing enabled</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4">
//                     <div className="text-center text-gray-500">
//                       <MapIcon className="w-8 h-8 mx-auto mb-2" />
//                       <p className="text-sm">Live map coming soon</p>
//                     </div>
//                   </div>
//                   <Link href={`/sessions/${session.id}/live`}>
//                     <Button className="w-full bg-green-600 hover:bg-green-700 text-white mb-3">
//                       <MapPin className="w-4 h-4 mr-2" />
//                       Join Live Session
//                     </Button>
//                   </Link>
//                   <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
//                     <MapPin className="w-4 h-4 mr-2" />
//                     Share My Location
//                   </Button>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
