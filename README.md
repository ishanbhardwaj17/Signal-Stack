# SignalStack

[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)](#tech-stack)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](#tech-stack)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis&logoColor=white)](#tech-stack)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socket.io&logoColor=white)](#tech-stack)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white)](#tech-stack)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-646CFF?logo=vite&logoColor=white)](#tech-stack)

**AI-powered incident response for modern operations teams.**

SignalStack is an internal incident response platform inspired by PagerDuty, designed to reduce mean time to detection (MTTD), accelerate investigation, and guide responders with real-time collaboration and AI-assisted analysis.

---

## Features

- `🚨` **6-stage incident lifecycle** from `OPEN` to `CLOSED` with explicit transition enforcement.
- `🛡️` **RBAC controls** for `USER`, `ENGINEER`, `SENIOR_ENGINEER`, and `ADMIN` personas.
- `📡` **Monitoring-driven incident creation** through configurable alert rules and synthetic metric ingestion.
- `⚡` **Real-time collaboration** with Socket.IO-powered live incident rooms, comments, assignment updates, SLA events, and AI progress notifications.
- `🤖` **AI-assisted incident intelligence** using Google Gemini 2.5 Flash for severity classification, summary generation, root-cause analysis, recommendations, and response playbooks.
- `✅` **Zod-validated structured AI output** to improve reliability of machine-generated operational guidance.
- `🧾` **Incident timeline / audit history** stored directly on incident records for operational traceability.
- `📈` **Live dashboard analytics** for incident totals, open workload, critical load, severity distribution, and daily trends.
- `🧰` **Operator-friendly workflows** for manual incident creation, responder assignment, and dashboard-driven demos.

---

## Architecture Overview

SignalStack uses a modular Node.js backend and React frontend with a shared real-time event model:

- **Frontend**: React + Vite + Redux Toolkit dashboard and incident console.
- **API Layer**: Express-based REST API for auth, incidents, monitoring, comments, AI, and analytics.
- **Primary Database**: MongoDB via Mongoose for incidents, comments, users, metrics, alert rules, alerts, and refresh tokens.
- **Queue / Async Work**: BullMQ + Redis for metric ingestion, SLA checks, and background AI analysis.
- **Realtime Layer**: Socket.IO for live incident feeds and room-based updates.
- **AI Layer**: Gemini 2.5 Flash for structured incident analysis and generated playbooks.

### High-Level Flow

1. Monitoring events or manual input create incident context.
2. BullMQ workers evaluate thresholds and schedule background jobs.
3. MongoDB persists incidents, alerts, comments, and analytics data.
4. Socket.IO broadcasts lifecycle changes and collaboration updates in real time.
5. Gemini enriches incidents asynchronously with summaries, root cause, recommendations, and playbooks.
6. The dashboard and incident detail views refresh live for operators and stakeholders.

### Key Design Decisions

| Decision | Why it matters |
| --- | --- |
| **MongoDB over relational storage** | Simplifies append-heavy incident timelines and flexible operational payloads. |
| **BullMQ for async workflows** | Keeps monitoring ingestion and AI analysis off the request path. |
| **Socket.IO room model** | Enables per-incident collaboration without polling-heavy clients. |
| **Zod validation around AI** | Reduces brittle JSON parsing and improves confidence in LLM outputs. |
| **Separate monitoring + incident surfaces** | Supports both automated detection and operator-driven response demos. |

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend runtime | Node.js (ES modules), Express 5 |
| Frontend | React 19, Vite, Redux Toolkit, React Router |
| Database | MongoDB, Mongoose |
| Queue / jobs | Redis, BullMQ |
| Realtime | Socket.IO, socket.io-client |
| AI | `@google/genai` with Gemini 2.5 Flash |
| Validation | Zod |
| Charts / analytics | Recharts |
| Styling | Tailwind CSS 4 |

---

## Quick Start / Local Development

### Prerequisites

- Node.js `22+`
- MongoDB running locally
- Redis running locally on `127.0.0.1:6379`
- Google Gemini API key

### 1. Install dependencies

```bash
cd Backend
npm install
cd ../Frontend
npm install
```

### 2. Configure environment variables

Create `Backend/.env` with the variables listed in the [Environment Variables](#environment-variables) section below.

Optional frontend configuration can be set with Vite env vars:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start MongoDB and Redis

Make sure both services are available before launching the app:

- MongoDB for application persistence
- Redis for BullMQ and Socket.IO event relays

### 4. Start the backend

```bash
cd Backend
npm run dev
```

By default, the backend listens on the `PORT` configured in `Backend/.env`. The current local setup commonly uses `5000`.

### 5. Start the frontend

```bash
cd Frontend
npm run dev
```

The Vite development server runs on `http://localhost:5173` by default.

### 6. Create demo data

Current repository state supports two practical demo-data paths:

#### Option A: Create data through the UI

1. Register and log in.
2. Open the **Monitoring** page.
3. Create one or more alert rules for a service such as `payments-api`.
4. Ingest a matching metric to auto-create incidents.
5. Open **Incidents** to create additional manual incidents if needed.

#### Option B: Seed data manually through API calls

Use the auth, monitoring, and incident endpoints documented below to create:

- users by role
- alert rules
- synthetic metrics
- manual incidents

> Note: An automated seed script is planned as part of demo hardening and is listed in the roadmap below.

### 7. Validate the frontend

```bash
cd Frontend
npm run lint
npm run build
```

---

## Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | Yes | API server port, e.g. `5000`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `NODE_ENV` | Yes | Runtime mode, usually `development` or `production`. |
| `JWT_SECRET` | Yes | JWT signing fallback secret. |
| `ACCESS_TOKEN_SECRET` | Recommended | Dedicated access-token signing secret. Falls back to `JWT_SECRET` if omitted. |
| `ACCESS_TOKEN_EXPIRES` | Optional | Access-token expiry window, default `15m`. |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Optional | Refresh-token lifetime in days, default `7`. |
| `FRONTEND_URL` | Recommended | Allowed frontend origin for CORS and cookies, e.g. `http://localhost:5173`. |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI analysis. |
| `MONITORING_INGEST_TOKEN` | Optional | Shared token for secure metric ingestion without a user session. |

### Frontend (optional Vite env)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Optional | API base URL. Defaults to `http://localhost:5000/api`. |
| `VITE_SOCKET_URL` | Optional | Socket.IO origin. Defaults to the API origin without `/api`. |

---

## Project Structure

```text
SignalStack/
├── Backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       │   ├── ai/
│       │   ├── auth/
│       │   ├── comment/
│       │   ├── dashboard/
│       │   ├── incident/
│       │   └── monitoring/
│       ├── queues/
│       ├── socket/
│       ├── utils/
│       └── workers/
└── Frontend/
    ├── package.json
    └── src/
        ├── app/
        ├── features/
        │   ├── auth/
        │   ├── dashboard/
        │   ├── incidents/
        │   └── monitoring/
        ├── layouts/
        ├── shared/
        └── styles/
```

### Important folders

| Path | Purpose |
| --- | --- |
| `Backend/src/modules/incident` | Incident lifecycle rules, service layer, validation, and routes |
| `Backend/src/modules/ai` | Gemini prompts, AI service orchestration, and AI API routes |
| `Backend/src/modules/monitoring` | Alert-rule management, metric ingestion, and monitoring APIs |
| `Backend/src/workers` | BullMQ workers for SLA checks and AI/monitoring background jobs |
| `Backend/src/socket` | Socket.IO initialization and event relay logic |
| `Frontend/src/features/dashboard` | Live analytics dashboard and socket-driven feed |
| `Frontend/src/features/incidents` | Incident list, details, assignment, comments, and AI views |
| `Frontend/src/features/monitoring` | Alert-rule management and metric injection console |

---

## API Documentation

SignalStack does not currently ship with Swagger or a checked-in Postman collection, so the most useful documentation today is the route surface itself.

### Core endpoints

| Area | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| Auth | `POST` | `/api/auth/register` | Register a user |
| Auth | `POST` | `/api/auth/login` | Start authenticated session |
| Auth | `GET` | `/api/auth/me` | Get current user |
| Auth | `GET` | `/api/auth/users?assignable=true` | List assignable responders |
| Incidents | `GET` | `/api/incidents` | List incidents |
| Incidents | `POST` | `/api/incidents` | Create manual incident |
| Incidents | `GET` | `/api/incidents/:id` | Get incident details |
| Incidents | `PATCH` | `/api/incidents/:id/assign` | Assign responder |
| Incidents | `PATCH` | `/api/incidents/:id/status` | Advance incident lifecycle |
| Comments | `GET` | `/api/comments/:incidentId` | Fetch incident comments |
| Comments | `POST` | `/api/comments/:incidentId` | Add incident comment |
| Monitoring | `GET` | `/api/monitoring/rules` | List alert rules |
| Monitoring | `POST` | `/api/monitoring/rules` | Create alert rule |
| Monitoring | `PATCH` | `/api/monitoring/rules/:ruleId` | Update alert rule |
| Monitoring | `DELETE` | `/api/monitoring/rules/:ruleId` | Delete alert rule |
| Monitoring | `POST` | `/api/monitoring/ingest` | Ingest metric event |
| Monitoring | `GET` | `/api/monitoring/activity` | View recent metrics and alerts |
| AI | `POST` | `/api/ai/incidents/:id/analyze` | Queue structured AI incident analysis |
| Dashboard | `GET` | `/api/dashboard/stats` | Summary metrics |
| Dashboard | `GET` | `/api/dashboard/severity-distribution` | Severity breakdown |
| Dashboard | `GET` | `/api/dashboard/trends` | Daily incident trends |

### Realtime events

Key Socket.IO events include:

- `incident:feed`
- `incident:created`
- `incident:assigned`
- `incident:statusUpdated`
- `incident:slaBreached`
- `incident:severityEscalated`
- `incident:aiQueued`
- `incident:aiProcessing`
- `incident:aiCompleted`
- `incident:aiFailed`
- `comment:added`

---

## Demo / Screenshots

> Add screenshots or recordings here for internal demos, release notes, or stakeholder decks.

Suggested captures:

- Dashboard overview with live feed and charts
- Monitoring rule creation screen
- Incident detail page with AI analysis and playbook
- Manual incident creation workflow
- Live socket-driven update sequence

```md
![Dashboard Screenshot](./docs/screenshots/dashboard.png)
![Incident Detail Screenshot](./docs/screenshots/incident-detail.png)
```

---

## Roadmap / Upcoming Features

- Automated seed script for one-command demo setup
- Swagger / OpenAPI or exported Postman collection
- Dedicated test suite for auth, lifecycle transitions, monitoring, and AI jobs
- SLA policy configuration UI
- Escalation policies and on-call schedules
- Incident ownership history and richer audit exports
- Notifications via Slack, email, or paging integrations
- Role-aware admin console for user provisioning
- Stronger reporting around MTTD / MTTR and team performance

---

## Contributing

This repository is currently positioned as an internal or team-managed platform. If you are contributing:

1. Create a feature branch.
2. Keep backend and frontend changes modular.
3. Validate frontend changes with:

```bash
cd Frontend
npm run lint
npm run build
```

4. Prefer production-safe defaults for auth, monitoring, and incident-state transitions.
5. Keep AI behavior deterministic where possible through schema validation and strong prompts.

Recommended contribution areas:

- test coverage
- environment bootstrap automation
- alert integrations
- dashboard analytics depth
- operational documentation

---

## License

The package metadata currently uses **ISC**.

If SignalStack remains an internal platform, confirm and replace licensing details with your organization’s standard policy before broader distribution.

---

## Contact / Support

For internal support, architecture questions, or demo preparation:

- Platform Engineering / SRE Tooling Team
- Incident Response Program Owner
- AI Platform / DevOps Enablement Lead

Suggested internal channels:

- `#signalstack`
- `#incident-response`
- shared engineering wiki / runbook space

---

**SignalStack helps teams detect incidents faster, coordinate confidently, and resolve production issues with AI-augmented operational context.**
