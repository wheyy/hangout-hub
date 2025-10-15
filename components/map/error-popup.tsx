"use client"

import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorPopupProps {
  message: string
  code?: string
  onDismiss: () => void
}

export function ErrorPopup({ message, code, onDismiss }: ErrorPopupProps) {
  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>

          <div className="flex-1 pt-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {message}
            </p>
            {code && (
              <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                Error: {code}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onDismiss} className="px-6">
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}
