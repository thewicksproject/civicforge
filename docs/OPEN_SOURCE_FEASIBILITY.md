# Open Source Feasibility Study: CivicForge

**Date:** February 2026
**Author:** Wicks LLC
**Status:** Draft for internal review

---

## 1. Executive Summary

CivicForge is well-positioned to go open source. The project is a community coordination tool -- not a commercial SaaS product -- and its mission of neighbors helping neighbors aligns naturally with open-source values. The tech stack is already composed of open-source building blocks (Next.js, Supabase under Apache 2.0, Drizzle ORM, Sharp), the architecture cleanly separates secrets from code through environment variables, and the codebase contains no proprietary algorithms that would lose competitive value from disclosure.

**Recommendation: Yes, open source CivicForge under the Apache 2.0 license with a BDFL governance model.** The project should complete V2 stabilization before making the repository public, adopt an AGENTS.md file to govern AI-assisted contributions, and establish a lightweight CLA process. The primary risks -- AI-generated contribution spam and maintainer burnout -- are manageable at CivicForge's current scale and can be mitigated with the strategies outlined below.

---

## 2. Governance Models

### 2.1 BDFL (Benevolent Dictator For Life)

A single maintainer (or a very small core team) has final authority on all project decisions, including what gets merged, the roadmap, and release timing. This is the dominant model for small, focused open-source projects.

**Advantages:**
- Minimal bureaucratic overhead
- Fast decision-making
- Clear accountability and project vision
- Works naturally with existing Wicks LLC team structure

**Disadvantages:**
- Single point of failure (burnout, departure)
- Can discourage contributors who feel powerless
- Succession planning needed

**Precedent: cURL.** Daniel Stenberg has maintained cURL under a BDFL model for over 25 years. The project recently ended its HackerOne bug bounty program (January 2026) after being overwhelmed by AI-generated vulnerability reports -- a cautionary example relevant to CivicForge's own agentic contribution defense planning (see Section 4).

### 2.2 Foundation Model

A formal foundation (e.g., under the Linux Foundation, Apache Software Foundation) governs the project through committees, bylaws, and elected leadership.

**Advantages:**
- Institutional longevity beyond any individual
- Neutral governance attracts corporate contributors
- Established legal and IP frameworks

**Disadvantages:**
- Significant administrative overhead
- Requires a contributor community that does not yet exist
- Slow decision-making through consensus

**Precedent: Agentic AI Foundation (AAIF).** Formed in December 2025 under the Linux Foundation with contributions of AGENTS.md (OpenAI), MCP (Anthropic), and goose (Block). This model works at ecosystem scale, not for individual applications.

### 2.3 Corporate-Backed Open Source

Wicks LLC retains full control over the project direction, roadmap, and release process. The code is open source but the company steers development.

**Advantages:**
- Wicks LLC maintains brand and direction
- Clear legal ownership
- Can pivot strategy without community negotiation

**Disadvantages:**
- Contributors may distrust corporate motives
- "Open source in name only" perception risk
- Requires active community management effort

**Precedent:** Supabase (open-source platform, VC-funded company), Vercel (Next.js).

### 2.4 Recommendation for CivicForge

**BDFL model with a path toward a small steering committee.** CivicForge is a small Wicks LLC project with no existing contributor community. Foundation governance would be premature overhead. The BDFL model lets the current maintainer(s) ship quickly while keeping the door open for trusted contributors to join a steering committee as the community grows. Key elements:

- Designate a project lead (BDFL) from Wicks LLC
- Document governance in a GOVERNANCE.md file
- Create a CONTRIBUTING.md with clear expectations
- Adopt AGENTS.md for AI agent contribution boundaries
- Revisit governance structure if the project reaches 10+ regular contributors

---

## 3. License Selection

### 3.1 MIT License

The most permissive common license. Anyone can use, modify, and distribute with minimal requirements (attribution only).

| Attribute | Detail |
|-----------|--------|
| Permissiveness | Maximum |
| Patent protection | None |
| Copyleft | None |
| SaaS fork protection | None |
| Adoption friction | Lowest |

