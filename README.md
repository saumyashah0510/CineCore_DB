<div align="center">

<br />

# 🎬 CineCore DB

### Enterprise Film Production & Distribution Management System

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cinecore--db.vercel.app-gold?style=for-the-badge&logo=vercel&logoColor=black)](https://cinecore-db.vercel.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger%20UI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://cinecore-backend.onrender.com/docs)
[![View Demo](https://img.shields.io/badge/View%20Demo-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/feed/update/urn:li:ugcPost:7460995035921170432/)

<br />

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat-square&logo=redis&logoColor=white)](https://upstash.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

<br />

> **The central nervous system for modern film studios.**
> Role-based access ensures data integrity from the writer's room to worldwide release.

<br />

<!-- SCREENSHOT PLACEHOLDER -->
<!-- Add your landing page screenshot here -->
<!-- ![CineCore Landing Page](./docs/screenshots/landing.png) -->

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Architecture](#-system-architecture)
- [Features](#-core-features)
- [Role Portals](#-role-based-portals)
- [Security](#-security--demo-mode)
- [Database Design](#-database-design)
- [Tech Stack](#-tech-stack)
- [Redis Caching](#-redis-caching-strategy)
- [Local Setup](#-local-development)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)

---

## 🎯 Overview

CineCore DB is a full-stack, enterprise-level application designed to handle the complex, multi-layered operations of a film production house. It provides five distinct role-based portals — from greenlighting projects to managing OTT distribution deals — all backed by a deeply relational PostgreSQL schema enforced by stored procedures, triggers, and automated business rules.

**Built as a portfolio project** demonstrating advanced database design, async API development, in-memory caching, and cinematic frontend engineering.

---

## 🌐 Live Demo

| Service | URL |
| :--- | :--- |
| **Frontend** | [cinecore-db.vercel.app](https://cinecore-db.vercel.app) |
| **Backend API** | [cinecore-backend.onrender.com](https://cinecore-backend.onrender.com) |
| **API Swagger Docs** | [cinecore-backend.onrender.com/docs](https://cinecore-backend.onrender.com/docs) |

> **Demo Mode Active:** All write operations (POST/PUT/DELETE) are simulated on the live site to protect the database. To see full edit capabilities, use the Superadmin unlock on the Login page.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│   React 18 + TypeScript + Vite   (Deployed: Vercel)         │
│   Framer Motion · Tailwind CSS · React Query · Recharts      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS / REST API
                          │ Axios (with X-Superadmin-Key header)
┌─────────────────────────▼───────────────────────────────────┐
│                        API LAYER                             │
│   FastAPI (ASGI) + Python 3.12   (Deployed: Render)         │
│   Pydantic validation · CORS middleware · Demo Mode guard    │
│                                                              │
│   ┌──────────────────┐    ┌──────────────────────────────┐  │
│   │   Redis Cache    │    │   11 Routers / 40+ Endpoints │  │
│   │   (Upstash)      │    │   projects · contracts        │  │
│   │   TTL: 1-5 min   │    │   analytics · distribution   │  │
│   └──────────────────┘    └──────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ asyncpg (async driver)
┌─────────────────────────▼───────────────────────────────────┐
│                      DATABASE LAYER                          │
│   PostgreSQL 17 + custom schema   (Deployed: Supabase)      │
│   17 entities · Stored Procedures · Triggers · Constraints   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Features

### 🎬 Production Management
- **Project Lifecycle Tracking** — `PRE_PRODUCTION → SHOOTING → POST_PRODUCTION → RELEASED`
- **6-Department Budget Heads** — Auto-created per project via stored procedure (`sp_create_project`)
- **Overspend Alerts** — Database trigger automatically sets `overspent_flag = TRUE` when expenses exceed allocation
- **Shoot Scheduling** — Location-linked daily shoot calendars with director notes and conflict visibility

### 💰 Finance & Contracts
- **Contract Engine** — Full contract lifecycle with `NEGOTIATION → ACTIVE → COMPLETED` states
- **Payment Milestone Tracker** — Automated milestone splits tied to production phases; flags `OVERDUE` status automatically
- **Expense Ledger** — Multi-department expense tracking with approval workflow (`PENDING → APPROVED → PAID`)
- **Budget Health Dashboard** — Real-time spend vs allocation with percentage burn rate per department

### 🎭 Talent Registry
- **Cast & Crew Database** — Centralized person registry linked to contracts and project roles
- **Script Management** — Version tracking, clearance status, and writer attribution
- **Casting Workflows** — Role assignment with contract binding across multiple projects

### 🌍 Distribution Matrix
- **OTT Deal Management** — Platform deals (Netflix, Prime, Hotstar) with territory, license fee, and expiry tracking
- **Theatre Release Grid** — City-wise collection tracking with screens, opening weekend, and weeks-running data
- **Music Catalog** — Song-to-project attribution with licensing and royalty management
- **Box Office Analytics** — Aggregate collection rankings across the entire studio portfolio

### 🤖 AI Assistant (Text-to-SQL)
- **Natural Language Queries** — Ask complex questions about budgets, schedules, and box office in plain English.
- **Powered by Groq & Llama 3** — Blazing fast SQL generation and plain-English summarization.
- **Conversational Memory** — Ask follow-up questions contextually without repeating previous details.
- **Sandboxed Execution** — AI-generated SQL is rigorously validated to ensure it's strictly `SELECT`-only and contained within the `cinecore` schema.
- **Graceful Error Handling** — Catches broken SQL seamlessly and returns conversational apologies instead of crash dumps.
---

## 👥 Role-Based Portals

| Role | Access Scope | Key Capabilities |
| :--- | :--- | :--- |
| **Production Admin** | Full portfolio | Greenlight projects, monitor all studios, global analytics |
| **Talent Manager** | Cast & contracts | Build rosters, sign contracts, manage scripts |
| **Finance Manager** | Budget & payments | Track expenses, clear milestones, overspend alerts |
| **Production Manager** | Logistics | Shoot schedules, locations, government permits |
| **Distribution Manager** | Sales & rights | OTT deals, box office, music licensing |

Each role gets a dedicated navigation, filtered data views, and role-specific dashboard widgets.

---

## 🔐 Security & Demo Mode

CineCore implements a custom **two-layer security architecture** designed for safe public portfolio hosting:

### Frontend Layer (Axios Interceptor)
```typescript
// lib/api.ts
api.interceptors.request.use((config) => {
  const superadminKey = localStorage.getItem('cinecore_superadmin');

  if (IS_DEMO_MODE && !superadminKey) {
    // Intercept mutations → show toast → return mock response
    // Database never touched. Visitor gets seamless UX.
    config.adapter = async () => ({ data: { message: 'Mocked' }, status: 200 });
  }
  return config;
});
```

### Backend Layer (FastAPI Middleware)
```python
# app/main.py
@app.middleware("http")
async def demo_mode_middleware(request: Request, call_next):
    if settings.DEMO_MODE and request.method in ["POST","PUT","DELETE","PATCH"]:
        key = request.headers.get("X-Superadmin-Key", "")
        if key != settings.SUPERADMIN_KEY:
            return Response(status_code=403, content="Read-only in demo mode")
    return await call_next(request)
```

### Superadmin Override Flow
```
Developer → Login Page → Enter credentials → localStorage gets key
         → Axios attaches X-Superadmin-Key to every request
         → Backend middleware allows mutations through
         → Select any role → Edit data normally
```

---

## 🗄️ Database Design

**17 core entities** in the `cinecore` PostgreSQL schema:

```
production_house ──< project >─┬─< budget_head >─< expense
                                ├─< contract >─< payment_milestone
                                ├─< shoot_schedule >─ location >─< location_permit
                                ├─< ott_deal >─ ott_platform
                                ├─< theatre_release
                                └─< song

project ──< script
person ──< contract
person ──< song (composer)
vendor ──< expense
```

### Key Database Objects

| Type | Name | Purpose |
| :--- | :--- | :--- |
| Stored Procedure | `sp_create_project` | Creates project + 6 budget heads atomically |
| Trigger | `trg_check_budget_overspend` | Sets `overspent_flag` when expense exceeds allocation |
| Trigger | `trg_update_payment_status` | Auto-marks milestones `OVERDUE` past due date |
| Constraint | `chk_contract_dates` | Ensures `start_date < end_date` at DB level |
| Index | `idx_expense_project` | Speeds up budget aggregation queries |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | SPA framework |
| **Styling** | Tailwind CSS, custom CSS variables | Cinematic dark theme |
| **Animation** | Framer Motion, GSAP | Page transitions, micro-animations |
| **Data Fetching** | Axios, TanStack React Query | API client + server state |
| **Charts** | Recharts | Data visualization |
| **Backend** | FastAPI, Python 3.12 | Async REST API (ASGI) |
| **Database ORM** | SQLAlchemy (asyncio), asyncpg | Async PostgreSQL queries |
| **Database** | PostgreSQL 17 | Relational data store |
| **Caching** | Redis (Upstash) | In-memory response cache |
| **AI Processing** | Groq (Llama 3.3 & 3.1) | Text-to-SQL & Summarization |
| **Validation** | Pydantic v2 | Schema validation & serialization |
| **Frontend Host** | Vercel | CDN-backed static hosting |
| **Backend Host** | Render | Containerized Python service |
| **DB Host** | Supabase | Managed PostgreSQL |
| **Cache Host** | Upstash | Serverless Redis |

---

## ⚡ Redis Caching Strategy

CineCore implements a **Cache-Aside pattern** with intelligent TTL tiers and automatic invalidation:

```
Request → Check Redis ──→ HIT  → Return cached JSON (~1ms)
              │
              └──→ MISS → Query PostgreSQL (~50-200ms)
                              → Store in Redis with TTL
                              → Return to client
```

### TTL Configuration

```python
CACHE_TTL_SHORT  = 60    # 1 min  — individual project records
CACHE_TTL_MEDIUM = 300   # 5 min  — lists, dashboard stats, analytics
CACHE_TTL_LONG   = 3600  # 1 hr   — OTT platform catalogue (rarely changes)
```

### Cached Endpoints

| Endpoint | Cache Key | TTL |
| :--- | :--- | :--- |
| `GET /projects/` | `projects:all` | 5 min |
| `GET /projects/{id}` | `projects:{id}` | 1 min |
| `GET /analytics/dashboard` | `analytics:dashboard` | 5 min |
| `GET /analytics/box-office` | `analytics:box-office` | 5 min |
| `GET /analytics/ott-deals` | `analytics:ott-deals` | 5 min |

### Cache Invalidation on Writes
```python
# After any project mutation:
await cache_delete_pattern("projects:*")  # Wipes all project keys
# → Next read re-fetches fresh data from PostgreSQL
```

---

## 🚀 Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+ (running on `5432`)
- Redis 6+ (running on `6379`) — optional, gracefully skipped if missing

### 1. Clone the Repository
```bash
git clone https://github.com/saumyashah0510/CineCore_DB.git
cd CineCore_DB
```

### 2. Backend Setup
```bash
cd Backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

Create `Backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=CineCoreDB
DB_USER=postgres
DB_PASSWORD=[YOUR_PASSWORD]
REDIS_HOST=localhost
REDIS_PORT=6379
DEMO_MODE=True
SUPERADMIN_KEY=[YOUR_SECRET_KEY]
GROQ_API_KEY=[YOUR_GROQ_KEY]
```

Start the server:
```bash
python run.py
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
```

Create `Frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SUPERADMIN_EMAIL=[YOUR_EMAIL]
VITE_SUPERADMIN_PASSWORD=[YOUR_SECRET_KEY]
```

Start the dev server:
```bash
npm run dev
# App: http://localhost:5173
```

---

## 📦 Deployment

This project is deployed across four free-tier cloud services:

| Service | Provider | Notes |
|:---|:---|:---|
| PostgreSQL | [Supabase](https://supabase.com) | Session pooler (IPv4) |
| Redis Cache | [Upstash](https://upstash.com) | SSL (`rediss://`) required |
| Backend API | [Render](https://render.com) | Root dir: `Backend`, Python 3.12 |
| Frontend | [Vercel](https://vercel.com) | Root dir: `Frontend`, Vite preset |

### Keep-Alive Setup (Prevents Cold Starts)
Render free tier sleeps after 15 minutes of inactivity. Ping it every 10 minutes using [cron-job.org](https://cron-job.org):
```
URL: https://cinecore-backend.onrender.com/health
Schedule: Every 10 minutes
```

---

## 📡 API Reference

Interactive Swagger documentation available at `/docs` on the live API.

### Key Endpoints

```http
GET    /api/v1/projects/                    # All projects with budget summary
GET    /api/v1/projects/{id}               # Single project detail
POST   /api/v1/projects/                    # Create project (triggers sp_create_project)
PATCH  /api/v1/projects/{id}               # Update project fields
GET    /api/v1/projects/{id}/budget        # Budget heads with spend %

GET    /api/v1/analytics/dashboard         # Studio-wide KPIs
GET    /api/v1/analytics/box-office        # Theatre collection rankings
GET    /api/v1/analytics/ott-deals         # OTT deal summary
GET    /api/v1/analytics/budget-health     # Overspend monitoring

GET    /api/v1/contracts/                   # All contracts
POST   /api/v1/contracts/                   # Create contract
GET    /api/v1/persons/                     # Talent registry
GET    /api/v1/distribution/               # OTT + theatre data

GET    /health                              # Health check (api + db + redis)
GET    /docs                                # Swagger UI
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <br />
  <i>"Cinema is a matter of what's in the frame and what's out."</i>
  <br />— Martin Scorsese
  <br /><br />
  <b>Built with precision. Deployed for the world.</b>
  <br /><br />
  <a href="https://cinecore-db.vercel.app">🌐 Live Demo</a> &nbsp;·&nbsp;
  <a href="https://cinecore-backend.onrender.com/docs">📡 API Docs</a> &nbsp;·&nbsp;
  <a href="https://github.com/saumyashah0510/CineCore_DB/issues">🐛 Report Bug</a>
</div>
