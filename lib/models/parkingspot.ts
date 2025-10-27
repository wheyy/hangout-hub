import { Location } from './location'

export enum ParkingType {
  MSCP,
  StreetParking,
  OutdoorParking
}

// Internal interfaces (not exported - only for type safety in constructor)
interface CarparkInfo {
  carpark_number: string
  address: string
  coordinates: [number, number]
  type: ParkingType
  source?: 'hdb' | 'commercial'
  short_term_parking?: string
  free_parking?: string
  night_parking?: string
  weekday_rate_1?: string
  weekday_rate_2?: string
  saturday_rate?: string
  sunday_publicholiday_rate?: string
  car_park_decks?: string
  gantry_height?: string
  car_park_basement?: string
}

interface CarparkAvailability {
  carpark_number: string
  total_lots: number
  lots_available: number
  lot_type: string
}

export class ParkingSpot implements Location {
  // Identity
  public id: string
  public name: string
  public address: string
  public coordinates: [number, number]

  // Type & Classification
  public type: ParkingType
  public source?: 'hdb' | 'commercial'

  // Availability (Real-time)
  public totalLots: number
  public availableLots: number
  public lotType: string

  // Rates & Pricing
  public shortTermParking?: string
  public freeParking?: string
  public nightParking?: string
  public weekdayRate1?: string
  public weekdayRate2?: string
  public saturdayRate?: string
  public sundayPublicHolidayRate?: string

  // Facility Information
  public carParkDecks?: string
  public gantryHeight?: string
  public hasBasement: boolean

  constructor(info: CarparkInfo, availability?: CarparkAvailability) {
    // Identity
    this.id = info.carpark_number
    this.name = info.address
    this.address = info.address
    this.coordinates = info.coordinates

    // Type
    this.type = info.type
    this.source = info.source

    // Availability (may be missing)
    this.totalLots = availability?.total_lots || 0
    this.availableLots = availability?.lots_available || 0
    this.lotType = availability?.lot_type || 'C'

    // Rates
    this.shortTermParking = info.short_term_parking
    this.freeParking = info.free_parking
    this.nightParking = info.night_parking
    this.weekdayRate1 = info.weekday_rate_1
    this.weekdayRate2 = info.weekday_rate_2
    this.saturdayRate = info.saturday_rate
    this.sundayPublicHolidayRate = info.sunday_publicholiday_rate

    // Facility info
    this.carParkDecks = info.car_park_decks
    this.gantryHeight = info.gantry_height
    this.hasBasement = info.car_park_basement?.toUpperCase() === 'Y'
  }

  // Location interface methods
  getName(): string {
    return this.address
  }

  getAddress(): string {
    return this.address
  }

  getCoordinates(): [number, number] {
    return this.coordinates
  }

  // Helper: Calculate availability percentage
  getAvailabilityPercentage(): number {
    if (this.totalLots === 0) return 0
    return (this.availableLots / this.totalLots) * 100
  }

  // Helper: Get color for availability indicator
  getAvailabilityColor(): 'green' | 'amber' | 'red' | 'gray' {
    if (this.totalLots === 0) return 'gray'

    const percentage = this.getAvailabilityPercentage()
    if (percentage >= 50) return 'green'
    if (percentage >= 20) return 'amber'
    return 'red'
  }

  // Helper: Check if availability data exists
  hasAvailabilityData(): boolean {
    return this.totalLots > 0
  }

  // Helper: Get CSS class for availability badge
  getAvailabilityBgClass(): string {
    const color = this.getAvailabilityColor()
    return `bg-${color}-500`
  }
}
