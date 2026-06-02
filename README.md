# Monarch System

A full-stack Solo Leveling–inspired hunter management platform with premium glassmorphism UI, built with **Next.js 15**, **PostgreSQL**, **Prisma**, and **Redis**.

## Features

- **Authentication** — Argon2id hashing, JWT access + refresh tokens, HTTP-only cookies, CSRF, rate limiting, email verification, password reset
- **Hunter System** — Level, XP, ranks (E → Monarch), 5 stats, stat allocation
- **Daily Quests** — Random quests, streak bonuses, XP/gold rewards
- **Achievements** — Visible and hidden achievements with claimable rewards
- **Inventory** — Equipment slots, rarity tiers, tooltips, equip flow
- **Dungeons** — Procedural gates, bosses, cooldowns, combat rolls
- **Shadow Army** — Summon and upgrade shadows
- **Leaderboards** — Global XP rankings
- **Guilds** — Create/join guilds, guild chat

## Quick Start

### 1. Start infrastructure

```bash
npm run docker:up
```

### 2. Environment

```bash
cp .env.example .env
```

Generate secrets:

```bash
openssl rand -base64 48  # JWT_ACCESS_SECRET
openssl rand -base64 48  # JWT_REFRESH_SECRET
openssl rand -base64 48  # CSRF_SECRET
```

### 3. Database

```bash
npm install
npm run db:push
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> In **development**, new accounts are auto-verified so you can log in immediately after signup. Verification links are logged to the terminal when SMTP is not configured.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, verify, password reset
│   ├── (dashboard)/     # Protected hunter UI pages
│   └── api/             # REST API routes
├── components/
│   ├── ui/              # Glass panel, button, input
│   ├── layout/          # Sidebar, notifications, modals
│   ├── game/            # XP bar, stat cards
│   └── effects/         # Particle field
├── lib/
│   ├── auth/            # JWT, sessions, Argon2
│   ├── security/        # CSRF, rate limit, sanitize
│   ├── game/            # Level/XP, quests, dungeons
│   └── db/              # Prisma client
├── stores/              # Zustand UI + player state
└── hooks/               # CSRF + API helpers
prisma/
├── schema.prisma        # Full database schema
└── seed.ts              # Quests, items, shadows, achievements
```

## Security

- OWASP-aligned headers (CSP, HSTS, X-Frame-Options)
- Parameterized queries via Prisma (SQL injection protection)
- Zod validation on all inputs
- DOMPurify sanitization (XSS protection)
- Per-route authorization with `requirePlayer()`
- Audit logging for auth events
- Secrets only in server environment variables

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 15, React 19, TypeScript    |
| Styling  | Tailwind CSS 4, Framer Motion       |
| State    | Zustand, TanStack Query             |
| Backend  | Next.js API Routes                  |
| Database | PostgreSQL + Prisma ORM             |
| Cache    | Redis (rate limiting + caching)       |
| Auth     | Argon2, jose (JWT), secure cookies  |

## License

MIT
