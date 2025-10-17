declare module 'svy21' {
  /**
   * Convert SVY21 coordinates to WGS84 (latitude/longitude)
   * @param northing - The Northing coordinate (Y)
   * @param easting - The Easting coordinate (X)
   * @returns A tuple [latitude, longitude]
   */
  export function svy21ToWgs84(northing: number, easting: number): [number, number];

  /**
   * Convert WGS84 coordinates to SVY21
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns A tuple [Northing, Easting]
   */
  export function wgs84ToSvy21(lat: number, lng: number): [number, number];
}