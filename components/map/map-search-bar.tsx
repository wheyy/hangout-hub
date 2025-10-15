"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { GooglePlacesService, PlaceSearchResult } from "@/lib/services/google-places"

interface SearchBarProps {
  onSearch: (result: PlaceSearchResult, isArea: boolean) => void
  value?: string
  onValueChange?: (value: string) => void
  showPinButton?: boolean
  onPinButtonClick?: () => void
}

interface Suggestion {
  placeId: string
  description: string
}

export function MapSearchBar({ onSearch, value, onValueChange, showPinButton = false, onPinButtonClick }: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState("")
  const query = value !== undefined ? value : internalQuery
  const setQuery = onValueChange || setInternalQuery
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const searchBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await GooglePlacesService.autocomplete(query)
        setSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch (error) {
        console.error("Autocomplete error:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const result = await GooglePlacesService.searchPlace(searchQuery)
      
      if (result) {
        const isArea = GooglePlacesService.isAreaSearch(result.types)
        const isSpecificPlace = GooglePlacesService.isSpecificPlace(result.types)

        console.log("=== SEARCH RESULT ===")
        console.log("Query:", searchQuery)
        console.log("Place Name:", result.name)
        console.log("Types:", result.types)
        console.log("Is Area:", isArea)
        console.log("Is Specific Place:", isSpecificPlace)
        console.log("Coordinates:", result.geometry.location)
        if (result.geometry.viewport) {
          console.log("Viewport:", result.geometry.viewport)
        }
        console.log("====================")

        onSearch(result, isArea)
      } else {
        console.warn("No results found for:", searchQuery)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.description)
    setShowSuggestions(false)
    handleSearch(suggestion.description)
  }

  const handleClear = () => {
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch(query)
    }
  }

  return (
    <div className="absolute top-4 left-0 right-0 z-[1000] pointer-events-none flex items-start justify-center gap-2">
      {/* Search Input */}
      <div ref={searchBarRef} className="relative pointer-events-auto" style={{ width: '500px' }}>
        <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          
          <input
            type="text"
            placeholder="Search for places or areas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="flex-1 pl-12 pr-12 py-3 bg-transparent rounded-full outline-none text-xs"
          />

          {isLoading ? (
            <Loader2 className="absolute right-4 w-5 h-5 text-gray-400 animate-spin" />
          ) : query && (
            <button
              onClick={handleClear}
              className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden pointer-events-auto z-10">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.placeId}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
              >
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{suggestion.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pin Button */}
      {showPinButton && (
        <button
          onClick={onPinButtonClick}
          className="pointer-events-auto flex items-center justify-center gap-2 h-[46px] px-4 bg-white rounded-md shadow-md border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all cursor-pointer text-xs font-medium text-gray-700"
          aria-label="Use pin to search area"
        >
          <svg width="20" height="23" viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 4C23.163 4 16 11.163 16 20C16 32 32 68 32 68C32 68 48 32 48 20C48 11.163 40.837 4 32 4Z" 
                  fill="#3B82F6" stroke="white" strokeWidth="3"/>
            <g transform="translate(32, 20)">
              <circle cx="0" cy="-2" r="7" stroke="white" strokeWidth="2.5" fill="none"/>
              <line x1="5" y1="2.5" x2="8" y2="5.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </g>
          </svg>
          <span className="whitespace-nowrap">Use Pin to Search Area</span>
        </button>
      )}
    </div>
  )
}
