# CivicForge V2 — STRIDE Threat Model

**Version:** 1.0
**Date:** 2026-02-07
**Status:** Active
**Scope:** All trust boundaries in CivicForge V2 production architecture

---

## 1. System Overview

CivicForge is a neighborhood needs board where residents post needs, offer help, receive AI-assisted matching, and build community reputation. The system handles user-generated content, authentication, AI processing, phone verification, photo moderation, and file storage.

### Architecture Components

| Component | Role |
|-----------|------|
| Browser (Client) | React SPA via Next.js App Router |
| Next.js Server | Server Actions, API Routes, SSR |
| Supabase (anon key) | User-scoped DB queries, auth session management |
| Supabase (service role) | Privileged inserts (audit_log, ai_matches) |
| Supabase Storage | Photo upload/retrieval (post-photos bucket) |
| Claude API (Anthropic) | Post extraction, matching, content moderation |
| Twilio Verify API | Phone number verification (SMS OTP) |
| ModerateContent API | Photo NSFW screening |
| Upstash Redis | Rate limiting for AI endpoints |

### Trust Boundaries

```
                    TB1                    TB2
  Browser  <───────────────>  Next.js  <──────────>  Supabase (anon)
                              Server
                                │  TB3                TB2b
                                ├──────────────────>  Supabase (service role)
                                │  TB4
                                ├──────────────────>  Claude API
                                │  TB5
                                ├──────────────────>  Twilio Verify API
                                │  TB6
                                ├──────────────────>  ModerateContent API
                                │
  Browser  <──── TB7 ─────────────────────────────>  Supabase Storage
```

---

## 2. STRIDE Analysis by Trust Boundary

### TB1: Client <-> Next.js Server

#### Spoofing
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB1-S1 | Attacker impersonates another user by forging auth tokens | HIGH | Supabase Auth with `getUser()` server-side validation on every request; never trust `getSession()` | MITIGATED |
| TB1-S2 | Session hijacking via cookie theft | HIGH | HttpOnly, Secure, SameSite cookies managed by Supabase SSR library; CSP frame-ancestors 'none' | MITIGATED |
| TB1-S3 | CSRF attacks on Server Actions | MEDIUM | Next.js Server Actions include automatic CSRF protection via action IDs and origin checking | MITIGATED |

#### Tampering
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB1-T1 | Client sends manipulated user IDs in request bodies | HIGH | All Server Actions derive user ID from `getUser()`, never from client payload | MITIGATED |
| TB1-T2 | Client submits malicious HTML/JS in post content | HIGH | AI output sanitized server-side via `sanitizeOutput()`; no `dangerouslySetInnerHTML` usage | MITIGATED (see V5 below) |
| TB1-T3 | Client tampers with trust_tier to bypass authorization | HIGH | Trust tier checked server-side from DB; client cannot set trust_tier directly (RLS enforced) | MITIGATED |

#### Repudiation
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB1-R1 | Admin denies performing moderation actions | MEDIUM | audit_log table records all admin actions with user_id, action, and timestamp | MITIGATED (see V3 fix) |
| TB1-R2 | User denies posting content | LOW | Posts table records author_id with created_at timestamps; immutable after creation | MITIGATED |

#### Information Disclosure
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB1-I1 | User location leaked via photo EXIF/GPS data | HIGH | Sharp strips ALL EXIF/metadata including GPS before storage (non-negotiable) | MITIGATED |
| TB1-I2 | Server error messages leak implementation details | MEDIUM | API routes return generic error messages; stack traces not exposed to client | MITIGATED |
| TB1-I3 | CSP allows unsafe-eval enabling script injection | HIGH | **Fixed**: Removed `unsafe-eval` from script-src CSP directive | FIXED (V1) |
| TB1-I4 | Precise user addresses exposed | LOW | Only `location_hint` (general area) stored; no precise addresses in schema | MITIGATED |

#### Denial of Service
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB1-D1 | AI endpoint abuse exhausting token budget | MEDIUM | Upstash rate limiting at 10 req/min/user on AI routes | PARTIAL (see V7) |
| TB1-D2 | Photo upload flooding storage | MEDIUM | 5MB file size limit enforced at storage bucket level; max 4 photos per post | MITIGATED |
| TB1-D3 | Excessive profile lookups for enumeration | LOW | PROFILE_LOOKUP_RATE_LIMIT_PER_HOUR = 30 | MITIGATED |

#### Elevation of Privilege
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB1-E1 | Tier 1 user posts content (requires Tier 2+) | HIGH | RLS policy `posts_insert_tier2` enforces trust_tier >= 2 at database level | MITIGATED |
| TB1-E2 | Non-admin accesses moderation functions | HIGH | `requireTier3()` checks trust_tier >= 3 server-side before any admin action | MITIGATED |
| TB1-E3 | Any user modifies any invitation | HIGH | **Fixed**: RLS policy scoped to creator updates + self-redemption only | FIXED (V4) |

