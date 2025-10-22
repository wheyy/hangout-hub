"use client"

import { Plus, Minus, Compass } from "lucide-react"

interface MobileMapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetBearing: () => void
}

export function MobileMapControls({ onZoomIn, onZoomOut, onResetBearing }: MobileMapControlsProps) {
  return (
    <div className="fixed left-4 top-32 z-[999] max-[999px]:flex hidden flex-col gap-2">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
        aria-label="Zoom in"
      >
        <Plus className="w-5 h-5 text-gray-700" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
        aria-label="Zoom out"
      >
        <Minus className="w-5 h-5 text-gray-700" />
      </button>

      {/* Reset Bearing / Compass */}
      <button
        onClick={onResetBearing}
        className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
        aria-label="Reset map orientation"
      >
        <Compass className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  )
}
