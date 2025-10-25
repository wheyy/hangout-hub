// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { MapPin, Calendar, Users, Plus, Settings, Eye } from "lucide-react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { AuthGuard } from "@/components/auth-guard"

// // Mock session data
// const mockSessions = [
//   {
//     id: "1",
//     title: "Weekend Brunch at Marina Bay",
//     description: "Let's enjoy the amazing city views while having brunch!",
//     place: {
//       id: "1",
//       name: "Marina Bay Sands SkyPark",
//       address: "10 Bayfront Ave, Singapore 018956",
//     },
//     creator_id: "user1",
//     scheduled_time: "2024-12-15T11:00:00Z",
//     status: "planned" as const,
//     max_participants: 6,
//     is_location_sharing_enabled: true,
//     participants: [
//       { id: "1", user: { name: "John Doe" }, status: "accepted" as const },
//       { id: "2", user: { name: "Jane Smith" }, status: "accepted" as const },
//       { id: "3", user: { name: "Mike Johnson" }, status: "maybe" as const },
//     ],
//     created_at: "2024-12-01T10:00:00Z",
//   },
//   {
//     id: "2",
//     title: "Evening Cycling at East Coast",
//     description: "Sunset cycling session followed by dinner at the hawker center",
//     place: {
//       id: "3",
//       name: "East Coast Park",
//       address: "E Coast Park Service Rd, Singapore",
//     },
//     creator_id: "user1",
//     scheduled_time: "2024-12-20T17:30:00Z",
//     status: "planned" as const,
//     max_participants: 8,
//     is_location_sharing_enabled: true,
//     participants: [
//       { id: "4", user: { name: "Sarah Wilson" }, status: "accepted" as const },
//       { id: "5", user: { name: "Tom Brown" }, status: "invited" as const },
//     ],
//     created_at: "2024-12-02T14:30:00Z",
//   },
//   {
//     id: "3",
//     title: "Food Tour at Maxwell Centre",
//     description: "Exploring the best local dishes together",
//     place: {
//       id: "4",
//       name: "Maxwell Food Centre",
//       address: "1 Kadayanallur St, Singapore 069184",
//     },
//     creator_id: "user2",
//     scheduled_time: "2024-12-10T12:00:00Z",
//     status: "completed" as const,
//     max_participants: 4,
//     is_location_sharing_enabled: false,
//     participants: [
//       { id: "6", user: { name: "You" }, status: "accepted" as const },
//       { id: "7", user: { name: "Alex Chen" }, status: "accepted" as const },
//       { id: "8", user: { name: "Lisa Wang" }, status: "accepted" as const },
//     ],
//     created_at: "2024-11-25T09:00:00Z",
//   },
// ]

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

// export default function SessionsPage() {
//   const [sessions, setSessions] = useState(mockSessions)
//   const [loading, setLoading] = useState(false)
//   const router = useRouter()

//   const currentUserId = "user1" // Mock current user ID