### 3.2 Apache License 2.0

Permissive like MIT but includes an explicit patent grant and contributor license terms. Used by Supabase, Android, Kubernetes, and many other major projects.

| Attribute | Detail |
|-----------|--------|
| Permissiveness | High |
| Patent protection | Yes (explicit grant + termination clause) |
| Copyleft | None |
| SaaS fork protection | None |
| Adoption friction | Low |

### 3.3 AGPL (GNU Affero General Public License)

Strong copyleft that extends to network use. Anyone running a modified version as a service must release their source code.

| Attribute | Detail |
|-----------|--------|
| Permissiveness | Low |
| Patent protection | Implicit |
| Copyleft | Strong (includes SaaS use) |
| SaaS fork protection | Yes |
| Adoption friction | High (many companies ban AGPL internally) |

### 3.4 BSL (Business Source License)

Source-available license that restricts commercial use for a defined period, after which it converts to an open-source license. Used by MariaDB (originator) and adopted by HashiCorp in 2023 for Terraform and other products.

| Attribute | Detail |
|-----------|--------|
| Permissiveness | Limited (time-delayed) |
| Patent protection | Varies by implementation |
| Copyleft | Converts after change date |
| SaaS fork protection | Yes (during BSL period) |
| Adoption friction | High (not OSI-approved, community controversy) |

### 3.5 Analysis: Should CivicForge Restrict Commercial Forks?

CivicForge is a community coordination tool, not a commercial product generating revenue from software licensing. Key considerations:

- **Mission alignment:** The project's stated principle is "community ownership -- no ads, no data selling, ever." Restrictive licenses contradict this ethos.
- **Network effects over code protection:** CivicForge's value comes from neighborhood communities using it, not from the code itself. More deployments (even forks) advance the mission.
- **Stack alignment:** Supabase (Apache 2.0), Next.js (MIT), Drizzle (Apache 2.0) -- the entire stack is permissively licensed. AGPL or BSL would create a licensing mismatch and deter contributors.
- **No revenue to protect:** There is no SaaS revenue stream that a fork could undercut. The risk of a commercial competitor forking a neighborhood needs board is negligible.
- **Contributor attraction:** Permissive licenses attract more contributors. AGPL and BSL scare away corporate contributors and many individual developers.

### 3.6 Recommendation

**Keep the existing Apache 2.0 license.** The project already ships with Apache 2.0 in its LICENSE file. This is the right choice for CivicForge because:

1. **Patent protection matters.** Apache 2.0's explicit patent grant protects both Wicks LLC and downstream users, which MIT does not provide.
2. **Stack consistency.** Aligns with Supabase (Apache 2.0), the project's primary infrastructure dependency.
3. **Community-friendly.** No copyleft obligations reduce friction for contributors and deployers.
4. **No commercial risk.** CivicForge has no revenue model that a permissive fork could threaten.
5. **Established.** Already in the repository -- changing licenses after going public is significantly harder than keeping the current one.

---

## 4. Agentic Contribution Defense

The rise of AI coding agents presents a new challenge for open-source maintainers. CivicForge must prepare for AI-generated contributions -- both well-intentioned and spam.

### 4.1 The Problem

The cURL project's experience is instructive. After AI-generated bug reports flooded their HackerOne program, the confirmed-valid rate dropped below 5%, consuming maintainer time triaging reports that were fabricated or irrelevant. The project ended its bug bounty program in January 2026. For CivicForge, the risks include:

- **Low-quality PRs:** AI agents generating superficial or broken contributions to farm GitHub activity
- **Plausible-sounding but wrong fixes:** LLM-generated code that passes superficial review but introduces subtle bugs
- **Issue spam:** AI-generated bug reports or feature requests with no basis in actual use
- **Security reports containing hallucinated vulnerabilities**

### 4.2 AGENTS.md for Safety Boundaries

