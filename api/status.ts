import { resolveAccountKey } from './ltaFetch.ts';
import { sendJson } from './response.ts';

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

  const accountKey = resolveAccountKey();
  const hasKey = !!accountKey && accountKey !== 'MY_LTA_ACCOUNT_KEY';

  return sendJson(res, 200, {
    success: true,
    data: {
      hasKey,
      service: 'LTA DataMall Singapore (v3/EVChargingPoints & Geospatial)',
      status: hasKey ? 'connected' : 'unconfigured',
      lastSync: new Date().toISOString(),
    },
  });
}
