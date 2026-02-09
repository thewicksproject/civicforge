# CLAUDE.md - CivicForge Ascendant Development Guide

Essential context for AI agents working on CivicForge.

## What is CivicForge?

A community civic coordination system where people post needs, offer help, complete quests, develop skills, form guilds, and govern their community together. Inspired by LitRPG game mechanics translated to real civic coordination — but designed to distribute power, not concentrate it. A Wicks LLC project at `civicforge.org`.

**Core Philosophy:** "People do not need to be managed into purpose; they need systems that make purposeful action legible, composable, and rewarding in ways that respect their autonomy."

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database + Auth | Supabase (PostgreSQL + Auth + Storage) |
| ORM | Drizzle ORM |
| AI | Vercel AI SDK 6 + Claude Sonnet (personal AI advocate architecture) |
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
  onboarding/page.tsx              # Community + profile setup
  (app)/                           # Auth-required routes with nav
    board/page.tsx                 # Needs Board (main screen)
    board/[postId]/page.tsx        # Post detail + responses
    post/new/page.tsx              # Create post
    profile/page.tsx               # Own profile
    profile/[userId]/page.tsx      # View others
    settings/privacy/page.tsx      # Settings, data export, deletion
    community/[id]/members/        # Member list + admin controls
    community/[id]/invite/         # Generate invite codes
  actions/                         # Server Actions (all CRUD)
    posts.ts, responses.ts, thanks.ts, profiles.ts, communities.ts
    invitations.ts, membership.ts, flags.ts, admin.ts
    quests.ts                      # Quest CRUD, XP awards, validation
    skills.ts                      # Skill progress queries
    guilds.ts                      # Guild CRUD, membership, steward mgmt
    endorsements.ts                # Peer endorsements, renown
    governance.ts                  # Proposals, quadratic voting, delegation
  api/ai/                          # AI route handlers (rate-limited)
    extract/                       # Post extraction from text
    match/                         # Profile matching for posts
    quest-extract/                 # Natural language -> quest parameters
    quest-match/                   # Match quests to user skills/availability
    advocate/                      # Personal AI advocate chat
  api/auth/callback/               # OAuth callback
  api/privacy/                     # Data export + deletion
components/                        # React components
lib/
  supabase/ (client, server, middleware)
  ai/
    client.ts                      # LLM calls: extractPost, findMatches, moderateContent,
                                   #   extractQuest, matchQuests, advocateChat, analyzeProposal
    schemas.ts                     # Zod schemas: post, match, moderation, quest, advocate, governance
    sanitize.ts                    # Datamarking + XSS output sanitization
    prompts.ts                     # System prompts with sandwich defense:
                                   #   POST_EXTRACTION, MATCHING, MODERATION,
                                   #   QUEST_EXTRACTION, QUEST_MATCHING, ADVOCATE, GOVERNANCE_ANALYSIS
  db/schema.ts                     # Drizzle schema (25 tables)
  photos/process.ts                # Sharp image pipeline
  privacy/ (consent, deletion, export)
  types.ts                         # Constants, enums, Ascendant types
  utils.ts                         # Helpers
middleware.ts                      # Auth + CSP + GPC detection
supabase/migrations/               # SQL migrations with RLS
```

## Security Architecture (Non-Negotiable)

### AI Isolation Model
User text and matching logic NEVER share an LLM context. Post creation uses datamarked input. Matching receives only structured output. Both use Zod-validated schemas. Quest extraction and advocate chat also use datamarking.

### Personal AI Advocate (Layer 3)
The advocate serves the USER, not the system. It is architecturally separated from system AI.
- NEVER shares user's private information without explicit permission
- NEVER pressures participation or gaming
- Detects coercion, power concentration, and exploitation
- Frames contributions as human stories, not point accumulation

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
- **Golden Hour** `#DEBA85` — warm accent, reputation/Pillar badges
- **Meadow** green — primary, offers, Green domain
- **Rose Clay** — needs, Craft/Hearth domains
- **Horizon** blue — events, Care/Signal domains, Keeper badges
- Charter serif headings, system-ui body (17px, line-height 1.7)
- Warm White / Cream backgrounds, OKLCH color space
- Cards: cream bg, 12px radius, subtle lift on hover

## Ascendant System Architecture

### The Hearthboard (Quest Board)
Community needs surfaced as structured quests with clear completion criteria.

