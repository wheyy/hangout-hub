// I think this file is not needed but I will keep it for now

// "use client"

// import dynamic from "next/dynamic"
// import { SearchBar } from "@/components/map/search-bar"
// import { ExploreDrawer } from "@/components/map/explore-drawer"
// import { ParkingDrawer } from "@/components/map/parking-drawer"
// import { BottomSheet } from "@/components/map/bottom-sheet"
// import { CreateMeetupFAB } from "@/components/map/create-meetup-fab"
// import { useIsMobile } from "@/hooks/use-mobile"

// const MapHost = dynamic(() => import("@/components/MapHost"), { 
//   ssr: false 
// }) as React.FC<{ options: { center: [number, number]; zoom: number } }>

// export default function HomePage() {
//   const isMobile = useIsMobile()

//   const mapOptions = {
//     center: [103.8198, 1.3521] as [number, number], // Singapore center
//     zoom: 11,
//   }

//   return (
//     <div className="h-screen w-full overflow-hidden">
//       <div className="relative w-full h-full">
//         <MapHost options={mapOptions} />

//         {/* Search Bar - Always visible at top */}
//         <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
//           <SearchBar />
//         </div>

//         {/* Desktop Layout */}
//         {!isMobile && (
//           <>
//             <div className="absolute top-20 left-4 z-10">
//               <ExploreDrawer />
//             </div>
//             <div className="absolute top-20 right-4 z-10">
//               <ParkingDrawer />
//             </div>
//           </>
//         )}

//         {/* Mobile Layout */}
//         {isMobile && (
//           <div className="absolute bottom-0 left-0 right-0 z-10">
//             <BottomSheet />
//           </div>
//         )}

//         {/* Create Meetup FAB */}
//         <div className="absolute bottom-6 right-6 z-10">
//           <CreateMeetupFAB />
//         </div>
//       </div>
//     </div>
//   )
// }
