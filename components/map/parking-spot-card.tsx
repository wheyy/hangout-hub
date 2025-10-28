"use client"

import { ParkingSpot, ParkingType } from "@/lib/models/parkingspot"
import { ArrowLeft, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ParkingSpotCardProps {
  spot: ParkingSpot
  variant: "compact" | "expanded"
  onClick?: () => void
  onBack?: () => void
  onGetDirections?: (spot: ParkingSpot) => void
}

export function ParkingSpotCard({ spot, variant, onClick, onBack, onGetDirections }: ParkingSpotCardProps) {
  const bgClass = `bg-${spot.getAvailabilityColor()}-500`
  const percentage = spot.getAvailabilityPercentage()

  if (variant === "compact") {
    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-semibold text-gray-800 text-sm">{spot.address}</div>
            <div className="text-xs text-gray-500 mb-2">Type: {ParkingType[spot.type]}</div>
            {spot.hasAvailabilityData() ? (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full ${bgClass}`}></div>
                  <span className="text-sm font-semibold text-gray-700">
                    {percentage.toFixed(0)}% Available
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-bold text-gray-800">{spot.availableLots}</span>
                  <span className="text-gray-600"> / {spot.totalLots} lots</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400">Availability data not found</div>
            )}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="bg-white h-full overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Back to list"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">Parking Details</h2>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-3">{spot.address}</h3>

          <div className="flex items-center gap-2 text-sm mb-4">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{ParkingType[spot.type]}</span>
          </div>

          {spot.hasAvailabilityData() ? (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <h4 className="font-semibold text-sm mb-3">Availability</h4>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-5 h-5 rounded-full ${bgClass}`}></div>
                <span className="text-lg font-bold text-gray-800">
                  {percentage.toFixed(0)}% Available
                </span>
              </div>
              <div className="text-base">
                <span className="font-bold text-gray-800">{spot.availableLots}</span>
                <span className="text-gray-600"> / {spot.totalLots} lots</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Availability data not found</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-2">Parking Rates</h4>
            <div className="space-y-2">
              {spot.shortTermParking && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Short-term: </span>
                  <span className="text-gray-600">{spot.shortTermParking}</span>
                </div>
              )}
              {spot.freeParking && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Free parking: </span>
                  <span className="text-gray-600">{spot.freeParking}</span>
                </div>
              )}
              {spot.nightParking && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Night parking: </span>
                  <span className="text-gray-600">{spot.nightParking}</span>
                </div>
              )}
              {!spot.shortTermParking && !spot.freeParking && !spot.nightParking && (
                <p className="text-sm text-gray-400 italic">No rate information available</p>
              )}
            </div>
          </div>

          {(spot.carParkDecks || spot.gantryHeight || spot.hasBasement) && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Facility Information</h4>
              <div className="space-y-2">
                {spot.carParkDecks && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Decks: </span>
                    <span className="text-gray-600">
                      {spot.carParkDecks === "SURFACE" ? "Surface" : spot.carParkDecks}
                    </span>
                  </div>
                )}
                {spot.gantryHeight && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Gantry height: </span>
                    <span className="text-gray-600">{spot.gantryHeight}</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Basement: </span>
                  <span className="text-gray-600">{spot.hasBasement ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {onGetDirections && (
          <Button
            className="w-full"
            onClick={() => onGetDirections(spot)}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        )}
      </div>
    </div>
  )
}