"use client"

import { ChevronLeft, ChevronRight, ParkingSquare, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useRef, useEffect } from "react"

import { CarparkInfo, CarparkAvailability } from "@/lib/services/carpark-api";
import { ParkingType } from "@/lib/data/parkingspot";

interface ParkingDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  carparks?: Array<{ info: CarparkInfo; availability?: CarparkAvailability }>;
  onSelect?: (info: CarparkInfo, availability?: CarparkAvailability) => void;
}


export function ParkingDrawer({ isOpen, onToggle, carparks, onSelect }: ParkingDrawerProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleCard = (carpark_number: string) => {
    setExpandedCard(expandedCard === carpark_number ? null : carpark_number)
  }

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

      // Don't close if clicking in the hangout drawer (to allow both dropdowns open)
      const hangoutDrawer = document.querySelector('[data-drawer="hangout"]')
      if (hangoutDrawer?.contains(target)) {
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

  // Calculate availability color for filtering
  const getAvailabilityColorCategory = (availability?: CarparkAvailability): string => {
    if (!availability || availability.total_lots === 0) return "gray"
    
    const percentage = (availability.lots_available / availability.total_lots) * 100
    if (percentage >= 50) return "green"
    if (percentage >= 20) return "amber"
    return "red"
  }

  // Filter carparks based on selected colors
  const filteredCarparks = carparks?.filter(({ availability }) => {
    if (selectedColors.length === 0) return true
    const color = getAvailabilityColorCategory(availability)
    return selectedColors.includes(color)
  })
  
  return (
    <div
      data-drawer="parking"
      className={`fixed right-0 top-14 bottom-0 z-[1000] bg-white border-l border-gray-200 shadow-lg transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-[300px]"
      }`}
      style={{ width: "300px" }}
    >
      <button
        onClick={onToggle}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-white border border-r-0 border-gray-200 rounded-l-lg px-2 py-8 hover:bg-gray-50 transition-colors shadow-md"
        aria-label={isOpen ? "Collapse drawer" : "Expand drawer"}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <div className="h-full overflow-hidden flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between relative">
          <h2 className="text-lg font-semibold">Parking Spots</h2>
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
            <div ref={dropdownRef} className="absolute left-0 right-4 top-[calc(100%+1px)] w-auto bg-white border-x border-b border-gray-200 rounded-b-xl shadow-2xl z-[1100] overflow-hidden">
              <div>
                {/* Availability Color Filter Section */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Availability</h3>
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
                        className={`w-full py-2.5 px-3 rounded-lg border transition-colors flex items-center gap-2 ${
                          selectedColors.includes(color)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${bgClass}`}></div>
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pt-3 pb-20">
          <div className="space-y-2 px-3">
          {filteredCarparks && filteredCarparks.length > 0 ? (
            <ul className="space-y-4">
              {filteredCarparks.map(({ info, availability }) => {
                // Calculate availability percentage and determine color
                let availabilityColor = "bg-gray-200"
                let availabilityPercentage = 0
                
                if (availability && availability.total_lots > 0) {
                  availabilityPercentage = (availability.lots_available / availability.total_lots) * 100
                  
                  if (availabilityPercentage >= 50) {
                    availabilityColor = "bg-green-500" // Green for ≥50%
                  } else if (availabilityPercentage >= 20) {
                    availabilityColor = "bg-amber-500" // Amber for 20-49%
                  } else {
                    availabilityColor = "bg-red-500" // Red for <20%
                  }
                }

                const isExpanded = expandedCard === info.carpark_number

                return (
                  <li key={info.carpark_number} className="border rounded-lg shadow-sm">
                    <div 
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => onSelect?.(info, availability)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{info.address}</div>
                          <div className="text-xs text-gray-500 mb-1">Code: {info.carpark_number}</div>
                          <div className="text-xs text-gray-500 mb-2">Type: {ParkingType[info.type]}</div>
                          {availability ? (
                            <div className="mt-2">
                              {/* Visual availability indicator */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-4 h-4 rounded-full ${availabilityColor}`}></div>
                                <span className="text-sm font-semibold text-gray-700">
                                  {availabilityPercentage.toFixed(0)}% Available
                                </span>
                              </div>
                              {/* Lots information */}
                              <div className="text-sm">
                                <span className="font-bold text-gray-800">{availability.lots_available}</span>
                                <span className="text-gray-600"> / {availability.total_lots} lots</span>
                                <span className="ml-2 text-xs text-gray-400">({availability.lot_type})</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">Availability data not found</div>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label={isExpanded ? "Collapse details" : "Expand details"}
                          className="ml-2 flex-shrink-0 p-1 rounded hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCard(info.carpark_number)
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-gray-100 bg-gray-50">
                        <div className="text-sm font-semibold text-gray-700 mt-2 mb-1">Parking Rates</div>
                        {info.short_term_parking ? (
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Short-term: </span>{info.short_term_parking}
                          </div>
                        ) : null}
                        {info.free_parking ? (
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Free parking: </span>{info.free_parking}
                          </div>
                        ) : null}
                        {info.night_parking ? (
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Night parking: </span>{info.night_parking}
                          </div>
                        ) : null}
                        {info.car_park_decks ? (
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Decks: </span>{info.car_park_decks}
                          </div>
                        ) : null}
                        {info.gantry_height ? (
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Gantry height: </span>{info.gantry_height}
                          </div>
                        ) : null}
                        {info.car_park_basement ? (
                          <div className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Basement: </span>{info.car_park_basement}
                          </div>
                        ) : null}
                        {!info.short_term_parking && !info.free_parking && !info.night_parking && (
                          <div className="text-xs text-gray-400 italic">No rate information available</div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ParkingSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filteredCarparks && filteredCarparks.length > 0 ? "No matching carparks" : "No carparks found in area"}
              </h3>
              <p className="text-sm text-gray-500">
                {filteredCarparks && filteredCarparks.length > 0 
                  ? "Try adjusting your filters to see more results"
                  : "Try moving the pin or zooming out"}
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}