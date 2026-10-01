import { fetchEvcBatch } from './ltaFetch.ts';
import { sendJson } from './response.ts';

/**
 * Section 2.29: Returns all electric vehicle charging points in Singapore and their availabilities in a single file
 * URL: https://datamall2.mytransport.sg/ltaodataservice/EVCBatch
 * Endpoint: /api/batch
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

  try {
    const data = await fetchEvcBatch();
    return sendJson(res, 200, {
      'odata.metadata': data?.['odata.metadata'] || 'https://datamall2.mytransport.sg/ltaodataservice/$metadata#EVCBatch',
      value: data?.value || [],
    });
  } catch (err: any) {
    return sendJson(res, 502, {
      'odata.metadata': 'https://datamall2.mytransport.sg/ltaodataservice/$metadata#EVCBatch',
      value: [],
      error: err.message || 'Failed to retrieve EVCBatch metadata from LTA DataMall',
      timestamp: new Date().toISOString(),
    });
  }
}
