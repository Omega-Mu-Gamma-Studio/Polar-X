# ❄️ What Is PolarX & Why It Exists

---

## The Problem

India operates three polar research stations:

| Station | Location | Est. | Capacity |
|---|---|---|---|
| Bharati | Antarctica | 2012 | 47 personnel |
| Maitri | Antarctica | 1989 | 25 personnel |
| Himadri | Svalbard, Arctic | 2008 | 12 personnel |

These stations are governed by the **Ministry of Earth Sciences (MoES)** and operated by **NCPOR** (National Centre for Polar and Ocean Research). Every gram of food, fuel, medicine, and equipment that reaches these stations has to be planned months in advance and shipped across some of the harshest terrain on earth.

Right now, the people coordinating this use **five separate tools** — spreadsheets, radio logs, manual inventory sheets, email chains, and whatever ERP fragment they've been handed. There is no unified view. A supply delay means 47 people at Bharati rationing meals. A missed equipment shipment grounds a research mission. An emergency with no automated escalation means someone is on a satellite phone trying to reach MoES HQ manually.

The evidence: **18 tons of cargo had to be airlifted via a Russian aircraft** because supply chain coordination broke down. That's the problem PolarX exists to solve.

---

## What PolarX Does

PolarX is a **centralized command center** for polar logistics. One platform. All three stations. Five pillars:

### 1. 📅 Mission Planning
Schedule expeditions, allocate resources, assign personnel, set timelines. Mission controllers at MoES HQ can see every upcoming and active mission across all three stations on one screen.

### 2. 📦 Cargo Tracking
Real-time shipment tracking from port of origin to research base. Logistics officers see exactly where a cargo vessel is, its ETA, what's in it, and whether it's on schedule. No more "the ship left Cape Town three weeks ago, we assume it's close."

### 3. 🗃 Inventory Management
Every station reports stock levels. The system flags items below threshold and those approaching expiry. A logistics officer in Chennai can see that Bharati has 12 days of fuel left without calling anyone.

### 4. 👥 Personnel Management
Who's at which station, doing what, until when. Qualifications on file. Rotation schedules tracked. Field team locations updated in real-time during active missions.

### 5. 🚨 Emergency Response
One-click alert activation. Pre-defined checklists load instantly. Evacuation routes surface on the map. Nearest available resources are flagged. MoES HQ is notified automatically. Target: full escalation in under 60 seconds.

---

## Who Uses It

**Logistics Officer (e.g. Raj at MoES HQ)**
Coordinating a supply shipment to Bharati. Opens the dashboard, sees the cargo vessel's current position on the map, checks the manifest, confirms ETA matches the station's fuel runway. Doesn't need to call anyone.

**Expedition Leader (e.g. Dr. Priya at Bharati)**
Leading a field team. A storm hits. Opens the emergency module, triggers an alert, gets a checklist, sees evacuation routes, knows MoES is already notified. Doesn't have to manage the escalation manually while also managing the crisis.

---

## What Makes It Different From an ERP

Standard ERPs aren't built for extreme environments. PolarX is different in three ways:

1. **Emergency-first design** — the emergency module isn't an afterthought. It's a first-class feature with automated escalation.
2. **Offline-capable** — connectivity in Antarctica is satellite-only and unreliable. Data syncs locally and uploads when connection is available.
3. **Polar-specific workflows** — rotation schedules, station capacity tracking, cargo routing for polar supply chains. Not generic "inventory management."

---

## How To Build It

This is the order that makes sense. Each phase produces something runnable before moving to the next.

---

### Phase 1 — Project Boots

**Goal:** `npm run dev` works. Client renders something. Server responds to a ping.

1. Fill `package.json` (root) with `concurrently` script:
   ```json
   "scripts": {
     "dev": "concurrently \"npm run dev --prefix client\" \"npm run dev --prefix server\"",
     "install": "npm install --prefix client && npm install --prefix server"
   }
   ```

