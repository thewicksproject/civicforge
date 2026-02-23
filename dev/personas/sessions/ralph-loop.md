# Session Template: Ralph Loop (Iterative Improvement Protocol)

## What Is a Ralph Loop?

A rapid feedback cycle: gather persona reactions, analyze for actionable changes, implement, re-test with the same personas, compare, repeat. Named for "rapid alpha loop" — getting to convergence before involving real humans.

## Protocol

### Phase 1: Baseline
Gather UAT feedback from all personas on the target flow/feature using `sessions/uat-feedback.md`. Record scores and issues.

### Phase 2: Analyze
Synthesize across all personas:
- **Consensus issues**: Problems flagged by 3+ personas (fix immediately)
- **Tier-specific issues**: Problems that only affect certain tiers (prioritize by tier breadth)
- **Contradictions**: Where personas disagree (investigate — may reveal design tension)
- **Silent gaps**: Perspectives not represented by current personas (note for future expansion)

### Phase 3: Implement
Make code changes addressing the highest-priority issues. Focus on:
- Blockers first
- Major issues second
- Minor issues only if quick to fix
- Cosmetic issues deferred

### Phase 4: Re-test
Run the same UAT feedback template with the same personas, but with updated feature description reflecting changes. Compare:
- Score deltas (did scores go up?)
- Issue resolution (did flagged issues disappear?)
- New issues (did changes introduce new problems?)
- Emotional response shifts

### Phase 5: Evaluate Convergence

**Converged (stop iterating) when:**
- No Blocker or Major issues remain
- Average score across all dimensions >= 4.0
- No persona scores any dimension below 3
- No new issues introduced in latest iteration
- Emotional response is net positive for all personas

**Escalate to real users when:**
- Personas fundamentally disagree and both positions are valid
- 3+ iterations on the same issue without resolution
- Cultural sensitivity or accessibility concerns arise
- The feature involves financial, legal, or safety implications
- Persona coverage gaps make synthetic feedback unreliable

**Keep iterating when:**
- Blockers or Major issues remain
- Any persona scores Trust below 3
- Changes introduced new issues
- Average score < 4.0

## Iteration Log Format

```
## Iteration N

### Changes Made
- [List of specific changes since last iteration]

### Persona Scores

| Persona | Usability | Usefulness | Emotion | Trust | Avg |
|---------|-----------|------------|---------|-------|-----|
| Victor  |           |            |         |       |     |
| Stella  |           |            |         |       |     |
| Marco   |           |            |         |       |     |
| Ava     |           |            |         |       |     |

### Issues Resolved
- [Issues from previous iteration that are now fixed]

### Issues Remaining
- [Issues that persist]

### New Issues
- [Issues introduced by this iteration's changes]

### Convergence Status
[ ] No blockers/majors
[ ] Avg >= 4.0
[ ] No dimension below 3
[ ] No new issues
[ ] Net positive emotion
→ Status: CONVERGED / ITERATE / ESCALATE
```
