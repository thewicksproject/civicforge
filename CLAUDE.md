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
| Visualization | D3-force (knowledge graph) + Recharts (charts) |
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
  join/[code]/page.tsx             # Join community via invite code
  privacy/page.tsx                 # Privacy policy
  terms/page.tsx                   # Terms of service
  (app)/                           # Auth-required routes with nav
    board/page.tsx                 # Needs Board (main screen)
    board/[postId]/page.tsx        # Post detail + responses
    board/quest/new/page.tsx       # Create quest
    board/quest/[questId]/page.tsx # View/edit quest
    post/new/page.tsx              # Create post
    profile/page.tsx               # Own profile
    profile/[userId]/page.tsx      # View others
    settings/privacy/page.tsx      # Settings, data export, deletion
    community/[id]/members/        # Member list + admin controls
    community/[id]/invite/         # Generate invite codes
    admin/review/                  # Content review dashboard
    game/                          # Game design system
      page.tsx                     # Design list
      design/new/page.tsx          # Create design
      design/[draftId]/page.tsx    # View design
      design/[draftId]/edit/page.tsx # Edit design
    governance/                    # Proposals + voting
      page.tsx                     # Proposal list
      new/page.tsx                 # Create proposal
      [proposalId]/page.tsx        # Proposal detail + voting
    guilds/                        # Guild management
      page.tsx                     # Guild list
      new/page.tsx                 # Create guild
      [guildId]/page.tsx           # Guild detail
    quests/[questId]/page.tsx      # Quest detail
  commons/                         # The Commons — public visualization dashboard
    layout.tsx                     # Minimal layout, no auth required
    page.tsx                       # Platform-wide aggregate view
    commons-dashboard.tsx          # Client component assembling all charts
    [communityId]/page.tsx         # Single-community view
    components/
      knowledge-graph.tsx          # D3-force interactive graph (centerpiece)
      domain-radar.tsx             # 7-axis skill domain radar (Recharts)
      renown-pyramid.tsx           # Tier distribution bars (custom SVG)
      quest-activity.tsx           # 12-week completion timeline (Recharts)
      guild-health.tsx             # Guild ecosystem bars (Recharts)
      governance-gauge.tsx         # Proposal status donut (Recharts)
      community-growth.tsx         # Member growth chart (Recharts)
      stat-card.tsx                # KPI card
      commons-header.tsx           # Title, community picker, timestamp
      privacy-notice.tsx           # Transparency notice
  actions/                         # Server Actions (24 files, all CRUD)
    activity.ts                    # Activity feed queries
    admin.ts                       # Admin operations
    commons.ts                     # Aggregate queries for Commons (no auth, privacy-guarded)
    communities.ts                 # Community CRUD
    endorsements.ts                # Peer endorsements, renown
    flags.ts                       # Content flagging
    game-designs.ts                # Game design CRUD, forking, publishing
    governance.ts                  # Proposals, quadratic voting, delegation
    guilds.ts                      # Guild CRUD, membership, steward mgmt
    interests.ts                   # Post interest tracking
    invitations.ts                 # Invite code generation + redemption
    membership.ts                  # Membership requests + approval
    notifications.ts               # Notification CRUD
    onboarding-guide.ts            # Onboarding state machine
    posts.ts                       # Post CRUD
    profiles.ts                    # Profile CRUD
    quest-comments.ts              # Quest comment threads
    quests.ts                      # Quest CRUD, XP awards, validation
    responses.ts                   # Response CRUD
    skills.ts                      # Skill progress queries
    stories.ts                     # Completion stories (narrative)
    thanks.ts                      # Thank-you system
    vouches.ts                     # Peer vouching for tier advancement
    waitlist.ts                    # Alpha waitlist interest
  api/ai/                          # AI route handlers (rate-limited)
    advocate/                      # Personal AI advocate chat
    extract/                       # Post extraction from text
    issue-decompose/               # Break community issues into quests
    match/                         # Profile matching for posts
    quest-extract/                 # Natural language -> quest parameters
    quest-match/                   # Match quests to user skills/availability
  api/auth/callback/               # OAuth callback
  api/dev/login/                   # Dev-only auth bypass
  api/membership/[requestId]/      # Membership approval workflow
    approve/                       # Approve membership request
    deny/                          # Deny membership request
  api/phone/                       # SMS verification (Twilio)
    send/                          # Send verification code
    verify/                        # Verify code
  api/photos/upload/               # Photo upload + processing
  api/privacy/                     # Data export + deletion
    delete/                        # Request data deletion
    export/                        # Export user data
    process-deletions/             # Cron: process pending deletions
