"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { GooglePlacesService, PlaceSearchResult } from "@/lib/services/google-places"

interface SearchBarProps {
  onSearch: (result: PlaceSearchResult, isArea: boolean) => void
  value?: string
  onValueChange?: (value: string) => void
}

interface Suggestion {
  placeId: string
  description: string
}

export function MapSearchBar({ onSearch, value, onValueChange }: SearchBarProps) {
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
    <div 
      ref={searchBarRef}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
      style={{ width: '500px' }}
    >
      {/* Search Input */}
      <div className="relative pointer-events-auto">
        <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          
          <input
            type="text"
            placeholder="Search for places or areas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="flex-1 pl-12 pr-12 py-3 bg-transparent rounded-full outline-none text-sm"
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
          <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden pointer-events-auto">
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
    </div>
  )
}
