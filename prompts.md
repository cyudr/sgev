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
   - Added a container behind the floating search bar and filter chips to substantially improve contrast and visibility over map tiles.
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
- **Commit**: `da9518d`

---

### Prompt 14: Smooth Slide-Up Transition for Station Details & White-Based Search Container
> *"1. the swipe up gesture to expose details of station card should have a smooth animation instead of abrupt change to details page; 2. change the search card contain in explore page to white based"*

#### Requirements & Implementations:
1. **Smooth Slide-Up Transition & Sheet Animation (`App.tsx`, `StationDetails.tsx`)**:
   - Replaced abrupt view switching with an overlay sheet animated with `transition-all duration-300 ease-out will-change-transform`.
   - Slides smoothly from `translate-y-full` to `translate-y-0` when swiping up on the station card or tapping Details.
   - Retains the underlying `InteractiveMap` mounted in the DOM, eliminating map re-initialization flickers and preserving zoom, camera position, and active markers.
   - Added interactive top grab handle pill in `StationDetails.tsx` with downward swipe gesture (`deltaY > 55px`) to smoothly slide the details sheet back down.
2. **White-Based Search & Filter Container (`InteractiveMap.tsx`)**:
   - Updated the 30% opacity backdrop container behind the explore search bar and filter chips to a white-frosted glass design:
     `bg-white/30 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-lg border border-white/40`.

---

### Prompt 15: Launch Page Redesign Inspired by Courier Hero Layout in Singapore Emerald Theme
> *"Improve the launch page with reference to the attached UI, keeping my current color scheme"*

#### Requirements & Implementations:
1. **Curved Hero Image Composition (`UrgencyLaunchScreen.tsx`)**:
   - Created organic curved arched graphic frame (`rounded-[2.5rem] rounded-tr-[5rem] rounded-bl-[1.5rem]`) displaying a cinematic Singapore expressway perspective with light trails and electric vehicles.
   - Added a floating emerald teardrop map pin marker (`#006948` to `#004f35` with pulsing neon `#85f8c4` core) on the top-left of the photo, mirroring the reference design.
   - Added soft radial atmospheric gradient aura and live LTA DataMall pill badge overlay.
2. **Brand Header & Tagline (`UrgencyLaunchScreen.tsx`)**:
   - Left: ChargeSG bolt squircle emblem + `ChargeSG` title + `SG 🇸🇬` badge + tagline `any EV, anywhere, anytime`.
   - Right: Quick-access action pill button + one-click PWA installation trigger.
3. **Typography & Content Hierarchy (`UrgencyLaunchScreen.tsx`)**:
   - Overline category: `SINGAPORE EV CHARGING SERVICES` (uppercase, bold, tracking-widest, `#006948`).
   - Main punchy headline: `Charge anything, anywhere, anytime` (crisp, bold, `#0d1c2f`).
   - Supportive copy: `When every kilowatt counts, trust us to find live available chargers, lowest tariffs, and fastest routes instantly.`
4. **Interactive Criteria Selection & Active Station Card (`UrgencyLaunchScreen.tsx`)**:
   - Interactive segment pills: `[ 📍 Nearest ]  [ 💰 Cheapest ]  [ ⚡ Fastest ]`.
   - Dynamic station recommendation card with live metrics, distance, drive time, free bay count, and tariff/speed.
5. **Dual Pill Action Buttons (`UrgencyLaunchScreen.tsx`)**:
   - Primary filled pill CTA: **"TAKE ME THERE NOW!!"** (`bg-gradient-to-r from-[#006948] to-[#00855d] text-white shadow-lg shadow-[#006948]/25 rounded-full py-3.5 px-6 font-black`).
   - Secondary clean outlined pill CTA: **"Show me around (Explore)"** (`rounded-full border border-slate-300 text-slate-800 py-3 px-6 font-bold hover:bg-slate-50`).
6. **Unified Bottom Navigation Strip (`App.tsx`)**:
   - Restyled bottom navigation bar on launch screen to clean white glass (`bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]`) matching the elevated light aesthetic with emerald active highlights.

---

### Prompt 16: Minimalist Urgency Redesign & Mobile Viewport Locking

> **User Prompt**:
> 1. make the launch page more minimalistic, remove all the descriptive words in launch page, have it with just asking for urgency; 2. lock scrolling for launch page and explore page; 3. change opacity for search container in explore to 50%; 4. remove the "menu" option at the top right of the launch page; 5. in the launch page, give nearest, cheapest and fastest different colors; push when done

