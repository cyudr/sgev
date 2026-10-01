import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import stationsHandler from './api/stations.ts';
import batchHandler from './api/batch.ts';
import geospatialHandler from './api/geospatial.ts';
import statusHandler from './api/status.ts';
import healthHandler from './api/health.ts';
import apiIndexHandler from './api/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// CORS & Headers Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/* ==========================================================================
   Raw JSON API Endpoints (Mounted on Express for both Dev & Production)
   ========================================================================== */

// 1. Health & Diagnostics: Raw JSON report showing API connection & health
app.all(['/api/health', '/api/health/', '/health', '/health/', '/healthcheck', '/health-check'], (req, res) => {
  return healthHandler(req, res);
});

// 2. Stations API by postal code
app.all(['/api/stations', '/api/stations/', '/api/ev/stations'], (req, res) => {
  return stationsHandler(req, res);
});

// 3. Batch API: all Singapore EV points
app.all(['/api/batch', '/api/batch/', '/api/ev/batch'], (req, res) => {
  return batchHandler(req, res);
});

// 4. Geospatial API
app.all(['/api/geospatial', '/api/geospatial/', '/api/ev/geospatial'], (req, res) => {
  return geospatialHandler(req, res);
});

// 5. Connection status
app.all(['/api/status', '/api/status/', '/api/ev/status'], (req, res) => {
  return statusHandler(req, res);
});

// 6. Root API catalog
app.all(['/api', '/api/'], (req, res) => {
  return apiIndexHandler(req, res);
});

/* ==========================================================================
   Vite & Static Server Setup
   ========================================================================== */

async function startServer() {
  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChargeSG server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
