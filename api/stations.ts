import { getRealSingaporeEvStations, fetchEvChargingPointsByPostalCode } from './ltaFetch.ts';
import { sendJson } from './response.ts';

/**
 * Returns electric vehicle charging points in Singapore and their availabilities by Postal Code
 * Endpoint: /api/stations
 * Query Parameters:
 *   - PostalCode (or postalCode): 6-digit Singapore postal code (e.g. 151129)
 *   - $skip: pagination offset
 */
export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    if (res.setHeader) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');
    }
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  // Parse postal code from query (supports both PostalCode and postalCode)
  let postalCode = '';
  if (req.query?.PostalCode || req.query?.postalCode) {
    postalCode = String(req.query.PostalCode || req.query.postalCode).trim();
  } else if (req.url && req.url.includes('?')) {
    const urlObj = new URL(req.url, 'http://localhost');
    postalCode = urlObj.searchParams.get('PostalCode') || urlObj.searchParams.get('postalCode') || '';
  }

  try {
    if (postalCode) {
      const result = await fetchEvChargingPointsByPostalCode(postalCode);
      return sendJson(res, 200, {
        value: {
          evLocationsData: result.locations,
        },
        data: result.stations,
        count: result.stations.length,
        postalCode,
        source: result.source,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await getRealSingaporeEvStations();

    return sendJson(res, 200, {
      value: {
        evLocationsData: result.rawLocations,
      },
      data: result.stations,
      count: result.stations.length,
      source: result.source,
      message: result.message,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return sendJson(res, 500, {
      value: {
        evLocationsData: [],
      },
      data: [],
      count: 0,
      error: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  }
}
