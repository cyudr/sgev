import { sendJson } from './response.ts';

export * from './types.ts';
export * from './client.ts';

/**
 * ChargeSG API Gateway
 * Exposes strictly the 3 LTA DataMall API connections:
 * 1. /api/stations  -> EVChargingPoints (by Postal Code)
 * 2. /api/batch     -> EVCBatch (single file all EV points)
 * 3. /api/geospatial -> GeospatialWholeIsland (SHP layer files)
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

  return sendJson(res, 200, {
    service: 'ChargeSG LTA DataMall API Gateway',
    version: '6.10',
    documentation: 'LTA DataMall API User Guide (1 Oct 2026)',
    endpoints: {
      stations: {
        path: '/api/stations',
        description: 'Returns electric vehicle charging points in Singapore and their availabilities by Postal Code',
        upstream: 'https://datamall2.mytransport.sg/ltaodataservice/EVChargingPoints',
        mandatoryParameter: 'PostalCode (e.g. 151129)',
      },
      batch: {
        path: '/api/batch',
        description: 'Returns all electric vehicle charging points in Singapore and their availabilities in a single file',
        upstream: 'https://datamall2.mytransport.sg/ltaodataservice/EVCBatch',
      },
      geospatial: {
        path: '/api/geospatial',
        description: 'Returns the SHP files of the requested geospatial layer',
        upstream: 'https://datamall2.mytransport.sg/ltaodataservice/GeospatialWholeIsland',
        mandatoryParameter: 'ID (e.g. ArrowMarking, Carpark, etc.)',
      },
      status: {
        path: '/api/status',
        description: 'Connection and authentication state',
      },
      health: {
        path: '/api/health',
        description: 'Multi-point verification and operational health report',
      },
    },
    timestamp: new Date().toISOString(),
  });
}
