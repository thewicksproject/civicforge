# CivicForge Persona Simulation System

Prompt-based simulated users for rapid UAT feedback loops. Interview, poll, and iterate with synthetic personas before talking to real humans.

## Quick Start

All invocations work through Claude Code's Task tool. The parent Claude Code instance orchestrates — it never simulates a persona itself. Personas run as Sonnet 4.6 subagents.

### Interview a Persona

Ask Claude Code:

> "Interview Stella about the flagging incident"

Claude Code will read `_system.md` + `_platform-state.md` + `stella.md` + `sessions/interview.md`, compose them into a Task prompt, and spawn a subagent you can converse with.

### Poll All Personas

Ask Claude Code:

> "Poll all four personas: Should CivicForge add direct messaging?"

Claude Code spawns 4 parallel subagents, each with their persona + `sessions/poll.md`. Returns structured positions from all 4, then synthesizes agreements, disagreements, and recommendations.

### Feature Walkthrough

Ask Claude Code:

> "Have Marco react to this new guild scheduling feature: [description]"

Loads Marco + `sessions/feature-test.md` + your feature description. Returns Marco's in-character reaction.

### UAT Scored Feedback

Ask Claude Code:

> "Get UAT feedback from all personas on the quest completion flow"

Spawns 4 parallel subagents with `sessions/uat-feedback.md`. Returns scored feedback (1-5) on Usability, Usefulness, Emotional Response, and Trust, plus issues and suggestions.

### Ralph Loop

Ask Claude Code:

> "Run a ralph loop on the onboarding flow"

Iterative cycle: baseline feedback from all personas → analyze → implement changes → re-test → compare → repeat until convergence. See `sessions/ralph-loop.md` for convergence criteria.

## File Structure

```
dev/personas/
  _system.md              Shared simulation rules (injected into every persona prompt)
  _platform-state.md      Current CivicForge feature snapshot
  victor.md               Keeper T4, governance focus, builder's perspective
  stella.md               Neighbor→Pillar progression, community heart, the flagging incident
  marco.md                Pillar T3, guild leader, practical builder, flagging misconception
  ava.md                  Newcomer T1, fresh eyes, 10 minutes of experience
  sessions/
    interview.md          Freeform conversation
    poll.md               Structured multi-persona polling
    feature-test.md       Feature walkthrough reaction
    uat-feedback.md       Scored UAT feedback (1-5 scales)
    ralph-loop.md         Iterative improvement protocol
```

## Persona Summary

| Persona | Tier | Perspective | Key Tension |
|---------|------|-------------|-------------|
| Victor | T4 Keeper | System architect, governance | Builder's bias — knows the code, not the UX |
| Stella | T3 Pillar | Community volunteer, gardener | Flagging trauma, conflict avoidance |
| Marco | T3 Pillar | Contractor, guild leader | Flagged Stella by accident, wants quality controls |
| Ava | T1 Newcomer | Fresh eyes, marketing brain | 10 min experience, "what do I do now?" |

## How It Works Under the Hood

When Claude Code receives a persona request, it:

1. Reads the relevant files from `dev/personas/`
2. Composes them into a Task prompt with this structure:
   ```
   [_system.md contents]
   [_platform-state.md contents]
   [persona.md contents]
   [session template contents]
   [developer's specific question or feature description]
   ```
3. Spawns a Task subagent (`subagent_type: "general-purpose"`, `model: "sonnet"`)
4. The subagent responds fully in character
5. For multi-persona sessions, spawns in parallel and synthesizes

## Synthesis Pattern (Multi-Persona)

After collecting responses from multiple personas, Claude Code synthesizes:

- **Agreements**: What all/most personas align on
- **Disagreements**: Where personas diverge (valuable signal)
- **Tier patterns**: Do newcomers and veterans see it differently?
- **Blind spot check**: Perspectives not represented (elder user, skeptic, etc.)
- **Recommended actions**: Prioritized by consensus and severity

## Design Principles

1. **Frustrations are features.** Every persona has documented pain points and misconceptions. Uniformly positive feedback means the simulation is broken.

2. **Mental models are intentionally wrong.** Users don't understand systems the way builders do. The misconceptions are the most valuable part.

3. **Voice is distinct.** If you can swap two personas' answers and nobody notices, the personas need more differentiation.

4. **Specificity over abstraction.** "The button on the quest page" beats "the user interface." Reference actual screens and actions.

5. **Blind spots are load-bearing.** Don't fix a persona's biases — they exist to reveal when features only work for certain mental models.

## Adding New Personas

Copy an existing persona file and fill in all 7 sections:

1. **Identity** — Who they are beyond CivicForge
2. **CivicForge Profile** — Hard data (tier, score, skills, privacy)
3. **Platform Experience** — Every action, chronologically
4. **Emotional Map** — Delights, frustrations, surprises, unmet needs
5. **Mental Model** — How they *think* the system works (include misconceptions)
6. **Blind Spots & Biases** — Realistic human limitations
7. **Voice** — Vocabulary, style, what they volunteer vs. withhold

Critical: sections 4-7 must include friction, confusion, and bias. If a persona has no complaints, it's not a persona — it's a press release.

## Future Personas

Planned additions to cover gaps in current coverage:

- **Elder user** — Low tech comfort, high community investment
- **Skeptic** — Privacy-maximalist, ghost tier, tests coercion guardrails
- **Power user** — Tries to game XP, stress-tests anti-dystopia rules
- **Intermittent user** — Monthly usage, forgets how things work
