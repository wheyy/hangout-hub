export interface Location {
    name: string;
    address: string;
    coordinates: [longitude: number, latitude: number];
  
    getName(): string;
    getAddress(): string;
    getCoordinates(): [longitude: number, latitude: number];
}