---

### TB2: Next.js Server <-> Supabase (anon key)

#### Spoofing
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB2-S1 | Attacker obtains anon key and queries directly | MEDIUM | Anon key is public by design; all data access controlled by RLS policies | MITIGATED |
| TB2-S2 | Attacker crafts JWT to impersonate another user | HIGH | Supabase Auth validates JWT server-side; `getUser()` re-validates with Auth server | MITIGATED |

#### Tampering
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB2-T1 | Direct DB manipulation bypassing application logic | MEDIUM | RLS enabled on ALL 13 tables; policies enforce row-level access control | MITIGATED |
| TB2-T2 | User modifies another user's profile | HIGH | `profiles_update_own` policy: USING (id = auth.uid()) WITH CHECK (id = auth.uid()) | MITIGATED |
| TB2-T3 | User reads posts from other neighborhoods | MEDIUM | `posts_select_neighborhood` policy filters by user's neighborhood_id | MITIGATED |

#### Information Disclosure
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB2-I1 | Audit log entries readable by unauthorized users | MEDIUM | `audit_log_select_own` policy: users can only read their own entries | MITIGATED |
| TB2-I2 | AI match data visible to non-post-authors | MEDIUM | `ai_matches_select_post_author` policy: only post author can view matches | MITIGATED |

#### Denial of Service
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB2-D1 | Connection pool exhaustion via excessive queries | LOW | Supabase manages connection pooling; rate limiting at application layer | MITIGATED |

#### Elevation of Privilege
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB2-E1 | Anon client inserts into service-role-only tables | HIGH | **Fixed**: ai_matches and audit_log inserts now use service-role client | FIXED (V2, V3) |

---

### TB2b: Next.js Server <-> Supabase (service role)

#### Spoofing
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB2b-S1 | Service role key leaked to client | CRITICAL | Key stored in server-only env var; never in NEXT_PUBLIC_ prefix; createServiceClient() only in server code | MITIGATED |

#### Tampering
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB2b-T1 | Compromised server uses service role for unauthorized writes | HIGH | Service client usage limited to two specific operations: ai_matches insert and audit_log insert | MITIGATED |

#### Information Disclosure
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB2b-I1 | Service role bypasses RLS exposing all data | CRITICAL | Service client only instantiated for write operations that require it; never used for reads | MITIGATED |

---

### TB3: Next.js Server <-> Claude API

#### Spoofing
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB3-S1 | Man-in-the-middle intercepts API key | HIGH | HTTPS enforced by Anthropic SDK; API key in server-only env var | MITIGATED |

#### Tampering
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB3-T1 | Prompt injection via user-supplied text | HIGH | Datamarking (Microsoft Spotlighting) wraps each word in delimiters; user text and matching logic NEVER share an LLM context | MITIGATED |
| TB3-T2 | AI output contains malicious content injected via prompt manipulation | HIGH | All AI output validated through Zod schemas (`generateObject`); text fields sanitized via `sanitizeOutput()` | MITIGATED (see V5) |
| TB3-T3 | Indirect prompt injection via profile/post data in matching context | MEDIUM | Matching context receives only structured fields (title, category, skills); raw user text never enters matching prompt | MITIGATED |

#### Information Disclosure
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB3-I1 | User PII sent to Claude API | MEDIUM | Post extraction uses datamarked text; matching uses only structured fields (no descriptions, bios, or contact info) | MITIGATED |
| TB3-I2 | API key exposed in client bundle | HIGH | `ANTHROPIC_API_KEY` (no NEXT_PUBLIC_ prefix) only accessed server-side in lib/ai/client.ts | MITIGATED |

#### Denial of Service
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB3-D1 | Token budget exhaustion leading to cost overruns | MEDIUM | Rate limit: 10 req/min/user via Upstash; `AI_DAILY_TOKEN_BUDGET = 100_000` defined but NOT enforced | KNOWN GAP (V7) |
| TB3-D2 | Slow Claude responses blocking server threads | LOW | Vercel serverless functions have built-in timeouts; requests are not long-lived | MITIGATED |

---

### TB4: Next.js Server <-> Twilio Verify API

#### Spoofing
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB4-S1 | Attacker intercepts Twilio credentials | HIGH | Credentials in server-only env vars; HTTPS enforced by Twilio SDK | MITIGATED |
| TB4-S2 | Attacker verifies someone else's phone number | HIGH | Twilio Verify handles OTP lifecycle; verification tied to specific phone number | MITIGATED |

#### Tampering
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB4-T1 | SMS interception (SIM swap, SS7 attack) | MEDIUM | Industry-wide SMS limitation; phone verification is one factor among trust tiers, not sole auth method | ACCEPTED RISK |

