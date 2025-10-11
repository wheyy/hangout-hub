// INTERFACE AND MOCK DATA are LEGACY CODE; Left here FOR REFERENCE (please delete or comment out when not needed anymore.)
// Actual Class for the HangoutSpotEntity is below commented out so that current code can still work properly. (line 129) 

export interface HangoutSpot {
  id: string
  name: string
  category: string
  priceRange: "$" | "$$" | "$$$" | "$$$$"
  rating: number
  reviewCount: number
  coordinates: [number, number] // [lng, lat]
  address: string
  description: string
  imageUrl: string
  amenities: string[]
  openingHours: string
  parkingInfo?: {
    available: boolean
    type: "street" | "indoor" | "surface" | "mall"
    capacity?: number
    occupied?: number
    pricePerHour?: number
  }
}

// Mock data for Singapore hangout spots
export const singaporeSpots: HangoutSpot[] = [
  {
    id: "1",
    name: "Marina Bay Sands SkyPark",
    category: "Observation Deck",
    priceRange: "$$$",
    rating: 4.5,
    reviewCount: 12847,
    coordinates: [103.8591, 1.2834],
    address: "10 Bayfront Ave, Singapore 018956",
    description: "Iconic observation deck with stunning city views and infinity pool access.",
    imageUrl: "/marina-bay-sands-skypark.jpg",
    amenities: ["City Views", "Photography", "Restaurant", "Gift Shop"],
    openingHours: "9:30 AM - 10:00 PM",
    parkingInfo: {
      available: true,
      type: "indoor",
      capacity: 2300,
      occupied: 1840,
      pricePerHour: 5,
    },
  },
  {
    id: "2",
    name: "Gardens by the Bay",
    category: "Park",
    priceRange: "$$",
    rating: 4.6,
    reviewCount: 8932,
    coordinates: [103.8636, 1.2816],
    address: "18 Marina Gardens Dr, Singapore 018953",
    description: "Futuristic park with iconic Supertrees and climate-controlled conservatories.",
    imageUrl: "/gardens-by-the-bay-supertrees.jpg",
    amenities: ["Nature Walk", "Light Show", "Conservatories", "Dining"],
    openingHours: "5:00 AM - 2:00 AM",
    parkingInfo: {
      available: true,
      type: "surface",
      capacity: 1600,
      occupied: 720,
      pricePerHour: 3,
    },
  },
  {
    id: "3",
    name: "East Coast Park",
    category: "Beach",
    priceRange: "$",
    rating: 4.3,
    reviewCount: 5621,
    coordinates: [103.9065, 1.3006],
    address: "East Coast Park Service Rd, Singapore",
    description: "Popular beach park perfect for cycling, barbecues, and water sports.",
    imageUrl: "/east-coast-park-beach-cycling.jpg",
    amenities: ["Beach", "Cycling", "BBQ Pits", "Water Sports", "Food Courts"],
    openingHours: "24 hours",
    parkingInfo: {
      available: true,
      type: "surface",
      capacity: 800,
      occupied: 320,
      pricePerHour: 1.2,
    },
  },
  {
    id: "4",
    name: "Lau Pa Sat",
    category: "Hawker Centre",
    priceRange: "$",
    rating: 4.2,
    reviewCount: 3847,
    coordinates: [103.8506, 1.2806],
    address: "18 Raffles Quay, Singapore 048582",
    description: "Historic hawker centre in the heart of the financial district.",
    imageUrl: "/singapore-hawker-centre-food-stalls.jpg",
    amenities: ["Local Food", "Outdoor Seating", "Late Night", "Historic Building"],
    openingHours: "24 hours",
    parkingInfo: {
      available: true,
      type: "street",
      capacity: 50,
      occupied: 42,
      pricePerHour: 2.5,
    },
  },
]

export const getSpotById = (id: string): HangoutSpot | undefined => {
  return singaporeSpots.find((spot) => spot.id === id)
}

export const getSpotsByCategory = (category: string): HangoutSpot[] => {
  return singaporeSpots.filter((spot) => spot.category === category)
}

export const getSpotsByPriceRange = (priceRange: string): HangoutSpot[] => {
  return singaporeSpots.filter((spot) => spot.priceRange === priceRange)
}

// ^^  ABOVE IS LEGACY CODE FOR REFERENCE  ^^ 
//  Feel free to update this class, I did not vet the behaviours, might be wrong

import { Location } from "./location"

export enum PriceRange {
  $ = "$",
  $$ = "$$",
  $$$ = "$$$",
}

// export class HangoutSpot {
//   constructor(
//     public id: string,
//     public name: string,
//     public category: string,
//     public priceRange: "$" | "$$" | "$$$" | "$$$$",
//     public rating: number,
//     public reviewCount: number,
//     public coordinates: GeolocationCoordinates,
//     public address: string,
//     public description: string,
//     public imageUrl: string,
//     public amenities: string[],
//     public openingHours: string,
//   ) {}

//   // === Getters ===
//   getName(): string {
//     return this.name;
//   }

//   getAddress(): string {
//     return this.address;
//   }

//   getCoordinates(): GeolocationCoordinates {
//     return this.coordinates;
//   }

//   getRating(): number {
//     return this.rating;
//   }

//   getPriceRange(): "$" | "$$" | "$$$" | "$$$$" {
//     return this.priceRange;
//   }

//   getOperatingHours(): string {
//     return this.openingHours;
//   }

//   getAmenities(): string[] {
//     return this.amenities;
//   }

//   getParkingInfo(): parking | undefined {
//     return this.parking;
//   }

// }