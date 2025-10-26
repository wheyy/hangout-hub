// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Badge } from "@/components/ui/badge"
// import {
//   MapPin,
//   Search,
//   Filter,
//   Star,
//   Car,
//   Coffee,
//   UtensilsCrossed,
//   TreePine,
//   ShoppingBag,
//   Gamepad2,
//   Dumbbell,
//   Palette,
// } from "lucide-react"
// import Link from "next/link"
// import type { PlaceCategory, PriceRange, SearchFilters } from "@/lib/types/index"
// import { AuthGuard } from "@/components/layout/auth-guard"

// // Mock data for demonstration
// const mockPlaces = [
//   {
//     id: "1",
//     name: "Marina Bay Sands SkyPark",
//     description: "Iconic rooftop observation deck with stunning city views",
//     address: "10 Bayfront Ave, Singapore 018956",
//     category: "entertainment" as PlaceCategory,
//     rating: 4.5,
//     price_range: "expensive" as PriceRange,
//     parking_info: { available: true, type: "paid" as const },
//     images: ["/marina-bay-sands-skypark.jpg"],
//     amenities: ["observation deck", "photography", "city views"],
//   },
//   {
//     id: "2",
//     name: "Gardens by the Bay",
//     description: "Futuristic botanical garden with iconic Supertrees",
//     address: "18 Marina Gardens Dr, Singapore 018953",
//     category: "park" as PlaceCategory,
//     rating: 4.7,
//     price_range: "moderate" as PriceRange,
//     parking_info: { available: true, type: "paid" as const },
//     images: ["/gardens-by-the-bay-supertrees.jpg"],
//     amenities: ["gardens", "walking trails", "conservatories"],
//   },
//   {
//     id: "3",
//     name: "East Coast Park",
//     description: "Popular beachside park perfect for cycling and barbecues",
//     address: "E Coast Park Service Rd, Singapore",
//     category: "park" as PlaceCategory,
//     rating: 4.4,
//     price_range: "free" as PriceRange,
//     parking_info: { available: true, type: "free" as const },
//     images: ["/east-coast-park-beach-cycling.jpg"],
//     amenities: ["beach", "cycling", "barbecue pits"],
//   },
//   {
//     id: "4",
//     name: "Maxwell Food Centre",
//     description: "Famous hawker centre with authentic local cuisine",
//     address: "1 Kadayanallur St, Singapore 069184",
//     category: "restaurant" as PlaceCategory,
//     rating: 4.6,
//     price_range: "budget" as PriceRange,
//     parking_info: { available: false, type: "limited" as const },
//     images: ["/singapore-hawker-centre-food-stalls.jpg"],
//     amenities: ["local food", "hawker stalls", "affordable dining"],
//   },
// ]

// const categoryIcons = {
//   cafe: Coffee,
//   restaurant: UtensilsCrossed,
//   park: TreePine,
//   mall: ShoppingBag,
//   entertainment: Gamepad2,
//   sports: Dumbbell,
//   cultural: Palette,
// }

// const priceRangeLabels = {
//   free: "Free",
//   budget: "$",
//   moderate: "$$",
//   expensive: "$$$",
// }

// export default function SearchPage() {
//   const [searchQuery, setSearchQuery] = useState("")
//   const [filters, setFilters] = useState<any>({
//     category: "",
//     priceRange: "",
//     minRating: undefined,
//     hasParking: undefined,
//   })
//   const [showFilters, setShowFilters] = useState(false)
//   const [results, setResults] = useState(mockPlaces)
//   const [loading, setLoading] = useState(false)

//   const handleSearch = async () => {
//     setLoading(true)
//     console.log("[v0] Searching with query:", searchQuery, "filters:", filters)

//     // Simulate API call
//     await new Promise((resolve) => setTimeout(resolve, 500))

//     // Filter mock data based on current filters
//     let filteredResults = mockPlaces

//     if (searchQuery) {
//       filteredResults = filteredResults.filter(
//         (place) =>
//           place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           place.address.toLowerCase().includes(searchQuery.toLowerCase()),
//       )
//     }

//     if (filters.category) {
//       filteredResults = filteredResults.filter((place) => place.category === filters.category)
//     }

//     if (filters.priceRange) {
//       filteredResults = filteredResults.filter((place) => place.price_range === filters.priceRange)
//     }

//     if (filters.hasParking) {
//       filteredResults = filteredResults.filter((place) => place.parking_info?.available)
//     }

//     if (filters.minRating) {
//       filteredResults = filteredResults.filter((place) => place.rating >= filters.minRating)
//     }

//     setResults(filteredResults)
//     setLoading(false)
//   }

//   useEffect(() => {
//     handleSearch()
//   }, [filters])

//   const updateFilter = (key: keyof SearchFilters, value: any) => {
//     setFilters((prev: any) => ({ ...prev, [key]: value }))
//   }

//   const clearFilters = () => {
//     setFilters({ category: "", priceRange: "", minRating: undefined, hasParking: undefined })
//   }

