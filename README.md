# 🚀 Acowale CRM Machine Test
> **Lightweight Customer Feedback Platform & Admin Analytics Dashboard**  
> *Designed, built, and documented for the Acowale Software Engineering Machine Test Round.*

---

## 🌟 Executive Summary

**Acowale CRM** is a full-stack, production-ready feedback platform that enables:
1. **Public End-Users (`UserWindow`)**: Submit structured feedback, choose categories, assign star ratings, and provide comments via an intuitive glassmorphic interface (No login required).
2. **Authenticated Admin Team (`AdminConsole`)**: Protected by JWT authentication (`admin@acowale.com`), allowing internal teams to monitor feedback metrics, view category distribution charts, analyze volume trends, search/filter submissions, triage issues, and export CSV data.

---

## 🏗 Architecture & Tech Stack

```
                                  ┌───────────────────────────────┐
                                  │      React 18 + Vite SPA      │
                                  │  (UserWindow & AdminConsole)  │
                                  └───────────────┬───────────────┘
                                                  │ REST APIs + Bearer Token
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │    Node.js + Express Server   │
                                  │  (TypeScript, Zod, JWT Auth)  │
                                  └───────────────┬───────────────┘
                                                  │ Prisma ORM
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │    PostgreSQL (Neon DB)       │
                                  │    + Resilient Fallback Store │
                                  └───────────────────────────────┘
```

| Layer | Technology | Key Highlights |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS | Glassmorphic design system, public & protected views |
| **Authentication**| HMAC-SHA256 JWT Admin Auth | Token-based auth for admin dashboard and triage routes |
| **Analytics Charts** | Recharts | Category bar charts & daily volume trend area graphs |
| **Backend API** | Node.js, Express, TypeScript | Layered architecture (Controllers, Services, Auth Guard) |
| **Validation & Security**| Zod, Helmet, Express Rate Limit | Strict payload schemas, HTTP security headers, anti-spam rate limiting |
| **Database** | PostgreSQL (Neon DB), Prisma ORM | Serverless PostgreSQL with type-safe schema migrations |
| **Testing** | Vitest, Supertest | Automated API endpoint & authentication integration testing |

---

## 🔑 Admin Console Credentials (Demo Access)

- **Public Feedback Page**: Publicly accessible at `/` (No login required).
- **Admin Console Login**:
  - **Email**: `admin@acowale.com`
  - **Password**: `admin123` *(Or click "Auto-fill Demo Credentials" button inside the UI for 1-click evaluation!)*

---

## 🎯 Key Features & APIs

### 1. Public Feedback Form (`UserWindow`)
- **Rating Selector**: Interactive 5-star rating with dynamic feedback text.
- **Category Selector**: Bug Report, Feature Request, UI/UX, Performance, Other.
- **Field Validation**: Name, valid work email, character limit counter.
- **User Experience**: Glassmorphic UI with toast notifications.

### 2. Authenticated Admin Console (`AdminConsole`)
- **Metric Cards**: Total feedback count, average rating score, open triage count, resolved items.
- **Category Distribution Chart**: Interactive visual breakdown of feedback domains.
- **Submission Trend Chart**: Time-series volume area chart.
- **Data Table & Triage**: Real-time keyword search, category filter, status filter, rating filter.
- **Status Management**: Quick action modal to change item status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) and append internal admin notes.
- **Data Export**: One-click export of current feedback dataset to `.csv`.

### 3. Backend REST API Endpoints
- `POST /api/v1/auth/login`: Admin login returning JWT token.
- `GET /api/v1/auth/me`: Verify current admin session token.
- `POST /api/v1/feedback`: Submit feedback payload (Public, rate-limited).
- `GET /api/v1/feedback`: Fetch feedback list (Requires Admin Bearer token).
- `PATCH /api/v1/feedback/:id`: Update feedback status & append admin notes (Requires Admin Bearer token).
- `GET /api/v1/analytics/summary`: Aggregate analytics data (Requires Admin Bearer token).
- `GET /api/v1/health`: System health check endpoint.

---

## 🛠 Local Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/acowale-crm-machine-test.git
cd acowale-crm-machine-test

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Configuration
Create `.env` inside `server/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/acowale_crm?schema=public"
FRONTEND_URL=http://localhost:5173
ADMIN_SECRET_KEY=acowale-admin-secret-2026
```

### 3. Database Migration & Seeding
```bash
cd server
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Run Development Server
```bash
# Terminal 1: Backend API (Port 5000)
cd server && npm run dev

# Terminal 2: Frontend SPA (Port 5173)
cd client && npm run dev
```

Visit **`http://localhost:5173`**! Click **Admin Console** tab -> **Auto-fill Demo Credentials** -> **Authenticate Admin**.

---

## 🧪 Running Automated Tests

```bash
cd server && npm run test
```
*Runs 6/6 Vitest integration tests validating public submissions, authentication guards, invalid tokens, and analytics endpoints.*

---

## 🌐 Deploying to Free Cloud Resources (Neon DB + Render + Vercel)

### 1. Database Setup (Neon PostgreSQL - Free Tier)
1. Create a free database on [Neon.tech](https://neon.tech).
2. Copy the **Pooled Connection String** (`postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/acowale_crm?sslmode=require`).

### 2. Backend Deployment (Render / Railway Free Tier)
1. Build Command: `cd server && npm install && npm run db:generate && npm run build`
2. Start Command: `cd server && npm start`
3. Environment Variables: `DATABASE_URL`, `ADMIN_SECRET_KEY`.

### 3. Frontend Deployment (Vercel / Netlify Free Tier)
1. Framework: `Vite`, Root Directory: `client`.
2. Environment Variable: `VITE_API_URL` pointing to live backend.

---

## 📁 Assignment Deliverables
- [DECISIONS.md](file:///c:/Acowale/DECISIONS.md) - Answers to all 11 Acowale evaluation criteria questions.
- [TEACH_US.md](file:///c:/Acowale/TEACH_US.md) - Bonus technical insight document on Dual-Database Analytics Offloading (<500 words).
