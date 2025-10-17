"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ParkingSquare, ChevronDown, ChevronUp } from "lucide-react"


import { CarparkInfo, CarparkAvailability } from "@/lib/services/carpark-api";
import { ParkingType } from "@/lib/data/parkingspot";

interface ParkingDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  carparks?: Array<{ info: CarparkInfo; availability?: CarparkAvailability }>;
}


export function ParkingDrawer({ isOpen, onToggle, carparks }: ParkingDrawerProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (carpark_number: string) => {
    setExpandedCard(expandedCard === carpark_number ? null : carpark_number);
  };
  return (
    <div
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
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Parking Spots</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {carparks && carparks.length > 0 ? (
            <ul className="space-y-4">
              {carparks.map(({ info, availability }) => {
                const isExpanded = expandedCard === info.carpark_number;
                return (
                  <li key={info.carpark_number} className="border rounded-lg shadow-sm">
                    <div 
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCard(info.carpark_number)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{info.address}</div>
                          <div className="text-xs text-gray-500 mb-1">Code: {info.carpark_number}</div>
                          <div className="text-xs text-gray-500 mb-1">Type: {ParkingType[info.type]}</div>
                          {availability ? (
                            <div className="mt-1">
                              <span className="text-green-700 font-bold">{availability.lots_available}</span>
                              <span className="text-gray-600"> / {availability.total_lots} lots available</span>
                              <span className="ml-2 text-xs text-gray-400">({availability.lot_type})</span>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">Availability data not found</div>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
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
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ParkingSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No carparks found in area
              </h3>
              <p className="text-sm text-gray-500">
                Try moving the pin or zooming out
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}