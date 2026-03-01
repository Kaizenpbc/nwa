# NWA Jamaica — Website Demo

Tender presentation demo for the **National Works Agency (NWA)** website redesign project.

Built with **Next.js 16** (App Router) + **React 18** + **TypeScript** + **Tailwind CSS** + **Leaflet** maps.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — video hero, quick links, closures, news, projects |
| `/projects` | Projects listing with interactive Leaflet map + parish filter |
| `/projects/[id]` | Project detail — completion %, timeline, location map |
| `/complaints` | Report Issue — form with photo upload, map pin, tracking ID |
| `/complaints/track` | Track complaint by ID — 5-step status workflow |
| `/closures` | Road closures — map, parish filter, severity, detours |
| `/emergency` | Emergency Operations Centre — alert levels, incidents, parish map |
| `/portal` | Staff Portal — complaint dashboard (SLA, assign, closeout) + CMS workflow |
| `/news` | Newsroom — article listing + detail view |
| `/about` | About NWA — mandate, mission/vision/values, key facts |
| `/contact` | Contact Us — office info, form, location map |

## Key Features

- **Complaint Tracker** — public submission with photo upload, GPS pin, auto-generated tracking ID, status lookup
- **Staff Dashboard** — sortable ticket table, SLA tracking (High/Standard/Low), case assignment, 2-person closeout, internal notes
- **CMS Workflow Demo** — 7-step simulated editorial workflow (Editor -> Approver -> Published)
- **Emergency Operations** — parish alert levels, active incidents, crew deployment tracking
- **GIS Maps** — interactive Leaflet maps on Projects, Closures, Complaints, Emergency, Contact pages
- **Responsive** — mobile-first design with hamburger nav, touch-friendly targets
- **Accessible** — skip-to-content link, ARIA labels, keyboard navigation, semantic HTML

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet + react-leaflet (dynamic import, SSR-safe)
- **Icons**: react-icons (Feather)
- **Data**: Client-side mock data (MongoDB-ready schema)

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Homepage
│   ├── projects/         # Projects listing + [id] detail
│   ├── complaints/       # Report issue + track
│   ├── closures/         # Road closures
│   ├── emergency/        # Emergency Operations Centre
│   ├── portal/           # Staff Portal (Dashboard + CMS)
│   ├── news/             # Newsroom
│   ├── about/            # About NWA
│   └── contact/          # Contact Us
├── components/           # Shared components
│   ├── Header.tsx        # Sticky nav with mobile menu
│   ├── Footer.tsx        # Site footer
│   ├── AlertBanner.tsx   # Live closure alerts
│   └── MapView.tsx       # Reusable Leaflet map
└── data/
    └── mock.ts           # All mock data + helpers
```

## Build

```bash
npm run build    # Production build
npm start        # Serve production build
```