AGENTS.md, now stewarded by the Agentic AI Foundation under the Linux Foundation, has been adopted by over 60,000 open-source projects since August 2025. It provides a standardized way to give AI coding agents project-specific guidance. CivicForge should adopt an AGENTS.md file that:

- Defines which areas of the codebase AI agents may modify
- Specifies required test coverage for AI-generated changes
- Declares security-sensitive files that should never be modified by automated tools (e.g., `middleware.ts`, `lib/supabase/server.ts`, RLS migration files)
- Requires that AI-generated contributions be clearly labeled
- Points agents to CONTRIBUTING.md for human review requirements

### 4.3 CLA (Contributor License Agreement)

A CLA ensures that all contributions grant Wicks LLC the rights needed to distribute the code under Apache 2.0, and that contributors warrant their submissions are original (or properly licensed).

**Recommendation:** Use a lightweight CLA via CLA Assistant (GitHub App) rather than requiring signed legal documents. This reduces friction while still providing:

- IP assignment clarity
- Confirmation that the contributor has the right to submit the code
- Protection against future license disputes
- A record of agreement for each contributor

### 4.4 Automated PR Quality Gates

Implement CI checks that run automatically on every pull request:

| Gate | Tool | Purpose |
|------|------|---------|
| Build verification | GitHub Actions + `npm run build` | Ensures the project compiles |
| Linting | ESLint (`npm run lint`) | Code style enforcement |
| Type checking | TypeScript strict mode | Catches type errors |
| AI disclosure check | Custom GitHub Action | Requires PR template checkbox for AI-generated code |
| CLA check | CLA Assistant | Blocks merge until CLA is signed |
| Minimum review | Branch protection rules | Require at least 1 maintainer approval |

Future additions (when contributor volume warrants):
- Test coverage thresholds (once a test suite exists)
- Automated security scanning (e.g., CodeQL, Snyk)
- PR size limits to prevent massive AI-generated dumps

### 4.5 Recommended Strategy

1. **Add AGENTS.md** before making the repository public
2. **Enable CLA Assistant** on the GitHub repository
3. **Set up GitHub Actions CI** with build, lint, and type-check gates
4. **Require PR templates** with an AI-disclosure checkbox
5. **Set branch protection rules** requiring maintainer review
6. **Start with a high bar:** Reject contributions that do not include a clear description of what was changed and why. This naturally filters out low-effort AI submissions.
7. **Reserve the right to close issues and PRs without explanation** if they appear to be AI-generated spam. Document this policy in CONTRIBUTING.md.

---

## 5. Sustainability

### 5.1 Hosting Cost Analysis

CivicForge's infrastructure costs scale with usage. At current (pre-launch) scale, the project can run on free tiers.

| Service | Free Tier | Paid Tier | Notes |
|---------|-----------|-----------|-------|
| Supabase | 500 MB DB, 1 GB storage, 50K monthly active users | $25/mo (Pro) | Sufficient for a single neighborhood; Pro needed for multiple |
| Vercel | 100 GB bandwidth, serverless functions | $20/mo (Pro) | Free tier adequate for moderate traffic |
| Anthropic API | None (pay-per-use) | ~$5-50/mo | Depends on AI feature usage; rate limiting keeps costs bounded |
| Upstash Redis | 10K commands/day | $10/mo (Pro) | Free tier sufficient for rate limiting at low scale |
| Twilio Verify | Pay-per-use | ~$0.05/verification | Negligible at community scale |
| ModerateContent | Free tier available | Pay-per-use | Photo moderation API |
| **Total (free tiers)** | | **$0-5/mo** | |
| **Total (paid tiers)** | | **$60-105/mo** | |

**Key insight:** CivicForge's costs are modest even at paid-tier scale. This is sustainable for a small LLC project without external funding, but becomes a consideration if the project gains many deployments generating support requests.

### 5.2 Sponsorship Models

| Model | Platform | Fit for CivicForge |
|-------|----------|-------------------|
| GitHub Sponsors | GitHub | Good -- low friction, direct to maintainers |
| Open Collective | Open Collective | Good -- transparent finances, community-oriented |
| Corporate sponsorship | Direct | Unlikely at current scale |
| Grants | Civic tech foundations | Possible -- aligns with civic mission |

