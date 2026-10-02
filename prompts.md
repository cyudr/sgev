# ChargeSG Development Prompts & Evolution Log (`prompts.md`)

This document collates all user prompts, architectural specifications, iterative refinements, and key implementations for **ChargeSG** — Singapore's Progressive Web App (PWA) for real-time electric vehicle (EV) charging point discovery, smart nearest-station routing, live status monitoring, and driver vehicle preferences.

---

## Chronological Prompts & Implementation Record

### Prompt 1: Viewport Centering & Initial Launch Page Layout
> *"Bring launch page objects and text to center of viewport"*

#### Requirements & Implementations:
- **Vertical & Horizontal Centering**: Balanced the hero launch screen elements within a flexbox viewport container (`min-h-screen`, `justify-center`, `items-center`).
- **Visual Balance**: Positioned the primary urgency battery icon, title, ETA badges, and navigation triggers centrally on mobile and desktop viewports.
- **Commit**: `76c2a96`

---

### Prompt 2: PWA Install Elevation, Low-Battery Urgency, and Filter Simplification
> *"Bring Install popup to front with portal, reword to FIND NEAREST NOW!!, remove DC fast filter, link ChargeSG and low battery icon"*

#### Requirements & Implementations:
- **React Portal for Install Dialog**: Rendered `PWAInstallButton` and install banners via `createPortal` to document body with `z-[9999]` so modals and map layers cannot clip or obscure it.
- **Action Copy**: Updated the main emergency CTA to **"FIND NEAREST NOW!!"**.
- **Header & Icon Navigation**: Linked the ChargeSG brand text and the pulsing low-battery indicator back to the launch/emergency view.
- **Filter Clean-up**: Streamlined redundant filters to keep initial discovery fast and uncluttered.
- **Commit**: `6c2d856`

---

### Prompt 3: Hero Redesign, ETA Prominence, and Bottom Location Card
> *"Centralize launch page objects, replace awaiting message with friendly text, add prominent route time estimate, and move navigate button to bottom location card"*

#### Requirements & Implementations:
- **Friendly Status Copy**: Replaced technical data messages with driver-friendly availability copy.
- **Prominent Route Time Estimate**: Added bold drive-time badges (e.g., `⚡ ~3 mins (1.2 km)`) directly to the nearest station preview.
- **Bottom Location Card**: Moved the direct navigation trigger into an elevated location card docked at the bottom of the viewport.
- **Commit**: `2e4621d`

---

### Prompt 4: Desktop Responsive Scaling
> *"Scale and fill desktop screens seamlessly across all views and navigation"*

#### Requirements & Implementations:
- **Full Viewport Adaptation**: Removed rigid mobile wrapper constraints on larger screens (`sm:`, `md:`, `lg:`, `xl:` breakpoints).
- **Split-View Desktop Map & List**: Adapted `InteractiveMap.tsx` and `NearestRoutingPage.tsx` to fill widescreen monitors with expansive map canvasses and balanced floating toolbars.
- **Commit**: `6c5eb3e`

---

### Prompt 5: Card Elevation & Server-Side Health Verification
> *"Elevate location card above bottom strip and restore raw JSON health reporting with Express routing"*

#### Requirements & Implementations:
- **Z-Index Layering**: Elevated the nearest station location card above the bottom dock and background cards.
- **Raw JSON Health Endpoint**: Fixed `/api/health` so that automated synthetic monitors and curl requests receive pure JSON with correct MIME type `application/json; charset=utf-8`.
- **Commit**: `6d93f76`

---

### Prompt 6: Unified Urgent Card
> *"Merge nearest point and urgency cards into single card reworded as TAKE ME THERE NOW!!"*

#### Requirements & Implementations:
- **Single High-Contrast Card**: Consolidated the distance metric, nearest hub name, availability pill, and drive-time into one primary actionable card.
- **Hero CTA**: Reworded button to high-urgency **"TAKE ME THERE NOW!!"**.
- **Commit**: `739504a`

---

### Prompt 7: Text Truncation & Card Metrics De-duplication
> *"Fix nearest location text overflow and remove duplicated metrics from cards"*

#### Requirements & Implementations:
- **Text Truncation**: Added `truncate` and `line-clamp` rules so long Singapore carpark / building names (e.g., multi-storey HDB addresses) never push CTAs out of view.
- **De-duplication**: Cleared repeated power ratings and operator tags across nested cards.
- **Commit**: `35d21ce`

---

### Prompt 8: Development Environment WebSocket & HMR Stability
> *"Fix [vite] error by disabling HMR WebSocket in iframe preview and suppressing dev worker collisions"*

