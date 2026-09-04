# PolarX — Architecture Notes

> This file explains *why* things are structured the way they are.  
> README covers *what*. This covers *why*.

---

## Why SQLite locally, PostgreSQL in prod

The blueprint calls for PostgreSQL + PostGIS. That's the right final answer — PostGIS gives proper geospatial queries for cargo tracking (distance, routing, bounding boxes on polar coordinates). But PostgreSQL requires a running server, credentials, and setup that slows down a first `npm run dev` to zero.

Sequelize is dialect-agnostic. The models are written once. Swapping the database is purely a `.env` change:

```
DB_DIALECT=sqlite  →  DB_DIALECT=postgres
```

For the hackathon demo, SQLite means anyone can clone and run. PostGIS features (geospatial queries) can be stubbed with in-memory mock coordinates until the switch.

---

## Why a single `npm run dev` from root

The blueprint's setup instructions use two terminals. That's friction — especially during a hackathon demo where someone needs to spin this up fast. `concurrently` in the root `package.json` runs both Vite (client) and Express (server) in one command. The root `package.json` also runs `npm install` in both `client/` and `server/` via a postinstall script, so there's only one install step too.

---

## Why three Context providers (App, Auth, Socket)

Splitting them keeps re-render scope tight.

- **AuthContext** — only auth state (user, token). Components that just need to know if the user is logged in don't re-render when cargo data changes.
- **SocketContext** — manages the socket connection lifecycle (connect on login, disconnect on logout). Separate because the socket depends on the JWT from AuthContext, and it needs to re-initialize when auth state changes.
- **AppContext** — everything else (missions, cargo, inventory, personnel, emergency). This is the broad state that most dashboard components consume.

If all three were merged, a cargo update would re-render the login button.

---

## Why axios instance in `services/api.js` instead of raw fetch

Two reasons: interceptors and base URL.

The request interceptor attaches the JWT from localStorage to every outgoing request automatically. The response interceptor catches 401s globally and redirects to login — no per-component auth error handling needed.

`useFetch` hook wraps this instance, so all data fetching goes through one pipe.

---

## Why Socket.io over raw WebSockets

Socket.io handles reconnection, room-based broadcasting, and event namespacing out of the box. For PolarX specifically:

- **Rooms** let us broadcast cargo updates only to users tracking a specific shipment, not all connected clients.
- **Emergency alerts** use a broadcast to all clients — Socket.io's `io.emit()` makes this one line.
- **Reconnection** matters for a polar logistics demo — the premise is unreliable comms. Socket.io auto-reconnects with exponential backoff.

---

## Why separate `socket/` handlers instead of everything in `server.js`

`server.js` is the entry point — it should only wire things together, not contain business logic. Each handler file (`cargoHandlers.js`, `emergencyHandlers.js`, `personnelHandlers.js`) registers its own events on the `io` instance. `socket/index.js` imports them all and calls them in sequence. This means adding a new real-time feature is additive — new file, one new import — not a surgery on `server.js`.

---

## Why controllers separate from routes

Routes declare the HTTP surface (`GET /api/cargo/shipments → cargoController.getAll`). Controllers hold the business logic. This split means:

1. You can unit test controller functions without spinning up Express.
2. Routes stay readable — they're just a mapping table.
3. Same controller function can be called from both a REST route and a socket handler (e.g., triggering an emergency from either HTTP or a socket event).

---

## Why `config/env.js` instead of raw `process.env` everywhere

`env.js` validates and exports all environment variables at startup. If a required var is missing, the server throws immediately with a clear message instead of failing silently mid-request. It also provides defaults for optional vars, so the rest of the codebase never has to do `process.env.X || 'default'` inline.

---

## Why Framer Motion for landing, not pure CSS

The `StationGallery` and scroll transitions need JS-driven animation triggers (Intersection Observer). Framer Motion's `whileInView` handles this with less boilerplate than managing `IntersectionObserver` instances manually. The rest of the landing (frost particles, aurora glow) is pure CSS — Framer Motion is only pulled in where the animation logic needs to respond to scroll state.

---

## Why React-Leaflet over Mapbox

Mapbox requires an API key. Leaflet uses OSM tiles — no key, no rate limit, works offline (tiles are cached). For a hackathon demo this removes one external dependency that can fail. If Mapbox visuals are needed for the final presentation, swapping the tile layer is a one-line change in `CargoMap.jsx`.

---

## Real-time Data Flow

```
User action (e.g. cargo status update)
  → REST POST to Express
  → Controller updates DB
  → Controller calls io.emit / io.to(room).emit
  → Socket.io broadcasts to relevant clients
  → SocketContext receives event
  → AppContext state updated via dispatch
  → Dashboard components re-render
```

REST handles writes. Socket.io handles read propagation. This avoids polling and keeps the state consistent across multiple open browser sessions.

---

## PostgreSQL Migration Path (when ready)

1. Install PostgreSQL + PostGIS locally (or use a cloud instance)
2. Update `.env`: flip dialect, add connection vars
3. `npm run migrate` — Sequelize runs the same migration files against Postgres
4. `npm run seed` — same seed data
5. Update `Shipment` model to use `GEOMETRY` type for `location` field (currently stored as JSON lat/lng pair for SQLite compatibility)
6. Update cargo tracking queries in `cargoController.js` to use PostGIS functions (`ST_DWithin`, `ST_Distance`) instead of the JS-side haversine stub

Steps 1–4 require no code changes. Steps 5–6 are the only model-level changes, and they're isolated to one model and one controller.

---

*ARCHITECTURE.md — internal reference for PolarX development*