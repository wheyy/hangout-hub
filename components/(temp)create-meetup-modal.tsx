// To be deleted --- Kept for legacy purpose and cross ref



// "use client"

// import type React from "react"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Users, X, MapPin, Calendar, Clock } from "lucide-react"
// import { useState } from "react"

// interface CreateMeetupModalProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export function CreateMeetupModal({ isOpen, onClose }: CreateMeetupModalProps) {
//   const [formData, setFormData] = useState({
//     title: "",
//     destination: "",
//     date: "",
//     time: "",
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Handle meetup creation
//     console.log("Creating meetup:", formData)
//     onClose()
//   }

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md p-0 gap-0">
//         <DialogHeader className="p-6 pb-4">
//           <DialogTitle className="flex items-center gap-2 text-lg">
//             <Users className="w-5 h-5" />
//             Create Meet-Up
//           </DialogTitle>
//           <button
//             onClick={onClose}
//             className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="px-6 pb-6">
//           <div className="space-y-4">
//             {/* Meet-up Title */}
//             <div className="space-y-2">
//               <Label htmlFor="title" className="text-sm font-medium text-gray-700">
//                 Meet-up Title
//               </Label>
//               <Input
//                 id="title"
//                 placeholder="e.g. Coffee at Marina Bay"
//                 value={formData.title}
//                 onChange={(e) => handleInputChange("title", e.target.value)}
//                 className="h-10"
//               />
//             </div>

//             {/* Destination */}
//             <div className="space-y-2">
//               <Label htmlFor="destination" className="text-sm font-medium text-gray-700">
//                 Destination
//               </Label>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <Input
//                   id="destination"
//                   placeholder="Where are you meeting?"
//                   value={formData.destination}
//                   onChange={(e) => handleInputChange("destination", e.target.value)}
//                   className="h-10 pl-10"
//                 />
//               </div>
//             </div>

//             {/* Date and Time */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="date" className="text-sm font-medium text-gray-700">
//                   Date
//                 </Label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <Input
//                     id="date"
//                     type="date"
//                     value={formData.date}
//                     onChange={(e) => handleInputChange("date", e.target.value)}
//                     className="h-10 pl-10"
//                     defaultValue="2025-06-09"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="time" className="text-sm font-medium text-gray-700">
//                   Time
//                 </Label>
//                 <div className="relative">
//                   <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <Input
//                     id="time"
//                     type="time"
//                     value={formData.time}
//                     onChange={(e) => handleInputChange("time", e.target.value)}
//                     className="h-10 pl-10"
//                     defaultValue="08:21"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-3 mt-6">
//             <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
//               Cancel
//             </Button>
//             <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
//               Create Meet-Up
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }
