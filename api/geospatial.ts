import { fetchGeospatialWholeIsland } from './ltaFetch.ts';
import { sendJson } from './response.ts';

/**
 * Section 2.22: Returns the SHP files of the requested geospatial layer
 * URL: https://datamall2.mytransport.sg/ltaodataservice/GeospatialWholeIsland (and GeospatialWholeIsla)
 * Endpoint: /api/geospatial
 * Query Parameters:
 *   - ID (or layer): Name of Geospatial Layer per ANNEX E (e.g. ArrowMarking, Carpark, etc.) - Mandatory
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

  let layerId = 'ArrowMarking';
  if (req.query?.ID || req.query?.layer) {
    layerId = String(req.query.ID || req.query.layer).trim();
  } else if (req.url && req.url.includes('?')) {
    const urlObj = new URL(req.url, 'http://localhost');
    layerId = urlObj.searchParams.get('ID') || urlObj.searchParams.get('layer') || 'ArrowMarking';
  }

  try {
    const data = await fetchGeospatialWholeIsland(layerId);
    return sendJson(res, 200, {
      'odata.metadata': data?.['odata.metadata'] || 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#GeospatialWholeIsland',
      value: data?.value || [],
    });
  } catch (err: any) {
    return sendJson(res, 502, {
      'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#GeospatialWholeIsland',
      value: [],
      error: err.message || `Failed to retrieve geospatial layer "${layerId}" from LTA DataMall`,
      timestamp: new Date().toISOString(),
    });
  }
}
