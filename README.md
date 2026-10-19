# GreenPulse 

Ghana's integrated waste intelligence ecosystem — a small-platform demonstrating citizen reporting, collector workflows, recycler marketplace, and city dashboards for flood and waste management.

---

## Contents
- Project overview
- Features
- Tech stack
- Quick start (local)
- Environment variables
- Project structure (file-by-file descriptions)
- API summary
- Deployment
- Contributing & contacts

---

## Project overview

GreenPulse connects Residents, Collectors, Recyclers, and City Admins to reduce flooding and improve waste recovery. Residents report neighbourhood issues, request home pickups, log QR-bin drop-offs, earn GreenPoints, and redeem rewards. Collectors accept jobs and pickups; recyclers buy sorted waste; City Admins monitor city-wide operations and intervene in low-performing zones.

## Features
- Resident portal: registration, issue reporting, home-pickup requests, QR-bin drop-offs, GreenPoints, rewards, history, and zone leaderboard
- QR-based reporting with photo uploads, geotagging, severity, and zone-aware links
- Collector mobile-first app: drain jobs, home-pickup acceptance/completion, optimized routing, volume logging, earnings, and Green CV
- Recycler marketplace: sorted waste batches, purchase orders, tricycle dispatch, traceable delivery status, and material-demand signals
- City Admin portal: live zone threshold status, heatmaps, collection KPIs, weather/flood risk, impact export, and engagement campaigns
- Authentication for residents, collectors, recyclers, and City Admins
- Prisma/PostgreSQL data model with seed data for zones, collectors, recyclers, tricycles, reports, and marketplace batches

## Tech stack
- Frontend: React + Vite, Tailwind CSS
- Backend: Node.js + Express, Prisma ORM, PostgreSQL
- Routing/optimizer: Python (FastAPI / uvicorn) — optional service
- Third-party: Cloudinary (images), Mapbox/Leaflet (maps), external weather API

---

## Quick start (Local Development)

Prereqs:
```bash
node --version   # v18+
npm --version
python --version # 3.10+ for routing service (optional)
```

Install & run backend (from repo root `backend/`):
```bash
cd backend
npm install
Copy-Item .env.example .env   # fill DB, Cloudinary, JWT_SECRET, FRONTEND_URL
npx prisma generate
npx prisma db push
node prisma/seed.js    # optional: seed local data
npm start              # or npm run dev
```

Install & run frontend (from repo root `frontend/`):
```bash
cd frontend
npm install
Copy-Item .env.example .env   # set VITE_API_URL if needed
npm run dev
```

Routing service (optional):
```bash
cd routing
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open frontend in browser (Vite default): http://localhost:5173 and backend API at http://localhost:3001 (default)

---

## Environment variables (summary)

Backend (`backend/.env`)
```
DATABASE_URL=postgres://USER:PASS@HOST:PORT/DB
JWT_SECRET=...          # used to sign tokens
PORT=3001
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=http://localhost:5173
ROUTING_SERVICE_URL=http://localhost:8000
```

Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001/api
```

Routing (`routing/requirements.txt`)
- See `routing/main.py` for expected envs if any (service URL, API keys).

---

## Project structure and file descriptions

Top-level layout (workspace root):

```
README.md
backend/
frontend/
routing/
cache/
```

backend/ (Node.js + Express + Prisma)
- `package.json` — backend dependencies and scripts.
- `server.js` — application entrypoint: Express app, middleware mounting, port listen.
- `prisma.config.ts` — local Prisma configuration utilities (if present).
- `lib/cloudinary.js` — Cloudinary helper for uploading images and building URLs.
- `middleware/auth.js` — JWT authentication middleware used by protected routes.
- `prisma/schema.prisma` — Prisma schema defining residents, collectors, recyclers, zones, drop-offs, pickup requests, rewards, collections, orders, and dispatches.
- `prisma/seed.js` — seed script that creates initial users, recyclers, tricycles, and sample reports.
- `routes/` — Express routers; each file maps endpoints and business logic:
  - `auth.js` — resident, collector, recycler, and City Admin authentication endpoints.
  - `collections.js` — endpoints for logging waste collections, marketplace flags, stats.
  - `collectors.js` — collector-specific endpoints (jobs, status, profile).
  - `dashboard.js` — city KPIs, heatmap data, and impact-summary endpoints.
  - `recyclers.js` — marketplace browsing, orders, dispatch, and material-demand endpoints.
  - `residents.js` — resident profiles, QR drop-offs, GreenPoints redemptions, home-pickup requests, and leaderboards.
  - `pickups.js` — collector pickup queues, acceptance, and completion workflows.
  - `zones.js` — zone threshold status and community engagement campaigns.
  - `reports.js` — create/update drain reports, upload images, fetch heatmap points.
  - `routing.js` — proxy / integration to routing optimizer (calls the routing service).
  - `weather.js` — fetches external weather/forecast data and returns rainfall risk.

