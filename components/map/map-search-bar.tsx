"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Loader2, Navigation, MapPin, AlertTriangle } from "lucide-react"
import { GooglePlacesService, PlaceSearchResult } from "@/lib/services/google-places"

interface SearchBarProps {
  onSearch: (result: PlaceSearchResult, isArea: boolean) => void
  value?: string
  onValueChange?: (value: string) => void
  showPinButton?: boolean
  onPinButtonClick?: () => void
  // Directions mode props
  directionsMode?: boolean
  fromValue?: string
  toValue?: string
  onFromChange?: (value: string) => void
  onToChange?: (value: string) => void
  onDirectionsSearch?: () => void
  onCancelDirections?: () => void
  onToggleDirectionsMode?: () => void
  onUseCurrentLocation?: () => void
  onClearCoordinates?: (field: 'from' | 'to') => void
}

interface Suggestion {
  placeId: string
  description: string
}

export function MapSearchBar({ 
  onSearch, 
  value, 
  onValueChange, 
  showPinButton = false, 
  onPinButtonClick,
  directionsMode = false,
  fromValue = '',
  toValue = '',
  onFromChange,
  onToChange,
  onDirectionsSearch,
  onCancelDirections,
  onToggleDirectionsMode,
  onUseCurrentLocation,
  onClearCoordinates
}: SearchBarProps) {

  //SearchBarController
  const [internalQuery, setInternalQuery] = useState("")
  const query = value !== undefined ? value : internalQuery
  const setQuery = onValueChange || setInternalQuery
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [activeSuggestionField, setActiveSuggestionField] = useState<'from' | 'to' | 'search' | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()
  const searchBarRef = useRef<HTMLDivElement>(null)
  const skipNextFetchRef = useRef(false)

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
    if (directionsMode) {
      // Only fetch suggestions for directions mode when typing in from/to fields
      if (activeSuggestionField === 'from' && fromValue.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }
      if (activeSuggestionField === 'to' && toValue.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      const searchQuery = activeSuggestionField === 'from' ? fromValue : toValue

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(async () => {
        setIsLoading(true)
        setHasError(false)
        try {
          const results = await GooglePlacesService.autocomplete(searchQuery)
          setSuggestions(results)
          setShowSuggestions(true)
          setHasError(false)
        } catch (error) {
          console.error("Autocomplete error:", error)
          setSuggestions([])
          setHasError(true)
          setShowSuggestions(true)
        } finally {
          setIsLoading(false)
        }
      }, 500)
    } else {
      // Normal search mode
      if (query.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        skipNextFetchRef.current = false
        return
      }

      // Skip fetch if the query looks like coordinates (e.g., "1.3521, 103.8198")
      const coordinatesPattern = /^-?\d+\.\d+,\s*-?\d+\.\d+$/
      if (coordinatesPattern.test(query.trim())) {
        setSuggestions([])
        setShowSuggestions(false)
        skipNextFetchRef.current = false
        return
      }

      // Skip fetch if we just selected a suggestion
      if (skipNextFetchRef.current) {
        skipNextFetchRef.current = false
        return
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(async () => {
        setIsLoading(true)
        setHasError(false)
        try {
          const results = await GooglePlacesService.autocomplete(query)
          setSuggestions(results)
          setShowSuggestions(true)
          setHasError(false)
        } catch (error) {
          console.error("Autocomplete error:", error)
          setSuggestions([])
          setHasError(true)
          setShowSuggestions(true)
        } finally {
          setIsLoading(false)
        }
      }, 500)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, directionsMode, fromValue, toValue, activeSuggestionField])

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
    if (directionsMode && activeSuggestionField) {
      if (activeSuggestionField === 'from' && onFromChange) {
        onFromChange(suggestion.description)
      } else if (activeSuggestionField === 'to' && onToChange) {
        onToChange(suggestion.description)
      }
    } else {
      // Set flag to skip next autocomplete fetch
      skipNextFetchRef.current = true
      setQuery(suggestion.description)
      handleSearch(suggestion.description)
    }
    setSuggestions([])
    setShowSuggestions(false)
    setHasError(false)
  }

  const handleClear = () => {
    if (directionsMode && activeSuggestionField) {
      if (activeSuggestionField === 'from' && onFromChange) {
        onFromChange('')
        // Clear coordinates when clearing the field
        if (onClearCoordinates) {
          onClearCoordinates('from')
        }
      } else if (activeSuggestionField === 'to' && onToChange) {
        onToChange('')
        // Clear coordinates when clearing the field
        if (onClearCoordinates) {
          onClearCoordinates('to')
        }
      }
    } else {
      setQuery("")
    }
    setSuggestions([])
    setShowSuggestions(false)
    setHasError(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch(query)
    }
  }

  return (
    <>
    {/* Desktop Search Bar (≥1000px) */}
    <div className="fixed top-14 left-0 right-0 z-[1000] pointer-events-none hidden min-[1000px]:block pt-4">
      <div className="mx-auto px-4" style={{
        marginLeft: '300px',
        marginRight: '300px',
        minWidth: '250px',
        maxWidth: 'calc(100vw - 600px)'
      }}>
        <div className="flex flex-wrap items-start justify-center gap-2">
      {directionsMode ? (
        /* Directions Mode - FROM and TO fields */
        <div ref={searchBarRef} className="relative pointer-events-auto w-full" style={{ minWidth: '250px', maxWidth: '500px' }}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 space-y-2">
            {/* FROM field */}
            <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-200">
              <div className="absolute left-3 w-3 h-3 rounded-full bg-blue-500"></div>
              
              <input
                type="text"
                placeholder="Choose starting point..."
                value={fromValue}
                onChange={(e) => {
                  if (onFromChange) onFromChange(e.target.value)
                }}
                onFocus={() => {
                  setActiveSuggestionField('from')
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                className="flex-1 pl-8 pr-20 py-2.5 bg-transparent rounded-lg outline-none text-sm"
              />

              {/* Use Current Location Button */}
              {onUseCurrentLocation && !fromValue && (
                <button
                  onClick={onUseCurrentLocation}
                  className="absolute right-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  aria-label="Use current location"
                  title="Use my current location"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Current</span>
                </button>
              )}

              {fromValue && (
                <button
                  onClick={() => {
                    setActiveSuggestionField('from')
                    handleClear()
                  }}
                  className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Clear from field"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* TO field */}
            <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-200">
              <div className="absolute left-3 w-3 h-3 rounded-full bg-red-500"></div>
              
              <input
                type="text"
                placeholder="Choose destination..."
                value={toValue}
                onChange={(e) => {
                  if (onToChange) onToChange(e.target.value)
                }}
                onFocus={() => {
                  setActiveSuggestionField('to')
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                className="flex-1 pl-8 pr-10 py-2.5 bg-transparent rounded-lg outline-none text-sm"
              />

              {toValue && (
                <button
                  onClick={() => {
                    setActiveSuggestionField('to')
                    handleClear()
                  }}
                  className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Clear to field"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={onCancelDirections}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDirectionsSearch}
                disabled={!fromValue || !toValue}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </button>
            </div>
          </div>

          {/* Autocomplete Dropdown for Directions Mode */}
          {showSuggestions && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden pointer-events-auto z-10">
              {hasError ? (
                <div className="px-4 py-3 text-sm flex items-center gap-3 text-red-600">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Unable to load suggestions. Please try again.</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm flex items-center gap-3 text-gray-500">
                  <Search className="w-4 h-4 flex-shrink-0" />
                  <span>No results found. Try a different search.</span>
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <button
                    key={suggestion.placeId}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSuggestionClick(suggestion)
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{suggestion.description}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* Normal Search Mode */
        <>
          <div ref={searchBarRef} className="relative pointer-events-auto flex-1" style={{ minWidth: '250px', maxWidth: '350px' }}>
            <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200">
              {/* Directions Toggle Button - Left side */}
              {onToggleDirectionsMode && (
                <button
                  onClick={onToggleDirectionsMode}
                  className="absolute left-3 p-1.5 hover:bg-blue-50 rounded-full transition-colors group z-10"
                  aria-label="Switch to directions mode"
                  title="Get Directions"
                >
                  <Navigation className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </button>
              )}

              <Search className="absolute left-12 w-5 h-5 text-gray-400" />
              
              <input
                type="text"
                placeholder="Search for places or areas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setActiveSuggestionField('search')
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                className="flex-1 pl-20 pr-12 py-3 bg-transparent rounded-full outline-none text-xs"
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
            {showSuggestions && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden pointer-events-auto z-10">
                {hasError ? (
                  <div className="px-4 py-3 text-sm flex items-center gap-3 text-red-600">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Unable to load suggestions. Please try again.</span>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm flex items-center gap-3 text-gray-500">
                    <Search className="w-4 h-4 flex-shrink-0" />
                    <span>No results found. Try a different search.</span>
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <button
                      key={suggestion.placeId}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSuggestionClick(suggestion)
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                    >
                      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{suggestion.description}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Pin Button */}
          {showPinButton && (
            <button
              onClick={onPinButtonClick}
              className="pointer-events-auto flex items-center gap-2 h-10 px-3 bg-blue-600 rounded-full shadow-lg border border-blue-700 hover:bg-blue-700 active:bg-blue-800 transition-all cursor-pointer text-xs font-medium text-white"
              aria-label="Use pin to search area"
            >
              <MapPin className="w-4 h-4 text-white flex-shrink-0" />
              <span className="whitespace-nowrap">Use Pin to Search</span>
            </button>
          )}
        </>
      )}
        </div>
      </div>
    </div>

    {/* Mobile Search Bar (<1000px) */}
    <div className="fixed top-14 left-0 right-0 z-[1000] pointer-events-none max-[999px]:flex hidden justify-center pt-2 px-4">
      <div className="flex flex-col gap-2 max-w-[350px] w-full">
        {directionsMode ? (
          /* Mobile Directions Mode */
          <div ref={searchBarRef} className="relative pointer-events-auto w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 space-y-2">
              {/* FROM field */}
              <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="absolute left-3 w-3 h-3 rounded-full bg-blue-500"></div>

                <input
                  type="text"
                  placeholder="Choose starting point..."
                  value={fromValue}
                  onChange={(e) => {
                    if (onFromChange) onFromChange(e.target.value)
                  }}
                  onFocus={() => {
                    setActiveSuggestionField('from')
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  className="flex-1 pl-8 pr-20 py-2.5 bg-transparent rounded-lg outline-none text-sm"
                />

                {onUseCurrentLocation && !fromValue && (
                  <button
                    onClick={onUseCurrentLocation}
                    className="absolute right-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    aria-label="Use current location"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Current</span>
                  </button>
                )}

                {fromValue && (
                  <button
                    onClick={() => {
                      setActiveSuggestionField('from')
                      handleClear()
                    }}
                    className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Clear from field"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>

              {/* TO field */}
              <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="absolute left-3 w-3 h-3 rounded-full bg-red-500"></div>

                <input
                  type="text"
                  placeholder="Choose destination..."
                  value={toValue}
                  onChange={(e) => {
                    if (onToChange) onToChange(e.target.value)
                  }}
                  onFocus={() => {
                    setActiveSuggestionField('to')
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  className="flex-1 pl-8 pr-10 py-2.5 bg-transparent rounded-lg outline-none text-sm"
                />

                {toValue && (
                  <button
                    onClick={() => {
                      setActiveSuggestionField('to')
                      handleClear()
                    }}
                    className="absolute right-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Clear to field"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onCancelDirections}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onDirectionsSearch}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Get Directions
                </button>
              </div>

              {showSuggestions && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden pointer-events-auto z-10">
                  {hasError ? (
                    <div className="px-4 py-3 text-sm flex items-center gap-3 text-red-600">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Unable to load suggestions. Please try again.</span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-4 py-3 text-sm flex items-center gap-3 text-gray-500">
                      <Search className="w-4 h-4 flex-shrink-0" />
                      <span>No results found. Try a different search.</span>
                    </div>
                  ) : (
                    suggestions.map((suggestion) => (
                      <button
                        key={suggestion.placeId}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSuggestionClick(suggestion)
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                      >
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{suggestion.description}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mobile Normal Search Mode */
          <>
            <div ref={searchBarRef} className="relative pointer-events-auto w-full">
              <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200">
                {onToggleDirectionsMode && (
                  <button
                    onClick={onToggleDirectionsMode}
                    className="absolute left-3 p-1.5 hover:bg-blue-50 rounded-full transition-colors group z-10"
                    aria-label="Switch to directions mode"
                  >
                    <Navigation className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </button>
                )}

                <Search className="absolute left-12 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  placeholder="Search for places..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActiveSuggestionField('search')
                  }}
                  onFocus={() => {
                    setActiveSuggestionField('search')
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-20 pr-12 py-3 bg-transparent rounded-full outline-none text-sm"
                />

                {isLoading ? (
                  <Loader2 className="absolute right-4 w-5 h-5 text-gray-400 animate-spin" />
                ) : query ? (
                  <button
                    onClick={() => {
                      setActiveSuggestionField('search')
                      handleClear()
                    }}
                    className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                ) : null}
              </div>

              {showSuggestions && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden pointer-events-auto z-10">
                  {hasError ? (
                    <div className="px-4 py-3 text-sm flex items-center gap-3 text-red-600">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Unable to load suggestions. Please try again.</span>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-4 py-3 text-sm flex items-center gap-3 text-gray-500">
                      <Search className="w-4 h-4 flex-shrink-0" />
                      <span>No results found. Try a different search.</span>
                    </div>
                  ) : (
                    suggestions.map((suggestion) => (
                      <button
                        key={suggestion.placeId}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSuggestionClick(suggestion)
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                      >
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{suggestion.description}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {showPinButton && (
              <div className="flex justify-center">
                <button
                  onClick={onPinButtonClick}
                  className="pointer-events-auto flex items-center gap-2 h-10 px-3 bg-blue-600 rounded-full shadow-lg border border-blue-700 hover:bg-blue-700 active:bg-blue-800 transition-all text-xs font-medium text-white w-fit"
                  aria-label="Use pin to search area"
                >
                  <MapPin className="w-4 h-4 text-white flex-shrink-0" />
                  <span className="whitespace-nowrap">Use Pin to Search</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  )
}