2. Fill `client/package.json` — Vite + React 18 + React Router + Tailwind + all frontend deps from blueprint.

3. Fill `server/package.json` — Express + Sequelize + sqlite3 + socket.io + jwt + bcryptjs + cors + dotenv.

4. Fill `client/vite.config.js` — proxy `/api` and `/socket.io` to `localhost:5000` so there's no CORS issue in dev.

5. Fill `client/tailwind.config.js` — content paths, extend theme with polar color palette as named tokens.

6. Fill `client/src/styles/theme.css` — CSS variables for the five palette colors.

7. Fill `client/src/styles/globals.css` — `.polar-card` glassmorphism class, `.aurora-glow`, `.frost-particle`.

8. Fill `server/src/config/env.js` — read and validate process.env, throw on missing required vars, export typed config object.

9. Fill `server/server.js` — Express init, CORS, JSON middleware, mount routes, attach Socket.io, call `db.connect()`.

10. Fill `server/src/db/connection.js` — Sequelize instance, dialect from env (sqlite or postgres), sync.

**Checkpoint:** `npm run dev` → client shows blank page, server logs "DB connected, listening on 5000".

---

### Phase 2 — Models & DB

**Goal:** Database schema exists. `npm run migrate` and `npm run seed` work.

Order matters here — foreign keys require the referenced model to exist first.

1. `User.js` — id, name, email, passwordHash, role (admin | logistics | leader | field)
2. `Mission.js` — id, name, station, startDate, endDate, status, createdBy (FK → User)
3. `Shipment.js` — id, name, missionId (FK → Mission), origin, destination, locationLat, locationLng, status, eta
4. `Inventory.js` — id, station, name, quantity, threshold, expiryDate, lastRestocked
5. `Personnel.js` — id, name, role, station, qualifications (JSON), rotationStart, rotationEnd, locationLat, locationLng, userId (FK → User)
6. `Emergency.js` — id, triggeredBy (FK → User), type, locationLat, locationLng, timestamp, status, checklistCompleted (JSON)

Then:
- `db/migrate.js` — call `sequelize.sync({ force: true })` (dev only) or run migrations in order
- `db/seed.js` — insert mock data: 3 stations' worth of missions, shipments, inventory items, personnel

**Checkpoint:** `npm run seed` completes without error. You can open the SQLite file and see rows.

---

### Phase 3 — Auth

**Goal:** Login works. JWT protects routes.

1. `controllers/authController.js` — `register` (hash password, create User, return JWT), `login` (verify, return JWT)
2. `routes/auth.js` — POST `/api/auth/register`, POST `/api/auth/login`
3. `middleware/auth.js` — verify JWT from `Authorization: Bearer <token>`, attach `req.user`, call `next()`
4. `middleware/errorHandler.js` — catch-all: log error, return `{ error: message }` with correct status
5. `middleware/validate.js` — wrap express-validator, return 400 with field errors on failure

**Checkpoint:** `POST /api/auth/login` with seed credentials returns a JWT. `GET /api/missions` without JWT returns 401.

---

### Phase 4 — REST API

**Goal:** All endpoints from the blueprint respond with real data from the DB.

Wire each domain the same way: route → middleware (auth + validate) → controller → model → response.

```
routes/missions.js      →  controllers/missionController.js      →  models/Mission.js
routes/cargo.js         →  controllers/cargoController.js        →  models/Shipment.js
routes/inventory.js     →  controllers/inventoryController.js    →  models/Inventory.js
routes/personnel.js     →  controllers/personnelController.js    →  models/Personnel.js
routes/emergency.js     →  controllers/emergencyController.js    →  models/Emergency.js
```

Notable controller logic:
- `inventoryController` — `getAlerts()` returns items where `quantity <= threshold` or `expiryDate < 30 days out`
- `emergencyController` — `trigger()` creates Emergency record AND calls `io.emit('emergency:alert', payload)` — this is the one controller that touches the socket layer

