"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Navigation, X, SlidersHorizontal, Building2, Map, Route } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { SearchService, type SearchSuggestion, type SearchFilters } from "@/lib/search/search-service"
import { useMap } from "@/lib/map/map-provider"
import { DirectionsBar } from "./directions-bar"

interface FilterChip {
  id: string
  label: string
  active: boolean
  count?: number
}

export function SearchBar() {
  const isMobile = useIsMobile()
  const { map } = useMap()
  const [destination, setDestination] = useState("")
  const [origin, setOrigin] = useState("")
  const [showOrigin, setShowOrigin] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<SearchSuggestion | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  
  const [filters, setFilters] = useState<FilterChip[]>([
    { id: "price", label: "Price", active: false },
    { id: "rating", label: "Rating 4+", active: false },
    // { id: "travel", label: "< 30 min", active: false },
    { id: "parking", label: "Parking", active: false },
  ])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (destination.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await SearchService.searchSuggestions(destination)
          setSuggestions(results)
          setShowSuggestions(true)
        } catch (error) {
          console.error("Search error:", error)
        }
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [destination])

  const handleDestinationSelect = async (suggestion: SearchSuggestion) => {
    setDestination(suggestion.name)
    setSelectedDestination(suggestion)
    setShowSuggestions(false)

    // Perform search and update map
    await performSearch(suggestion)
  }

  const performSearch = async (destination: SearchSuggestion) => {
    if (!map) return

    setIsSearching(true)

    try {
      // Build filters object
      const searchFilters: SearchFilters = {}

      if (filters.find((f) => f.id === "rating" && f.active)) {
        searchFilters.minRating = 4
      }

      if (filters.find((f) => f.id === "parking" && f.active)) {
        searchFilters.hasParking = true
      }

      const result = await SearchService.searchSpots(destination, undefined, searchFilters)

      // Update filter counts
      setFilters((prev) =>
        prev.map((filter) => ({
          ...filter,
          count: filter.id === "parking" ? result.spots.filter((s) => s.parkingInfo?.available).length : undefined,
        })),
      )

      // Update map view
      map.fitBounds(result.bounds)

      // Add search boundary visualization
      if (result.searchType === "place" && result.radius) {
        // Add 1km radius circle
        map.addLayer({
          id: "search-radius",
          type: "circle",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: result.center,
              },
            },
          },
          paint: {
            "circle-radius": {
              stops: [
                [0, 0],
                [20, result.radius / 10], // Approximate pixel conversion
              ],
            },
            "circle-color": "rgba(8, 145, 178, 0.1)",
            "circle-stroke-color": "#0891b2",
            "circle-stroke-width": 2,
          },
        })
      } else if (result.searchType === "area") {
        // Add area polygon
        const [west, south, east, north] = result.bounds
        map.addLayer({
          id: "search-area",
          type: "fill",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [west, south],
                    [east, south],
                    [east, north],
                    [west, north],
                    [west, south],
                  ],
                ],
              },
            },
          },
          paint: {
            "fill-color": "rgba(8, 145, 178, 0.1)",
            "fill-outline-color": "#0891b2",
          },
        })
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin("Current Location")
      },
      (error) => {
        console.error("Geolocation error:", error)
      },
    )
  }

  const toggleFilter = (id: string) => {
    setFilters((prev) => prev.map((filter) => (filter.id === id ? { ...filter, active: !filter.active } : filter)))

    // Re-search if destination is selected
    if (selectedDestination) {
      performSearch(selectedDestination)
    }
  }

  const clearFilter = (id: string) => {
    setFilters((prev) => prev.map((filter) => (filter.id === id ? { ...filter, active: false } : filter)))

    // Re-search if destination is selected
    if (selectedDestination) {
      performSearch(selectedDestination)
    }
  }

  const clearSearch = () => {
    setDestination("")
    setSelectedDestination(null)
    setSuggestions([])
    setShowSuggestions(false)

    // Remove search boundaries from map
    if (map) {
      try {
        map.removeLayer("search-radius")
        map.removeLayer("search-area")
      } catch (e) {
        // Layers might not exist
      }
    }
  }

  const handleDirectionsClick = () => {
    setShowDirections(true)
  }

  const handleDirectionsClose = () => {
    setShowDirections(false)
  }

  if (showDirections) {
    return <DirectionsBar onClose={handleDirectionsClose} />
  }

  return (
    <div className={`absolute top-4 left-4 right-4 z-20 ${isMobile ? "left-4 right-4" : "left-84 right-84"}`}>
    {/* <div className={`absolute top-4 left-4 right-4 z-20 ${isMobile ? "right-4" : "right-80"}`}> */}
      {/* Main Search Container */}
      <div className="floating-panel p-4 space-y-3 relative">
        {/* Destination Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for places or areas..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="pl-10 pr-20 bg-background border-border"
          />
          {destination && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-8 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={clearSearch}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setShowOrigin(!showOrigin)}
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-30 border border-border shadow-lg">
            <CardContent className="p-0">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                  onClick={() => handleDestinationSelect(suggestion)}
                >
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    {suggestion.type === "place" ? (
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Map className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{suggestion.name}</span>
                      <Badge variant={suggestion.type === "place" ? "default" : "secondary"} className="text-xs">
                        {suggestion.type === "place" ? "Place" : "Area"}
                      </Badge>
                    </div>
                    {suggestion.address && <p className="text-xs text-muted-foreground">{suggestion.address}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Origin Input (Collapsible) */}
        {showOrigin && (
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="From where?"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="pl-10 pr-24 bg-background border-border"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUseCurrentLocation}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 h-8 px-2 text-xs text-primary"
            >
              Use current
            </Button>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDirectionsClick} className="shrink-0 bg-transparent">
            <Route className="w-4 h-4 mr-1" />
            Directions
          </Button>
          {/* <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            Filters
          </Button> */}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal className="w-3 h-3" />
            <div className="text-xs">Filters: </div>
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant={filter.active ? "default" : "outline"}
              className={`shrink-0 cursor-pointer ${
                filter.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              onClick={() => toggleFilter(filter.id)}
            >
              {filter.label}
              {filter.count && ` (${filter.count})`}
              {filter.active && (
                <X
                  className="w-3 h-3 ml-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFilter(filter.id)
                  }}
                />
              )}
            </Badge>
          ))}
        </div>

        {isSearching && <div className="text-xs text-muted-foreground">Searching...</div>}
      </div>
    </div>
  )
}
