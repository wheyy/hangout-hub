export interface Location {
    name: string;
    address: string;
    coordinates: GeolocationCoordinates;
  
    getName(): string;
    getAddress(): string;
    getCoordinates(): GeolocationCoordinates;
}