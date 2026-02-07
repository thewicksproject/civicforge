# CivicForge

**Your neighborhood, connected.**

A neighborhood needs board where people post needs, offer help, get AI-matched, and build reputation. No ads, no data selling — just neighbors helping neighbors.

A [Wicks LLC](https://thewicksproject.org) project.

## How It Works

1. **Post** a need or offer to your neighborhood board
2. **Get matched** with neighbors who can help (AI-suggested, human-decided)
3. **Help each other** and build reputation through thanks

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://anthropic.com) API key (for AI features)
- An [Upstash](https://upstash.com) Redis instance (for rate limiting)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template and fill in values
cp .env .env.local
# Edit .env.local with your Supabase, Anthropic, and Upstash credentials

# Run the initial database migration
# (Apply supabase/migrations/0001_initial_schema.sql to your Supabase project)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `ANTHROPIC_API_KEY` | Yes | Claude API key for AI features |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |
| `NEXT_PUBLIC_APP_URL` | No | App URL (defaults to http://localhost:3000) |

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase** (PostgreSQL, Auth, Storage)
- **Drizzle ORM** (type-safe database access)
- **Vercel AI SDK 6** + Claude Sonnet (AI matching & assistance)
- **Tailwind CSS v4** (OKLCH color space, Wicks-derived design system)
- **Sharp** (photo processing, EXIF stripping)

## Security

- Row Level Security on every database table
- AI isolation model (user text never enters matching context)
- Microsoft Spotlighting (datamarking) for prompt injection defense
- CSP headers, EXIF/GPS stripping, rate limiting
- `getUser()` (not `getSession()`) for all auth checks
- Zod validation on all inputs and AI outputs

## Privacy

- No ads, no data selling, ever
- EXIF/GPS metadata stripped from all photos
- Global Privacy Control (GPC) signal honored
- Data export and account deletion available
- AI processing disclosed with transparency badges
- 18+ age requirement

## License

See [LICENSE](./LICENSE).