| Difficulty | Name | Validation | Base XP | Example |
|------------|------|-----------|---------|---------|
| 1 | Spark | Self-report | 5 | Pick up litter |
| 2 | Ember | 1 peer confirms | 15 | Help move a couch |
| 3 | Flame | Photo + peer | 35 | Repair a fence |
| 4 | Blaze | Community vote (3+) | 75 | Organize block cleanup |
| 5 | Inferno | Vote + evidence | 150 | Multi-week project |

### The Forge (Skill Domains)
Seven non-hierarchical domains — no single path is superior.

| Domain | Color | Examples |
|--------|-------|----------|
| Craft | rose-clay | Home repair, woodworking, electrical |
| Green | meadow | Gardening, composting, urban farming |
| Care | horizon | Childcare, eldercare, tutoring |
| Bridge | golden-hour | Transportation, moving, delivery |
| Signal | horizon | Tech help, translation, teaching |
| Hearth | rose-clay | Cooking, event hosting, gathering |
| Weave | golden-hour | Coordination, governance, conflict resolution |

XP progression is logarithmic (fast early momentum, mastery takes effort).
Skill levels are **private by default** — the most important anti-Nosedive safeguard.

### Renown Tiers (5-tier reputation)
Reputation unlocks ACCESS, not PUNISHMENT. Never decremented by others.

| Tier | Name | Requirement | Unlocks |
|------|------|-------------|---------|
| 1 | Newcomer | Sign up | Browse, post needs, respond |
| 2 | Neighbor | Invitation + 1 quest | Post offers, create quests, join parties |
| 3 | Pillar | 50+ Renown + vouched by 2 Pillars | Create guilds, moderate |
| 4 | Keeper | 200+ Renown + 6 months + steward exp | Governance, propose rules |
| 5 | Founder | 500+ Renown + cross-domain + mentoring | Cross-community coordination |

### Guilds
Persistent groups organized around skill domains:
- Mandatory charters with sunset clauses (default 1 year)
- Elected stewards (6-month terms, max 2 consecutive)
- Liquid delegation for guild decisions
- Domain-scoped only — no super-guilds

### Governance
- Quadratic voting for charter amendments
- Liquid democracy for guild decisions
- Approval voting for steward elections
- All rules subject to sunset clauses

### Privacy Tiers
- Ghost: badge only
- Quiet: tier + domain summary (DEFAULT)
- Open: full profile
- Mentor: full + availability

## Anti-Dystopia Principles (Non-Negotiable)

1. **No Coercion Test:** Every feature must pass: "Could someone who never joins live a full, comfortable life?"
2. **Multidimensional reputation:** One score per domain, NOT a single public number
3. **Access not punishment:** Renown unlocks capabilities; it is never decremented by others
4. **No economic gatekeeping:** Never controls housing, employment, government services
5. **No leaderboards:** No public rankings, no streaks, no loss aversion mechanics
6. **Sunset clauses:** No permanent rules — everything expires and must be re-ratified
7. **Federated:** Each community is sovereign; no central override
8. **AI proposes, never decides:** System AI suggests; humans approve

## Schneier's Design Axiom
AI should DECENTRALIZE rather than concentrate power. The personal AI advocate (Layer 3) serves the user and is architecturally adversarial to the system AI (Layer 2) when needed.

## Implementation Versions

- **V2 (current):** Needs board + AI matching + trust tiers 1-3 + thanks + privacy
- **V2.5 (in progress):** Quest layer + skill domains + AI advocate MVP + endorsements
- **V3 (next):** Guilds + parties + full skill progression + AI advocate v2
- **V4 (future):** Governance + quadratic voting + sunset clauses + Collective Constitutional AI
- **V5 (future):** Federation + ZK proofs + multi-provider AI advocates

## Key Principles

1. **Humans navigate, AI advocates** — AI serves the user, not the platform
2. **Privacy by design** — EXIF stripped, no precise addresses, GPC honored, skills private by default
3. **Community ownership** — no ads, no data selling, ever
4. **Progressive trust** — earn capabilities through meaningful action
5. **Ship minimal, iterate from real use** — avoid vision bloat
6. **Narrative over numbers** — frame contributions as human stories, not scores
7. **Distribute power** — every design choice must pass Schneier's test

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

## Not Yet (Deferred)

These are explicitly deferred:
- Federated architecture / P2P / ActivityPub (V5)
- ZK proofs / Semaphore (V5)
- W3C DIDs / self-sovereign identity (V5)
- Local/cloud hybrid AI inference split (V5)
- Chat-first interface (V2.5 advocate is API-first)
- Docker / self-hosting
- Native mobile app
- Pol.is deliberation widget (V4)
- Community currencies / time banking
