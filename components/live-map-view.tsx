// "use client"

// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { MapPin, Users, Navigation, Crosshair, Layers, Plus, Minus } from "lucide-react"
// import { useState } from "react"

// interface MapMember {
//   id: string
//   name: string
//   location: { lat: number; lng: number }
//   status: "online" | "arrived"
//   color: string
// }

// interface LiveMapViewProps {
//   meetupId: string
//   destination?: { lat: number; lng: number; name: string }
// }

// export function LiveMapView({ meetupId, destination }: LiveMapViewProps) {
//   const [mapCenter] = useState({ lat: 1.2966, lng: 103.8547 })
//   const [zoomLevel, setZoomLevel] = useState(15)

//   // Mock member locations
//   const members: MapMember[] = [
//     {
//       id: "1",
//       name: "Alex Chen",
//       location: { lat: 1.2966, lng: 103.8547 },
//       status: "online",
//       color: "bg-blue-500",
//     },
//     {
//       id: "2",
//       name: "Sarah Kim",
//       location: { lat: 1.2976, lng: 103.8557 },
//       status: "online",
//       color: "bg-green-500",
//     },
//     {
//       id: "3",
//       name: "Mike Johnson",
//       location: { lat: 1.2956, lng: 103.8537 },
//       status: "arrived",
//       color: "bg-purple-500",
//     },
//   ]

//   const destinationLocation = destination || {
//     lat: 1.2986,
//     lng: 103.8567,
//     name: "Marina Bay Sands",
//   }

//   return (
//     <div className="h-full flex flex-col">
//       {/* Map Header */}
//       <div className="p-4 bg-white border-b">
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="text-lg font-semibold text-gray-900">Live Group Map</h2>
//           <Badge className="bg-green-100 text-green-800">
//             {members.filter((m) => m.status === "online").length} members active
//           </Badge>
//         </div>
//         <div className="text-sm text-gray-600">Destination: {destinationLocation.name}</div>
//       </div>

//       {/* Map Area */}
//       <div className="flex-1 relative bg-gradient-to-br from-blue-200 to-blue-300 overflow-hidden">
//         {/* Map Controls */}
//         <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
//           <Button
//             size="sm"
//             variant="secondary"
//             className="w-10 h-10 p-0 bg-white shadow-md"
//             onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 20))}
//           >
//             <Plus className="w-4 h-4" />
//           </Button>
//           <Button
//             size="sm"
//             variant="secondary"
//             className="w-10 h-10 p-0 bg-white shadow-md"
//             onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 1))}
//           >
//             <Minus className="w-4 h-4" />
//           </Button>
//           <Button size="sm" variant="secondary" className="w-10 h-10 p-0 bg-white shadow-md">
//             <Crosshair className="w-4 h-4" />
//           </Button>
//           <Button size="sm" variant="secondary" className="w-10 h-10 p-0 bg-white shadow-md">
//             <Layers className="w-4 h-4" />
//           </Button>
//         </div>

//         {/* Destination Marker */}
//         <div
//           className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
//           style={{
//             left: "60%",
//             top: "30%",
//           }}
//         >
//           <div className="relative">
//             <div className="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
//               <MapPin className="w-4 h-4 text-white" />
//             </div>
//             <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
//               {destinationLocation.name}
//             </div>
//           </div>
//         </div>

//         {/* Member Markers */}
//         {members.map((member, index) => (
//           <div
//             key={member.id}
//             className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
//             style={{
//               left: `${40 + index * 15}%`,
//               top: `${50 + index * 10}%`,
//             }}
//           >
//             <div className="relative">
//               <div
//                 className={`w-6 h-6 ${member.color} rounded-full border-2 border-white shadow-lg flex items-center justify-center`}
//               >
//                 <span className="text-white text-xs font-bold">
//                   {member.name
//                     .split(" ")
//                     .map((n) => n[0])
//                     .join("")}
//                 </span>
//               </div>

//               {/* Pulse animation for active members */}
//               {member.status === "online" && (
//                 <div className={`absolute inset-0 ${member.color} rounded-full animate-ping opacity-75`}></div>
//               )}

//               <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-1 py-0.5 rounded shadow text-xs font-medium whitespace-nowrap">
//                 {member.name.split(" ")[0]}
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Route Lines (simplified) */}
//         <svg className="absolute inset-0 w-full h-full pointer-events-none">
//           {members.map((member, index) => (
//             <line
//               key={`route-${member.id}`}
//               x1={`${40 + index * 15}%`}
//               y1={`${50 + index * 10}%`}
//               x2="60%"
//               y2="30%"
//               stroke="#3B82F6"
//               strokeWidth="2"
//               strokeDasharray="5,5"
//               opacity="0.6"
//             />
//           ))}
//         </svg>
//       </div>

