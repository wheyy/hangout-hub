export interface Location {
    name: string;
    address: string;
    // coordinates: GeolocationCoordinates;
    coordinates: [number, number];
  
    getName(): string;
    getAddress(): string;
    // getCoordinates(): GeolocationCoordinates;
    getCoordinates(): [number, number];
}