**Recommendation:** Set up GitHub Sponsors as a first step. It requires no additional infrastructure and signals that the project accepts support. Open Collective is a good second step if the project gains traction, as its transparent ledger aligns with CivicForge's community-ownership values.

### 5.3 Dual Licensing Possibilities

Dual licensing (e.g., Apache 2.0 for open source, commercial license for enterprises) is not recommended for CivicForge because:

- There is no enterprise use case to monetize
- The project's value proposition is community coordination, not software licensing
- Dual licensing creates confusion and discourages contributors
- The maintenance burden of managing two license tracks is not justified

If Wicks LLC later develops a hosted multi-neighborhood SaaS offering, revenue should come from the hosted service (infrastructure, support, SLAs) rather than from licensing the code.

---

## 6. Security Implications

### 6.1 Secret Management in Open Repos

CivicForge currently manages secrets through environment variables, which is the correct approach. The `.gitignore` already excludes `.env`, `.env.local`, and other environment files. Before going public:

**Current secrets that require management:**

| Secret | Variable | Risk if Exposed |
|--------|----------|----------------|
| Supabase project URL | `NEXT_PUBLIC_SUPABASE_URL` | Low (public by design, embedded in client) |
| Supabase anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Low (public by design, RLS-protected) |
| Supabase service role key | `SUPABASE_SERVICE_ROLE_KEY` | **Critical** -- bypasses RLS, full DB access |
| Anthropic API key | `ANTHROPIC_API_KEY` | **High** -- enables API usage billed to Wicks LLC |
| Twilio Account SID | `TWILIO_ACCOUNT_SID` | **High** -- phone verification abuse |
| Twilio Auth Token | `TWILIO_AUTH_TOKEN` | **High** -- full Twilio account access |
| Twilio Verify Service SID | `TWILIO_VERIFY_SERVICE_SID` | Medium -- usable only with valid auth token |
| ModerateContent API key | `MODERATECONTENT_API_KEY` | Medium -- image moderation API abuse |
| Upstash Redis URL | `UPSTASH_REDIS_REST_URL` | Medium -- rate limit data exposure |
| Upstash Redis token | `UPSTASH_REDIS_REST_TOKEN` | **High** -- full Redis access |
| Database password | `DB_PASSWORD` | **Critical** -- direct database access |

**Pre-open-source checklist:**
- [ ] Audit entire git history for accidentally committed secrets (use `git log -p | grep -i "key\|secret\|password\|token"` or a tool like truffleHog / git-secrets)
- [ ] Rotate all production credentials after going public
- [ ] Add `.env.example` with placeholder values (no real credentials)
- [ ] Enable GitHub secret scanning on the repository
- [ ] Document required environment variables in README with setup instructions

### 6.2 Vulnerability Disclosure Process

Establish a clear vulnerability disclosure process before going public:

1. **Create a SECURITY.md** file with:
   - Supported versions
   - How to report vulnerabilities (email, not public issues)
   - Expected response timeline (e.g., acknowledge within 48 hours)
   - Scope (what counts as a security issue)
2. **Set up a security contact email** (e.g., security@civicforge.org)
3. **Enable GitHub private vulnerability reporting** on the repository
4. **Do not use a bug bounty program** -- the cURL experience demonstrates that bug bounties attract AI-generated spam reports at a scale that solo maintainers cannot handle

### 6.3 Security Audit Frequency

| Activity | Frequency | Notes |
|----------|-----------|-------|
| Dependency updates (`npm audit`) | Weekly (automated via Dependabot) | Catches known CVEs in dependencies |
| Supabase RLS policy review | Every schema change | Ensure new tables have proper policies |
| Manual code review of auth paths | Every PR touching `lib/supabase/`, `middleware.ts`, or `actions/` | Prevent auth bypass |
| Full security review | Annually or before major releases | Comprehensive audit of auth, RLS, AI isolation |
| Secret rotation | Quarterly | All non-public credentials |