#### Requirements & Implementations:
- **Vite Config Hardening**: Configured `server.hmr = false` and disabled WebSocket retry loops inside cloud sandboxes / iframe containers.
- **Worker Clean-up**: Prevented duplicate service worker registration crashes in development mode.
- **Commit**: `b92523b`

---

### Prompt 9: Themed Bottom Strip, Camera QR Scanner, and Tariff Distinctions
> *"Add themed bottom strip to Launch page, adjust items upward, enable real camera QR scanner, elevate modals to topmost layer, and distinguish Live vs Nominal tariffs"*

#### Requirements & Implementations:
- **Themed Bottom Strip**: Added an emerald-tinted dock at the bottom of the Launch view matching the overall Singapore green aesthetic.
- **Real Camera QR Scanner**: Implemented browser `getUserMedia` video stream with fallback canvas scanning for hardware camera QR code scanning at charging bays.
- **Tariff Differentiation**: Clearly distinguished between dynamic operator pricing (Live Published Tariff) and standard nominal estimates.
- **Topmost Modals**: Enforced `z-[200]` and `z-[300]` on all bottom sheets, QR dialogs, and charging modals.
- **Commit**: `fb2e27d`

---

### Prompt 10: Strict Raw JSON API & Service Worker Bypass
> *"Fix /api/health to strictly return raw JSON across all environments, disable service worker fallback on API routes, and add client-side JSON renderer"*

#### Requirements & Implementations:
- **Direct Express & Vercel API Handlers**: Built dedicated, zero-dependency endpoints at `/api/health.ts` and `server.ts` returning raw JSON for `/api/health`, `/api/stations`, `/api/batch`, and `/api/status`.
- **Service Worker Bypass**: Added strict network-only exclusion for all `/api/*` paths in `sw.js` to prevent HTML SPA catch-all fallbacks.
- **Client Route Guard**: Added raw JSON view fallback in `index.html` / `App.tsx` if a client browser navigates directly to `/api/health`.
- **Commit**: `a0c7e68`

---

### Prompt 11: Mobile Swipe-Back, History Navigation & Explore Filters
> *"Mobile users should detect as mobile, allow right swipe to go back or default back button to go back. In 'show me around' explore mode, add plug type in filter and preferred based on saved preference in profile, reduce the icon of chargesg in header"*

#### Requirements & Implementations:
- **Mobile Device Detection (`useMobileNavigation.ts`)**: Accurately detects mobile viewports, touch pointers (`navigator.maxTouchPoints > 0`), and mobile user-agent strings.
- **Swipe-Back Gesture**: Listened to horizontal touch events (`deltaX > 65px`, `deltaY < 50px`, originating near screen edge) to trigger intuitive rightward swipe back.
- **Browser History Integration**: Connected modal states (`pushNavState` / `popstate`) so clicking the Android/browser back button closes modals or returns to the previous view instead of exiting the web application.
- **Explore Plug Filters (`InteractiveMap.tsx`)**: Added plug standard chips (`CCS2 (DC)`, `Type 2 (AC)`, `CHAdeMO`) and a persistent **`⭐ Preferred ({plug})`** filter.
- **Driver Profile Connector Preferences (`ProfileTab.tsx`)**: Added vehicle connector selection with cookie persistence and instant reactive event synchronization.
- **Header Icon Refinement (`Header.tsx`)**: Scaled down the ChargeSG bolt emblem to a compact size (`w-5.5 h-5.5`).
- **Commit**: `0ca7fe5`

---

### Prompt 12: Filter Ordering, Subtitle Clean-up & Tab Scrolling
> *"1. Move the available now filter selection to beside all, then preferred, and the rest; 2. remove the "Singapore EV charging" below "ChargeSG in show me around; 3. Allow scrolling in saved, activity and profile"*

#### Requirements & Implementations:
1. **Filter Order (`InteractiveMap.tsx`)**:
   - Reordered top horizontal chips to:
     `All` ➔ `Available Now` (with pulsing indicator) ➔ `Preferred ({plug})` ➔ `CCS2 (DC)` ➔ `Type 2 (AC)` ➔ `CHAdeMO` ➔ `SP Mobility` ➔ `CDG ENGIE`.
2. **Header Subtitle Clean-up (`Header.tsx`)**:
   - Removed `"Singapore EV Charging"` text under `"ChargeSG"` in Explore view for a minimal, clean brand header.
3. **Scrollable Tab Views (`src/App.tsx`, `SavedTab.tsx`, `ActivityTab.tsx`, `ProfileTab.tsx`)**:
   - Wrapped the Saved, Activity, and Profile views in `<div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain">`.
   - Increased bottom padding (`pb-32 sm:pb-36`) so all content and cards remain fully visible and scrollable above the bottom navigation dock.
- **Commit**: `0b4437a`

---

