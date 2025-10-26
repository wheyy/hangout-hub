export interface ParkingInfo {
  available: boolean
  type: "street" | "indoor" | "surface" | "mall"
}

export enum PriceRange {
  $ = "$",
  $$ = "$$",
  $$$ = "$$$",
  $$$$ = "$$$$"
}

export class HangoutSpot {
  constructor(
    public id: string,
    public name: string,
    public category: string,
    public priceRange: "$" | "$$" | "$$$" | "$$$$",
    public rating: number,
    public reviewCount: number,
    public coordinates: [number, number],
    public address: string,
    public thumbnailUrl: string,
    public openingHours: string,
  ) {}

  getName(): string {
    return this.name
  }

  getAddress(): string {
    return this.address
  }

  getCoordinates(): [number, number] {
    return this.coordinates
  }

  getRating(): number {
    return this.rating
  }

  getPriceRange(): "$" | "$$" | "$$$" | "$$$$" {
    return this.priceRange
  }

  getOpeningHours(): string {
    return this.openingHours
  }
}
