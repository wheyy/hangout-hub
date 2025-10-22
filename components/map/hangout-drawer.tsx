"use client"

import { HangoutSpot } from "@/lib/data/hangoutspot"
import { HangoutSpotCard, HangoutSpotCardSkeleton } from "./hangout-spot-card"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface HangoutDrawerProps {
  spots: HangoutSpot[]
  loading: boolean
  selectedSpot: HangoutSpot | null
  isOpen: boolean
  onToggle: () => void
  onCardClick: (spot: HangoutSpot) => void
  onBack: () => void
  onGetDirections?: (spot: HangoutSpot) => void
}

export function HangoutDrawer({
  spots,
  loading,
  selectedSpot,
  isOpen,
  onToggle,
  onCardClick,
  onBack,
  onGetDirections
}: HangoutDrawerProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<string[]>([])
  const [rating, setRating] = useState<number[]>([])
  const [operatingHours, setOperatingHours] = useState<"open" | "closed" | null>(null)
  const [placeType, setPlaceType] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Don't close if clicking inside this dropdown or button
      if (
        dropdownRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }

      // Don't close if clicking in the parking drawer (to allow both dropdowns open)
      const parkingDrawer = document.querySelector('[data-drawer="parking"]')
      if (parkingDrawer?.contains(target)) {
        return
      }

      setIsFilterOpen(false)
    }

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isFilterOpen])

  // Helper function to check if a place is currently open
  const checkIfOpen = (openingHours: string): boolean => {
    // Simple check - if it contains "Open" or "Closed" in the string
    // This is a basic implementation - can be enhanced based on actual data format
    const lowerHours = openingHours.toLowerCase()
    
    // If it explicitly says "Closed" or "Temporarily closed"
    if (lowerHours.includes("closed") || lowerHours.includes("close")) {
      return false
    }
    
    // If it says "Open 24 hours" or "Open now"
    if (lowerHours.includes("open 24") || lowerHours.includes("open now")) {
      return true
    }
    
    // If it has time ranges, we'd need to parse and check current time
    // For now, assume it's open if it has hours listed
    if (lowerHours.match(/\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)/i)) {
      // TODO: Implement proper time parsing and comparison
      return true
    }
    
    // Default to open if we can't determine
    return true
  }

  // Filter spots based on selected criteria
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
    if (operatingHours) {
      const isOpen = checkIfOpen(spot.openingHours)
      if (operatingHours === "open" && !isOpen) {
        return false
      }
      if (operatingHours === "closed" && isOpen) {
        return false
      }
    }

    // Filter by place type
    if (placeType.length > 0 && !placeType.includes(spot.category)) {
      return false
    }

    return true
  })

  return (
    <div
      data-drawer="hangout"
      className={`fixed left-0 top-14 bottom-0 z-[1000] bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out hidden min-[1000px]:block ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ width: "300px" }}
    >
      <button
        onClick={onToggle}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full bg-white border border-l-0 border-gray-200 rounded-r-lg px-2 py-8 hover:bg-gray-50 transition-colors shadow-md"
        aria-label={isOpen ? "Collapse drawer" : "Expand drawer"}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <div className="h-full overflow-hidden flex flex-col">
        {selectedSpot ? (
          <HangoutSpotCard
            spot={selectedSpot}
            variant="expanded"
            onBack={onBack}
            onGetDirections={onGetDirections}
          />
        ) : (
          <>
            <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between relative">
              <h2 className="text-lg font-semibold">Hangout Spots</h2>
              <button
                ref={buttonRef}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Filter and sort"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>

              {/* Filter Dropdown */}
              {isFilterOpen && (
                <div ref={dropdownRef} className="absolute left-4 right-0 top-[calc(100%+1px)] w-auto bg-white border-x border-b border-gray-200 rounded-b-xl shadow-2xl z-[1100] overflow-hidden">
                  {/* Price Range Section */}
                  <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h3>
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
                            className={`flex-1 py-2.5 px-3 rounded-lg border transition-colors ${
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

                    {/* Rating Section */}
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Rating</h3>
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
                            className={`flex-1 py-2.5 px-1 rounded-lg border transition-colors text-sm ${
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

                    {/* Operating Hours Section */}
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Operating Hours</h3>
                      <div className="flex gap-2">
                        {(["open", "closed"] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setOperatingHours(status === operatingHours ? null : status)}
                            className={`flex-1 py-2.5 px-3 rounded-lg border transition-colors capitalize ${
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

                    {/* Type of Places Section */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Type of Places</h3>
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
                          // Convert snake_case to Title Case for display
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
                              className={`py-2.5 px-3 rounded-lg border transition-colors text-sm ${
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
                )}
            </div>

            <div className="flex-1 overflow-y-auto pt-3 pb-20" style={{ direction: 'rtl' }}>
              <div className="space-y-2 px-3" style={{ direction: 'ltr' }}>
              {loading ? (
                Array.from({ length: 20 }).map((_, i) => (
                  <HangoutSpotCardSkeleton key={i} />
                ))
              ) : filteredSpots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {spots.length === 0 ? "No results yet" : "No matching spots"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {spots.length === 0 
                      ? "Search for a place to discover hangout spots"
                      : "Try adjusting your filters to see more results"}
                  </p>
                </div>
              ) : (
                filteredSpots.map((spot) => (
                  <HangoutSpotCard
                    key={spot.id}
                    spot={spot}
                    variant="compact"
                    onClick={() => onCardClick(spot)}
                  />
                ))
              )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
