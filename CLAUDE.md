# CLAUDE.md - CivicForge V2 Development Guide

Essential context for AI agents working on CivicForge.

## What is CivicForge?

A neighborhood needs board where people post needs, offer help, get AI-matched, and build reputation. Think "HOA killer" — community coordination without the bureaucracy. A Wicks LLC project at `civicforge.org`.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database + Auth | Supabase (PostgreSQL + Auth + Storage) |
| ORM | Drizzle ORM |
| AI | Vercel AI SDK 6 + Claude Sonnet |
| Styling | Tailwind CSS v4 + shadcn/ui (OKLCH colors) |
| Rate Limiting | Upstash Redis |
| Images | Sharp (EXIF strip, resize, compress) |
| Deployment | Vercel |

## Quick Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Project Structure

```
app/
  page.tsx                         # Landing page
  login/page.tsx                   # Auth (magic link + Google)
  onboarding/page.tsx              # Neighborhood + profile setup
  (app)/                           # Auth-required routes with nav
    board/page.tsx                 # Needs Board (main screen)
    board/[postId]/page.tsx        # Post detail + responses
    post/new/page.tsx              # Create post
    profile/page.tsx               # Own profile
    profile/[userId]/page.tsx      # View others
    settings/privacy/page.tsx      # Settings, data export, deletion
    neighborhood/[id]/members/     # Member list + admin controls
    neighborhood/[id]/invite/      # Generate invite codes
  actions/                         # Server Actions (all CRUD)
  api/ai/                          # AI route handlers (rate-limited)
  api/auth/callback/               # OAuth callback
  api/privacy/                     # Data export + deletion
components/                        # React components
lib/
  supabase/ (client, server, middleware)
  ai/ (client, schemas, sanitize, prompts)
  db/schema.ts                     # Drizzle schema (14 tables)
  photos/process.ts                # Sharp image pipeline
  privacy/ (consent, deletion, export)
  types.ts, utils.ts
middleware.ts                      # Auth + CSP + GPC detection
supabase/migrations/               # SQL migrations with RLS
```

## Security Architecture (Non-Negotiable)

### AI Isolation Model
User text and matching logic NEVER share an LLM context. Post creation uses datamarked input. Matching receives only structured output. Both use Zod-validated schemas.

### Auth
- Always `getUser()`, never `getSession()` for auth checks
- User IDs from auth only, never from client
- Service role key NEVER client-side

### RLS
- Every table has Row Level Security enabled
- Policies enforced at migration time
- Test: direct Supabase client cannot read other users' data

### Content Security
- CSP headers on all responses
- No `dangerouslySetInnerHTML`
- LLM output sanitized server-side before rendering
- EXIF/GPS stripped from all photos before storage

### Rate Limiting
- AI endpoints: 10 req/min/user via Upstash
- Daily token budget tracked in `ai_usage` table

## Design System

Inherits Wicks DNA with CivicForge twist:
- **Golden Hour** `#DEBA85` — warm accent, reputation badge
- **Meadow** green — primary, offers
- **Rose Clay** — needs
- **Horizon** blue — events, civic features
- Charter serif headings, system-ui body (17px, line-height 1.7)
- Warm White / Cream backgrounds, OKLCH color space
- Cards: cream bg, 12px radius, subtle lift on hover

## Trust Tiers

| Tier | Name | Requirement | Can |
|------|------|-------------|-----|
| 1 | Neighbor | Email + signup | Browse, react, message |
| 2 | Confirmed | Invite code OR admin approval | Post, respond, earn reputation |
| 3 | Verified | Vouched by 2+ Tier 3 (future) | Moderate, approve members |

## Key Principles

1. **Humans navigate, AI guides** — AI is invisible plumbing
2. **Privacy by design** — EXIF stripped, no precise addresses, GPC honored
3. **Community ownership** — no ads, no data selling, ever
4. **Progressive trust** — earn capabilities through action
5. **Ship minimal, iterate from real use** — avoid vision bloat

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=        # Admin key (server only)
ANTHROPIC_API_KEY=                # Claude API
UPSTASH_REDIS_REST_URL=           # Rate limiting
UPSTASH_REDIS_REST_TOKEN=         # Rate limiting
NEXT_PUBLIC_APP_URL=              # App URL (http://localhost:3000 for dev)
```

## Not V2

These are explicitly deferred. Build none of these until V2 ships:
- Federated architecture / P2P / Community Hubs
- W3C DIDs / self-sovereign identity
- Local Controller / Remote Thinker split
- Chat-first interface
- Docker / self-hosting
- Native mobile app
- Tier 3 verification UI