Notes: Static helpers and business logic may live in `lib/` or sibling modules. Look for `api` utilities for external service calls.

frontend/ (React + Vite)
- `package.json` — frontend dependencies and scripts.
- `vite.config.js` — Vite config and dev server proxy (if configured to backend).
- `tailwind.config.js` & `postcss.config.js` — Tailwind setup.
- `index.html` — Vite HTML entry.
- `src/main.jsx` — React DOM bootstrap.
- `src/App.jsx` — top-level routes and app shell.
- `src/index.css` — global styles (Tailwind imports).
- `src/lib/api.js` — API wrapper that calls backend endpoints using `VITE_API_URL`.
- `src/lib/constants.js` — shared constants (roles, status codes).
- `src/pages/` — route pages:
  - `LandingPage.jsx` — public landing and info
  - `CollectorApp.jsx`, `CollectorLogin.jsx` — collector flows
  - `RecyclerDashboard.jsx`, `RecyclerLogin.jsx`, `RecyclerPortal.jsx` — recycler flows
  - `CityAdminLogin.jsx`, `CityAdminPortal.jsx` — protected city-admin access and operations dashboard
  - `ResidentPortal.jsx`, `ResidentDashboard.jsx` — resident reports, pickups, drop-offs, points, rewards, and history
  - `CitizenReport.jsx` — photo, geotag, and severity report form embedded in the resident portal
  - `GreenCV.jsx` — collector work history view
  - `NotFound.jsx` — 404 page
  - `QRZones.jsx` — QR zone management / preview (also a top-level file `QRZones.jsx` exists)
- `../components/Layout.jsx` — active layout wrapper and shared header/nav.

Public/static assets are in `frontend/public` and `frontend/src/assets`.

routing/ (optional Python service)
- `main.py` — FastAPI app providing route optimization endpoints and helpers (Dijkstra or routing heuristics).
- `requirements.txt` — Python dependencies (FastAPI, uvicorn, networkx, etc.).

cache/
- JSON files used for caching third-party responses (forecast, map tiles, or precomputed routing). Safe to clear during development.

Other notable files at workspace root
- `README.md` — this file.

---

## API summary (selected endpoints)
- `POST /api/reports` — Submit a drain report (multipart: image + metadata)
- `GET /api/reports/heatmap` — Returns heatmap points for dashboard
- `POST /api/collections` — Collector logs a cleared waste batch
- `GET /api/recyclers/marketplace` — Recycler lists available batches
- `POST /api/residents/:id/pickups` — Resident requests a home pickup
- `POST /api/pickups/:id/accept` / `POST /api/pickups/:id/collect` — Collector accepts and completes a pickup
- `POST /api/residents/:id/dropoffs` — Log a QR-bin drop-off and award segregation-weighted points
- `GET /api/zones` — Zone fill levels and threshold/dispatch status
- `GET` / `POST /api/recyclers/demands` — View or create recycler material-demand signals
- Auth: `POST /api/auth/resident/login`, `POST /api/auth/collector/login`, `POST /api/auth/recycler/login`, `POST /api/auth/admin/login`
- Dashboard: `GET /api/dashboard/summary`

Refer to `backend/routes/` for full, up-to-date endpoint details.

---

## Deployment notes
- Frontend: Deploy `frontend/` to Vercel or Netlify (set `VITE_API_URL` to production backend).
- Backend: Deploy `backend/` to Render, Heroku, or any Node host. Ensure `DATABASE_URL`, `JWT_SECRET`, Cloudinary settings, and `FRONTEND_URL` are set. Run `npx prisma generate` followed by `npx prisma db push` (or a reviewed Prisma migration) before starting the API.
- Routing: Deploy `routing/` as a separate service (optional). Update `ROUTING_SERVICE_URL` in backend envs.

Security: Rotate `JWT_SECRET` and Cloudinary keys for production. Use HTTPS and restrict CORS to your frontend domain.

---

## Contributing
- To add features or fix bugs: open a branch, add tests where appropriate, and submit a PR.
- Seed and demo data live in `backend/prisma/seed.js` — use this to bootstrap test accounts.

## Contact
Built by Ishmeal Aggrey Paintsil and Bismark Zebill Bakomora. For questions, open an issue or contact the maintainer in the repository.

---

If you'd like, I can also:
- generate an `ARCHITECTURE.md` with diagrams, or
- add a small `DEVELOPMENT.md` with step-by-step commands and common troubleshooting tips.