#### Implementation Details:
1. **Minimalist Launch Page (`UrgencyLaunchScreen.tsx`)**:
   - Removed all secondary descriptive text, subtitles, and decorative blurbs from the launch screen.
   - Refocused the screen exclusively onto the core urgency prompt: **"How urgent is your charge?"**.
   - Removed the top-right "menu" button, retaining only the clean one-click PWA install action.
2. **Distinct Color Identity for Criteria Selectors**:
   - **Nearest**: Emerald Green (`bg-[#006948]` active / soft emerald tint inactive, matching proximity and route efficiency).
   - **Cheapest**: Amber Gold (`bg-[#d97706]` active / soft amber tint inactive, matching price savings).
   - **Fastest**: Electric Sky Blue (`bg-[#0284c7]` active / soft sky tint inactive, matching high-power DC charging).
   - Dynamically synchronized the primary CTA "TAKE ME THERE NOW!!", the floating teardrop pin, and the active station recommendation card to the selected criteria's theme color.
3. **Viewport Scroll Locking**:
   - Locked all scrolling on both the Launch screen and Explore map (`overscroll-none touch-none overflow-hidden max-h-[100dvh] select-none`).
4. **Explore Search Bar 50% Opacity**:
   - Updated the top floating search container in `InteractiveMap.tsx` from `bg-white/30` to `bg-white/50 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/60 shadow-lg`.

---

### Prompt 17: Ubiquitous ChargeSG Brand Icon Propagation

> **User Prompt**:
> 1. propagate the ChargeSG icon in all pages

#### Implementation Details:
1. **Centralized Brand Component (`ChargeSGLogo.tsx`)**:
   - Created a modular `ChargeSGLogo` component featuring the signature squircle emerald gradient tile (`#006948` to `#004f35`), neon mint bolt glyph (`#85f8c4`), bold typography, and optional `SG 🇸🇬` country badge.
2. **Propagated Brand Presence Across All Views & Modals**:
   - **Global Header (`Header.tsx`)**: Displays `ChargeSGLogo` on every screen, retaining the back arrow seamlessly when navigating deeper views.
   - **Launch Screen (`UrgencyLaunchScreen.tsx`)**: Prominently features `ChargeSGLogo` in the minimal top bar.
   - **Emergency Routing View (`NearestRoutingPage.tsx`)**: Embedded in the turn-by-turn header.
   - **Station Details View (`StationDetails.tsx`)**: Embedded in the top context bar.
   - **Live Charging Session Modal (`ChargingSessionModal.tsx`)**: Embedded in the live charging header.
   - **QR Scanner Modal (`QRScannerModal.tsx`)**: Embedded above the camera viewfinder.
   - **Bay Reservation Modal (`ReservationModal.tsx`)**: Embedded in the reservation header.
   - **Port Selector Modal (`PortSelectorModal.tsx`)**: Embedded in the connector chooser header.
   - **Saved & Activity Tabs (`SavedTab.tsx`, `ActivityTab.tsx`)**: Displayed proudly alongside tab headings.

---

### Prompt 18: Custom Green Color Themes (Light Mint vs Dark Emerald)

> **User Prompt**:
> 1. allow user preference in color theme, have light and dark (but all different shades of green), default is light

#### Implementation Details:
1. **Theme Architecture (`ThemeContext.tsx`)**:
   - Built a custom `ThemeProvider` and `useGreenTheme` hook supporting `'light'` and `'dark'` themes.
   - Persisted user preference to `localStorage` under `chargesg_color_theme` with instant fallback to **Light mode as default**.
   - Dynamically syncs the `data-theme` attribute and `dark` class to `document.documentElement`.
2. **All Shades of Green Color Palette**:
   - **Light Mint (Default)**:
     - Backgrounds: Pristine sage white (`#f4faf7`, `#eaf5ef`).
     - Surfaces: Pure white with soft mint borders (`#d8efe4`).
     - Accents: Singapore Emerald (`#006948`), deep pine (`#004f35`), and mint (`#85f8c4`).
     - Typography: High-contrast pine forest (`#0d1c2f` / `#0a291e`).
   - **Dark Emerald**:
     - Backgrounds: Deep midnight evergreen (`#06150f`, `#0c231a`, `#040e0a`).
     - Surfaces: Layered forest greens (`#0a2118`, `#0e291f`, `#143b2c`) with emerald borders (`#1b4434`).
     - Accents: Luminous electric charging mint (`#85f8c4`) and neon emerald (`#00a86b`).
     - Typography: Crisp ice mint (`#f0fbf6`) and soft sage (`#a5d8c3`).