//   return (
//     <AuthGuard>
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <Link href="/" className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                 <MapPin className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-xl font-bold text-gray-900">Hangout Hub</span>
//             </Link>
//             <div className="flex items-center gap-4">
//               <Link href="/sessions">
//                 <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
//                   My Sessions
//                 </Button>
//               </Link>
//               <Link href="/profile">
//                 <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
//                   Profile
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Search Bar */}
//         <div className="mb-6">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <Input
//                 placeholder="Search for places, activities, or locations..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                 className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex gap-2">
//               <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
//                 {loading ? "Searching..." : "Search"}
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="border-blue-300 text-blue-700 hover:bg-blue-50"
//               >
//                 <Filter className="w-4 h-4 mr-2" />
//                 Filters
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Filters Panel */}
//         {showFilters && (
//           <Card className="mb-6 bg-white/80 backdrop-blur-sm border-blue-200">
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-lg">Filters</CardTitle>
//                 <Button variant="ghost" onClick={clearFilters} className="text-sm text-gray-600 hover:text-gray-800">
//                   Clear All
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {/* Category Filter */}
//                 <div className="space-y-2">
//                   <Label>Category</Label>
//                   <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
//                     <SelectTrigger className="bg-white">
//                       <SelectValue placeholder="All categories" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="">All categories</SelectItem>
//                       <SelectItem value="cafe">Cafes</SelectItem>
//                       <SelectItem value="restaurant">Restaurants</SelectItem>
//                       <SelectItem value="park">Parks</SelectItem>
//                       <SelectItem value="mall">Shopping</SelectItem>
//                       <SelectItem value="entertainment">Entertainment</SelectItem>
//                       <SelectItem value="sports">Sports</SelectItem>
//                       <SelectItem value="cultural">Cultural</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Price Range Filter */}
//                 <div className="space-y-2">
//                   <Label>Price Range</Label>
//                   <Select value={filters.priceRange} onValueChange={(value) => updateFilter("priceRange", value)}>
//                     <SelectTrigger className="bg-white">
//                       <SelectValue placeholder="Any price" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="">Any price</SelectItem>
//                       <SelectItem value="free">Free</SelectItem>
//                       <SelectItem value="budget">Budget ($)</SelectItem>
//                       <SelectItem value="moderate">Moderate ($$)</SelectItem>
//                       <SelectItem value="expensive">Premium ($$$)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Rating Filter */}
//                 <div className="space-y-2">
//                   <Label>Minimum Rating</Label>
//                   <Select
//                     value={filters.minRating?.toString() || ""}
//                     onValueChange={(value) => updateFilter("minRating", value ? Number.parseFloat(value) : undefined)}
//                   >
//                     <SelectTrigger className="bg-white">
//                       <SelectValue placeholder="Any rating" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="">Any rating</SelectItem>
//                       <SelectItem value="4.5">4.5+ stars</SelectItem>
//                       <SelectItem value="4.0">4.0+ stars</SelectItem>
//                       <SelectItem value="3.5">3.5+ stars</SelectItem>
//                       <SelectItem value="3.0">3.0+ stars</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Parking Filter */}
//                 <div className="space-y-2">
//                   <Label>Amenities</Label>
//                   <div className="flex items-center space-x-2">
//                     <Checkbox
//                       id="parking"
//                       checked={filters.hasParking || false}
//                       onCheckedChange={(checked) => updateFilter("hasParking", checked)}
//                     />
//                     <Label htmlFor="parking" className="text-sm font-normal">
//                       Parking available
//                     </Label>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Results */}
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-2xl font-bold text-gray-900">
//             {results.length} {results.length === 1 ? "place" : "places"} found
//           </h2>
//           <Select defaultValue="rating">
//             <SelectTrigger className="w-48 bg-white">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="rating">Highest rated</SelectItem>
//               <SelectItem value="distance">Nearest first</SelectItem>
//               <SelectItem value="price-low">Price: Low to high</SelectItem>
//               <SelectItem value="price-high">Price: High to low</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Results Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {results.map((place) => {
//             const CategoryIcon = categoryIcons[place.category]
//             return (
//               <Link key={place.id} href={`/places/${place.id}`}>
//                 <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
//                   <div className="aspect-video relative overflow-hidden rounded-t-lg">
//                     <img
//                       src={place.images[0] || "/placeholder.svg"}
//                       alt={place.name}
//                       className="w-full h-full object-cover"
//                     />
//                     <div className="absolute top-3 left-3">
//                       <Badge className="bg-white/90 text-gray-700 hover:bg-white">
//                         <CategoryIcon className="w-3 h-3 mr-1" />
//                         {place.category}
//                       </Badge>
//                     </div>
//                     <div className="absolute top-3 right-3">
//                       <Badge className="bg-white/90 text-gray-700 hover:bg-white">
//                         {priceRangeLabels[place.price_range]}
//                       </Badge>
//                     </div>
//                   </div>
//                   <CardHeader className="pb-2">
//                     <div className="flex items-start justify-between">
//                       <CardTitle className="text-lg leading-tight">{place.name}</CardTitle>
//                       <div className="flex items-center gap-1 text-sm text-gray-600 ml-2">
//                         <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                         {place.rating}
//                       </div>
//                     </div>
//                     <CardDescription className="text-sm">{place.description}</CardDescription>
//                   </CardHeader>
//                   <CardContent className="pt-0">
//                     <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
//                       <MapPin className="w-4 h-4" />
//                       <span className="truncate">{place.address}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-4 text-sm text-gray-600">
//                         {place.parking_info?.available && (
//                           <div className="flex items-center gap-1">
//                             <Car className="w-4 h-4" />
//                             <span>Parking</span>
//                           </div>
//                         )}
//                       </div>
//                       <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
//                         View Details
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Link>
//             )
//           })}
//         </div>

//         {results.length === 0 && !loading && (
//           <div className="text-center py-12">
//             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Search className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No places found</h3>
//             <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
//             <Button
//               onClick={clearFilters}
//               variant="outline"
//               className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
//             >
//               Clear Filters
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//     </AuthGuard>
//   )
// }
