export type { Station, Connector, ChargingBay, Review } from '../src/types/charging.ts';

export interface LtaEvId {
  id?: string;
  evCpId: string;
  status: string | number; // 0 = Occupied, 1 = Available, "" = Not Available
}

export interface LtaPlugType {
  plugType: string; // e.g. "Type 2", "CCS2"
  powerRating: string; // "AC" or "DC"
  chargingSpeed: string | number; // Unit: kW, e.g. 7.4, 22, 50, 120
  price: string | number; // Charging price, including VAT, e.g. 0.70
  priceType: string; // "$/h" or "$/kWh"
  evIds?: LtaEvId[];
}

export interface LtaChargingPoint {
  id?: string;
  name?: string;
  operator?: string;
  position?: string;
  operationHours?: string;
  operatingHours?: string;
  status?: string | number; // 0 = Occupied, 1 = Available, 100 = Not Available
  plugTypes: LtaPlugType[];
}

export interface LtaEvLocation {
  locationId: string; // e.g. 123456123456
  name: string;
  address: string;
  longtitude?: number; // Official LTA DataMall documentation spelling (p.50 S/N 4)
  longitude?: number;
  latitude: number;
  status?: string;
  chargingPoints: LtaChargingPoint[];
}

/**
 * Connection 1 (Section 2.28): Returns electric vehicle charging points in Singapore and their availabilities by Postal Code
 * URL: https://datamall2.mytransport.sg/ltaodataservice/EVChargingPoints
 */
export interface LtaEvChargingPointsResponse {
  'odata.metadata'?: string;
  value: {
    evLocationsData: LtaEvLocation[];
  } | LtaEvLocation[];
}

/**
 * Connection 2 (Section 2.29): Returns all electric vehicle charging points in Singapore and their availabilities in a single file
 * URL: https://datamall2.mytransport.sg/ltaodataservice/EVCBatch
 */
export interface LtaBatchResponse {
  'odata.metadata'?: string;
  value: Array<{
    Link: string;
  }>;
}

/**
 * Connection 3 (Section 2.22): Returns the SHP files of the requested geospatial layer
 * URL: https://datamall2.mytransport.sg/ltaodataservice/GeospatialWholeIsland
 */
export interface LtaGeospatialResponse {
  'odata.metadata'?: string;
  value: Array<{
    Link: string;
  }>;
}

export interface ApiStatus {
  hasKey: boolean;
  service: string;
  status: 'connected' | 'unconfigured' | 'offline';
  lastSync?: string;
}

export type { HealthCheckReport, EndpointCheck } from './health.ts';

export interface StationResult {
  stations: import('../src/types/charging.ts').Station[];
  source: 'lta-live' | 'lta-batch' | 'cached' | 'empty';
  message?: string;
  timestamp: string;
  count: number;
}

export default async function handler(req: any, res: any) {
  if (typeof res.status === 'function') {
    return res.status(200).json({ status: 'ok', schema: 'api-types' });
  }
  res.statusCode = 200;
  res.setHeader?.('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'ok', schema: 'api-types' }));
}
