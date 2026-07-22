# Engineering Decision Log (`DECISIONS.md`)
**Candidate Submission**: Acowale CRM Machine Test  
**Project**: Customer Feedback Platform & Admin Analytics Dashboard  

---

### 1. Why did you choose this technology stack?
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Recharts + Lucide Icons.
  - **Vite & React 18**: Provides instantaneous HMR, fast production bundling, and strong ecosystem support.
  - **Clean & Professional Design System**: A crisp, enterprise-grade light UI (inspired by Stripe & Linear) prioritizing high-contrast legibility, clean card boundaries, and zero visual clutter.
  - **Recharts**: Lightweight SVG-based charting library optimal for real-time category distribution and daily feedback trend visualization.
- **Backend**: Node.js + Express + TypeScript + Zod + Helmet + Express Rate Limit + JWT Auth.
  - **Express with TypeScript**: Provides lightweight, battle-tested HTTP routing with full type safety across requests and responses.
  - **Zod**: Guarantees runtime request validation with zero-dependency TypeScript inference, catching malformed payloads before they reach controllers.
  - **Authentication & User Model**: HMAC-SHA256 JWT Admin Authentication (`POST /api/v1/auth/login`) backed by a relational `User` table (`email`, `password`, `role: ADMIN`). Admin authentication guards all sensitive analytics and triage routes (`requireAdminAuth` middleware), while public feedback submission remains open.

---

### 2. Why did you choose this database?
- **PostgreSQL via Neon DB (Serverless Postgres) with Prisma ORM**:
  - **Relational Schema Design**: Includes structured **`User`** model (for Admin authentication/role management) and **`Feedback`** model with optimized database indexes.
  - **Free Tier Cloud Accessibility**: Neon provides instant free-tier serverless PostgreSQL with scale-to-zero capabilities, automatic connection pooling (`pgbouncer`), and low-latency branching without infrastructure overhead.
  - **Prisma ORM**: Gives type-safe query generation, automated schema migrations (`prisma db push`), and declarative model definitions (`schema.prisma`).
  - **Resiliency & Fallback Strategy**: Built with a layered repository abstraction so that in disconnected environments (e.g. offline testing before plugging DB credentials), the application seamlessly uses an in-memory fallback store without throwing 500 crashes.

---

### 3. Why did you structure your application this way?
- **Decoupled Client-Server Architecture**:
  - `client/` and `server/` operate as independent, standalone projects, sharing a unified root repository.
  - **Separation of Concerns**: Controllers only handle HTTP translation; Services encapsulate domain logic and database access; Middleware handles validation, rate limiting, authentication, and global error envelope formatting (`{ success: false, error: {...} }`).
  - **Zero-Cost Deployment Agility**: Frontend deploys seamlessly to Vercel/Netlify free tiers, while the Node.js API deploys to Render/Railway free tiers, eliminating complex infrastructure costs.

---

### 4. What trade-offs did you make due to time constraints?
- **Deferred Docker & CI/CD Pipelines**: Deferred Docker containerization and GitHub Actions automation to the future roadmap to focus 100% of effort on rapid development, UI polish, clean API design, authentication, and direct deployment to free cloud tiers (Neon + Render + Vercel).
- **WebSockets / Real-Time Push**: Admin dashboard updates via polling and manual refresh instead of WebSocket / Server-Sent Events (SSE) push streams.

---

### 5. What would you improve if you had one more week?
1. **Docker & CI/CD Automation**: Implement multi-stage production Docker images and GitHub Actions CI/CD workflows for automated deployment.
2. **Multi-Tenant Role Permissions**: Implement fine-grained RBAC roles (Super Admin, Team Moderator, Read-Only Analyst).
3. **Automated Sentiment Analysis**: Integrate OpenAI / Claude / Gemini API on submission to automatically grade customer feedback sentiment (Positive, Neutral, Negative) and extract key topic tags.
4. **Automated Notification Triggers**: Webhook integration with Slack / Discord / Email (SendGrid/Resend) when urgent `BUG_REPORT` entries with 1-star ratings are submitted.

---

### 6. What was the most difficult technical challenge you faced?
- **Managing Serverless PostgreSQL Connection Lifecycles & Resilient Fallback Architecture**:
  - Connecting Node.js Express APIs to serverless databases (like Neon DB) can cause connection pool exhaustion if connections aren't recycled properly across container lifecycles. Furthermore, database network latency or offline local testing shouldn't block app boot-up or test runners.
  - **Solution**: Structured a Prisma Client singleton instance with automatic connection pooling (`?sslmode=require&pgbouncer=true`). Concurrently, implemented a service-level repository fallback mechanism that detects database unavailability and routes operations to a synchronized in-memory database store, maintaining 100% application uptime and facilitating zero-dependency local testing.

---

### 7. Which AI tools did you use?
- **ChatGPT & Antigravity AI (Gemini)**: Used as supplementary pair-programming tools for initial boilerplate scaffolding, API documentation research, and optimizing CSS/SVG layouts.

---

### 8. Share one instance where AI helped you.
- **Bootstrapping Boilerplate & Recharts SVG Configuration**:
  - Used AI to quickly draft Recharts SVG styling configurations (e.g., custom tooltip styling and gradient boundaries). This automated the repetitive layout tweaking, allowing focus to remain on implementing secure authentication guard middleware and robust service-level fallbacks.

---

### 9. Share one instance where AI disagreed with AI/you and why.
- **Database Architecture Decisions (SQLite vs. PostgreSQL)**:
  - The AI suggested using `better-sqlite3` locally for a zero-config setup. This recommendation was overridden to ensure production parity with Neon serverless PostgreSQL from the start. A repository pattern was designed with an in-memory fallback mechanism in the service layer, keeping local test suites zero-dependency while maintaining production-grade PostgreSQL support.

---

### 10. What would break first if this application suddenly had 100,000 users?
1. **Unindexed Full-Text Search**: Performing `ILIKE '%keyword%'` across 100,000+ comment records in PostgreSQL without a `pg_trgm` or Elasticsearch index would cause high DB CPU utilization and query timeouts.
2. **Database Connection Limits**: Without connection pooling (like Neon's PgBouncer or AWS RDS Proxy), 100,000 concurrent web requests would exhaust PostgreSQL max connections (`max_connections=100`).
3. **API Rate Limiting Memory**: In-memory `express-rate-limit` would consume excessive RAM under high IP cardinality; it would need offloading to Redis.

---

### 11. What is one thing in this assignment that you would improve, change, or challenge?
- **Implicit Feedback Workflow Loop**:
  - The assignment prompt treats feedback as a passive data collection exercise. In real-world product engineering, feedback requires a **Closed-Loop Customer Communication Mechanism**. Adding automated email updates to users when their submitted bug or feature request changes status from `OPEN` -> `RESOLVED` ("You built that!") turns feedback from a static submission into an active retention tool.
