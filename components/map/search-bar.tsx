"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  onSearch?: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && onSearch) {
      onSearch(query.trim())
    }
  }

  const handleClear = () => {
    setQuery("")
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for places or areas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20 bg-white shadow-lg border-gray-300"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          Search
        </Button>
      </form>
    </div>
  )
}