//   const mySessions = sessions.filter((session) => session.creator_id === currentUserId)
//   const joinedSessions = sessions.filter(
//     (session) => session.creator_id !== currentUserId && session.participants.some((p) => p.user.name === "You"),
//   )

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString("en-SG", {
//       weekday: "short",
//       year: "numeric",
//       month: "short",
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

//   const getAcceptedParticipants = (participants: any[]) => {
//     return participants.filter((p) => p.status === "accepted").length
//   }

//   return (
//     <AuthGuard>
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <Link href="/" className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                 <MapPin className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-xl font-bold text-gray-900">Hangout Hub</span>
//             </Link>
//             <div className="flex items-center gap-4">
//               <Link href="/search">
//                 <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
//                   Discover Places
//                 </Button>
//               </Link>
//               <Link href="/profile">
//                 <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
//                   Profile
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Page Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
//             <p className="text-gray-600">Manage your meetups and discover new hangout opportunities</p>
//           </div>
//           <Link href="/sessions/create">
//             <Button className="bg-blue-600 hover:bg-blue-700 text-white">
//               <Plus className="w-4 h-4 mr-2" />
//               Create Session
//             </Button>
//           </Link>
//         </div>

//         {/* Sessions Tabs */}
//         <Tabs defaultValue="created" className="space-y-6">
//           <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-blue-200">
//             <TabsTrigger value="created" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
//               Created by Me ({mySessions.length})
//             </TabsTrigger>
//             <TabsTrigger value="joined" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
//               Joined Sessions ({joinedSessions.length})
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="created" className="space-y-4">
//             {mySessions.length === 0 ? (
//               <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
//                 <CardContent className="text-center py-12">
//                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <Calendar className="w-8 h-8 text-blue-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions created yet</h3>
//                   <p className="text-gray-600 mb-4">Start by creating your first meetup session</p>
//                   <Link href="/sessions/create">
//                     <Button className="bg-blue-600 hover:bg-blue-700 text-white">
//                       <Plus className="w-4 h-4 mr-2" />
//                       Create Your First Session
//                     </Button>
//                   </Link>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="grid gap-4">
//                 {mySessions.map((session) => (
//                   <Card
//                     key={session.id}
//                     className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-shadow"
//                   >
//                     <CardHeader>
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-2">
//                             <Badge className={statusColors[session.status]}>{session.status}</Badge>
//                             {session.is_location_sharing_enabled && (
//                               <Badge variant="outline" className="border-green-300 text-green-700">
//                                 Live Location
//                               </Badge>
//                             )}
//                           </div>
//                           <CardTitle className="text-xl mb-1">{session.title}</CardTitle>
//                           <CardDescription className="text-gray-600">{session.description}</CardDescription>
//                         </div>
//                         <div className="flex items-center gap-2 ml-4">
//                           <Link href={`/sessions/${session.id}`}>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
//                             >
//                               <Eye className="w-4 h-4 mr-1" />
//                               View
//                             </Button>
//                           </Link>
//                           <Link href={`/sessions/${session.id}/manage`}>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
//                             >
//                               <Settings className="w-4 h-4 mr-1" />
//                               Manage
//                             </Button>
//                           </Link>
//                         </div>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <MapPin className="w-4 h-4" />
//                           <div>
//                             <p className="font-medium text-gray-900">{session.place.name}</p>
//                             <p className="text-xs">{session.place.address}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <Calendar className="w-4 h-4" />
//                           <div>
//                             <p className="font-medium text-gray-900">{formatDate(session.scheduled_time)}</p>
//                             <p className="text-xs">{formatTime(session.scheduled_time)}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <Users className="w-4 h-4" />
//                           <div>
//                             <p className="font-medium text-gray-900">
//                               {getAcceptedParticipants(session.participants)} / {session.max_participants || "∞"}{" "}
//                               participants
//                             </p>
//                             <div className="flex gap-1 mt-1">
//                               {session.participants.slice(0, 3).map((participant, index) => (
//                                 <Badge key={index} className={`text-xs ${participantStatusColors[participant.status]}`}>
//                                   {participant.user.name}
//                                 </Badge>
//                               ))}
//                               {session.participants.length > 3 && (
//                                 <Badge variant="outline" className="text-xs">
//                                   +{session.participants.length - 3} more
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </TabsContent>

//           <TabsContent value="joined" className="space-y-4">
//             {joinedSessions.length === 0 ? (
//               <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
//                 <CardContent className="text-center py-12">
//                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <Users className="w-8 h-8 text-green-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">No joined sessions yet</h3>
//                   <p className="text-gray-600 mb-4">Discover places and join sessions created by others</p>
//                   <Link href="/search">
//                     <Button className="bg-blue-600 hover:bg-blue-700 text-white">
//                       <MapPin className="w-4 h-4 mr-2" />
//                       Discover Places
//                     </Button>
//                   </Link>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="grid gap-4">
//                 {joinedSessions.map((session) => (
//                   <Card
//                     key={session.id}
//                     className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-shadow"
//                   >
//                     <CardHeader>
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-2">
//                             <Badge className={statusColors[session.status]}>{session.status}</Badge>
//                             {session.is_location_sharing_enabled && (
//                               <Badge variant="outline" className="border-green-300 text-green-700">
//                                 Live Location
//                               </Badge>
//                             )}
//                           </div>
//                           <CardTitle className="text-xl mb-1">{session.title}</CardTitle>
//                           <CardDescription className="text-gray-600">{session.description}</CardDescription>
//                         </div>
//                         <Link href={`/sessions/${session.id}`}>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
//                           >
//                             <Eye className="w-4 h-4 mr-1" />
//                             View Details
//                           </Button>
//                         </Link>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <MapPin className="w-4 h-4" />
//                           <div>
//                             <p className="font-medium text-gray-900">{session.place.name}</p>
//                             <p className="text-xs">{session.place.address}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <Calendar className="w-4 h-4" />
//                           <div>
//                             <p className="font-medium text-gray-900">{formatDate(session.scheduled_time)}</p>
//                             <p className="text-xs">{formatTime(session.scheduled_time)}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <Users className="w-4 h-4" />
//                           <div>
//                             <p className="font-medium text-gray-900">
//                               {getAcceptedParticipants(session.participants)} / {session.max_participants || "∞"}{" "}
//                               participants
//                             </p>
//                             <div className="flex gap-1 mt-1">
//                               {session.participants.slice(0, 3).map((participant, index) => (
//                                 <Badge key={index} className={`text-xs ${participantStatusColors[participant.status]}`}>
//                                   {participant.user.name}
//                                 </Badge>
//                               ))}
//                               {session.participants.length > 3 && (
//                                 <Badge variant="outline" className="text-xs">
//                                   +{session.participants.length - 3} more
//                                 </Badge>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//     </AuthGuard>
//   )
// }
