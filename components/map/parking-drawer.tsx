"use client"

import { ChevronLeft, ChevronRight, ParkingSquare, Filter } from "lucide-react"
import { useState, useRef, useEffect } from "react"

import { CarparkInfo, CarparkAvailability } from "@/lib/services/carpark-api";
import { ParkingSpotCard } from "./parking-spot-card";

interface ParkingDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  carparks?: Array<{ info: CarparkInfo; availability?: CarparkAvailability }>;
  onSelect?: (info: CarparkInfo, availability?: CarparkAvailability) => void;
  onGetDirections?: (info: CarparkInfo) => void;
  selectedCarpark?: { info: CarparkInfo; availability?: CarparkAvailability } | null;
  onBack?: () => void;
}


export function ParkingDrawer({ isOpen, onToggle, carparks, onSelect, onGetDirections, selectedCarpark, onBack }: ParkingDrawerProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
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
        {selectedCarpark ? (
          <ParkingSpotCard
            info={selectedCarpark.info}
            availability={selectedCarpark.availability}
            variant="expanded"
            onBack={onBack}
            onGetDirections={onGetDirections}
          />
        ) : (
          <>
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

              {isFilterOpen && (
                <div ref={dropdownRef} className="absolute left-0 right-4 top-[calc(100%+1px)] w-auto bg-white border-x border-b border-gray-200 rounded-b-xl shadow-2xl z-[1100] overflow-hidden">
                  <div>
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
                  filteredCarparks.map(({ info, availability }) => (
                    <ParkingSpotCard
                      key={info.carpark_number}
                      info={info}
                      availability={availability}
                      variant="compact"
                      onClick={() => onSelect?.(info, availability)}
                    />
                  ))
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
          </>
        )}
      </div>
    </div>
  )
}