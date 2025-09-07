export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Place {
  id: string
  name: string
  description: string
  address: string
  latitude: number
  longitude: number
  category: PlaceCategory
  amenities: string[]
  parking_info?: ParkingInfo
  rating: number
  price_range: PriceRange
  opening_hours: OpeningHours
  images: string[]
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  title: string
  description?: string
  place_id: string
  creator_id: string
  scheduled_time: string
  status: SessionStatus
  max_participants?: number
  is_location_sharing_enabled: boolean
  created_at: string
  updated_at: string
}

export interface SessionParticipant {
  id: string
  session_id: string
  user_id: string
  status: ParticipantStatus
  joined_at: string
}

export interface LocationShare {
  id: string
  session_id: string
  user_id: string
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: string
}

export type PlaceCategory = "cafe" | "restaurant" | "park" | "mall" | "entertainment" | "sports" | "cultural"

export type PriceRange = "free" | "budget" | "moderate" | "expensive"

export type SessionStatus = "planned" | "active" | "completed" | "cancelled"

export type ParticipantStatus = "invited" | "accepted" | "declined" | "maybe"

export interface ParkingInfo {
  available: boolean
  type: "free" | "paid" | "limited"
  details?: string
}

export interface OpeningHours {
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
}

export interface SearchFilters {
  category?: PlaceCategory
  priceRange?: PriceRange
  hasParking?: boolean
  radius?: number // in kilometers
  minRating?: number
}