**Checkpoint:** All 11 API endpoints return real data. Postman (or curl) confirms each one.

---

### Phase 5 — Frontend Shell

**Goal:** React app navigates between pages. Auth works end to end.

1. `context/AuthContext.jsx` — stores user + token in state + localStorage, exposes `login()`, `logout()`, `isAuthenticated`
2. `context/AppContext.jsx` — global state shape from blueprint, dispatch actions for each domain
3. `context/SocketContext.jsx` — connect socket on login (attach JWT as auth), disconnect on logout, expose socket instance
4. `services/api.js` — axios instance with `baseURL: /api`, request interceptor attaches JWT, response interceptor catches 401 → logout
5. `services/socket.js` — socket singleton, `connect(token)`, `disconnect()`, export
6. `hooks/useAuth.js` — consumes AuthContext
7. `hooks/useFetch.js` — wraps api.js, handles loading/error state, returns `{ data, loading, error, refetch }`
8. `hooks/useSocket.js` — consumes SocketContext, exposes `on(event, handler)` with auto-cleanup on unmount
9. `App.jsx` — wrap everything in providers, define routes:
   - `/` → Landing (public)
   - `/dashboard` → Dashboard (protected)
   - `/dashboard/cargo` → CargoMap (protected)
   - `/dashboard/inventory` → Inventory (protected)
   - `/dashboard/personnel` → Personnel (protected)
   - `/dashboard/emergency` → Emergency (protected)
   - `/dashboard/settings` → Settings (protected)

**Checkpoint:** Navigate to `/dashboard` without logging in → redirects to `/`. Log in → Dashboard renders. Logout → back to Landing.

---

### Phase 6 — Landing Page

**Goal:** The scroll-through landing page is complete.

1. `styles/globals.css` — `.frost-particle` keyframe animation (float upward, fade out)
2. `components/landing/Hero.jsx` — fullscreen polar background, frost particle layer (pure CSS, no JS), "Enter Command Center" CTA with aurora glow, Framer Motion fade-in on mount
3. `components/landing/ProblemSection.jsx` — three impact stats (18 tons airlifted, 47 crew at Bharati, 3 disconnected stations), counter animation on scroll-into-view via Intersection Observer
4. `components/landing/StationGallery.jsx` — three station cards (Bharati / Maitri / Himadri), auto-rotate on scroll via Intersection Observer
5. `pages/Landing.jsx` — stack the three sections, wire the CTA to navigate to `/dashboard`

**Checkpoint:** Landing page scrolls smoothly through all three sections. CTA lands on dashboard (login gate if not authenticated).

---

### Phase 7 — Dashboard Pages

**Goal:** All six dashboard pages show real data.

Start with shared layout:

1. `components/common/Sidebar.jsx` — nav links for all 6 sections, aurora glow on active link, polar theme
2. `components/common/Navbar.jsx` — search bar, notification bell (badge count from emergency alerts), user avatar + logout
3. `components/common/PolarCard.jsx` — glassmorphism wrapper, accepts `title` + `children`
4. `components/common/StatusBadge.jsx` — `active` (green) / `inactive` (grey) / `alert` (red) variants
5. `components/common/LoadingSpinner.jsx` — polar-themed spinner for async states

Then pages:

6. `pages/Dashboard.jsx` + `components/dashboard/StationCard.jsx` — three station cards (status, personnel count, supply days, active missions), `CargoMap` widget, `InventoryWidget`, `PersonnelWidget`
7. `pages/CargoMap.jsx` + `components/dashboard/CargoMap.jsx` — full-page Leaflet map, animated markers for in-transit shipments, station markers, popup on click
8. `pages/Inventory.jsx` — table of all inventory items, highlight low-stock rows, filter by station
9. `pages/Personnel.jsx` — table of all personnel, filter by station/status, show location
10. `pages/Emergency.jsx` — active alert list, trigger button (opens confirmation modal), checklist view
11. `pages/Settings.jsx` — placeholder for now; user profile info