#### Denial of Service
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB4-D1 | SMS flooding via repeated verification requests | MEDIUM | Twilio Verify has built-in rate limiting per phone number; application should add per-user rate limiting | PARTIAL |

---

### TB5: Next.js Server <-> ModerateContent API

#### Spoofing
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB5-S1 | API key leak allows unauthorized usage | MEDIUM | Key in server-only env var; transmitted via HTTPS query parameter (URL-encoded) | MITIGATED |

#### Tampering
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB5-T1 | Manipulated API response marks adult content as safe | MEDIUM | HTTPS prevents MITM; response parsed and validated server-side | MITIGATED |

#### Information Disclosure
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB5-I1 | User photos transmitted to third-party moderation service | LOW | Photos sent as base64 over HTTPS; ModerateContent privacy policy applies; users consent to photo processing | ACCEPTED RISK |

#### Denial of Service
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB5-D1 | Missing API key causes no moderation to occur | MEDIUM | **Fixed**: Production fails closed (returns safe: false) when API key missing; dev fails open with warning | FIXED (V6) |
| TB5-D2 | API unavailability allows NSFW content through | LOW | Network errors still fail open; documented as accepted risk for availability over safety tradeoff | ACCEPTED RISK |

---

### TB7: Browser <-> Supabase Storage (direct upload)

#### Spoofing
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB7-S1 | Unauthenticated upload to storage bucket | HIGH | Storage bucket is private (public: false); upload requires authenticated session | MITIGATED |
| TB7-S2 | User uploads to another user's folder | HIGH | Storage policy enforces `(storage.foldername(name))[1] = auth.uid()::text` | MITIGATED |

#### Tampering
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB7-T1 | Malicious file uploaded with image MIME type | MEDIUM | Server-side Sharp validation confirms actual image format; `isValidImage()` checks format and dimensions | MITIGATED |
| TB7-T2 | User overwrites another user's photos | HIGH | Storage update policy scoped to own folder via auth.uid() check | MITIGATED |

#### Information Disclosure
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB7-I1 | Photos accessible without authentication | LOW | Bucket is private; SELECT policy requires authenticated role | MITIGATED |
| TB7-I2 | EXIF/GPS metadata in stored photos | HIGH | Sharp strips all EXIF metadata before upload in `processPhoto()` | MITIGATED |

#### Denial of Service
| ID | Threat | Severity | Mitigation | Status |
|----|--------|----------|------------|--------|
| TB7-D1 | Storage quota exhaustion via large/many uploads | MEDIUM | 5MB per file limit at bucket level; 4 photos per post at application level; allowed MIME types restricted | MITIGATED |

---

## 3. Vulnerabilities Found and Fixed

### V1: CSP includes 'unsafe-eval' (HIGH) -- FIXED
- **File:** `middleware.ts` line 13
- **Issue:** `script-src` directive included `'unsafe-eval'`, allowing arbitrary JavaScript evaluation via `eval()`, `Function()`, and similar constructs. This significantly weakens XSS protections.
- **Fix:** Removed `'unsafe-eval'` from `script-src`. Note: `'unsafe-inline'` is retained in `style-src` as required by the current styling approach (Tailwind CSS). A future improvement would be to use nonce-based style loading.

### V2: AI match inserts use anon client (HIGH) -- FIXED
- **File:** `app/api/ai/match/route.ts` lines 93-99
- **Issue:** The code used `createClient()` (anon-key client) to insert into `ai_matches`, but the RLS policy `ai_matches_insert_service_role` only allows `service_role` inserts. Match inserts silently failed because the anon client lacks the required role.
- **Fix:** Import and use `createServiceClient()` from `lib/supabase/server` for the `ai_matches` insert operation.

### V3: Audit log inserts use anon client (HIGH) -- FIXED
- **File:** `app/actions/admin.ts` lines 69-74 and 100-105
- **Issue:** Same as V2 -- `audit_log` RLS only allows `service_role` inserts, but admin actions used the regular anon client. Audit entries were silently dropped.
- **Fix:** Import and use `createServiceClient()` for audit log inserts.

### V4: Invitation update policy USING (true) (HIGH) -- FIXED
- **File:** `supabase/migrations/0001_initial_schema.sql` lines 554-559
- **Issue:** The `invitations_update_authenticated` policy used `USING (true) WITH CHECK (true)`, allowing ANY authenticated user to modify ANY invitation record (change neighborhood, creator, expiry, etc.).
- **Fix:** New migration `0003_fix_invitation_rls.sql` drops the overly permissive policy and creates two scoped policies:
  1. **Creator update:** The invitation creator can update their own invitations (e.g., change expiry).
  2. **Redemption:** Any authenticated user can set `used_by` to their own `auth.uid()` (for redeeming an invitation), but only on invitations not yet used.

