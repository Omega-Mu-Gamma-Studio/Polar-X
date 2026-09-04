# ❄️ PolarX

> **Integrated Polar Expedition Logistics & Asset Management System**  
> Smart India Hackathon 2026 · Problem ID 26062  
> St. Xavier's Catholic College of Engineering, Nagercoil

---

## What This Is

India operates three polar research stations — Bharati (Antarctica, cap. 47), Maitri (Antarctica, cap. 25), and Himadri (Svalbard, cap. 12). Supplying them is a logistical nightmare: 18 tons were once airlifted via a Russian aircraft due to a supply chain breakdown. PolarX is the command center that prevents that.

It gives mission controllers a single interface to track cargo shipments in real-time, monitor inventory levels across all three stations, manage personnel rotations, and trigger emergency protocols — all from a glassmorphism dashboard that looks like it belongs at a polar base.

---

## Progress Tracker

### Phase 1 — Foundation
- [ ] Root `package.json` with `concurrently` dev script
- [ ] Vite + React 18 client bootstrapped
- [ ] Tailwind CSS + PostCSS configured
- [ ] Express server running on port 5000
- [ ] SQLite connected via Sequelize
- [ ] `.env` wired through `config/env.js`
- [ ] CORS + JSON middleware on server

### Phase 2 — Data Layer
- [ ] `User` model + JWT auth (register/login)
- [ ] `Mission` model + CRUD routes
- [ ] `Shipment` model + CRUD routes
- [ ] `Inventory` model + low-stock alert logic
- [ ] `Personnel` model + rotation logic
- [ ] `Emergency` model + trigger route
- [ ] DB migration script (`npm run migrate`)
- [ ] Seed script with mock data (`npm run seed`)

### Phase 3 — Backend API
- [ ] `POST /api/auth/login` · `POST /api/auth/register`
- [ ] `GET/POST /api/missions`
- [ ] `GET /api/cargo/shipments` · `GET /api/cargo/shipments/:id/track`
- [ ] `GET /api/inventory` · `GET /api/inventory/alerts`
- [ ] `PUT /api/personnel/:id/location`
- [ ] `POST /api/emergency/trigger`
- [ ] Auth middleware protecting all non-auth routes
- [ ] Global error handler

### Phase 4 — Frontend Shell
- [ ] `App.jsx` with React Router v6 routes
- [ ] `AuthContext` — login state + JWT storage
- [ ] `AppContext` — global state shape from blueprint
- [ ] `SocketContext` — Socket.io connection lifecycle
- [ ] `api.js` — axios instance with JWT interceptor
- [ ] `socket.js` — socket singleton

### Phase 5 — Landing Page
- [ ] `Hero` — fullscreen polar image, frost overlay, aurora CTA
- [ ] `ProblemSection` — impact stats (18 tons, 47 crew, 3 stations)
- [ ] `StationGallery` — rotating station images via Intersection Observer
- [ ] Frost particle CSS animation
- [ ] Scroll-through experience wired end to end

### Phase 6 — Dashboard
- [ ] `Sidebar` — nav with all 6 sections
- [ ] `Navbar` — search bar, notification bell, user avatar
- [ ] `StationCard` — status badge, supply progress bar, personnel count
- [ ] `CargoMap` — Leaflet OSM, animated shipment markers, popups
- [ ] `InventoryWidget` — low stock count + alert list
- [ ] `PersonnelWidget` — on-duty / in-field counts
- [ ] All 6 pages wired to real API data

### Phase 7 — Real-time
- [ ] Socket.io server setup (`socket/index.js`)
- [ ] Cargo tracking broadcast (`cargoHandlers.js`)
- [ ] Emergency alert broadcast to all clients (`emergencyHandlers.js`)
- [ ] Personnel location sync (`personnelHandlers.js`)
- [ ] Client `useSocket` hook consuming all events

### Phase 8 — Polish
- [ ] Responsive layout (tablet + desktop)
- [ ] Loading states on all async operations
- [ ] Error boundaries
- [ ] `StatusBadge` and `PolarCard` applied consistently
- [ ] Aurora glow on active sidebar items
- [ ] Final demo run with seed data

### Nice to Have (time permitting)
- [ ] AI supply forecasting demo (mock AI response)
- [ ] Weather API integration
- [ ] Offline-first with IndexedDB
- [ ] PostgreSQL switchover tested end to end

---

## Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast HMR, clean build |
| Styling | Tailwind CSS | Utility-first, easy glassmorphism |
| Routing | React Router v6 | Standard, declarative |
| Map | React-Leaflet + Leaflet.js | OSM tiles, no API key needed for prototype |
| Charts | Chart.js + react-chartjs-2 | Supply/inventory trends |
| Animation | Framer Motion | Landing scroll transitions |
| Real-time | Socket.io (client + server) | Cargo + emergency broadcasts |
| Backend | Node.js + Express | Lightweight, fast to wire |
| ORM | Sequelize | Dialect-agnostic — SQLite now, PostgreSQL later |
| DB (local) | SQLite | Zero setup, single file, `npm run dev` just works |
| DB (prod) | PostgreSQL + PostGIS | Geospatial cargo tracking |
| Auth | JWT + bcryptjs | Stateless, works with Socket.io |

---

## Running Locally

```bash
git clone <repo>
cd polarx-app

cp .env.example .env   # fill in values

npm install            # installs root + client + server

npm run dev            # client on :5173, server on :5000
```