### 6.4 Additional Security Measures

- **Enable Dependabot** for automated dependency vulnerability alerts
- **Enable CodeQL** (GitHub's static analysis) for JavaScript/TypeScript
- **Pin GitHub Actions** to commit SHAs rather than tags to prevent supply chain attacks
- **Review the AI isolation model** documentation to ensure open-sourcing does not reveal prompt injection attack vectors (current architecture separates user text from matching context, which is safe to disclose)

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI-generated PR spam | High | Medium | AGENTS.md, PR templates, branch protection, maintainer right to close without explanation |
| AI-generated issue spam | High | Low | Issue templates, label triage, close stale issues aggressively |
| Leaked secrets in git history | Medium | Critical | Audit history pre-launch, rotate all credentials post-launch, enable secret scanning |
| Maintainer burnout | Medium | High | Keep governance lightweight, set clear contribution expectations, accept that low activity is acceptable |
| Hostile fork / brand confusion | Low | Medium | Apache 2.0 trademark clause, register CivicForge trademark if needed |
| Security vulnerability disclosure to wrong channel | Medium | High | SECURITY.md, GitHub private reporting, clear instructions |
| Low contributor engagement | High | Low | Expected for a niche civic tool; open source is still valuable for transparency and trust |
| Supply chain attack via dependency | Low | High | Dependabot, lockfile, review dependency changes carefully |
| Inappropriate use of AI features in forks | Low | Low | Not CivicForge's responsibility under Apache 2.0; AI isolation model documentation helps forks stay safe |
| Community conflict / code of conduct violations | Low | Medium | Adopt Contributor Covenant, enforce consistently |

---

## 8. Recommendation

### Decision: Yes, open source CivicForge.

### Conditions (complete before making the repository public):

**Must-have (blocking):**
1. Audit the full git history for leaked secrets; consider using a tool like BFG Repo Cleaner or `git filter-repo` if secrets are found, or start from a clean initial commit
2. Create `.env.example` with documented placeholder values for all required and optional environment variables
3. Add `SECURITY.md` with vulnerability disclosure process
4. Add `CONTRIBUTING.md` with expectations, PR process, and AI disclosure requirements
5. Add `AGENTS.md` with safety boundaries for AI coding agents
6. Set up GitHub Actions CI with build, lint, and type-check gates
7. Enable branch protection on `main` requiring at least 1 review
8. Rotate all production credentials after the repository goes public

**Should-have (complete within 30 days of launch):**
9. Enable CLA Assistant for contributor IP management
10. Enable Dependabot for automated dependency updates
11. Enable GitHub secret scanning
12. Set up GitHub Sponsors
13. Add `CODE_OF_CONDUCT.md` (Contributor Covenant)
14. Add `GOVERNANCE.md` documenting BDFL model

**Nice-to-have (complete as needed):**
15. Enable CodeQL static analysis
16. Write initial test suite for critical auth and RLS paths
17. Set up Open Collective for transparent finances
18. Register CivicForge trademark

### Timing

Open source after V2 is stable and deployed to at least one real neighborhood. The initial release should be a working product, not a work in progress. A premature open-source launch invites contributions to a moving target and wastes both maintainer and contributor time.

### Summary

CivicForge's mission, architecture, and cost structure are all compatible with open-source development. The Apache 2.0 license already in place is the right choice. The BDFL governance model matches the project's current scale. The primary new work is operational: secret management, CI/CD, contribution policies, and security disclosure processes. None of these are technically difficult -- they are checklists, not engineering challenges.

The biggest risk is not that open-sourcing will harm CivicForge, but that it will create maintenance obligations (triaging issues, reviewing PRs, responding to questions) that distract from shipping. Mitigate this by setting clear expectations in documentation: CivicForge is a small project maintained by Wicks LLC, contributions are welcome but not guaranteed a response, and the maintainer reserves final authority on all decisions.
