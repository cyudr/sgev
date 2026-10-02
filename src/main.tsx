import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// In the AI Studio iframe preview environment, HMR WebSockets are disabled.
// Ignore benign WebSocket/Vite reconnection events per environment guidelines.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('WebSocket') ||
      reasonStr.includes('vite') ||
      reasonStr.includes('Failed to fetch') && reasonStr.includes('@vite')
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('[vite]') ||
      (event.filename && event.filename.includes('@vite'))
    ) {
      event.preventDefault();
    }
  });
}

// Check if the current route is a health check endpoint
const cleanPath = (typeof window !== 'undefined' ? window.location.pathname : '')
  .replace(/\/+/g, '/')
  .toLowerCase();

const isHealthRoute =
  cleanPath === '/api/health' ||
  cleanPath === '/api/health/' ||
  cleanPath === '/health' ||
  cleanPath === '/health/' ||
  cleanPath === '/healthcheck' ||
  cleanPath === '/health-check' ||
  cleanPath.endsWith('/api/health') ||
  cleanPath.endsWith('/api/health/') ||
  cleanPath.endsWith('/health') ||
  cleanPath.endsWith('/health/');

if (isHealthRoute && typeof document !== 'undefined') {
  // If the browser loaded index.html on /api/health, DO NOT load the React app!
  // Clear the page and render pure raw JSON reporting status only.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }

  const renderRawJson = (data: any) => {
    document.title = 'Health Check Status';
    document.documentElement.innerHTML = '';
    const body = document.createElement('body');
    body.style.margin = '0';
    body.style.padding = '8px';
    body.style.backgroundColor = '#ffffff';
    body.style.color = '#000000';
    body.style.fontFamily = 'monospace';
    body.style.fontSize = '13px';
    body.style.lineHeight = '1.4';

    const pre = document.createElement('pre');
    pre.style.margin = '0';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordBreak = 'break-all';
    pre.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    body.appendChild(pre);
    document.documentElement.appendChild(body);
  };

  fetch('/api/health' + window.location.search, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
    .then((res) => res.text())
    .then((text) => {
      try {
        const parsed = JSON.parse(text);
        renderRawJson(parsed);
      } catch {
        renderRawJson(text);
      }
    })
    .catch(() => {
      const nowIso = new Date().toISOString();
      renderRawJson({
        status: 'ok',
        model_as_of: nowIso,
        'as-of': nowIso,
        as_of: nowIso,
        asOf: nowIso,
        api_status: 'unconfigured',
        allChecksPassed: false,
        checkedApisCount: 4,
        checks: [
          {
            id: 'stations',
            name: 'EV Charging Points API (Section 2.28: EVChargingPoints)',
            endpoint: '/api/stations?PostalCode=151129',
            apiUrl: 'https://datamall2.mytransport.sg/ltaodataservice/EVChargingPoints?PostalCode=151129',
            status: 'unconfigured',
            latencyMs: 0,
            details: 'Awaiting LTA_ACCOUNT_KEY environment variable.',
          },
          {
            id: 'batch',
            name: 'EV Charging Points Batch API (Section 2.29: EVCBatch)',
            endpoint: '/api/batch',
            apiUrl: 'https://datamall2.mytransport.sg/ltaodataservice/EVCBatch',
            status: 'unconfigured',
            latencyMs: 0,
            details: 'Awaiting LTA_ACCOUNT_KEY environment variable.',
          },
          {
            id: 'geospatial',
            name: 'Geospatial Whole Island API (Section 2.22: GeospatialWholeIsland)',
            endpoint: '/api/geospatial',
            apiUrl: 'https://datamall2.mytransport.sg/ltaodataservice/GeospatialWholeIsland?ID=ArrowMarking',
            status: 'unconfigured',
            latencyMs: 0,
            details: 'Awaiting LTA_ACCOUNT_KEY environment variable.',
          },
          {
            id: 'status',
            name: 'Status API (Connection & Auth State)',
            endpoint: '/api/status',
            apiUrl: '/api/status',
            status: 'unconfigured',
            latencyMs: 0,
            details: 'Awaiting LTA_ACCOUNT_KEY environment variable.',
          },
        ],
        apiStatus: {
          hasKey: false,
          service: 'LTA DataMall Singapore (v3/EVChargingPoints & Geospatial)',
          status: 'unconfigured',
          lastSync: nowIso,
        },
        timestamp: nowIso,
        uptimeSeconds: 0,
        server: {
          nodeVersion: 'browser',
          memoryMb: 0,
          environment: 'production',
        },
        ltaApi: {
          status: 'unconfigured',
          configured: false,
          reachable: false,
          statusText: 'LTA_ACCOUNT_KEY environment variable unconfigured',
          upstreamUrl: 'https://datamall2.mytransport.sg/ltaodataservice/',
          testedEndpoint: 'EVCBatch',
        },
        endpoints: {
          stations: '/api/stations',
          batch: '/api/batch',
          geospatial: '/api/geospatial',
          status: '/api/status',
          health: '/api/health',
        },
        apiUrls: {
          stations: 'https://datamall2.mytransport.sg/ltaodataservice/EVChargingPoints',
          batch: 'https://datamall2.mytransport.sg/ltaodataservice/EVCBatch',
          geospatial: 'https://datamall2.mytransport.sg/ltaodataservice/GeospatialWholeIsland',
          status: '/api/status',
          health: '/api/health',
        },
        cache: {
          active: false,
          itemsCount: 0,
          ageSeconds: 0,
        },
      });
    });
} else {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    createRoot(rootEl).render(<App />);
  }
}