Other scripts:

```bash
npm run migrate        # run DB migrations
npm run seed           # populate with mock data
npm run build          # production build
```

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database — SQLite (local)
DB_DIALECT=sqlite
DB_STORAGE=./polarx.db

# Database — PostgreSQL (prod, swap these in)
# DB_DIALECT=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=polarx
# DB_USER=postgres
# DB_PASSWORD=your_password

# Auth
JWT_SECRET=your_secret_key_min_32_chars

# External (optional for prototype)
MAPBOX_TOKEN=
WEATHER_API_KEY=
```

---

## Switching to PostgreSQL

1. Set `DB_DIALECT=postgres` in `.env`
2. Supply the `DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD` vars
3. `npm run migrate`

No model or controller changes needed — Sequelize handles the dialect difference.

---

## Project Structure

```
polarx-app/
├── package.json                  ← root: concurrently dev script
├── .env.example
├── .gitignore
├── README.md
├── ARCHITECTURE.md               ← why things work the way they do
│
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx               ← router + context providers
│       ├── components/
│       │   ├── common/           → PolarCard, StatusBadge, LoadingSpinner, Navbar, Sidebar
│       │   ├── landing/          → Hero, ProblemSection, StationGallery
│       │   └── dashboard/        → StationCard, CargoMap, InventoryWidget, PersonnelWidget
│       ├── pages/                → Landing, Dashboard, CargoMap, Inventory, Personnel, Emergency, Settings
│       ├── context/              → AppContext, AuthContext, SocketContext
│       ├── hooks/                → useSocket, useFetch, useAuth
│       ├── services/
│       │   ├── api.js            ← axios instance, JWT interceptor
│       │   └── socket.js         ← socket singleton
│       ├── styles/
│       │   ├── globals.css       ← polar card, frost, aurora classes
│       │   └── theme.css         ← CSS variables for color palette
│       └── utils/
│           ├── constants.js      ← API base URL, socket events, station data
│           └── helpers.js        ← date formatting, supply % calc, etc.
│
└── server/
    ├── server.js                 ← entry: Express + Socket.io init
    ├── package.json
    └── src/
        ├── config/
        │   ├── env.js            ← validated env vars (throws if missing)
        │   └── db.js             ← Sequelize instance
        ├── db/
        │   ├── connection.js     ← connect + sync
        │   ├── migrate.js        ← run migrations in order
        │   └── seed.js           ← mock data for demo
        ├── models/               → Mission, Shipment, Inventory, Personnel, Emergency, User
        ├── controllers/          → one per domain, pure business logic
        ├── routes/               → one per domain, wires controller to Express
        ├── middleware/
        │   ├── auth.js           ← JWT verify, attaches req.user
        │   ├── errorHandler.js   ← global 500 catcher
        │   └── validate.js       ← express-validator wrapper
        └── socket/
            ├── index.js          ← registers all handlers on io instance
            ├── cargoHandlers.js
            ├── emergencyHandlers.js
            └── personnelHandlers.js
```

---

## Design System

**Color Palette**

| Name | Hex | Usage |
|---|---|---|
| Deep Arctic Night | `#0D1B2A` | Primary background |
| Ice Sea | `#1B3A6B` | Secondary background, sidebar |
| Glacier Blue | `#A8D8F0` | Accent, borders, text highlights |
| Aurora Green | `#6FCF97` | CTA buttons, success states |
| Emergency Red | `#FF6B6B` | Alerts, warnings |

**Glass Card** (`polar-card` class)
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(168, 216, 240, 0.15);
border-radius: 16px;
box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(168, 216, 240, 0.1);
```

---

## Data Models (Shape Reference)

```js
Mission:    { id, name, station, startDate, endDate, status, personnelCount, cargoCount }
Shipment:   { id, name, missionId, origin, destination, location, status, eta, items }
Inventory:  { id, station, name, quantity, threshold, expiryDate, lastRestocked }
Personnel:  { id, name, role, station, qualifications, rotationStart, rotationEnd, location }
Emergency:  { id, triggeredBy, type, location, timestamp, status, checklistCompleted }
User:       { id, name, email, passwordHash, role }
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ✗ | Register user |
| POST | `/api/auth/login` | ✗ | Login, returns JWT |
| GET | `/api/missions` | ✓ | All missions |
| POST | `/api/missions` | ✓ | Create mission |
| GET | `/api/cargo/shipments` | ✓ | All shipments |
| GET | `/api/cargo/shipments/:id/track` | ✓ | Track shipment |
| GET | `/api/inventory` | ✓ | All inventory |
| GET | `/api/inventory/alerts` | ✓ | Low-stock alerts |
| GET | `/api/personnel` | ✓ | All personnel |
| PUT | `/api/personnel/:id/location` | ✓ | Update location |
| GET | `/api/emergency` | ✓ | All alerts |
| POST | `/api/emergency/trigger` | ✓ | Trigger alert |

---

## Socket Events

| Event | Direction | Payload |
|---|---|---|
| `cargo:update` | server → client | `{ shipmentId, location, status }` |
| `emergency:alert` | server → all clients | `{ id, type, location, timestamp }` |
| `personnel:location` | server → client | `{ personnelId, location }` |
| `inventory:low` | server → client | `{ station, item, quantity }` |

---

*PolarX · SIH 2026 · Confidential — Internal Use Only*