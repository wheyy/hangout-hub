"use client"

import { HangoutSpot } from "@/lib/data/hangoutspot"
import { HangoutSpotCard, HangoutSpotCardSkeleton } from "./hangout-spot-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface HangoutDrawerProps {
  spots: HangoutSpot[]
  loading: boolean
  selectedSpot: HangoutSpot | null
  isOpen: boolean
  onToggle: () => void
  onCardClick: (spot: HangoutSpot) => void
  onBack: () => void
}

export function HangoutDrawer({
  spots,
  loading,
  selectedSpot,
  isOpen,
  onToggle,
  onCardClick,
  onBack
}: HangoutDrawerProps) {
  return (
    <div
      className={`fixed left-0 top-14 bottom-0 z-[1000] bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out ${
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
          />
        ) : (
          <>
            <div className="px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Hangout Spots</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-20 space-y-2">
              {loading ? (
                Array.from({ length: 20 }).map((_, i) => (
                  <HangoutSpotCardSkeleton key={i} />
                ))
              ) : spots.length === 0 ? (
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
                    No results yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Search for a place to discover hangout spots
                  </p>
                </div>
              ) : (
                spots.map((spot) => (
                  <HangoutSpotCard
                    key={spot.id}
                    spot={spot}
                    variant="compact"
                    onClick={() => onCardClick(spot)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
