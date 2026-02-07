# CivicForge CCPA/CPRA Compliance Audit

**Date:** 2026-02-07
**Auditor:** Automated code review (Claude Opus 4.6)
**Scope:** CivicForge V2 codebase at commit `ws4/compliance` branch
**Frameworks:** CCPA (Cal. Civ. Code 1798.100-199.100), CPRA amendments, ADMT regulations (effective Jan 1, 2026)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [CCPA/CPRA Core Rights Assessment](#2-ccpacpra-core-rights-assessment)
3. [ADMT (Automated Decision-Making Technology) Assessment](#3-admt-automated-decision-making-technology-assessment)
4. [AI Transparency Assessment](#4-ai-transparency-assessment)
5. [Privacy Risk Assessment](#5-privacy-risk-assessment)
6. [Code Fixes Applied](#6-code-fixes-applied)
7. [Remediation Roadmap](#7-remediation-roadmap)

---

## 1. Executive Summary

CivicForge demonstrates strong foundational privacy architecture with several areas requiring remediation before full CCPA/CPRA and ADMT compliance. The application collects limited personal information (email, display name, optional phone and bio), processes content through three AI systems (extraction, matching, moderation), and provides basic data export and deletion flows.

**Overall Rating: PARTIAL COMPLIANCE**

| Area | Rating | Critical Issues |
|------|--------|-----------------|
| Right to Know (Data Export) | PARTIAL | Export now covers all 14 tables (fixed in this audit) |
| Right to Delete | PARTIAL | Cascade logic sound; missing audit trail for completed deletions |
| Right to Opt-Out (GPC) | PARTIAL | GPC header detected but not acted upon |
| Right to Correct | COMPLIANT | Users can edit profile data |
| ADMT Pre-use Notice | NON-COMPLIANT | No disclosure before AI moderation runs |
| ADMT Opt-out | NON-COMPLIANT | No mechanism to decline AI features |
| AI Transparency | PARTIAL | AI badge exists but moderation is undisclosed |
| Data Minimization | COMPLIANT | Strong minimization practices observed |
| Retention Policies | NON-COMPLIANT | No automated data retention or expiration |
| Third-Party DPAs | NON-COMPLIANT | No evidence of Data Processing Agreements |

---

## 2. CCPA/CPRA Core Rights Assessment

### 2.1 Right to Know (Data Export)

**Rating: PARTIAL (was NON-COMPLIANT, fixed to PARTIAL)**

**What the law requires:** Consumers have the right to request disclosure of the categories and specific pieces of personal information a business has collected about them (Cal. Civ. Code 1798.110).

**Implementation review:**

The data export function lives at `/lib/privacy/export.ts` and is exposed via `/api/privacy/export`. The user-facing UI at `/app/(app)/settings/privacy/page.tsx` provides a "Export My Data (JSON)" button that downloads the export as a file.

**Database tables (14 total in schema):**

| Table | Contains User Data | Previously Exported | Now Exported |
|-------|-------------------|--------------------|----|
| `profiles` | Yes (PII: display_name, bio, skills, avatar_url, phone_verified) | Yes | Yes |
| `posts` | Yes (authored content, location_hint) | Yes | Yes |
| `post_photos` | Yes (uploaded images) | Yes (via posts join) | Yes |
| `responses` | Yes (response messages) | Yes | Yes |
| `thanks` | Yes (given and received) | Yes | Yes |
| `user_consents` | Yes (consent records) | Yes | Yes |
| `invitations` | Yes (created invitations) | No | **Yes (fixed)** |
| `membership_requests` | Yes (membership requests) | No | **Yes (fixed)** |
| `ai_matches` | Yes (AI match suggestions for user) | No | **Yes (fixed)** |
| `ai_usage` | Yes (token/request counts per day) | No | **Yes (fixed)** |
| `audit_log` | Yes (actions taken by user) | No | **Yes (fixed)** |
| `deletion_requests` | Yes (deletion request history) | No | **Yes (fixed)** |
| `post_flags` | Yes (flags submitted by user) | No | **Yes (fixed)** |
| `neighborhoods` | Indirect (created_by reference) | No | No (not user-owned PII) |

**Remaining gaps:**
- **FORMAT:** Export is JSON-only. CCPA does not mandate a specific format, but providing CSV or human-readable alternatives improves accessibility.
- **RESPONSE TIME:** No tracking of when a request was made. CCPA requires response within 45 days (extendable to 90). The current implementation responds immediately, which satisfies the requirement, but there is no logging of the request itself for compliance record-keeping.
- **VERIFICATION:** The export endpoint verifies auth via `getUser()`, which is appropriate for logged-in users. However, there is no mechanism for identity verification if a consumer submits a request through another channel (e.g., email).

**Relevant files:**
- `/lib/privacy/export.ts` -- export function (fixed in this audit)
- `/app/api/privacy/export/route.ts` -- API route
- `/app/(app)/settings/privacy/page.tsx` -- UI (line 53-66)

---

### 2.2 Right to Delete

**Rating: PARTIAL**

**What the law requires:** Consumers have the right to request deletion of personal information collected about them (Cal. Civ. Code 1798.105). Businesses must delete, and direct service providers to delete, the consumer's personal information.

**Implementation review:**

The deletion flow is implemented across three files:

1. **Request phase** (`/app/api/privacy/delete/route.ts`): Creates a `deletion_requests` record with status `pending`.
2. **Processing phase** (`/lib/privacy/deletion.ts`): The `processPendingDeletions()` function runs against requests older than 30 days.
3. **Execution**: Deletes storage files (photos), cascades via `profiles` table deletion (FK cascade handles posts, responses, thanks, ai_matches, ai_usage, consents, flags, membership_requests, invitations), then deletes the auth user via `supabase.auth.admin.deleteUser()`.

**Strengths:**
- 30-day cooling-off period allows cancellation (`cancelDeletion` function exists).
- CASCADE DELETE on the `profiles` table FK references ensures related data is removed.
- Storage files (photos) are explicitly cleaned up before profile deletion.
- The UI clearly warns "This will permanently delete all your data within 30 days."

**Gaps:**

| Gap | Severity | Detail |
|-----|----------|--------|
| No cron job configured | HIGH | `processPendingDeletions()` exists but there is no evidence of a scheduled trigger (no cron config, no Vercel cron, no edge function). Deletions may never execute. |
| Audit log not preserved | MEDIUM | When the profile is deleted via CASCADE, `audit_log` entries referencing that `user_id` lose their FK reference (audit_log.user_id is a plain uuid, no FK constraint). However, the entries themselves survive since there is no ON DELETE CASCADE on audit_log. This is actually correct behavior -- audit records should be retained for compliance. Confirm this is intentional. |
| No deletion confirmation email | LOW | Best practice is to email the user confirming their deletion request and when it will complete. |
| Third-party deletion | HIGH | Data sent to Anthropic (Claude API), Twilio (phone verification), and ModerateContent is not addressed. CivicForge must ensure these processors delete the data or are covered by DPA terms. |
| No deletion of Supabase Auth metadata | LOW | `supabase.auth.admin.deleteUser()` handles this, but email addresses in Supabase's `auth.users` table metadata should be confirmed as deleted. |

**Relevant files:**
- `/lib/privacy/deletion.ts` -- deletion logic
- `/app/api/privacy/delete/route.ts` -- API route
- `/app/(app)/settings/privacy/page.tsx` -- UI (lines 69-76, 209-240)

---

### 2.3 Right to Opt-Out of Sale/Sharing

**Rating: PARTIAL**

**What the law requires:** Consumers have the right to opt out of the sale or sharing of their personal information (Cal. Civ. Code 1798.120). Businesses must honor the Global Privacy Control (GPC) signal as a valid opt-out request (Cal. Civ. Code 1798.135(e)).

**Implementation review:**

GPC detection is implemented in `/middleware.ts` (lines 33-36):

```typescript
const gpc = request.headers.get("sec-gpc");
if (gpc === "1") {
  response.headers.set("x-gpc-honored", "true");
}
```

**Assessment:**
- GPC signal is **detected** but only results in setting a response header. There is no downstream behavior change.
- CivicForge states it does not sell data ("no ads, no data selling, ever" per CLAUDE.md), which reduces the obligation. However, sharing data with Anthropic for AI processing could be considered "sharing" under CPRA's broad definition if AI outputs are used to profile users.
- The `ai_processing` consent type exists in the consent system (`/lib/privacy/consent.ts`, line 10) but there is no UI for users to grant or revoke it.

**Gaps:**

| Gap | Severity | Detail |
|-----|----------|--------|
| GPC not actionable | HIGH | Detecting GPC without acting on it is non-compliant. At minimum, when GPC is detected, AI processing that could constitute "sharing" should be suppressed unless the user has explicitly opted in. |
| No opt-out UI | MEDIUM | No "Do Not Share My Personal Information" link exists. If AI processing constitutes sharing, a link is required on the homepage per 1798.135(a). |
| `ai_processing` consent exists but is unused | MEDIUM | The consent type is defined but never presented to users or checked before AI calls. |

**Relevant files:**
- `/middleware.ts` -- GPC detection (lines 33-36)
- `/lib/privacy/consent.ts` -- consent types (line 10)

---

### 2.4 Right to Correct

**Rating: COMPLIANT**

**What the law requires:** Consumers have the right to request correction of inaccurate personal information (Cal. Civ. Code 1798.106).

**Implementation review:**

The settings page at `/app/(app)/settings/privacy/page.tsx` provides editable fields for:
- Display name (lines 107-118)
- Bio (lines 123-131)
- Skills (lines 133-144)

The `updateProfile` server action processes these changes. RLS policies allow users to update only their own profile (`profiles_update_own` policy). The `posts_update_author` policy allows users to edit their own posts via `updatePost` in `/app/actions/posts.ts`.

**No gaps identified.** Users can correct all user-provided personal information.

---

### 2.5 Right to Limit Use of Sensitive Personal Information

**Rating: COMPLIANT**

CivicForge collects limited sensitive personal information:
- **Phone number:** Collected for verification only, processed via Twilio Verify, and only a boolean `phone_verified` flag is stored (the actual phone number is not persisted in the database).
- **Precise geolocation:** Explicitly excluded. The AI extraction prompt instructs: "NEVER include precise addresses -- coarsen to neighborhood level." The `location_hint` schema field is max 100 characters and described as "Neighborhood-level location hint only."

No social security numbers, financial accounts, health data, racial/ethnic origin, or other sensitive PI categories (per 1798.140(ae)) are collected.

---

## 3. ADMT (Automated Decision-Making Technology) Assessment

The CPRA's ADMT regulations (effective January 1, 2026) impose requirements on businesses that use automated decision-making technology. CivicForge uses three AI systems:

### 3.1 AI Systems Inventory

| System | Function | Input | Output | User-Facing | Consequential |
|--------|----------|-------|--------|-------------|---------------|
| **Post Extraction** | Converts natural language to structured post data | Raw user text (datamarked) | Structured JSON (title, description, category, etc.) | Yes (AI-assisted badge) | Low |
| **AI Matching** | Suggests neighbor matches for posts | Structured post fields + profile data | Match scores + reasons | Yes (AI-assisted badge) | MEDIUM -- affects which neighbors see/respond to posts |
| **Content Moderation** | Screens posts and responses for safety | Raw user text (datamarked) | Safe/unsafe + reason | No (invisible) | HIGH -- can block post publication |
| **Photo Moderation** | Screens uploaded images for NSFW | Image base64 | Safe/unsafe + rating | No (invisible) | HIGH -- can block photo upload |

### 3.2 Pre-Use Notice

**Rating: NON-COMPLIANT**

**What the regulation requires:** Businesses must provide consumers with a pre-use notice before processing their personal information through ADMT. The notice must describe: (1) the purpose, (2) how ADMT is used, (3) the consumer's right to opt out, and (4) how to exercise that right.

**Current state:**
- **Post extraction:** The post form has a hidden `ai_assisted` field and the resulting post shows an "AI-assisted" badge. However, there is no disclosure *before* the user encounters the AI extraction feature. The form does not explain that text may be processed by AI.
- **AI matching:** No pre-use notice. Matches happen server-side in `/app/api/ai/match/route.ts` without user notification.
- **Content moderation:** No notice whatsoever. Posts and responses are silently screened via `moderateContent()` in `/app/actions/posts.ts` (line 78) and `/app/actions/responses.ts` (line 91). Users only learn AI was involved if their content is flagged.
- **Photo moderation:** No notice. Photos are screened via `moderatePhoto()` in `/app/api/photos/upload/route.ts` (line 45). Users only discover this if a photo is rejected.

**Login page disclosure:** The login page references Terms and Privacy Policy (line 137-146) but contains no AI-specific disclosure.

**Remediation required:**
1. Add a visible AI disclosure banner to the post creation form explaining that content may be processed by AI for structure extraction and safety screening.
2. Add AI disclosure to the response submission flow.
3. Add AI disclosure to the photo upload flow.
4. Add an AI processing section to the Privacy Policy.
5. Add AI disclosure during onboarding/signup.

---

### 3.3 Access to Logic (Right to Explanation)

**Rating: PARTIAL**

**What the regulation requires:** Consumers have the right to access meaningful information about the logic involved in ADMT, including the key parameters and data used.

**Current state:**
- **Matching:** Match results include a `match_reason` (max 200 chars) stored in `ai_matches` table. This provides some transparency about why a match was suggested. However, users cannot access their match history through the UI.
- **Moderation:** When content is flagged, the moderation reason is shown to the user ("Content flagged: [reason]"). This provides partial transparency.
- **Extraction:** The extraction schemas and prompts are well-documented in `/lib/ai/schemas.ts` and `/lib/ai/prompts.ts`, but this information is not exposed to users.

**Remediation required:**
1. Create a user-facing page explaining how each AI system works, what data it receives, and what decisions it makes.
2. Include AI match history in the user's data export (now included after the fix in this audit).
3. Expose match reasoning in the UI where matches are displayed.

---

### 3.4 Opt-Out of ADMT

**Rating: NON-COMPLIANT**

**What the regulation requires:** Consumers have the right to opt out of ADMT that produces legal or similarly significant effects. Content moderation (blocking publication) qualifies as significant because it restricts the consumer's ability to use the service.

**Current state:**
- The `ai_processing` consent type is defined in `/lib/privacy/consent.ts` (line 10) as an `OPTIONAL_CONSENTS` entry, but:
  - No UI exists for users to grant or revoke this consent.
  - No code checks `hasConsent(userId, "ai_processing")` before AI calls.
  - All AI processing runs unconditionally for all users.

**Remediation required:**
1. Add an AI processing toggle in settings that allows users to opt out.
2. When opted out:
   - Posts skip AI moderation (fallback to community flagging only, or manual review queue).
   - Post extraction is disabled (user fills manual form only).
   - Matching is disabled for that user's posts.
3. Check the `ai_processing` consent before every AI call.

---

### 3.5 Human Alternative

**Rating: PARTIAL**

**What the regulation requires:** Where ADMT opt-out is available, the business must offer a human alternative that produces a reasonably equivalent outcome.

**Current state:**
- **Post creation:** The manual form (`/components/post-form.tsx`) already exists as a non-AI alternative. Users fill in title, description, category, etc. directly. This is the default path -- AI extraction is an optional enhancement.
- **Content moderation:** The moderation call fails open ("Fail open -- don't block users if moderation API is down" at `/app/actions/posts.ts` line 88). This means posts ARE published if AI moderation fails. Community flagging (3 flags = auto-hide) serves as the human-driven moderation alternative. However, there is no intentional opt-out path -- the fail-open is a resilience measure, not a user choice.
- **Photo moderation:** Also fails open if API is unavailable (`/lib/photos/moderate.ts` lines 18-19).
- **Matching:** No human alternative exists. If AI matching is disabled, there is no fallback mechanism to connect neighbors.

**Remediation required:**
1. Make the manual post form the default when AI opt-out is active.
2. Route AI-opted-out posts through the existing community review queue (`review_status: "pending_review"`) instead of AI moderation.
3. For matching, consider a simple skill-based filter as a non-AI fallback.

---

## 4. AI Transparency Assessment

### 4.1 AI Badge System

**Rating: PARTIAL**

The `AiBadge` component (`/components/ai-badge.tsx`) renders a small "AI-assisted" badge with a sparkle icon. It appears on:
- Post cards in the board listing (`/components/post-card.tsx`, line 67)
- Post detail pages (`/app/(app)/board/[postId]/page.tsx`, line 122)

The badge is displayed when `post.ai_assisted === true`, which is set based on the `ai_assisted` hidden form field in the post form.

**Gaps:**
- The badge label "AI-assisted" is vague. It does not specify *what* AI did (extraction? matching? both?).
- No tooltip or link to learn more about AI usage.
- Badge only appears on posts, not on AI-generated match suggestions or moderation decisions.

---

### 4.2 Content Moderation Disclosure

**Rating: NON-COMPLIANT**

All posts and responses are screened through AI content moderation via `moderateContent()`, but users are not informed this happens. The only signal is if content is rejected ("Content flagged: [reason]"), which does not state AI was involved.

Photo moderation via ModerateContent.com API is similarly undisclosed.

**Remediation required:**
1. Add a notice on the post creation and response forms: "Posts are automatically screened for safety using AI before publication."
2. When content is flagged, state: "AI review flagged this content for: [reason]. You can appeal to community moderators."
3. Disclose photo screening in the upload UI.

---

### 4.3 Match Algorithm Transparency

**Rating: PARTIAL**

The matching system (`/lib/ai/client.ts`, `findMatches()`) uses these data points:
- Post: title, category, skills_relevant, urgency, available_times
- Profiles: user_id, display_name, skills, reputation_score

The matching prompt (`/lib/ai/prompts.ts`) considers:
1. Skill overlap (strongest signal)
2. Availability alignment
3. Past reputation in similar categories

Match results include a `match_reason` per suggestion, stored in `ai_matches` table.

**Security note (positive):** The matching context only receives structured data -- raw user text never enters the matching LLM context, preventing cross-context prompt injection.

**Gaps:**
- No user-facing documentation of how matching works.
- Match reasons are stored but not surfaced in the UI.
- Users who are matched (suggested_user_id) cannot see that they were suggested or why.

---

## 5. Privacy Risk Assessment

### 5.1 Data Minimization

**Rating: COMPLIANT**

CivicForge demonstrates strong data minimization:

- **Location:** AI prompts explicitly coarsen to neighborhood level. `location_hint` schema field enforces max 100 characters with the instruction "Neighborhood-level location hint only. NEVER include precise addresses."
- **Phone numbers:** Not stored. Only a boolean `phone_verified` flag is persisted after Twilio verification.
- **Photos:** All EXIF/GPS metadata is stripped via Sharp (`/lib/photos/process.ts`). Photos are auto-oriented, then re-encoded to JPEG with all metadata removed.
- **Permissions policy:** Middleware disables camera, microphone, and geolocation browser APIs: `camera=(), microphone=(), geolocation=()`.
- **Profile data:** Minimal fields -- display_name, bio, skills. No real name, address, or date of birth required.
- **AI isolation:** User text and matching logic never share an LLM context. Post extraction uses datamarked input. Matching receives only structured output.

---

### 5.2 Data Retention

**Rating: NON-COMPLIANT**

**What the law requires:** CPRA requires businesses to disclose retention periods and not retain personal information longer than reasonably necessary (Cal. Civ. Code 1798.100(a)(3)).

**Current state:**
- **No automated retention policy.** Data persists indefinitely unless the user requests deletion.
- **Posts:** Have an `expires_at` field in the schema, but no evidence of automated expiration processing.
- **AI usage data:** Stored indefinitely per-user per-day in `ai_usage` table.
- **Audit log:** Grows indefinitely with no rotation or archival.
- **AI matches:** Stored indefinitely even after posts are completed or expired.

**Remediation required:**
1. Define retention periods for each data category:
   - Posts: Consider auto-expiring completed/expired posts after 12 months.
   - AI matches: Delete when the associated post is completed or expired.
   - AI usage: Aggregate after 90 days (keep monthly totals, delete daily granularity).
   - Audit log: Retain for 24 months, then archive or delete.
2. Implement a scheduled job to enforce retention policies.
3. Document retention periods in the Privacy Policy.

---

### 5.3 Third-Party Data Sharing and DPA Requirements

**Rating: NON-COMPLIANT**

CivicForge shares personal information with three third-party processors:

| Processor | Data Shared | Purpose | DPA Status |
|-----------|-------------|---------|------------|
| **Anthropic (Claude API)** | Post text (datamarked), structured post/profile data for matching, post/response text for moderation | AI extraction, matching, content moderation | **UNKNOWN -- DPA required** |
| **Twilio** | Phone number (transient, for verification SMS) | Phone verification | **UNKNOWN -- DPA required** |
| **ModerateContent.com** | Photo image data (base64) | NSFW photo screening | **UNKNOWN -- DPA required** |
| **Supabase** | All user data (database host, auth provider, storage) | Infrastructure | **UNKNOWN -- DPA required** |
| **Upstash (Redis)** | User IDs (for rate limiting keys) | Rate limiting | **UNKNOWN -- DPA required** |
| **Vercel** | Request data, server-side processing | Hosting/deployment | **UNKNOWN -- DPA required** |

**CPRA requires:**
1. Written contracts with service providers/contractors that include specific CCPA-mandated terms (1798.100(d)).
2. Service providers must be prohibited from selling/sharing the data, retaining it beyond the business purpose, or using it for their own purposes.
3. Businesses must conduct due diligence on service providers.

**Remediation required:**
1. Execute DPAs with all six processors.
2. Confirm Anthropic's data retention policy for API inputs/outputs. As of 2025, Anthropic's API terms state they do not train on API data, but a DPA should formalize this.
3. Confirm ModerateContent.com does not retain submitted images.
4. Document all third-party processors in the Privacy Policy.

---

### 5.4 Security Controls

**Rating: COMPLIANT**

CivicForge implements robust security controls:

- **CSP headers:** Content Security Policy applied via middleware with frame-ancestors 'none', base-uri 'self', form-action 'self'.
- **Auth:** Uses `getUser()` (not `getSession()`) for all server-side auth checks, preventing JWT forgery.
- **RLS:** Row Level Security enabled on all 14 tables with granular policies per table.
- **AI input sanitization:** Datamarking (Microsoft Spotlighting technique) applied to all user text before AI processing. Sandwich defense in system prompts.
- **AI output sanitization:** XSS vectors stripped from AI-generated text via `sanitizeOutput()`.
- **Zod validation:** All user inputs validated with Zod schemas on the server side.
- **Rate limiting:** AI endpoints rate-limited to 10 requests/minute/user via Upstash Redis. Phone verification limited to 3/hour.
- **Photo processing:** Images validated with Sharp, EXIF stripped, re-encoded. Size-limited to 5MB.
- **No `dangerouslySetInnerHTML`:** Confirmed absent from codebase.

---

### 5.5 Consent Management

**Rating: PARTIAL**

The consent system (`/lib/privacy/consent.ts`) provides:
- `recordConsent()` -- records consent with policy version
- `revokeConsent()` -- soft-revokes by setting `revoked_at`
- `hasConsent()` -- checks for active consent
- `getUserConsents()` -- lists active consents

Defined consent types:
- `terms_of_service` (required)
- `privacy_policy` (required)
- `ai_processing` (optional)
- `phone_verification` (recorded on successful verification)

**Gaps:**
- The `ai_processing` consent is defined but never used in any flow.
- The login page states "By signing in, you confirm you are 18 or older and agree to our Terms and Privacy Policy" (line 137-146) -- this is "browsewrap" consent, which is legally weak. There is no explicit checkbox or consent recording during signup.
- No evidence of `recordConsent()` being called during the signup/onboarding flow for required consents.
- Consent versioning exists (`policy_version` field) but there is no mechanism to prompt users to re-consent when the policy version changes.

---

## 6. Code Fixes Applied

### 6.1 Data Export Function Expanded

**File:** `/lib/privacy/export.ts`

**Before:** The export function queried only 6 of 14 tables (profiles, posts with photos, responses, thanks given/received, user_consents).

**After:** The export function now queries all 13 user-data-bearing tables:

Added:
- `ai_matches` -- AI match suggestions where the user was suggested
- `ai_usage` -- daily AI token/request usage records
- `audit_log` -- all audit log entries for the user
- `deletion_requests` -- deletion request history
- `invitations` -- invitations created by the user
- `membership_requests` -- neighborhood membership requests
- `post_flags` -- flags submitted by the user

The `neighborhoods` table is excluded because it contains community data, not individual user PII (the `created_by` reference is captured through the profile's `neighborhood_id`).

---

## 7. Remediation Roadmap

### Priority 1 -- CRITICAL (address before launch)

| # | Issue | Effort | Files to Modify |
|---|-------|--------|-----------------|
| 1.1 | **Implement deletion cron job** -- `processPendingDeletions()` exists but is never called. Add a Vercel cron or Supabase Edge Function on a daily schedule. | Small | Add `vercel.json` cron config or `supabase/functions/` |
| 1.2 | **Add ADMT pre-use notice** -- Add visible AI disclosure to post form, response form, and photo upload UI before any AI processing occurs. | Medium | `/components/post-form.tsx`, `/components/response-list.tsx`, `/components/photo-upload.tsx` |
| 1.3 | **Make GPC actionable** -- When GPC=1, suppress AI processing for that request or record an opt-out preference. At minimum, route content to manual review instead of AI moderation. | Medium | `/middleware.ts`, `/app/actions/posts.ts`, `/app/actions/responses.ts` |
| 1.4 | **Execute DPAs** -- Obtain Data Processing Agreements from Anthropic, Twilio, ModerateContent.com, Supabase, Upstash, and Vercel. | External | Legal/procurement (not code) |

### Priority 2 -- HIGH (address within 30 days)

| # | Issue | Effort | Files to Modify |
|---|-------|--------|-----------------|
| 2.1 | **Implement AI opt-out toggle** -- Add UI toggle in settings to revoke `ai_processing` consent. Check `hasConsent()` before all AI calls. When opted out, use manual form + community moderation. | Medium | `/app/(app)/settings/privacy/page.tsx`, `/lib/privacy/consent.ts`, `/app/actions/posts.ts`, `/app/actions/responses.ts`, `/app/api/ai/extract/route.ts`, `/app/api/ai/match/route.ts` |
| 2.2 | **Add AI transparency page** -- Create a user-facing page explaining each AI system, what data it uses, and how decisions are made. Link from AI badge. | Medium | New page: `/app/(app)/ai-info/page.tsx` or equivalent |
| 2.3 | **Record consent at signup** -- Call `recordConsent()` during onboarding for `terms_of_service` and `privacy_policy`. Present `ai_processing` as an explicit opt-in. | Small | `/app/onboarding/page.tsx` |
| 2.4 | **Disclose moderation in UI** -- Add text to post/response forms stating content is AI-screened. When content is flagged, attribute the decision to AI. | Small | `/app/actions/posts.ts`, `/app/actions/responses.ts`, `/components/post-form.tsx` |

### Priority 3 -- MEDIUM (address within 90 days)

| # | Issue | Effort | Files to Modify |
|---|-------|--------|-----------------|
| 3.1 | **Define and implement retention policies** -- Set retention periods for each data type. Implement a scheduled cleanup job. | Medium | New file: `/lib/privacy/retention.ts`, cron config |
| 3.2 | **Add consent re-consent flow** -- When `CURRENT_POLICY_VERSION` changes, prompt existing users to review and re-consent. | Medium | `/lib/privacy/consent.ts`, middleware or layout component |
| 3.3 | **Improve AI badge specificity** -- Make the badge describe what AI did (e.g., "AI-structured" vs "AI-matched"). Add tooltip with learn-more link. | Small | `/components/ai-badge.tsx` |
| 3.4 | **Surface AI match reasoning** -- Display match_reason in the UI where AI matches are shown. Allow matched users to see why they were suggested. | Medium | UI components for match display |
| 3.5 | **Add non-AI matching fallback** -- Implement a simple skill-based filter as a deterministic alternative when AI matching is opted out. | Medium | `/app/api/ai/match/route.ts` or new endpoint |
| 3.6 | **Document third-party processors in Privacy Policy** -- List all six processors, their purposes, and data shared. | Small | Privacy Policy content (not code) |
| 3.7 | **Add export request logging** -- Log when data exports are requested for compliance record-keeping. | Small | `/app/api/privacy/export/route.ts` |
| 3.8 | **Add deletion confirmation notification** -- Email users confirming their deletion request and estimated completion date. | Medium | `/lib/privacy/deletion.ts` |

---

## Appendix A: Personal Information Categories Collected

Per CCPA 1798.140(v), the following categories of personal information are collected:

| CCPA Category | CivicForge Data | Source |
|---------------|-----------------|--------|
| A. Identifiers | Email address (via Supabase Auth), display name, user ID | Direct from consumer |
| B. Personal information (Cal. Civ. Code 1798.80) | Phone number (transient, for verification only) | Direct from consumer |
| D. Commercial information | Posts (needs/offers), responses | Direct from consumer |
| F. Internet activity | AI usage logs, audit log, rate limiting data | Automatic collection |
| K. Inferences | AI match scores, AI content moderation decisions, AI-extracted post structure | Derived by AI processing |

Categories NOT collected: C (protected characteristics), E (biometric), G (geolocation -- explicitly stripped), H (audio/visual -- photos stripped of metadata), I (professional), J (education), L (sensitive PI beyond phone).

## Appendix B: Data Flow Diagram (Text)

```
User Input
    |
    v
[Post Form] ---(text)---> [AI Extraction] ---(structured data)---> [Database]
    |                          |                                        |
    |                     (datamarked)                                  |
    |                          |                                        v
    |                          v                              [AI Matching] <--- [Profiles DB]
    |                    [Anthropic API]                            |
    |                                                              v
    |                                                        [ai_matches table]
    |
    +---(text)---> [AI Moderation] ---(datamarked)---> [Anthropic API]
    |                   |
    |              (safe/unsafe)
    |                   |
    +---(photo)---> [Photo Moderation] ---> [ModerateContent API]
    |                   |
    |              (safe/unsafe)
    |                   |
    +---(photo)---> [Sharp Processing] ---> [EXIF Strip] ---> [Supabase Storage]
    |
    +---(phone)---> [Twilio Verify] ---> (boolean verified flag stored)
```

## Appendix C: RLS Policy Coverage

All 14 database tables have Row Level Security enabled. Key access patterns:

- **Profiles:** Users read same-neighborhood profiles; create/update/delete own only.
- **Posts:** Users read non-hidden posts in own neighborhood; create/update/delete own only. Tier 3 can read/update all for moderation.
- **Responses:** Visible to post author and responder only.
- **AI Matches:** Visible to post author only. Insert by service role only.
- **AI Usage:** Own records only.
- **Audit Log:** Own records only (read). Insert by service role only.
- **Deletion Requests:** Own records only.
- **User Consents:** Own records only.
- **Post Flags:** Own flags visible. Tier 3 can view/delete all flags.
