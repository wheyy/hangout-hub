// lib/data/parkingspot.ts
import { Location } from './location'; // Assuming you have a Location interface

export enum ParkingType {
    MSCP,
    StreetParking,
    OutdoorParking
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