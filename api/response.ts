/**
 * Safe JSON response helper that works across:
 * - Vercel Serverless Functions (VercelResponse)
 * - Raw Node.js http.ServerResponse (Vite dev server middlewares)
 * - Express Response objects
 */
export function sendJson(res: any, statusCode: number, data: any) {
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }

  if (typeof res.status === 'function') {
    res.status(statusCode);
    if (typeof res.json === 'function') {
      return res.json(data);
    }
  }

  res.statusCode = statusCode;
  if (typeof res.end === 'function') {
    res.end(JSON.stringify(data));
  }
}

export default async function handler(req: any, res: any) {
  if (typeof res.status === 'function') {
    return res.status(200).json({ status: 'ok', module: 'api-response' });
  }
  res.statusCode = 200;
  res.setHeader?.('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'ok', module: 'api-response' }));
}
