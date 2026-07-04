# Buddy Script — Social Media Platform

A production-oriented full-stack social media application built with **Next.js 16**, **React 19**, and **PostgreSQL**. It delivers a LinkedIn-style feed experience with posts, comments, replies, likes, and image uploads — backed by a scalable, event-driven architecture designed to support high traffic and future real-time features.

---

## Features

| Area | Capabilities |
|------|-------------|
| **Auth** | Register, login, logout, JWT access tokens, refresh token rotation, silent refresh, multi-tab session sync, logout from all devices |
| **Feed** | Cursor-based infinite scroll, feed preloading, duplicate removal, optimistic UI updates |
| **Posts** | Create (text + image), edit, delete, public/private visibility, like/unlike |
| **Comments** | Threaded comments and replies, like/unlike, delete |
| **UI** | Three-column feed layout, stories strip, sidebar navigation, responsive design |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Database | PostgreSQL + Prisma 7 |
| Client state | TanStack Query v5 |
| HTTP client | Axios (centralized with interceptors) |
| Validation | Zod |
| Cache | Redis (ioredis) — optional, graceful fallback |
| Events | Kafka (kafkajs) — optional, graceful fallback |
| Auth | Custom JWT + httpOnly cookies |

---

## Architecture

```
Browser (React)
    │
    ▼
Centralized API Client (lib/axios)
    │  • Auth interceptors  • Silent refresh  • Retry queue
    ▼
Next.js BFF Routes (/api/v1/*)
    │  • Cookie handling  • Response shaping  • Validation
    ▼
Service Layer (services/, modules/)
    │  • Business logic  • Authorization  • Event publishing
    ▼
Repository Layer (repositories/)
    │
    ├──▶ PostgreSQL (Prisma)
    ├──▶ Redis (feed / user / session cache)
    └──▶ Kafka (async events → consumers)
```

### Write path (e.g. new post)

1. Save to PostgreSQL via repository
2. Publish Kafka event (`PostCreated`, etc.)
3. Invalidate affected Redis cache keys only
4. Consumers handle notifications, analytics, search indexing async

### Read path (e.g. home feed)

1. Check Redis cache (cache-aside pattern)
2. On miss → query database → cache result with TTL
3. Client preloads next page while user scrolls

---

## Project Structure

```text
socialmedia/
├── app/
│   ├── (auth)/              # Login, register pages
│   ├── (protected)/         # Feed page
│   └── api/
│       ├── v1/              # Versioned BFF API (primary)
│       └── */               # Legacy routes (backward compatible)
├── components/              # UI components (PostCard, FeedLayout, etc.)
├── constants/               # API version, cache keys, events, query keys
├── hooks/                   # useAuth, usePosts, useComments
├── lib/
│   ├── auth/                # JWT, cookies, session, middleware
│   ├── axios/               # API client, interceptors, error mapping
│   ├── kafka/               # Producer, consumer, DLQ
│   ├── logger/              # Structured JSON logging
│   ├── redis/               # Cache-aside, rate limiting
│   └── realtime/            # WebSocket-ready adapter (stub)
├── modules/
│   ├── feed/                # Feed caching, deduplication, merge
│   ├── jobs/                # Job feed architecture (stub)
│   └── consumers/           # Kafka event handlers
├── providers/               # QueryProvider, AuthProvider
├── repositories/            # Prisma data access
├── services/                # Business logic + client API services
│   └── api/                 # auth.api, posts.api, comments.api, upload.api
├── types/                   # Shared types + DTOs
└── prisma/                  # Database schema
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL
- Redis and Kafka (optional for local dev)

### Installation

```bash
# Clone and install dependencies
pnpm install

# Copy environment file and configure
cp .env.example .env

# Generate Prisma client
pnpm exec prisma generate

# Run database migrations (when available)
pnpm exec prisma migrate dev

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/login`.

### Production build

```bash
pnpm build
pnpm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens |
| `REDIS_URL` | No | Redis connection (caching disabled if unset) |
| `KAFKA_BROKERS` | No | Comma-separated Kafka brokers (events logged locally if unset) |
| `KAFKA_CLIENT_ID` | No | Kafka client identifier |
| `LOG_LEVEL` | No | `debug` \| `info` \| `warn` \| `error` |
| `NODE_ENV` | No | `development` \| `production` |

See [`.env.example`](.env.example) for a full template.

---

## API Overview

All frontend requests go through **`/api/v1`** via the centralized Axios client.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout current session |
| POST | `/api/v1/auth/logout-all` | Revoke all refresh tokens |
| POST | `/api/v1/auth/refresh` | Rotate tokens (silent refresh) |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/posts` | Paginated feed (`?cursor=`) |
| POST | `/api/v1/posts` | Create post |
| PATCH/DELETE | `/api/v1/posts/:id` | Update / delete post |
| POST | `/api/v1/posts/:id/like` | Toggle like |
| GET/POST | `/api/v1/posts/:id/comments` | List / create comments |
| POST | `/api/v1/comments/:id/like` | Toggle comment like |
| POST | `/api/v1/comments/:id/replies` | Create reply |
| POST | `/api/v1/upload` | Upload image |

Responses use a consistent envelope:

```json
{ "success": true, "data": {}, "message": "..." }
```

---

## Authentication

- **Access token** — JWT, 15-minute TTL, stored in httpOnly cookie
- **Refresh token** — Opaque token, hashed in DB, 30-day TTL, rotated on every refresh
- **Silent refresh** — Axios interceptor catches 401, refreshes tokens, retries queued requests
- **Multi-tab sync** — `BroadcastChannel` keeps sessions consistent across tabs
- **Route protection** — `proxy.ts` guards `/feed`; unauthenticated users redirect to `/login`

---

## Kafka Events

Important actions publish events for async processing:

`PostCreated` · `PostUpdated` · `PostDeleted` · `CommentCreated` · `CommentDeleted` · `LikeAdded` · `LikeRemoved` · `MediaUploaded` · `FeedRefreshRequested` · `AnalyticsTracked`

Consumers (started via `instrumentation.ts` when Kafka is configured):

- **Cache** — Targeted Redis invalidation
- **Notifications** — Notification generation hook
- **Analytics** — Metrics and activity tracking

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

---

## Database Models

- **User** — Accounts with bcrypt password hashes
- **Post** — Content, optional image, public/private visibility
- **Comment** — Top-level comments on posts
- **Reply** — Nested replies on comments
- **PostLike / CommentLike / ReplyLike** — Reaction records
- **RefreshToken** — Hashed refresh tokens with revocation support

Schema: [`prisma/schema.prisma`](prisma/schema.prisma)

---

## Roadmap-Ready

The codebase is structured for:

- WebSocket live feed updates and notifications
- Horizontal scaling (stateless API + Redis + Kafka)
- Job listings module (`modules/jobs/`)
- Object storage for uploads (S3/CDN)
- Prometheus / Grafana observability via structured logs

---

## License

Private — Appify social media project.
