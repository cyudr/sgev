import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import stationsHandler from './api/stations.ts';
import batchHandler from './api/batch.ts';
import geospatialHandler from './api/geospatial.ts';
import statusHandler from './api/status.ts';
import healthHandler from './api/health.ts';
import apiIndexHandler from './api/index.ts';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        // 1. Returns electric vehicle charging points in Singapore and their availabilities by Postal Code
        if (url === '/api/stations' || url === '/api/stations/' || url === '/api/ev/stations') {
          return stationsHandler(req, res);
        }
        // 2. Returns all electric vehicle charging points in Singapore and their availabilities in a single file
        if (url === '/api/batch' || url === '/api/batch/' || url === '/api/ev/batch') {
          return batchHandler(req, res);
        }
        // 3. Returns the SHP files of the requested geospatial layer
        if (url === '/api/geospatial' || url === '/api/geospatial/' || url === '/api/ev/geospatial') {
          return geospatialHandler(req, res);
        }
        // 4. API connection status
        if (url === '/api/status' || url === '/api/status/' || url === '/api/ev/status') {
          return statusHandler(req, res);
        }
        // 5. Operational health report
        if (
          url === '/api/health' ||
          url === '/api/health/' ||
          url === '/health' ||
          url === '/health/' ||
          url === '/healthcheck' ||
          url === '/health-check' ||
          url === '/api/health.json' ||
          url.endsWith('/api/health') ||
          url.endsWith('/api/health/') ||
          url.endsWith('/health') ||
          url.endsWith('/health/')
        ) {
          return healthHandler(req, res);
        }
        // Root API overview
        if (url === '/api' || url === '/api/') {
          return apiIndexHandler(req, res);
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  const rootDir = import.meta.dirname || path.resolve();
  return {
    plugins: [
      react(),
      tailwindcss(),
      apiDevServerPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        workbox: {
          navigateFallbackDenylist: [/^\/api/, /^\/health/, /api\/health/],
        },
        manifest: {
          id: '/',
          name: 'ChargeSG - Singapore EV Charging',
          short_name: 'ChargeSG',
          description: 'Real-time Singapore EV charging station finder with live bay availability and fast in-app navigation.',
          theme_color: '#006948',
          background_color: '#0d1c2f',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@/api': path.resolve(rootDir, 'api'),
        '@': path.resolve(rootDir, 'src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: false,
      watch: null,
    },
  };
});
