import { LtaEvLocation, Station } from './types.ts';
import { adaptLtaLocationToStation } from './adapter.ts';

// In-memory cache for live requests
let cachedStations: Station[] = [];
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function getCachedStationState() {
  return {
    active: cachedStations.length > 0,
    itemsCount: cachedStations.length,
    ageSeconds: lastCacheTime ? Math.round((Date.now() - lastCacheTime) / 1000) : 0,
  };
}

/**
 * Resolves the LTA_ACCOUNT_KEY from environment variables.
 * The API key is strictly and exclusively named "LTA_ACCOUNT_KEY".
 */
export function resolveAccountKey(): string {
  const envKey = process.env.LTA_ACCOUNT_KEY || '';
  if (envKey && envKey !== 'MY_LTA_ACCOUNT_KEY') {
    return envKey.trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

/**
 * Normalizes and extracts EV location records from authentic LTA DataMall payload:
 * Standard payload format: { "value": { "evLocationsData": [ ... ] } }
 */
export function extractLocationsFromLta(data: any): LtaEvLocation[] {
  if (!data) return [];
  if (data.value && Array.isArray(data.value.evLocationsData)) {
    return data.value.evLocationsData;
  }
  if (Array.isArray(data.evLocationsData)) {
    return data.evLocationsData;
  }
  if (Array.isArray(data.value)) {
    if (data.value[0] && Array.isArray(data.value[0].evLocationsData)) {
      return data.value[0].evLocationsData;
    }
    return data.value;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

/**
 * Helper to make authenticated calls to LTA DataMall Singapore.
 * Transmits the AccountKey header using the LTA_ACCOUNT_KEY environment variable.
 */
export async function fetchFromLta<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accountKey = resolveAccountKey();

  if (!accountKey || accountKey === 'MY_LTA_ACCOUNT_KEY') {
    throw new Error('LTA_ACCOUNT_KEY environment variable is not configured.');
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `https://datamall2.mytransport.sg/ltaodataservice/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    'AccountKey': accountKey,
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // Allow longer timeout (15s) for upstream LTA DataMall

  try {
    const resp = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    if (!resp.ok) {
      throw new Error(`LTA DataMall HTTP ${resp.status} ${resp.statusText}`);
    }

    return (await resp.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Documentation Section 2.28 (Page 50):
 * URL: https://datamall2.mytransport.sg/ltaodataservice/EVChargingPoints
 * Description: Returns electric vehicle charging points in Singapore and their availabilities by Postal Code.
 * Mandatory Request Parameter: PostalCode
 */
export async function fetchEvChargingPointsByPostalCode(postalCode?: string): Promise<{
  raw: any;
  locations: LtaEvLocation[];
  stations: Station[];
  source: 'lta-live' | 'empty';
}> {
  const queryParam = postalCode ? `PostalCode=${encodeURIComponent(postalCode.trim())}` : '';
  const endpoint = queryParam ? `EVChargingPoints?${queryParam}` : 'EVChargingPoints';

  let raw: any;
  try {
    raw = await fetchFromLta(endpoint);
  } catch (err: any) {
    // Try v3/EVChargingPoints fallback if standard 404s
    const altEndpoint = queryParam ? `v3/EVChargingPoints?${queryParam}` : 'v3/EVChargingPoints';
    raw = await fetchFromLta(altEndpoint);
  }

  const locations = extractLocationsFromLta(raw);
  const stations = locations.map((loc, idx) => adaptLtaLocationToStation(loc, idx));

  return {
    raw,
    locations,
    stations,
    source: stations.length > 0 ? 'lta-live' : 'empty',
  };
}

/**
 * Documentation Section 2.29 (Page 53):
 * URL: https://datamall2.mytransport.sg/ltaodataservice/EVCBatch
 * Description: Returns all electric vehicle charging points in Singapore and their availabilities in a single file.
 */
export async function fetchEvcBatch(): Promise<any> {
  try {
    return await fetchFromLta('EVCBatch');
  } catch {
    // Fallback to lowercase evcBatch if upstream casing differs
    return await fetchFromLta('evcBatch');
  }
}

/**
 * Documentation Section 2.22 (Page 44):
 * URL: https://datamall2.mytransport.sg/ltaodataservice/GeospatialWholeIsland
 * Description: Returns the SHP files of the requested geospatial layer
 * Request Parameter: ID (Mandatory: Yes, e.g. ArrowMarking, Carpark, etc.)
 */
export async function fetchGeospatialWholeIsland(layer: string = 'ArrowMarking'): Promise<any> {
  try {
    return await fetchFromLta(`GeospatialWholeIsland?ID=${encodeURIComponent(layer)}`);
  } catch (err: any) {
    // Also support truncated endpoint URL if upstream expects GeospatialWholeIsla
    return await fetchFromLta(`GeospatialWholeIsla?ID=${encodeURIComponent(layer)}`);
  }
}

/**
 * Comprehensive fetch combining live locations across Singapore.
 * Uses live EVChargingPoints by postal code or EVCBatch single file.
 */
export async function getRealSingaporeEvStations(postalCode?: string): Promise<{
  stations: Station[];
  rawLocations: LtaEvLocation[];
  source: 'lta-live' | 'lta-batch' | 'cached' | 'empty';
  message?: string;
  error?: string;
}> {
  const accountKey = resolveAccountKey();

  if (!accountKey || accountKey === 'MY_LTA_ACCOUNT_KEY') {
    return {
      stations: [],
      rawLocations: [],
      source: 'empty',
      error: 'LTA_ACCOUNT_KEY_REQUIRED',
      message: 'Please provide the LTA_ACCOUNT_KEY environment variable to stream real-time Singapore EV data.',
    };
  }

  // If specific PostalCode requested, fetch directly via EVChargingPoints?PostalCode={PostalCode}
  if (postalCode) {
    try {
      const res = await fetchEvChargingPointsByPostalCode(postalCode);
      return {
        stations: res.stations,
        rawLocations: res.locations,
        source: res.source,
      };
    } catch (err: any) {
      return {
        stations: [],
        rawLocations: [],
        source: 'empty',
        error: err.message,
        message: `Failed to fetch charging points for postal code ${postalCode}: ${err.message}`,
      };
    }
  }

  const now = Date.now();
  if (cachedStations.length > 0 && now - lastCacheTime < CACHE_TTL_MS) {
    return {
      stations: cachedStations,
      rawLocations: [],
      source: 'cached',
    };
  }

  let rawLocations: LtaEvLocation[] = [];
  let source: 'lta-live' | 'lta-batch' = 'lta-live';
  let lastErrorMsg = '';

  // 1. Try single file EVCBatch first for complete island-wide coverage (Doc p.53 Section 2.29)
  try {
    const batchMeta: any = await fetchEvcBatch();
    const downloadLink = batchMeta?.value?.[0]?.Link;
    if (downloadLink) {
      const s3Response = await fetch(downloadLink);
      if (s3Response.ok) {
        const batchJson: any = await s3Response.json();
        rawLocations = extractLocationsFromLta(batchJson);
        if (rawLocations.length > 0) {
          source = 'lta-batch';
        }
      }
    }
  } catch (batchErr: any) {
    lastErrorMsg = `EVCBatch notice: ${batchErr.message}`;
  }

  // 2. If EVCBatch not available, query EVChargingPoints directly
  if (rawLocations.length === 0) {
    try {
      let skip = 0;
      let hasMore = true;
      while (hasMore && skip < 5000) {
        const endpoint = skip === 0 ? 'EVChargingPoints' : `EVChargingPoints?$skip=${skip}`;
        const liveResponse: any = await fetchFromLta(endpoint);
        const page = extractLocationsFromLta(liveResponse);
        if (page.length > 0) {
          rawLocations.push(...page);
          if (page.length < 500) {
            hasMore = false;
          } else {
            skip += 500;
          }
        } else {
          hasMore = false;
        }
      }
    } catch (err: any) {
      lastErrorMsg = `${lastErrorMsg} | EVChargingPoints notice: ${err.message}`;
    }
  }

  if (rawLocations.length === 0) {
    return {
      stations: [],
      rawLocations: [],
      source: 'empty',
      error: lastErrorMsg || 'NO_EV_LOCATIONS',
      message: lastErrorMsg
        ? `LTA DataMall connection notice: ${lastErrorMsg}`
        : 'LTA DataMall returned 0 EV locations.',
    };
  }

  const stations: Station[] = rawLocations.map((loc, idx) => adaptLtaLocationToStation(loc, idx));
  cachedStations = stations;
  lastCacheTime = now;

  return {
    stations,
    rawLocations,
    source,
  };
}

export default async function handler(req: any, res: any) {
  if (typeof res.status === 'function') {
    return res.status(200).json({ status: 'ok', module: 'api-lta-fetch' });
  }
  res.statusCode = 200;
  res.setHeader?.('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'ok', module: 'api-lta-fetch' }));
}
