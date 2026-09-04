# ❄️ POLARX — Polar Expedition Logistics & Asset Management

Full-stack web application for managing India's polar expedition logistics across three research stations:
**Bharati** (Antarctica, 2012), **Maitri** (Antarctica, 1989) and **Himadri** (Arctic, Svalbard, 2008).

> SIH 2026 · Problem ID 26062 · All **8 phases complete** — dark glass+clay design system,
> live Dashboard, Cargo tracking with maps, Inventory, Personnel, Emergency Response,
> a public Landing page, and JWT auth with real-time Socket.io updates.

## Tech Stack

| Layer     | Technology                                                        |
|-----------|-------------------------------------------------------------------|
| Frontend  | React 18 + TypeScript + Tailwind CSS (Vite)                       |
| Routing   | react-router-dom v6                                               |
| Maps      | react-leaflet + Leaflet.js (CARTO dark tiles, no API key needed)  |
| Charts    | Chart.js + react-chartjs-2 (reserved for later extension)         |
| Real-time | Socket.io (client + server)                                       |
| HTTP      | Axios with JWT request interceptor                                |
| Backend   | Node.js + Express                                                 |
| ORM       | Sequelize (schema created via `sequelize.sync()`)                 |
| Database  | PostgreSQL + PostGIS (geography columns, UUID PKs)                |
| Auth      | JWT (jsonwebtoken) + bcryptjs                                     |
| Validation| express-validator                                                 |

## Folder Structure

```
├── client/          # React + TS + Tailwind SPA
│   └── src/
│       ├── components/common/    # reusable UI (GlassCard, Sidebar, Button, …)
│       ├── components/landing/   # landing page sections
│       ├── components/dashboard/ # per-feature widgets (tables, maps, modals)
│       ├── pages/                # one file per route
│       ├── context/              # LayoutContext, AuthContext
│       ├── hooks/                # per-domain data hooks (with socket subscriptions)
│       ├── services/             # api.ts (axios), socket.ts, per-domain API clients
│       ├── styles/               # design tokens + tailwind entry
│       └── utils/
└── server/          # Node + Express + Sequelize API
    ├── server.js                # entry: Express + Socket.io + schema sync
    └── src/
        ├── config/              # db.js (Sequelize), env loader, seed.js, socket.js
        ├── models/              # 7 Sequelize models (stations … users)
        ├── controllers/
        ├── routes/
        └── middleware/          # JWT auth, validation, error handler
```

## Prerequisites

- Node.js ≥ 18 (v20+ recommended)
- PostgreSQL **with the PostGIS extension** — the easiest path is Docker:

```bash
docker compose up -d     # starts postgres + postgis on localhost:5432
```

No Docker? Install Postgres locally and enable PostGIS (`CREATE EXTENSION postgis;`).

## Setup

```bash
# 1. Server
cd server
npm install
cp .env.example .env        # then edit DB_PASSWORD / JWT_SECRET
npm run seed                # creates tables + seeds ALL demo data (see below)
npm run dev                 # API on http://localhost:5000 — /api/health

# 2. Client (second terminal)
cd client
npm install
npm run dev                 # app on http://localhost:5173
```

Open http://localhost:5173 — you land on the public marketing page. Click
**Enter Command Center** → sign in with the demo credentials below.

## Demo Login

| Field    | Value                   |
|----------|-------------------------|
| Email    | `commander@polarx.in`   |
| Password | `polarx-demo-2026`      |

## Seed Data (what `npm run seed` produces)

- **3 stations** — Bharati (47 capacity, active), Maitri (25), Himadri (12), with real lat/lng + occupancy counts
- **6 missions** (2 active / 1 planned / 3 completed) and **7 shipments** across all three statuses
- **256 inventory items** — statuses derive from quantity-vs-threshold (142 adequate / 63 low-stock / 26 critical / 25 out-of-stock)
- **60 personnel** — 42 on duty, 6 in field, 6 at base, 6 on leave; realistic roles + qualifications; several rotating out within 30 days
- **Emergency alerts** — 4 active + 3 resolved, with type-specific checklists
- **1 demo user** — the account above

The seed is **idempotent** — safe to re-run; it converges rather than duplicating.

## Useful Commands

| Where   | Command             | What it does                                    |
|---------|---------------------|-------------------------------------------------|
| server  | `npm run dev`       | start API on :5000 (auto-restart on change)     |
| server  | `npm run seed`      | sync schema + seed all demo data                |
| server  | `npm run migrate`   | run pending Sequelize migrations (Phase 5 extension) |
| client  | `npm run dev`       | start Vite dev server on :5173                  |
| client  | `npm run typecheck` | TypeScript check (no emit)                      |
| client  | `npm run build`     | typecheck + production build                    |

## Environment Variables

`server/.env` — see `server/.env.example` for every key
(`PORT`, `NODE_ENV`, `DB_*`, `JWT_SECRET`, `MAPBOX_TOKEN`, `WEATHER_API_KEY`).
The client reads `VITE_API_URL` (defaults to `http://localhost:5000/api`).

## Routes & Auth

- **Public**: `/` (landing), `/login`, `/register`
- **Protected** (redirect to `/login` when logged out): `/app` — Dashboard, Stations, Cargo, Inventory, Personnel, Emergency, Settings
- Every **mutating** endpoint (POST/PATCH/DELETE) requires a valid JWT and returns `401` without one; GET endpoints stay public for demo convenience.
- 5 real-time Socket.io events drive live UI updates across open tabs: `shipment:update`, `alert:new`, `alert:update`, `personnel:update`, `inventory:update`.

## Phase Roadmap (all complete)

- **Phase 0** — design tokens, glass/clay component library, app shell + navigation, Postgres/PostGIS schema (7 tables)
- **Phase 1** — Dashboard with live stations/missions data + stations & missions API
- **Phase 2** — Cargo tracking: full map with status-colored routes, shipment list/detail drawer, cargo API
- **Phase 3** — Inventory: summary strip, filters, restock modal, low-stock/expiry alerts, inventory API (server-derived statuses)
- **Phase 4** — Personnel: card grid, detail modal with field map, rotation timeline, personnel API
- **Phase 5** — Emergency response: one-click trigger with type-specific checklists, evacuation map, resolve flow, emergency API (+ schema extension)
- **Phase 6** — Public landing page; app moved under `/app`
- **Phase 7** — JWT auth (register/login/logout), protected routes + mutating endpoints, full seed data, Socket.io live events, README