//       {/* Bottom Panel */}
//       <div className="p-4 bg-white border-t">
//         <div className="grid grid-cols-2 gap-3">
//           <Button variant="outline" className="flex items-center justify-center gap-2 bg-transparent">
//             <Navigation className="w-4 h-4" />
//             Get Directions
//           </Button>
//           <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
//             <Users className="w-4 h-4" />
//             Center on Group
//           </Button>
//         </div>

//         <div className="mt-3 text-xs text-gray-500 text-center">
//           Locations update every 5 seconds • Tap markers for member details
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Navigation, Crosshair, Layers, Plus, Minus } from "lucide-react"
import { useState } from "react"

interface MapMember {
  id: string
  name: string
  location: { lat: number; lng: number }
  status: "online" | "arrived"
  color: string
}

interface LiveMapViewProps {
  meetupId: string
  destination?: { lat: number; lng: number; name: string }
}

export function LiveMapView({ meetupId, destination }: LiveMapViewProps) {
  const [mapCenter] = useState({ lat: 1.2966, lng: 103.8547 })
  const [zoomLevel, setZoomLevel] = useState(15)

  // Mock member locations
  const members: MapMember[] = [
    {
      id: "1",
      name: "Alex Chen",
      location: { lat: 1.2966, lng: 103.8547 },
      status: "online",
      color: "bg-blue-500",
    },
    {
      id: "2",
      name: "Sarah Kim",
      location: { lat: 1.2976, lng: 103.8557 },
      status: "online",
      color: "bg-green-500",
    },
    {
      id: "3",
      name: "Mike Johnson",
      location: { lat: 1.2956, lng: 103.8537 },
      status: "arrived",
      color: "bg-purple-500",
    },
  ]

  const destinationLocation = destination || {
    lat: 1.2986,
    lng: 103.8567,
    name: "Marina Bay Sands",
  }

  return (
    <div className="h-full flex flex-col">
      {/* Map Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Live Group Map</h2>
          <Badge className="bg-green-100 text-green-800">
            {members.filter((m) => m.status === "online").length} members active
          </Badge>
        </div>
        <div className="text-sm text-gray-600">Destination: {destinationLocation.name}</div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-200 to-blue-300 overflow-hidden">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-white shadow-md"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 20))}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-white shadow-md"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0 bg-white shadow-md">
            <Crosshair className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0 bg-white shadow-md">
            <Layers className="w-4 h-4" />
          </Button>
        </div>

        {/* Destination Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: "60%",
            top: "30%",
          }}
        >
          <div className="relative">
            <div className="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
              {destinationLocation.name}
            </div>
          </div>
        </div>

        {/* Member Markers */}
        {members.map((member, index) => (
          <div
            key={member.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${40 + index * 15}%`,
              top: `${50 + index * 10}%`,
            }}
          >
            <div className="relative">
              <div
                className={`w-6 h-6 ${member.color} rounded-full border-2 border-white shadow-lg flex items-center justify-center`}
              >
                <span className="text-white text-xs font-bold">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>

              {/* Pulse animation for active members */}
              {member.status === "online" && (
                <div className={`absolute inset-0 ${member.color} rounded-full animate-ping opacity-75`}></div>
              )}

              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-1 py-0.5 rounded shadow text-xs font-medium whitespace-nowrap">
                {member.name.split(" ")[0]}
              </div>
            </div>
          </div>
        ))}

        {/* Route Lines (simplified) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {members.map((member, index) => (
            <line
              key={`route-${member.id}`}
              x1={`${40 + index * 15}%`}
              y1={`${50 + index * 10}%`}
              x2="60%"
              y2="30%"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          ))}
        </svg>
      </div>

      {/* Bottom Panel */}
      <div className="p-4 bg-white border-t">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center justify-center gap-2 bg-transparent">
            <Navigation className="w-4 h-4" />
            Get Directions
          </Button>
          <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Users className="w-4 h-4" />
            Center on Group
          </Button>
        </div>

        <div className="mt-3 text-xs text-gray-500 text-center">
          Locations update every 5 seconds • Tap markers for member details
        </div>
      </div>
    </div>
  )
}