### Prompt 13: Front Page Modes (Cheapest/Fastest), Bluetooth EV Telematics, 30% Opacity Search Container, Multi-filter AND Logic & Station Detail Swipe-up Exploration
> *"1. add also "Cheapest" and "Fastest" to front page, along with "Nearest", have it as an option, also add these to filters after "Preferred" in explore; 2. enable "bluetooth" connection to EV's API under profile, to auto detect fetch data from the EV to populate the profile; 3. add a container behind the search and filter card in the explore page to increase visibility, set opacity to 30%; 4. allow multiple filter selection, use AND logic for this; 5. in explore, allow swiping up gesture to explore the details of particular stations, also add restaurant, place of interest, amenities in the detail exploration; push when done"*

#### Requirements & Implementations:
1. **Front Page Criteria Selector (`UrgencyLaunchScreen.tsx`, `App.tsx`)**:
   - Added interactive option selector on the launch page: `[ 📍 Nearest ]  [ 💰 Cheapest ]  [ ⚡ Fastest ]`.
   - Dynamic recommendation card updates in real-time with customized metrics:
     - **Nearest**: Closest available charging point with drive time and distance.
     - **Cheapest**: Lowest published/nominal tariff ($/kWh).
     - **Fastest**: Maximum charging speed (up to 150kW DC).
   - "TAKE ME THERE NOW!!" launches route directly to the active choice.
2. **Bluetooth EV Telematics API (`ProfileTab.tsx`)**:
   - Implemented Web Bluetooth API (`navigator.bluetooth`) integration with BLE GATT / OBD-II dongle support and graceful simulation fallback.
   - Automatically detects and reads: Vehicle Model, Car Plate, Battery State of Charge (SoC %), Remaining Range (km), Battery Capacity (kWh), and Preferred Plug Standard.
   - Auto-populates Driver Profile inputs, persists to cookies, and broadcasts updates instantly across the app.
3. **30% Opacity Container Behind Explore Search & Filters (`InteractiveMap.tsx`)**:
   - Added a container behind the floating search bar and filter chips with `bg-slate-900/30 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-xl border border-white/20` to substantially improve contrast and visibility over map tiles.
4. **Multiple Filter Selection with AND Logic (`InteractiveMap.tsx`)**:
   - Replaced single-select state with multi-select `selectedFilters: string[]`.
   - Multiple active filters combine strictly with **AND logic** (e.g. `Available Now` AND `Fastest` AND `CCS2`).
   - Added `Cheapest` and `Fastest` filter chips positioned directly after `Preferred`.
5. **Swipe-up Gesture & Station Detail Exploration (`InteractiveMap.tsx`, `StationDetails.tsx`)**:
   - Implemented touch swipe-up gesture (`deltaY > 35px`) and visual pull handle on the bottom place card to open full details.
   - Added comprehensive Singapore exploration sections:
     - **Nearby Restaurants & Dining**: Walking distance, cuisine, hours, ratings (e.g. Din Tai Fung, Ya Kun Kaya Toast, Kopitiam, Starbucks, Shake Shack).
     - **Places of Interest (POI) & Retail**: Supermarkets (NTUC FairPrice, Don Don Donki), Shopping Mall retail, IMAX Cinema, Sky Park.
     - **Driver Amenities & Services**: Restrooms, free 1-hour parking with charging, high-pressure tire air & water, touchless car wash, Wi-Fi lounge, 24/7 security.

---

## Architecture Summary

| Component | Responsibility |
|---|---|
| `src/App.tsx` | Root navigation controller, state machine, tab routing, modal management, and mobile history stack. |
| `src/components/LaunchUrgencyPage.tsx` | Emergency low-battery launch view, nearest hub estimation, "TAKE ME THERE NOW!!", and Explore button. |
| `src/components/NearestRoutingPage.tsx` | Emergency navigation view with interactive Google Maps route preview, turnkey bay selector, and reservations. |
| `src/components/InteractiveMap.tsx` | Explore map view with Google Maps tiles, live station markers, cluster zoom, and ordered filter chips. |
| `src/components/Header.tsx` | Compact application header with status indicator, PWA install trigger, and brand logo. |
| `src/components/SavedTab.tsx` | Saved favourite station cards with real-time status and quick details. |
| `src/components/ActivityTab.tsx` | Active charging session monitor and past receipt history with CO₂ savings. |
| `src/components/ProfileTab.tsx` | Vehicle specification and preferred plug standard selector with instant cookie persistence. |
| `src/hooks/useMobileNavigation.ts` | Mobile device detection, touch swipe-back gesture recognizer, and browser history popstate handling. |
| `api/health.ts` & `server.ts` | Ultra-fast raw JSON health check and LTA DataMall proxy routes. |

---

*Generated and maintained as part of the ChargeSG project documentation.*