### V5: Regex XSS sanitizer misses SVG/CSS vectors (MEDIUM) -- FIXED
- **File:** `lib/ai/sanitize.ts`
- **Issue:** The regex-based `sanitizeOutput()` function only stripped `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, and inline event handlers. It missed:
  - `<svg onload=...>` and `<svg>` tags generally
  - `<math>` tags (can execute scripts in some browsers)
  - `<style>` tags (CSS injection)
  - `<link>` tags (external resource loading)
  - `<meta>` tags (redirect injection)
  - `<base>` tags (URL hijacking)
  - CSS `expression()` function (legacy IE but still a vector)
  - CSS `url()` with javascript: protocol
- **Fix:** Added stripping for `<svg>`, `<math>`, `<style>`, `<link>`, `<meta>`, `<base>` tags and CSS `expression()` / `url(javascript:...)` patterns.
- **Note:** Regex-based sanitization is inherently limited. For production hardening, a proper DOM-based sanitizer such as DOMPurify (running server-side via jsdom) should replace the regex approach. The current regex approach handles known vectors but cannot guarantee completeness against novel bypass techniques.

### V6: Photo moderation fails open when API key missing (MEDIUM) -- FIXED
- **File:** `lib/photos/moderate.ts`
- **Issue:** When `MODERATECONTENT_API_KEY` is not set, the function returned `{ safe: true }`, meaning unmoderated photos were treated as safe. In production, this means disabling moderation is as simple as not configuring the API key.
- **Fix:** Environment-aware behavior:
  - **Production** (`NODE_ENV === 'production'`): Fails closed -- returns `{ safe: false, rating: null }` with a console error when the API key is missing.
  - **Development**: Fails open with a console warning, allowing local development without requiring a ModerateContent API key.

### V7: AI token budget never enforced (LOW) -- KNOWN GAP
- **File:** `lib/types.ts` defines `AI_DAILY_TOKEN_BUDGET = 100_000`; `ai_usage` table and `increment_ai_usage()` function exist in the schema
- **Issue:** The `AI_DAILY_TOKEN_BUDGET` constant is defined and the `ai_usage` table/function exist, but no code actually checks the budget before allowing AI requests. The `increment_ai_usage()` function is never called. A user could exhaust the Anthropic API budget by making many requests (subject only to the per-minute rate limit).
- **Recommended Fix:**
  1. Before each AI request in `app/api/ai/match/route.ts` and any other AI endpoints, query the `ai_usage` table for the current user and date.
  2. If `tokens_used >= AI_DAILY_TOKEN_BUDGET`, reject the request with a 429 status.
  3. After each successful AI call, invoke `increment_ai_usage()` via `supabase.rpc()` with the token count from the AI response.
  4. Consider a global (not per-user) budget cap as well to prevent cost overruns from many users.

---

## 4. Residual Risks and Accepted Trade-offs

### Accepted Risks
1. **SMS interception (TB4-T1):** SIM swap and SS7 attacks are industry-wide issues. Phone verification is one factor in trust tier progression, not sole authentication. Risk accepted.
2. **Photo moderation network failures (TB5-D2):** When the ModerateContent API is unreachable, photos fail open to maintain availability. A queuing system for retry would be ideal but is deferred.
3. **Third-party photo processing (TB5-I1):** User photos are transmitted to ModerateContent for NSFW screening. Users consent to this during signup. Risk accepted.

### Future Improvements
1. **Replace regex sanitizer with DOMPurify** for comprehensive XSS prevention (V5).
2. **Implement AI token budget enforcement** (V7).
3. **Add nonce-based CSP** to eliminate `'unsafe-inline'` from style-src.
4. **Add per-user rate limiting for Twilio** to prevent SMS flooding (TB4-D1).
5. **Implement content signing** for audit log entries to prevent tampering even by service-role compromises.
6. **Add request logging** for all service-role client usage to detect misuse.

---

## 5. Security Controls Summary

| Control | Implementation | Coverage |
|---------|---------------|----------|
| Authentication | Supabase Auth, `getUser()` on every request | All routes |
| Authorization | RLS on all 13+ tables, trust tier checks in Server Actions | All data access |
| Input Validation | Zod schemas for all inputs, datamarking for AI inputs | All user input |
| Output Sanitization | `sanitizeOutput()` for AI-generated text, no dangerouslySetInnerHTML | All rendered AI output |
| Rate Limiting | Upstash Redis, 10 req/min/user for AI endpoints | AI routes |
| CSP | Strict policy, frame-ancestors none, no unsafe-eval | All responses |
| EXIF Stripping | Sharp metadata removal before storage | All photo uploads |
| Privacy | GPC honored, no precise addresses, consent tracking, data export/deletion | Platform-wide |
| Audit Logging | audit_log table with service-role inserts | Admin actions |
| Photo Moderation | ModerateContent API, fails closed in production | Photo uploads |