**Checkpoint:** Every page loads real data from the API. No hardcoded values anywhere except `utils/constants.js`.

---

### Phase 8 — Real-time

**Goal:** Cargo updates, emergency alerts, and personnel locations update live without refresh.

1. `socket/index.js` — register all handlers on the `io` instance, export `initSocket(io)` called from `server.js`
2. `socket/cargoHandlers.js` — on `cargo:subscribe`, join room `cargo:${shipmentId}`; on location update from server, `io.to(room).emit('cargo:update', payload)`
3. `socket/emergencyHandlers.js` — on `emergency:trigger`, `io.emit('emergency:alert', payload)` to all connected clients
4. `socket/personnelHandlers.js` — on `personnel:location`, `io.to('personnel').emit('personnel:location', payload)`
5. Client `useSocket.js` hook — in Dashboard, subscribe to `cargo:update`, `emergency:alert`, `personnel:location`, `inventory:low` — dispatch to AppContext on receive

**Checkpoint:** Open two browser tabs. Trigger an emergency in tab 1 — alert appears in tab 2 without refresh.

---

### Phase 9 — Polish

Before calling it demo-ready:

- [ ] All pages responsive on tablet (1024px)
- [ ] Loading spinner shown on every async operation
- [ ] Empty states (no shipments, no alerts) look intentional, not broken
- [ ] Error states handled — API down → user sees a message, not a white screen
- [ ] `utils/constants.js` has all magic strings (API base, socket events, station names, color tokens)
- [ ] `utils/helpers.js` has: `formatDate()`, `calcSupplyDays(quantity, dailyUsage)`, `getStatusColor(status)`, `haversineDistance(lat1, lng1, lat2, lng2)`
- [ ] No console errors in production build (`npm run build` completes clean)

---

## Key Decisions & Constraints

**For the SIH demo specifically:**
The briefing doc says "mock everything for demo — no real backend needed." That's the PPT. PolarX the app is being built to actually run. The seed data provides the mock data; the backend is real. This means if selected, there's a working codebase to build on — not a prototype to throw away.

**Tech finalized (per briefing + blueprint):**
- Frontend: React 18 + Vite (not TypeScript — keeping it plain JSX for hackathon speed)
- Backend: Node.js + Express (not FastAPI — team is JS-first)
- DB: SQLite locally → PostgreSQL + PostGIS in prod
- Maps: Leaflet (no API key needed for prototype)
- Auth: JWT

**The AI/ML angle:**
The briefing mentions "supply forecasting + weather route optimization" — mention as planned feature. For the demo, this can be a mock AI response on the dashboard (a "Predicted Stock-Out" card with hardcoded forecast data styled to look live).

---

## Constants Reference

```js
// utils/constants.js — fill these in during Phase 5

export const STATIONS = ['Bharati', 'Maitri', 'Himadri'];

export const STATION_COORDS = {
  Bharati: { lat: -69.41, lng: 76.19 },
  Maitri:  { lat: -70.77, lng: 11.73 },
  Himadri: { lat: 78.92,  lng: 11.93 },
};

export const SOCKET_EVENTS = {
  CARGO_UPDATE:       'cargo:update',
  CARGO_SUBSCRIBE:    'cargo:subscribe',
  EMERGENCY_ALERT:    'emergency:alert',
  EMERGENCY_TRIGGER:  'emergency:trigger',
  PERSONNEL_LOCATION: 'personnel:location',
  INVENTORY_LOW:      'inventory:low',
};

export const SUPPLY_ALERT_DAYS = 30; // flag if < 30 days runway
export const LOW_STOCK_THRESHOLD_MULTIPLIER = 1.2; // alert at 1.2x threshold
```

---

*POLARX.md — internal build reference · SIH 2026 · Confidential*