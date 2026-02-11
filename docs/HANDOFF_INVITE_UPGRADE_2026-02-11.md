# Handoff: Invite Codes Must Upgrade Existing Community Members

Date: 2026-02-11  
Author: Codex review handoff

## Goal (confirmed by product owner)

Invite codes are intended to **upgrade** an existing user to posting eligibility (Tier 2+) even when they already belong to a community.

## Current Problem

There is a logic mismatch between onboarding/settings UX and server-side redemption rules:

- Onboarding sets `community_id` before the invite step.
- Invite redemption currently rejects any user with a non-null `community_id`.
- Result: users who join an existing community during onboarding cannot redeem an invite and remain blocked from posting.

## Evidence in Code

- Onboarding sets community before invite:
  - `/Users/victor/Projects/civicforge/app/onboarding/page.tsx:72`
  - `/Users/victor/Projects/civicforge/app/onboarding/page.tsx:74`
  - `/Users/victor/Projects/civicforge/app/onboarding/page.tsx:83`
- Invite redemption hard-blocks users already in a community:
  - `/Users/victor/Projects/civicforge/app/actions/invitations.ts:150`
  - `/Users/victor/Projects/civicforge/app/actions/invitations.ts:154`
- Posting remains locked until Tier 2:
  - `/Users/victor/Projects/civicforge/app/(app)/post/new/page.tsx:27`
- Settings UX promises invite can unlock posting:
  - `/Users/victor/Projects/civicforge/app/(app)/settings/privacy/page.tsx:89`
  - `/Users/victor/Projects/civicforge/app/(app)/settings/privacy/page.tsx:97`

## Required Behavior

`redeemInvitation(code)` should:

1. Allow redemption when user already has `community_id` **if** invitation community equals user community.
2. Reject redemption when user community differs from invitation community.
3. Upgrade user renown to at least Tier 2.
4. Keep invitation single-use and expiration guarantees.

## Implementation Plan for Next Agent

1. Update `redeemInvitation()` in:
   - `/Users/victor/Projects/civicforge/app/actions/invitations.ts`
2. Replace current guard:
   - Current: reject when `profile.community_id` exists.
   - New:
     - If `profile.community_id` is null: assign invitation community.
     - If `profile.community_id` equals invitation community: allow upgrade-only path.
     - If different: return explicit error (cross-community redemption not allowed).
3. Preserve/strengthen race safety:
   - Keep atomic claim on invitation (`used_by IS NULL` and unexpired).
   - Make profile update conditional to avoid accidental overwrites (recommended: include community predicate in update where clause).
4. Keep rollback behavior if profile update fails:
   - Continue best-effort `used_by` rollback.
5. Update user-facing error strings for clearer outcomes.

## Acceptance Criteria

1. User with `community_id = null` redeems valid code:
   - Invitation marked used.
   - Profile community set to invitation community.
   - Renown tier >= 2.
2. User already in same community redeems valid code:
   - Invitation marked used.
   - Community unchanged.
   - Renown tier >= 2.
3. User in different community redeems code:
   - Redemption fails with explicit community mismatch error.
   - Invitation remains unused.
4. Expired or already used invitation:
   - Fails as today.
5. Concurrent redemption attempts:
   - At most one succeeds per code.
   - No unintended community reassignment.

## Tests to Add

Prefer adding unit/integration coverage around invitation action behavior:

- File suggestion:
  - `/Users/victor/Projects/civicforge/lib/__tests__/` (new invitation redemption test file)
- Cases:
  - null-community join + upgrade
  - same-community upgrade
  - different-community rejection
  - used/expired invitation rejection
  - concurrent claim behavior (or deterministic simulation of atomic claim failure)

## Notes

- No schema migration should be required for this change.
- This is a behavior correction aligned with existing UX copy and product intent.

## Resolution (Implemented 2026-02-11)

### Files Changed

- `/Users/victor/Projects/civicforge/app/actions/invitations.ts`
  - `redeemInvitation(code)` now supports three paths:
    - join path when `profile.community_id` is null
    - upgrade-only path when user community matches invitation community
    - explicit rejection for cross-community redemption
  - Preserved atomic invitation claim with `used_by IS NULL` and unexpired predicate.
  - Added conditional profile update predicates:
    - join path requires `community_id IS NULL`
    - same-community path requires `community_id = claimedInvitation.community_id`
  - Kept best-effort rollback of invitation claim if profile update fails or returns no row.
  - Updated profile-update failure message to a retryable form.
- `/Users/victor/Projects/civicforge/lib/__tests__/invitations-redeem.test.ts` (new)
  - Added deterministic in-memory Supabase simulation tests for invitation redemption behavior and race/rollback paths.
- `/Users/victor/Projects/civicforge/vitest.config.ts` (new)
  - Added `@` path alias mapping so Vitest can import app-layer modules in action-level tests.

### Confirmation Evidence (Before Fix)

- Targeted run (`npm test -- lib/__tests__/invitations-redeem.test.ts`) failed as expected:
  - Case A failed because same-community redemption returned `success: false`.
  - Case C failed because cross-community redemption returned generic `You already belong to a community` instead of explicit mismatch.

### Verification Evidence (After Fix)

- Targeted run (`npm test -- lib/__tests__/invitations-redeem.test.ts`): **7/7 tests passed**.
- Full test run (`npm test`): **8/8 files passed, 106/106 tests passed**.
- Lint run (`npm run lint`): passed with **3 pre-existing warnings** in unrelated files:
  - `/Users/victor/Projects/civicforge/app/actions/commons.ts`
  - `/Users/victor/Projects/civicforge/app/commons/components/commons-header.tsx`
  - `/Users/victor/Projects/civicforge/app/commons/components/community-growth.tsx`
- Build run (`npm run build`): successful production build.

### Behavior Status

- Same-community members can now redeem invite codes to unlock posting eligibility (Tier 2+).
- Cross-community invite redemption is explicitly blocked with a clear mismatch error.
- Single-use, expiry enforcement, atomic claim, and rollback safety are preserved.
