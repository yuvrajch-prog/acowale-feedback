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
  - **Authentication & User Model**: HMAC-SHA256 JWT Admin Authentication (`POST /api/v1/auth/login`) backed by a relational `User` table (`email`, `passwordHash`, `role: ADMIN | USER`). Admin authentication guards all sensitive analytics and triage routes (`requireAdminAuth` middleware), while public feedback submission remains open.

---

### 2. Why did you choose this database?
- **PostgreSQL via Neon DB (Serverless Postgres) with Prisma ORM**:
  - **Relational Schema Design**: Includes structured **`User`** model (Role-based access control `ADMIN` vs `USER`) and **`Feedback`** model with relational foreign keys.
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
- **Handling Serverless PostgreSQL Connection Lifecycles**:
  - Connecting Node.js Express APIs to serverless databases (like Neon DB) can cause connection pool exhaustion if connections aren't reused across warm serverless lambdas or container restarts.
  - **Solution**: Structured Prisma Client singleton instance with automatic connection pooling (`?sslmode=require&pgbouncer=true`) and implemented defensive fallback state handling inside the service layer to maintain 100% uptime regardless of DB network glitches.

---

### 7. Which AI tools did you use?
- **Antigravity AI (Gemini 3.5 Flash)**: Used for architecture planning, TypeScript schema generation, unit test creation, responsive layout refinement, and drafting engineering documentation.

---

### 8. Share one instance where AI helped you.
- **Complex Recharts Customization & Responsive Layouts**:
  - AI generated the exact SVG gradient definitions (`<linearGradient id="colorTrend">`) and custom tooltip formatting for the submission trend area chart and category breakdown bar chart, saving ~45 minutes of trial-and-error CSS/SVG tweaking.

---

### 9. Share one instance where AI disagreed with AI/you and why.
- **Database Connection Strategy (SQLite vs Neon PostgreSQL)**:
  - Initial AI suggestion recommended SQLite (`better-sqlite3`) for local zero-config testing. However, since the user explicitly requested live deployment on Neon DB free-tier PostgreSQL, I overrode the SQLite suggestion to use **Prisma ORM with PostgreSQL**. I kept an in-memory fallback layer inside the service so local execution and unit tests remain zero-dependency while production targets Neon Postgres.

---

### 10. What would break first if this application suddenly had 100,000 users?
1. **Unindexed Full-Text Search**: Performing `ILIKE '%keyword%'` across 100,000+ comment records in PostgreSQL without a `pg_trgm` or Elasticsearch index would cause high DB CPU utilization and query timeouts.
2. **Database Connection Limits**: Without connection pooling (like Neon's PgBouncer or AWS RDS Proxy), 100,000 concurrent web requests would exhaust PostgreSQL max connections (`max_connections=100`).
3. **API Rate Limiting Memory**: In-memory `express-rate-limit` would consume excessive RAM under high IP cardinality; it would need offloading to Redis.

---

### 11. What is one thing in this assignment that you would improve, change, or challenge?
- **Implicit Feedback Workflow Loop**:
  - The assignment prompt treats feedback as a passive data collection exercise. In real-world product engineering, feedback requires a **Closed-Loop Customer Communication Mechanism**. Adding automated email updates to users when their submitted bug or feature request changes status from `OPEN` -> `RESOLVED` ("You built that!") turns feedback from a static submission into an active retention tool.
