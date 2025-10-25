// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { MapPin, ArrowLeft, Search, Info } from "lucide-react"
// import Link from "next/link"
// import { useRouter, useSearchParams } from "next/navigation"

// // Mock places for selection
// const mockPlaces = [
//   {
//     id: "1",
//     name: "Marina Bay Sands SkyPark",
//     address: "10 Bayfront Ave, Singapore 018956",
//     category: "entertainment",
//   },
//   {
//     id: "2",
//     name: "Gardens by the Bay",
//     address: "18 Marina Gardens Dr, Singapore 018953",
//     category: "park",
//   },
//   {
//     id: "3",
//     name: "East Coast Park",
//     address: "E Coast Park Service Rd, Singapore",
//     category: "park",
//   },
//   {
//     id: "4",
//     name: "Maxwell Food Centre",
//     address: "1 Kadayanallur St, Singapore 069184",
//     category: "restaurant",
//   },
// ]

// export default function CreateSessionPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const preselectedPlaceId = searchParams.get("placeId")

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     place_id: preselectedPlaceId || "",
//     scheduled_date: "",
//     scheduled_time: "",
//     max_participants: "",
//     is_location_sharing_enabled: true,
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [searchQuery, setSearchQuery] = useState("")

//   const filteredPlaces = mockPlaces.filter(
//     (place) =>
//       place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       place.address.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

//   const selectedPlace = mockPlaces.find((place) => place.id === formData.place_id)

//   const updateFormData = (field: string, value: string | boolean) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setError("")

//     // Validation
//     if (!formData.title.trim()) {
//       setError("Please enter a session title")
//       setLoading(false)
//       return
//     }

//     if (!formData.place_id) {
//       setError("Please select a place for your session")
//       setLoading(false)
//       return
//     }

//     if (!formData.scheduled_date || !formData.scheduled_time) {
//       setError("Please select a date and time for your session")
//       setLoading(false)
//       return
//     }

//     // Check if the scheduled time is in the future
//     const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`)
//     if (scheduledDateTime <= new Date()) {
//       setError("Please select a future date and time")
//       setLoading(false)
//       return
//     }

//     try {
//       console.log("[v0] Creating session:", formData)

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1500))

//       // Redirect to sessions page
//       router.push("/sessions")
//     } catch (err) {
//       setError("Failed to create session. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Set minimum date to today
//   const today = new Date().toISOString().split("T")[0]

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
//           </div>
//         </div>
//       </header>

//       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Page Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Session</h1>
//           <p className="text-gray-600">Plan your next hangout and invite friends to join</p>
//         </div>

//         {/* Create Session Form */}
//         <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
//           <CardHeader>
//             <CardTitle>Session Details</CardTitle>
//             <CardDescription>Fill in the details for your meetup session</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {error && (
//                 <Alert className="border-red-200 bg-red-50">
//                   <AlertDescription className="text-red-700">{error}</AlertDescription>
//                 </Alert>
//               )}

//               {/* Session Title */}
//               <div className="space-y-2">
//                 <Label htmlFor="title">Session Title *</Label>
//                 <Input
//                   id="title"
//                   placeholder="e.g., Weekend Brunch at Marina Bay"
//                   value={formData.title}
//                   onChange={(e) => updateFormData("title", e.target.value)}
//                   className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Description */}
//               <div className="space-y-2">
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   placeholder="Tell people what to expect from this hangout..."
//                   value={formData.description}
//                   onChange={(e) => updateFormData("description", e.target.value)}
//                   className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
//                 />
//               </div>

//               {/* Place Selection */}
//               <div className="space-y-2">
//                 <Label htmlFor="place">Location *</Label>
//                 {selectedPlace ? (
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <div className="flex items-start justify-between">
//                       <div className="flex items-start gap-3">
//                         <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
//                           <MapPin className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="font-medium text-gray-900">{selectedPlace.name}</h3>
//                           <p className="text-sm text-gray-600">{selectedPlace.address}</p>
//                         </div>
//                       </div>
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => updateFormData("place_id", "")}
//                         className="border-blue-300 text-blue-700 hover:bg-blue-50"
//                       >
//                         Change
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                       <Input
//                         placeholder="Search for a place..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2 bg-white">
//                       {filteredPlaces.map((place) => (
//                         <button
//                           key={place.id}
//                           type="button"
//                           onClick={() => updateFormData("place_id", place.id)}
//                           className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
//                               <MapPin className="w-4 h-4 text-gray-600" />
//                             </div>
//                             <div>
//                               <p className="font-medium text-gray-900">{place.name}</p>
//                               <p className="text-sm text-gray-600">{place.address}</p>
//                             </div>
//                           </div>
//                         </button>
//                       ))}
//                       {filteredPlaces.length === 0 && <p className="text-center text-gray-500 py-4">No places found</p>}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Date and Time */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="date">Date *</Label>
//                   <Input
//                     id="date"
//                     type="date"
//                     min={today}
//                     value={formData.scheduled_date}
//                     onChange={(e) => updateFormData("scheduled_date", e.target.value)}
//                     className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="time">Time *</Label>
//                   <Input
//                     id="time"
//                     type="time"
//                     value={formData.scheduled_time}
//                     onChange={(e) => updateFormData("scheduled_time", e.target.value)}
//                     className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               {/* Max Participants */}
//               <div className="space-y-2">
//                 <Label htmlFor="maxParticipants">Maximum Participants</Label>
//                 <Input
//                   id="maxParticipants"
//                   type="number"
//                   min="2"
//                   max="50"
//                   placeholder="Leave empty for unlimited"
//                   value={formData.max_participants}
//                   onChange={(e) => updateFormData("max_participants", e.target.value)}
//                   className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                 />
//                 <p className="text-sm text-gray-500">Optional: Set a limit on how many people can join</p>
//               </div>

//               {/* Location Sharing */}
//               <div className="space-y-3">
//                 <div className="flex items-start space-x-3">
//                   <Checkbox
//                     id="locationSharing"
//                     checked={formData.is_location_sharing_enabled}
//                     onCheckedChange={(checked) => updateFormData("is_location_sharing_enabled", checked as boolean)}
//                     className="mt-1"
//                   />
//                   <div className="space-y-1">
//                     <Label htmlFor="locationSharing" className="text-sm font-medium">
//                       Enable live location sharing
//                     </Label>
//                     <p className="text-sm text-gray-500">
//                       Participants can share their real-time location during the session for easier coordination
//                     </p>
//                   </div>
//                 </div>
//                 {formData.is_location_sharing_enabled && (
//                   <Alert className="border-blue-200 bg-blue-50">
//                     <Info className="w-4 h-4" />
//                     <AlertDescription className="text-blue-700">
//                       Location sharing will only be active during the session and participants can opt out at any time.
//                     </AlertDescription>
//                   </Alert>
//                 )}
//               </div>

//               {/* Submit Button */}
//               <div className="flex gap-4 pt-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => router.back()}
//                   className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
//                   {loading ? "Creating Session..." : "Create Session"}
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }
