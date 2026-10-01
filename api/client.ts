import { useState, useEffect, useCallback } from 'react';
import { Station } from '../src/types/charging.ts';
import { StationResult } from './types.ts';

function getClientHeaders(): Record<string, string> {
  return {
    Accept: 'application/json',
  };
}

/**
 * Fetch wrapper with configurable generous timeout (default 15,000ms / 15 seconds)
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Connection 1: Returns electric vehicle charging points in Singapore and their availabilities by Postal Code.
 * Endpoint: /api/stations
 * Upstream: https://datamall2.mytransport.sg/ltaodataservice/EVChargingPoints
 */
export async function fetchEvStations(postalCode?: string, timeoutMs: number = 15000): Promise<StationResult> {
  try {
    const url = postalCode ? `/api/stations?PostalCode=${encodeURIComponent(postalCode.trim())}` : '/api/stations';
    const res = await fetchWithTimeout(url, {
      headers: getClientHeaders(),
    }, timeoutMs);

    if (!res.ok) {
      throw new Error(`Failed to fetch stations: HTTP ${res.status}`);
    }

    const json = await res.json();
    const stations = Array.isArray(json.data) ? json.data : [];

    return {
      stations,
      source: json.source || (stations.length > 0 ? 'lta-live' : 'empty'),
      message: json.message || json.error,
      timestamp: json.timestamp || new Date().toISOString(),
      count: stations.length,
    };
  } catch (err: any) {
    return {
      stations: [],
      source: 'empty',
      message: err.message || 'Network error connecting to /api/stations',
      timestamp: new Date().toISOString(),
      count: 0,
    };
  }
}

/**
 * Connection 2: Returns all electric vehicle charging points in Singapore and their availabilities in a single file.
 * Endpoint: /api/batch
 * Upstream: https://datamall2.mytransport.sg/ltaodataservice/EVCBatch
 */
export async function fetchEvBatch(timeoutMs: number = 15000): Promise<any> {
  const res = await fetchWithTimeout('/api/batch', {
    headers: getClientHeaders(),
  }, timeoutMs);
  return res.json();
}

/**
 * Connection 3: Returns the SHP files of the requested geospatial layer.
 * Endpoint: /api/geospatial
 * Upstream: https://datamall2.mytransport.sg/ltaodataservice/GeospatialWholeIsland
 */
export async function fetchGeospatialLayer(layer: string = 'ArrowMarking', timeoutMs: number = 15000): Promise<any> {
  const res = await fetchWithTimeout(`/api/geospatial?ID=${encodeURIComponent(layer)}`, {
    headers: getClientHeaders(),
  }, timeoutMs);
  return res.json();
}

/**
 * Fetches real-time API health & LTA DataMall connection status
 */
export async function fetchApiHealth(timeoutMs: number = 15000): Promise<any> {
  try {
    const res = await fetchWithTimeout('/api/health', {
      headers: getClientHeaders(),
    }, timeoutMs);
    if (!res.ok) {
      throw new Error(`Health probe HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: 'offline',
      api_status: 'offline',
      error: err.message,
    };
  }
}

/**
 * Fetches basic API status directly from /api/status
 */
export async function fetchApiStatus(timeoutMs: number = 15000): Promise<any> {
  try {
    const res = await fetchWithTimeout('/api/status', {
      headers: getClientHeaders(),
    }, timeoutMs);
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * React hook to consume live EV station data from the API connections
 */
export function useEvStations(postalCode?: string) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'lta-live' | 'lta-batch' | 'cached' | 'empty'>('empty');
  const [apiStatus, setApiStatus] = useState<any | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stationResult = await fetchEvStations(postalCode);
      const health = await fetchApiHealth();

      setStations(stationResult.stations);
      setDataSource(stationResult.source);
      setApiStatus(health?.apiStatus || null);
      setLastRefreshed(new Date());

      if (stationResult.stations.length === 0 && stationResult.message) {
        setError(stationResult.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync with LTA DataMall API');
      setStations([]);
      setDataSource('empty');
    } finally {
      setLoading(false);
    }
  }, [postalCode]);

  useEffect(() => {
    refresh();

    // Auto-sync every 60 seconds
    const interval = setInterval(() => {
      refresh();
    }, 60000);

    return () => clearInterval(interval);
  }, [refresh]);

  return {
    stations,
    loading,
    error,
    dataSource,
    apiStatus,
    lastRefreshed,
    refresh,
  };
}

export default async function handler(req: any, res: any) {
  if (typeof res.status === 'function') {
    return res.status(200).json({ status: 'ok', module: 'api-client' });
  }
  res.statusCode = 200;
  res.setHeader?.('Content-Type', 'application/json');
  res.end(JSON.stringify({ status: 'ok', module: 'api-client' }));
}
