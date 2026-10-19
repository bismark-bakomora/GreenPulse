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

GreenPulse connects Citizens, Collectors, Recyclers, and City Admins to reduce flooding and improve waste recovery. Citizens report blocked drains; Collectors clear and log waste; Recyclers buy sorted waste; Admins monitor KPIs and heatmaps.

## Features
- QR-based citizen reporting with photo uploads
- Collector mobile-first app: accept jobs, optimized routing, log weight
- Recycler marketplace for listed waste batches and tricycle dispatch
- Admin dashboard: heatmap, KPIs, weather forecasts, CO₂ pulse
- Authentication for collectors and recyclers, role-based flows
- Prisma-powered Postgres schema and seed data

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
cp .env.example .env   # fill DB, Cloudinary, JWT_SECRET, FRONTEND_URL
npx prisma generate
npx prisma db push
node prisma/seed.js    # optional: seed local data
node server.js         # or `npm run dev` if script exists
```

Install & run frontend (from repo root `frontend/`):
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if needed
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
- `middleware/auth.js` — JWT authentication middleware and role checks used by protected routes.
- `prisma/schema.prisma` — Prisma schema defining `User`, `Report`, `WasteCollection`, `Tricycle`, `Order`, etc.
- `prisma/seed.js` — seed script that creates initial users, recyclers, tricycles, and sample reports.
- `routes/` — Express routers; each file maps endpoints and business logic:
  - `auth.js` — collector/recycler registration and login endpoints (JWT issuance).
  - `collections.js` — endpoints for logging waste collections, marketplace flags, stats.
  - `collectors.js` — collector-specific endpoints (jobs, status, profile).
  - `dashboard.js` — admin KPIs, heatmap data, summary endpoints.
  - `recyclers.js` — marketplace browsing, orders, dispatch endpoints.
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
  - `AdminDashboard.jsx` — admin heatmap & KPIs
  - `CitizenReport.jsx` — QR scan + report submit UI
  - `GreenCV.jsx` — collector work history view
  - `NotFound.jsx` — 404 page
  - `QRZones.jsx` — QR zone management / preview (also a top-level file `QRZones.jsx` exists)
- `src/components/Layout.jsx` — layout wrapper and shared header/nav.

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
- Auth: `POST /api/auth/collector/login`, `POST /api/auth/recycler/login`
- Dashboard: `GET /api/dashboard/summary`

Refer to `backend/routes/` for full, up-to-date endpoint details.

---

## Deployment notes
- Frontend: Deploy `frontend/` to Vercel or Netlify (set `VITE_API_URL` to production backend).
- Backend: Deploy `backend/` to Render, Heroku, or any Node host. Ensure `DATABASE_URL` and Cloudinary envs are set. Run `npx prisma migrate` / `prisma db push` as appropriate.
- Routing: Deploy `routing/` as a separate service (optional). Update `ROUTING_SERVICE_URL` in backend envs.

Security: Rotate `JWT_SECRET` and Cloudinary keys for production. Use HTTPS and restrict CORS to your frontend domain.

---

## Contributing
- To add features or fix bugs: open a branch, add tests where appropriate, and submit a PR.
- Seed and demo data live in `backend/prisma/seed.js` — use this to bootstrap test accounts.

## Contact
Built by Ishmeal Aggrey Paintsil (University of Ghana, GCL 2026). For questions, open an issue or contact the maintainer in the repository.

---

If you'd like, I can also:
- generate an `ARCHITECTURE.md` with diagrams, or
- add a small `DEVELOPMENT.md` with step-by-step commands and common troubleshooting tips.
