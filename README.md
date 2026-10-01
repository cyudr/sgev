# ChargeSG - Singapore EV Charging Network

Live electric vehicle (EV) charging station finder, navigation, and diagnostics application connected to Land Transport Authority (LTA) DataMall Singapore.

## Environment Variables

The server connects to authentic Singapore EV data via:

```env
LTA_ACCOUNT_KEY="<your-lta-datamall-account-key>"
```

- **Variable Name:** `LTA_ACCOUNT_KEY`
- Provided securely via server-side environment variables or Vercel Environment Variables.
- Transmitted in the `AccountKey` header to upstream LTA DataMall APIs.

## Serverless & API Architecture (`api/`)

This project is built for seamless deployment on **Vercel**, **Netlify**, or standard Node runtimes.

- **No API routing from `server.ts`**: `server.ts` is strictly a static/Vite runner and performs no API routing.
- **Vercel Serverless Functions (`api/*.ts`)**: Every endpoint file in `api/` exports a standard `export default async function handler(req, res)`:
  - `GET /api` (`api/index.ts`): API index & metadata
  - `GET /api/stations` (`api/stations.ts`): Real-time Singapore EV Charging Points with OData `$skip` pagination
  - `GET /api/batch` (`api/batch.ts`): EV Charging Batch Dataset download & metadata
  - `GET /api/geospatial` (`api/geospatial.ts`): Whole-island geospatial layer
  - `GET /api/status` (`api/status.ts`): LTA DataMall connection & credential check
  - `GET /api/health` (`api/health.ts`): Sequential API evaluation with comprehensive health report
- **Underscored Shared Library (`api/_lib/`)**: Shared types, adapters, response helpers, and LTA proxy routines reside in `api/_lib/`. Because the directory starts with an underscore `_`, Vercel excludes them from being compiled as standalone endpoints, preventing function invocation failures.
- **Local Dev Server**: During local development, `vite.config.ts` mounts an internal `apiDevServerPlugin` to execute these handlers directly.
- **Client Data Layer**: React components import data hooks and utilities from `@/api` (mapped to `src/api/`).
