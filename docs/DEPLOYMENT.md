# Deployment Runbook

## Environment Model
- `local`: local machine development.
- `dev`: hosted development environment (`dev.civicforge.org`).
- `preprod`: production-grade hardening on non-production rollout.
- `prod`: production environment.

## Required Variables by `APP_ENV`
- `local`: none enforced.
- `dev`: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- `preprod`/`prod`: all `dev` vars plus `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CRON_SECRET`.

Run preflight:

```bash
npm run verify:env
```

## Vercel Project Setup
1. Confirm project linkage:
   - `.vercel/project.json` should match the intended Vercel project.
2. Ensure environment variables are set in Vercel for:
   - Development
   - Preview
   - Production
3. Set `NEXT_PUBLIC_APP_URL` per environment:
   - Dev: `https://dev.civicforge.org`
   - Production: `https://civicforge.org`
4. Set `APP_ENV`:
   - Dev deployment: `dev`
   - Production deployment before GA: `preprod`
   - Production deployment after GA: `prod`
5. Set `SAFETY_FAIL_MODE=closed` for hosted environments.

## DNS + Domain Configuration
1. Add `dev.civicforge.org` as a domain in Vercel.
2. Add DNS record:
   - Type: `A`
   - Name: `dev`
   - Value: `76.76.21.21` (Vercel edge).
3. Verify:

```bash
dig +short dev.civicforge.org A
curl -I https://dev.civicforge.org
```

## Release Steps
1. Merge to `main`.
2. Wait for CI (`lint`, `test`, `verify:env`, `build`).
3. Confirm deployment health:

```bash
npm run smoke:domains
```

4. Verify protected endpoint behavior:

```bash
curl -i https://civicforge.org/api/privacy/export
curl -i -X POST https://civicforge.org/api/ai/extract -H 'content-type: application/json' -d '{"text":"hello"}'
```

## Rollback
1. In Vercel dashboard, restore previous production deployment.
2. Re-run smoke checks:
   - Domain DNS + root status
   - Unauthorized endpoint checks
3. If rollback is incomplete, remove problematic alias and reassign stable deployment.

## Incident Notes
- If `dev.civicforge.org` is not resolvable (NXDOMAIN), treat as a priority incident because nightly smoke will fail.
- For moderation/safety provider outages, hosted environments are expected to fail closed by default.
