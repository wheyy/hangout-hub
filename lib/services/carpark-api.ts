
// Carpark API service for fetching carpark availability and static info (coords/address)
import { ParkingSpot, ParkingType } from "@/lib/models/parkingspot";
import { svy21ToWgs84 } from "svy21";

export interface CarparkAvailability {
	carpark_number: string;
	total_lots: number;
	lots_available: number;
	lot_type: string;
}

export interface CarparkInfo {
	carpark_number: string;
	address: string;
	coordinates: [number, number];
	type: ParkingType;
	short_term_parking?: string;
	free_parking?: string;
	night_parking?: string;
	car_park_decks?: string;
	gantry_height?: string;
	car_park_basement?: string;
	source?: "hdb" | "commercial"; // distinguish HDB vs commercial/mall carparks
	weekday_rate_1?: string;
	weekday_rate_2?: string;
	saturday_rate?: string;
	sunday_publicholiday_rate?: string;
}

// In-memory cache of HDB carpark info (coords + address)
let carparkInfoList: CarparkInfo[] = [];
let carparkInfoLoadedAt: number | null = null;
const HOUR_MS = 60 * 60 * 1000;

// Map HDB car park type string to enum
function mapHdbTypeToEnum(typeStr: string | undefined): ParkingType {
	const t = (typeStr || "").toLowerCase();
	if (t.includes("multi") || t.includes("covered")) return ParkingType.MSCP;
	if (t.includes("surface") || t.includes("outdoor")) return ParkingType.OutdoorParking;
	return ParkingType.MSCP;
}

// Fetch HDB carpark geoinfo from data.gov.sg CKAN datastore (requires resource_id)
// Set NEXT_PUBLIC_HDB_CARPARK_RESOURCE_ID in your env, pointing to the HDB Carpark Information resource.
// Expected fields: car_park_no, address, x_coord (SVY21 Easting), y_coord (SVY21 Northing), car_park_type
async function fetchHdbCarparkInfoAll(): Promise<CarparkInfo[]> {
	const resourceId = process.env.NEXT_PUBLIC_HDB_CARPARK_RESOURCE_ID;
	if (!resourceId) {
		console.warn("HDB resource_id is not set (NEXT_PUBLIC_HDB_CARPARK_RESOURCE_ID). Carpark info will be empty.");
		return [];
	}

	const limit = 5000; // fetch in big pages (dataset is ~2000+)
	let offset = 0;
	const all: CarparkInfo[] = [];

	while (true) {
		const url = new URL("https://data.gov.sg/api/action/datastore_search");
		url.searchParams.set("resource_id", resourceId);
		url.searchParams.set("limit", String(limit));
		url.searchParams.set("offset", String(offset));

		const res = await fetch(url.toString());
		if (!res.ok) {
			console.error("Failed to fetch HDB carpark info:", res.status, res.statusText);
			break;
		}
		const data = await res.json();
		const records: any[] = data?.result?.records || [];

		for (const r of records) {
			const num = (r.car_park_no || r.carpark_number || "").toString().trim();
			const address = (r.address || "").toString().trim();
			const x = Number(r.x_coord ?? r.x);
			const y = Number(r.y_coord ?? r.y);
			if (!num || !address || Number.isNaN(x) || Number.isNaN(y)) continue;

			// svy21ToWgs84 expects (northing, easting) and returns [lat, lng]
			const [lat, lng] = svy21ToWgs84(y, x);
			const typeEnum = mapHdbTypeToEnum(r.car_park_type);
			all.push({
				carpark_number: num,
				address,
				coordinates: [lng, lat],
				type: typeEnum,
				short_term_parking: r.short_term_parking || r.short_term_parking_charges,
				free_parking: r.free_parking,
				night_parking: r.night_parking,
				car_park_decks: r.car_park_decks,
				gantry_height: r.gantry_height,
				car_park_basement: r.car_park_basement,
			});
		}

		if (records.length < limit) break;
		offset += limit;
	}

	// Deduplicate by carpark_number (some datasets have multiple rows per car park)
	const map = new Map<string, CarparkInfo>();
	for (const cp of all) {
		if (!map.has(cp.carpark_number)) {
			map.set(cp.carpark_number, cp);
		}
	}
	return Array.from(map.values());
}

export async function ensureCarparkInfoLoaded(force = false): Promise<CarparkInfo[]> {
	const stale = carparkInfoLoadedAt && Date.now() - carparkInfoLoadedAt > HOUR_MS;
	if (!force && carparkInfoList.length > 0 && !stale) return carparkInfoList;
	carparkInfoList = await fetchHdbCarparkInfoAll();
	carparkInfoLoadedAt = Date.now();
	return carparkInfoList;
}

export async function fetchCarparkAvailability(): Promise<CarparkAvailability[]> {
	const res = await fetch("https://api.data.gov.sg/v1/transport/carpark-availability");
	const data = await res.json();
	if (!data.items || !data.items[0] || !data.items[0].carpark_data) return [];
	return data.items[0].carpark_data.map((cp: any) => ({
		carpark_number: cp.carpark_number,
		total_lots: cp.carpark_info[0]?.total_lots ? parseInt(cp.carpark_info[0].total_lots) : 0,
		lots_available: cp.carpark_info[0]?.lots_available ? parseInt(cp.carpark_info[0].lots_available) : 0,
		lot_type: cp.carpark_info[0]?.lot_type || "C",
	}));
}

export async function getCarparksWithinRadiusAsync(
	center: [number, number],
	radius: number
): Promise<CarparkInfo[]> {
	const list = await ensureCarparkInfoLoaded();
	// Filter carparks within radius (meters)
	return list.filter((cp) => {
		const dist = getDistanceMeters(center, cp.coordinates);
		return dist <= radius;
	});
}

function getDistanceMeters(a: [number, number], b: [number, number]): number {
	// Haversine formula
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const R = 6371000;
	const dLat = toRad(b[1] - a[1]);
	const dLon = toRad(b[0] - a[0]);
	const lat1 = toRad(a[1]);
	const lat2 = toRad(b[1]);
	const aVal =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
	return R * c;
}