components/                        # React components
lib/
  __tests__/                       # Vitest test files
  ai/
    budget.ts                      # Daily token budget tracking
    client.ts                      # LLM calls: extractPost, findMatches, moderateContent,
                                   #   extractQuest, matchQuests, advocateChat, analyzeProposal
    prompts.ts                     # System prompts with sandwich defense
    sanitize.ts                    # Datamarking + XSS output sanitization
    schemas.ts                     # Zod schemas: post, match, moderation, quest, advocate,
                                   #   governance, issue decomposition
  commons/privacy.ts               # K-anonymity + privacy guards for Commons
  db/schema.ts                     # Drizzle schema (41 tables)
  env/server.ts                    # Environment variable loading
  game-config/                     # Game design system
    display-labels.ts              # UI labels for domains, tiers, etc.
    guardrails.ts                  # Anti-Nosedive validations
    resolver.ts                    # Game config lookup + caching
    schemas.ts                     # Zod schemas for game config
    template-seeder.ts             # Bootstrap quest/skill/tier templates
  http/json.ts                     # JSON body parsing utility
  notify/                          # Notification system
    dispatcher.ts                  # Notification routing/queueing
    pushover.ts                    # Pushover integration (admin alerts)
  phone/twilio.ts                  # Twilio SMS integration
  photos/
    moderate.ts                    # Image moderation (NSFW detection)
    process.ts                     # Sharp image pipeline (EXIF strip, resize)
  privacy/ (consent, deletion, export)
  security/
    authorization.ts               # Access control + policy checks
    runtime-policy.ts              # Runtime moderation + anti-injection
  supabase/ (client, server, middleware)
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

### The Commons (Public Dashboard)
Privacy-respecting community visualization at `/commons` (public, no auth):
- **K-anonymity threshold = 3**: aggregates with < 3 individuals suppressed
- Only shows counts, distributions, averages — never individual rows
- Weekly aggregation for time series (prevents temporal fingerprinting)
- Communities < 10 members hide growth charts
- Uses `createServiceClient()` to bypass RLS for aggregate-only reads
- ISR with 5-minute revalidation

## Design System

Inherits Wicks DNA with CivicForge twist:
- **Golden Hour** `#DEBA85` — warm accent, reputation/Pillar badges
- **Meadow** green — primary, offers, Green domain
- **Rose Clay** — needs, Craft/Hearth domains
- **Horizon** blue — events, Care/Signal domains, Keeper badges
- Charter serif headings, system-ui body (17px, line-height 1.7)
- Warm White / Cream backgrounds, OKLCH color space
- Cards: cream bg, 12px radius, subtle lift on hover
- **Chart domain colors** (`--chart-craft` through `--chart-weave`): distinct per domain when shown together in Commons visualizations

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

- **V2 (complete):** Needs board + AI matching + trust tiers 1-3 + thanks + privacy
- **V2.5 (nearly complete):** Quest layer + skill domains + AI advocate MVP + endorsements + vouches + game design system + issue decomposition
- **V3 (partially built):** Guilds + parties — schema, actions, and routes exist
- **V4 (partially built):** Governance + quadratic voting + sunset rules — schema, actions, and routes exist
- **V5 (future):** Federation + ZK proofs + multi-provider AI advocates + Collective Constitutional AI

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
- Chat-first interface (advocate is API-first)
- Docker / self-hosting
- Native mobile app
- Pol.is deliberation widget
- Community currencies / time banking
- Collective Constitutional AI
