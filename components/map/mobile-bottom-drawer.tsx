"use client"

import { useState, useRef, useEffect } from "react"
import { Filter } from "lucide-react"
import { HangoutSpot } from "@/lib/models/hangoutspot"
import { ParkingSpot } from "@/lib/models/parkingspot"
import { HangoutSpotCard, HangoutSpotCardSkeleton } from "./hangout-spot-card"
import { ParkingSpotCard } from "./parking-spot-card"

type TabType = "hangout" | "parking" | "filters"

interface MobileBottomDrawerProps {
  // Hangout props
  spots: HangoutSpot[]
  loadingSpots: boolean
  selectedSpot: HangoutSpot | null
  onSpotClick: (spot: HangoutSpot) => void
  onSpotBack: () => void
  onSpotGetDirections?: (spot: HangoutSpot) => void
  onOpenCreateMeetup?: (spot: HangoutSpot) => void

  // Parking props
  carparks: ParkingSpot[]
  selectedCarpark: ParkingSpot | null
  onCarparkSelect: (spot: ParkingSpot) => void
  onCarparkBack: () => void
  onCarparkGetDirections?: (spot: ParkingSpot) => void
}

export function MobileBottomDrawer({
  spots,
  loadingSpots,
  selectedSpot,
  onSpotClick,
  onSpotBack,
  onSpotGetDirections,
  onOpenCreateMeetup,
  carparks,
  selectedCarpark,
  onCarparkSelect,
  onCarparkBack,
  onCarparkGetDirections,
}: MobileBottomDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("hangout")
  const [drawerState, setDrawerState] = useState<"closed" | "peeking" | "full">("closed")
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [currentTranslateY, setCurrentTranslateY] = useState(0)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Hangout filter states
  const [priceRange, setPriceRange] = useState<string[]>([])
  const [rating, setRating] = useState<number[]>([])
  const [operatingHours, setOperatingHours] = useState<"open" | "closed" | null>(null)
  const [placeType, setPlaceType] = useState<string[]>([])

  // Parking filter states
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  const peekingHeightPercent = 35 // 35% of screen height when peeking
  const headerHeight = 56 // Height of the header in pixels (top-14 = 3.5rem = 56px)

  // Auto-open drawer to peeking state when there are results
  useEffect(() => {
    const hasResults = spots.length > 0 || carparks.length > 0

    if (hasResults && drawerState === "closed") {
      setDrawerState("peeking")
    }
  }, [spots.length, carparks.length, drawerState])

  // Switch to correct tab when a spot is selected
  useEffect(() => {
    if (selectedSpot !== null) {
      setActiveTab("hangout")
    }
  }, [selectedSpot])

  useEffect(() => {
    if (selectedCarpark !== null) {
      setActiveTab("parking")
    }
  }, [selectedCarpark])

  // Open drawer to full when filters tab is clicked
  useEffect(() => {
    if (activeTab === "filters") {
      setDrawerState("full")
    }
  }, [activeTab])

  // Filter hangout spots based on selected criteria
  const filteredSpots = spots.filter((spot) => {
    // Filter by price range
    if (priceRange.length > 0 && !priceRange.includes(spot.priceRange)) {
      return false
    }

    // Filter by rating (round to nearest integer for comparison)
    if (rating.length > 0 && !rating.includes(Math.round(spot.rating))) {
      return false
    }

    // Filter by operating hours
    const isOpen = spot.openingHours && spot.openingHours.toLowerCase() !== 'closed'
    if (operatingHours === "open" && !isOpen) {
      return false
    }
    if (operatingHours === "closed" && isOpen) {
      return false
    }

    // Filter by place type
    if (placeType.length > 0 && !placeType.includes(spot.category)) {
      return false
    }

    return true
  })

  // Filter carparks based on selected colors
  const filteredCarparks = carparks.filter((spot) => {
    if (selectedColors.length === 0) return true
    const color = spot.getAvailabilityColor()
    return color !== "gray" && selectedColors.includes(color)
  })

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY)
  }

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY === null) return

    const currentY = e.touches[0].clientY
    const diff = currentY - dragStartY // swipe UP = negative, swipe DOWN = positive

    // Only allow dragging if we're at the top of the scroll container
    // or if we're trying to collapse
    if (diff > 0 && drawerState === "full") {
      const scrollElement = drawerRef.current?.querySelector('.drawer-content')
      if (scrollElement && scrollElement.scrollTop > 0) {
        return // Let the content scroll instead
      }
    }

    setCurrentTranslateY(diff)
  }

  // Handle touch end
  const handleTouchEnd = () => {
    if (dragStartY === null) return

    const threshold = 50 // Pixels to trigger state change
    const largeThreshold = 150 // Larger swipe to skip a state

    if (currentTranslateY < -threshold) {
      // Swiped UP - move to next state
      if (drawerState === "closed") {
        setDrawerState("peeking")
      } else if (drawerState === "peeking") {
        setDrawerState("full")
      }
    } else if (currentTranslateY > largeThreshold) {
      // Large swipe DOWN - close completely
      setDrawerState("closed")
    } else if (currentTranslateY > threshold) {
      // Normal swipe DOWN - move to previous state
      if (drawerState === "full") {
        setDrawerState("peeking")
      } else if (drawerState === "peeking") {
        setDrawerState("closed")
      }
    }

    setDragStartY(null)
    setCurrentTranslateY(0)
  }

  // Handle tap on handle to toggle
  const handleTap = () => {
    if (drawerState === "closed") {
      setDrawerState("peeking")
    } else if (drawerState === "peeking") {
      setDrawerState("full")
    } else {
      setDrawerState("peeking")
    }
  }

  // Calculate drawer height
  const getDrawerHeight = () => {
    if (drawerState === "closed") {
      return "0px"
    } else if (drawerState === "peeking") {
      return `${peekingHeightPercent}vh`
    } else {
      // Full screen minus header
      return `calc(100vh - ${headerHeight}px)`
    }
  }

  // Calculate transform for drag
  const getTransform = () => {
    if (dragStartY !== null && currentTranslateY !== 0) {
      return `translateY(${currentTranslateY}px)` // Fixed: removed negative
    }
    return 'translateY(0)'
  }

  return (
    <div
      ref={drawerRef}
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-out max-[999px]:block hidden"
      style={{
        height: getDrawerHeight(),
        transform: getTransform(),
      }}
    >
      {/* Combined Handle and Tabs */}
      <div
        className="border-b border-gray-200"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe Handle */}
        <div className="flex items-center justify-center pt-2 pb-1 cursor-pointer" onClick={handleTap}>
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Compact Tabs */}
        <div className="flex px-3 pb-1">
          <button
            onClick={() => setActiveTab("hangout")}
            className={`py-1.5 px-3 text-xs font-medium transition-colors border-b-2 ${
              activeTab === "hangout"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Hangouts
          </button>
          <div className="w-px bg-gray-200 my-1"></div>
          <button
            onClick={() => setActiveTab("parking")}
            className={`py-1.5 px-3 text-xs font-medium transition-colors border-b-2 ${
              activeTab === "parking"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Parking
          </button>
          <div className="w-px bg-gray-200 my-1"></div>
          <button
            onClick={() => setActiveTab("filters")}
            className={`py-1.5 px-3 text-xs font-medium transition-colors border-b-2 flex items-center gap-1 ${
              activeTab === "filters"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            <Filter className="w-3 h-3" />
            Filters
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="drawer-content overflow-y-auto h-[calc(100%-60px)]">
        {activeTab === "filters" ? (
          <div className="p-4 space-y-6">
            {/* Hangout Filters Section */}
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-4">Hangout Spot Filters</h2>

              {/* Price Range */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Range</h3>
                <div className="flex gap-2">
                  {["$", "$$", "$$$", "$$$$"].map((price) => (
                    <button
                      key={price}
                      onClick={() => {
                        if (priceRange.includes(price)) {
                          setPriceRange(priceRange.filter(p => p !== price))
                        } else {
                          setPriceRange([...priceRange, price])
                        }
                      }}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
                        priceRange.includes(price)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Rating</h3>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        if (rating.includes(star)) {
                          setRating(rating.filter(r => r !== star))
                        } else {
                          setRating([...rating, star])
                        }
                      }}
                      className={`flex-1 py-2 px-1 rounded-lg border text-xs transition-colors ${
                        rating.includes(star)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Operating Hours</h3>
                <div className="flex gap-2">
                  {(["open", "closed"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setOperatingHours(status === operatingHours ? null : status)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors capitalize ${
                        operatingHours === status
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type of Places */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Type of Places</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "restaurant",
                    "cafe",
                    "bar",
                    "night_club",
                    "park",
                    "shopping_mall",
                    "movie_theater",
                    "museum",
                    "tourist_attraction",
                    "bowling_alley",
                    "amusement_park",
                    "art_gallery"
                  ].map((type) => {
                    const displayName = type
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')

                    return (
                      <button
                        key={type}
                        onClick={() => {
                          if (placeType.includes(type)) {
                            setPlaceType(placeType.filter(t => t !== type))
                          } else {
                            setPlaceType([...placeType, type])
                          }
                        }}
                        className={`py-2 px-3 rounded-lg border text-xs transition-colors ${
                          placeType.includes(type)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        {displayName}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Parking Filters Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">Parking Spot Filters</h2>

              {/* Availability */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Availability</h3>
                <div className="space-y-2">
                  {[
                    { color: "green", label: "High (≥50%)", bgClass: "bg-green-500" },
                    { color: "amber", label: "Medium (20-49%)", bgClass: "bg-amber-500" },
                    { color: "red", label: "Low (<20%)", bgClass: "bg-red-500" },
                  ].map(({ color, label, bgClass }) => (
                    <button
                      key={color}
                      onClick={() => {
                        if (selectedColors.includes(color)) {
                          setSelectedColors(selectedColors.filter(c => c !== color))
                        } else {
                          setSelectedColors([...selectedColors, color])
                        }
                      }}
                      className={`w-full py-2 px-3 rounded-lg border transition-colors flex items-center gap-2 text-sm ${
                        selectedColors.includes(color)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${bgClass}`}></div>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "hangout" ? (
          <>
            {selectedSpot ? (
              <HangoutSpotCard
                spot={selectedSpot}
                variant="expanded"
                onBack={onSpotBack}
                onGetDirections={onSpotGetDirections}
                onOpenCreateMeetup={onOpenCreateMeetup}
              />
            ) : (
              <div className="p-3 space-y-2">
                {loadingSpots ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <HangoutSpotCardSkeleton key={i} />
                  ))
                ) : filteredSpots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      {spots.length === 0 ? "No hangout spots found" : "No matching hangout spots"}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      {spots.length === 0 ? "Try searching for a location" : "Try adjusting your filters"}
                    </p>
                  </div>
                ) : (
                  filteredSpots.map((spot) => (
                    <HangoutSpotCard
                      key={spot.id}
                      spot={spot}
                      variant="compact"
                      onClick={() => onSpotClick(spot)}
                    />
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {selectedCarpark ? (
              <ParkingSpotCard
                spot={selectedCarpark}
                variant="expanded"
                onBack={onCarparkBack}
                onGetDirections={onCarparkGetDirections}
              />
            ) : (
              <div className="p-3 space-y-2">
                {filteredCarparks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-500 text-sm">
                      {carparks.length === 0 ? "No parking spots found" : "No matching parking spots"}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      {carparks.length === 0 ? "Try searching for a location" : "Try adjusting your filters"}
                    </p>
                  </div>
                ) : (
                  filteredCarparks.map((spot) => (
                    <ParkingSpotCard
                      key={spot.id}
                      spot={spot}
                      variant="compact"
                      onClick={() => onCarparkSelect(spot)}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
