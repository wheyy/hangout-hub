import { Location } from './location';

export enum ParkingType {
    MSCP = "MSCP",
    StreetParking = "Street",
    OutdoorParking = "Outdoor"
}

export class ParkingSpot implements Location {
  constructor(
    public name: string,
    public address: string,
    public coordinates: [longitude: number, latitude: number],
    public carparkCode: string,
    public rate: string,                 
    public totalCapacity: number,
    public currentAvailability: number,
    public parkingType: ParkingType,
    public operatingHours: string
  ) {}


  isAvailable(): boolean {
    return this.currentAvailability > 0;
  }

  getName(): string {
    return this.name;
  }

  getAddress(): string {
    return this.address;
  }

  getCoordinates(): [longitude: number, latitude: number]{
    return this.coordinates;
  }

  getCarparkCode(): string {
    return this.carparkCode;
  }

  getRate(): string {
    return this.rate;
  }

  getTotalCapacity(): number {
    return this.totalCapacity;
  }

  getCurrentAvailability(): number {
    return this.currentAvailability;
  }

  getParkingType(): ParkingType {
    return this.parkingType;
  }

  getOperatingHours(): string {
    return this.operatingHours;
  }

  getOccupied(): number {
    return this.totalCapacity - this.currentAvailability;
  }

  // === Update methods (mirroring your Meetup style) ===
  updateName(newName: string): boolean {
    this.name = newName;
    return true;
  }

  updateAddress(newAddress: string): boolean {
    this.address = newAddress;
    return true;
  }

  updateCoordinates(newCoords: [longitude: number, latitude: number]): boolean {
    this.coordinates = newCoords;
    return true;
  }

  updateRate(newRate: string): boolean {
    this.rate = newRate;
    return true;
  }

  updateTotalCapacity(newTotal: number): boolean {
    if (newTotal < 0) return false;
    this.totalCapacity = newTotal;
    // Clamp availability if it went out of bounds
    if (this.currentAvailability > newTotal) {
      this.currentAvailability = newTotal;
    }
    return true;
  }

  updateCurrentAvailability(newAvail: number): boolean {
    if (newAvail < 0 || newAvail > this.totalCapacity) return false;
    this.currentAvailability = newAvail;
    return true;
  }

  updateParkingType(newType: ParkingType): boolean {
    this.parkingType = newType;
    return true;
  }

  updateOperatingHours(newHours: string): boolean {
    this.operatingHours = newHours;
    return true;
  }
}

// Mock data for Singapore parking spots
export const mockParkingSpots: ParkingSpot[] = [
    new ParkingSpot(
        "Marina Bay Sands Carpark",
        "10 Bayfront Ave, Singapore 018956",
        [1.2834, 103.8591],
        "MBS001",
        "$2.00/hr",
        2000,
        1500,
        ParkingType.MSCP,
        "24 hours"
    ),
    new ParkingSpot(
        "Orchard Road Street Parking",
        "Orchard Rd, Singapore",
        [1.3048, 103.8318],
        "ORC123",
        "$3.00/hr",
        100,
        20,
        ParkingType.StreetParking,
        "Mon-Sat: 8am-10pm"
    ),
    new ParkingSpot(
        "East Coast Park Outdoor Parking",
        "East Coast Park Service Rd, Singapore",
        [1.3039, 103.9136],
        "ECP456",
        "$1.50/hr",
        500,
        300,
        ParkingType.OutdoorParking,
        "24 hours"
    ),
];
