// "use client"

// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { MapPin, Users, Calendar, Clock, Settings, ArrowLeft } from "lucide-react"
// import Link from "next/link"
// import { useState } from "react"
// import { GroupManagement } from "@/components/group-management"
// import { LiveMapView } from "@/components/live-map-view"

// interface MeetupPageProps {
//   params: { id: string }
// }

// export default function MeetupPage({ params }: MeetupPageProps) {
//   const [activeTab, setActiveTab] = useState<"map" | "tracking">("map")
//   const [isLocationSharing, setIsLocationSharing] = useState(false)

//   // Mock meetup data
//   const meetup = {
//     id: params.id,
//     title: "Coffee at Marina Bay",
//     destination: "Marina Bay Sands SkyPark",
//     date: "2025-06-09",
//     time: "08:21",
//     status: "active",
//     memberCount: 3,
//     creator: "Alex Chen",
//   }

//   return (
//     <div className="h-screen flex flex-col bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b px-4 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Link href="/meetups">
//               <Button variant="ghost" size="sm" className="p-2">
//                 <ArrowLeft className="w-4 h-4" />
//               </Button>
//             </Link>
//             <div>
//               <h1 className="text-lg font-semibold text-gray-900">{meetup.title}</h1>
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <MapPin className="w-3 h-3" />
//                 <span>{meetup.destination}</span>
//                 <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
//               </div>
//             </div>
//           </div>
//           <Button variant="ghost" size="sm">
//             <Settings className="w-4 h-4" />
//           </Button>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex gap-1 mt-3">
//           <Button
//             variant={activeTab === "map" ? "default" : "ghost"}
//             size="sm"
//             onClick={() => setActiveTab("map")}
//             className={activeTab === "map" ? "bg-blue-600 text-white" : ""}
//           >
//             <MapPin className="w-4 h-4 mr-1" />
//             Live Map
//           </Button>
//           <Button
//             variant={activeTab === "tracking" ? "default" : "ghost"}
//             size="sm"
//             onClick={() => setActiveTab("tracking")}
//             className={activeTab === "tracking" ? "bg-blue-600 text-white" : ""}
//           >
//             <Users className="w-4 h-4 mr-1" />
//             Group Management
//           </Button>
//         </div>
//       </header>

//       {/* Content */}
//       <div className="flex-1 overflow-hidden">
//         {activeTab === "map" ? (
//           <LiveMapView
//             meetupId={meetup.id}
//             destination={{
//               lat: 1.2986,
//               lng: 103.8567,
//               name: meetup.destination,
//             }}
//           />
//         ) : (
//           <div className="h-full overflow-y-auto p-4">
//             <GroupManagement
//               meetupId={meetup.id}
//               isActive={meetup.status === "active"}
//               onLocationShare={setIsLocationSharing}
//             />
//           </div>
//         )}
//       </div>

//       {/* Meetup Info Panel */}
//       <div className="bg-white border-t p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4 text-sm text-gray-600">
//             <div className="flex items-center gap-1">
//               <Calendar className="w-4 h-4" />
//               <span>{meetup.date}</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <Clock className="w-4 h-4" />
//               <span>{meetup.time}</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <Users className="w-4 h-4" />
//               <span>{meetup.memberCount} members</span>
//             </div>
//           </div>
//           <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
//             End Meetup
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Users, Calendar, Clock, Settings, ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { GroupManagement } from "@/components/group-management"
import { LiveMapView } from "@/components/live-map-view"

interface MeetupPageProps {
  params: { id: string }
}

export default function MeetupPage({ params }: MeetupPageProps) {
  const [activeTab, setActiveTab] = useState<"map" | "tracking">("map")
  const [isLocationSharing, setIsLocationSharing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: "",
    destination: "",
    date: "",
    time: "",
  })

  // Mock meetup data
  const [meetup, setMeetup] = useState({
    id: params.id,
    title: "Coffee at Marina Bay",
    destination: "Marina Bay Sands SkyPark",
    date: "2025-06-09",
    time: "08:21",
    status: "active",
    memberCount: 3,
    creator: "Alex Chen",
  })

  const handleSettingsClick = () => {
    setEditData({
      title: meetup.title,
      destination: meetup.destination,
      date: meetup.date,
      time: meetup.time,
    })
    setIsEditing(true)
  }

  const handleSaveChanges = () => {
    setMeetup((prev) => ({
      ...prev,
      title: editData.title,
      destination: editData.destination,
      date: editData.date,
      time: editData.time,
    }))
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditData({
      title: "",
      destination: "",
      date: "",
      time: "",
    })
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/meetups">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{meetup.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-3 h-3" />
                <span>{meetup.destination}</span>
                <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
              </div>
            </div>
          </div>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={handleSettingsClick}>
              <Settings className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSaveChanges} className="bg-blue-600 text-white hover:bg-blue-700">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Edit Meetup Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Meetup Name</label>
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter meetup name"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
                <Input
                  value={editData.destination}
                  onChange={(e) => setEditData((prev) => ({ ...prev, destination: e.target.value }))}
                  placeholder="Enter destination"
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData((prev) => ({ ...prev, date: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <Input
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData((prev) => ({ ...prev, time: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3">
          <Button
            variant={activeTab === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("map")}
            className={activeTab === "map" ? "bg-blue-600 text-white" : ""}
          >
            <MapPin className="w-4 h-4 mr-1" />
            Live Map
          </Button>
          <Button
            variant={activeTab === "tracking" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tracking")}
            className={activeTab === "tracking" ? "bg-blue-600 text-white" : ""}
          >
            <Users className="w-4 h-4 mr-1" />
            Group Management
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "map" ? (
          <LiveMapView
            meetupId={meetup.id}
            destination={{
              lat: 1.2986,
              lng: 103.8567,
              name: meetup.destination,
            }}
          />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <GroupManagement
              meetupId={meetup.id}
              isActive={meetup.status === "active"}
              onLocationShare={setIsLocationSharing}
            />
          </div>
        )}
      </div>

      {/* Meetup Info Panel */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{meetup.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{meetup.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{meetup.memberCount} members</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
            End Meetup
          </Button>
        </div>
      </div>
    </div>
  )
}