3. **Dual Access Points for Theme Switching**:
   - **One-Click Quick Toggle**: Added in the top navigation bar (`Header.tsx` & `UrgencyLaunchScreen.tsx`) for instant toggling anywhere in the app.
   - **Profile Settings Card (`ProfileTab.tsx`)**: Added a dedicated "Color Theme Preference" section with selectable cards for "Light Mint (Default)" and "Dark Emerald".

---

### Prompt 19: Time-Based Auto Theme Toggling & Top Bar Cleanup

> **User Prompt**:
> 1. detect time and auto toggle theme between light and dark; 2. in the explore, save, activity and profile pages, remove the theme toggle and the back arrow in the top bar

#### Implementation Details:
1. **Time Detection & Auto Theme Toggling (`ThemeContext.tsx`)**:
   - Implemented real-time hour detection (`new Date().getHours()`):
     - **Daytime (7:00 AM – 6:59 PM / 07:00–18:59)**: Resolves to **Light Mint** theme.
     - **Nighttime (7:00 PM – 6:59 AM / 19:00–06:59)**: Resolves to **Dark Emerald** theme.
   - Built a dynamic scheduler that monitors local time every 10 seconds and automatically transitions the theme at the 7:00 AM/PM thresholds.
   - Enhanced user preferences in `ProfileTab.tsx` with three distinct mode options:
     - **Auto (Time-based)** (Default & Recommended): Automatically syncs with the day/night cycle, displaying live local time status (e.g. `21:23 (Nighttime · Dark)`).
     - **Always Light**: Forced Light Mint theme.
     - **Always Dark**: Forced Dark Emerald theme.
2. **Top Bar Cleanup on Primary Navigation Pages (`Header.tsx`)**:
   - **Back Arrow Removed**: On Explore (`map`), Saved (`saved`), Activity (`activity`), and Profile (`profile`), the back arrow `<` is removed since these are primary root tabs accessible via the bottom navigation dock. (The back arrow is retained solely on the station details sheet `details` to navigate back to the map).
   - **Theme Toggle Removed**: Removed the manual sun/moon toggle button from the top bar across Explore, Save, Activity, and Profile pages, eliminating visual clutter in favor of seamless time-based auto-theming.

---

### Prompt 20: "nearest!" CTA in Explore, Flag Icon Cleanup & Top Bar Optimization

> **User Prompt**:
> 1. in explore, change take me there to "nearest!", remove the "SG" in the flag icon; 2. optimize and declutter the top bar

#### Implementation Details:
1. **"nearest!" Action Button (`Header.tsx`)**:
   - Changed the prominent urgent button in Explore from "TAKE ME THERE NOW!!" / "Take Me There" to punchy, bold **"nearest!"** with a pulsing lightning bolt glyph.
   - Styled with high-contrast urgent badge styling (`bg-[#ffdad6] dark:bg-[#3b1219] text-[#ba1a1a] dark:text-[#ffb4ab] border border-[#ba1a1a]/25`) ensuring instant visual clarity.
2. **Flag Icon Cleanup (`ChargeSGLogo.tsx`)**:
   - Removed the redundant "SG" text next to the flag emoji.
   - Now renders the clean Singapore flag `🇸🇬` alongside the ChargeSG wordmark across all views and modals.
3. **Top Bar Decluttering & Optimization (`Header.tsx`)**:
   - Removed redundant duplicate profile "EV" avatar button (Profile is already directly accessible from the bottom navigation dock).
   - Removed dummy static notifications bell icon and popover toast.
   - Removed manual refresh API button from the top header to maximize screen space for mobile viewports.
   - Kept the top bar ultra-clean, balanced, and responsive with just the `ChargeSGLogo` (left) and the `nearest!` button plus install trigger (right).

---

### Prompt 21: Top-Right Theme Toggle Restoration & Launch Pin Removal

> **User Prompt**:
> 1. bring back the theme toggle to the top right of the top bar; 2. remove the green map pin from (or near) the center picture in the launch page

#### Implementation Details:
1. **Top-Right Theme Toggle Restoration**:
   - Restored the quick-toggle button (`light_mode` / `dark_mode`) to the top right of the header across all application screens in `Header.tsx`.
   - Restored the matching top-right theme toggle button in `UrgencyLaunchScreen.tsx` beside the install button.
   - Users can now instantaneously toggle between Light Mint and Dark Emerald directly from the top-right corner of any screen, complementing automatic time detection.
2. **Removed Map Pin Marker from Launch Center Picture (`UrgencyLaunchScreen.tsx`)**:
   - Removed the floating teardrop pin marker from the top-left edge of the organic highway picture container.
   - The central visual is now completely clean, unobtrusive, and beautifully framed with organic curvature and soft ambient glow.

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
