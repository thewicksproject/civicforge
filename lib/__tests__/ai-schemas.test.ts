import { describe, expect, it } from "vitest";
import {
  PostExtractionSchema,
  QuestExtractionSchema,
  ModerationResultSchema,
  AdvocateResponseSchema,
  GovernanceAnalysisSchema,
  IssueDecompositionSchema,
} from "@/lib/ai/schemas";

describe("PostExtractionSchema", () => {
  const validPost = {
    title: "Need help fixing a leaky faucet",
    description: "My kitchen faucet has been dripping for a week. Need someone handy with plumbing.",
    category: "home_repair",
    type: "need",
    skills_relevant: ["plumbing", "home repair"],
    urgency: "medium",
    available_times: "Weekends",
    location_hint: "Downtown area",
  };

  it("accepts valid input", () => {
    const result = PostExtractionSchema.safeParse(validPost);
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 5 characters", () => {
    const result = PostExtractionSchema.safeParse({ ...validPost, title: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = PostExtractionSchema.safeParse({ ...validPost, category: "invalid_cat" });
    expect(result.success).toBe(false);
  });

  it("accepts null urgency", () => {
    const result = PostExtractionSchema.safeParse({ ...validPost, urgency: null });
    expect(result.success).toBe(true);
  });
});

describe("QuestExtractionSchema", () => {
  const validQuest = {
    title: "Clean up the community garden",
    description: "The community garden needs weeding and mulching before spring planting.",
    difficulty: "ember",
    skill_domains: ["green"],
    max_party_size: 4,
    urgency: "medium",
    available_times: "Saturday mornings",
    location_hint: "Community garden on 5th",
  };

  it("accepts valid input", () => {
    const result = QuestExtractionSchema.safeParse(validQuest);
    expect(result.success).toBe(true);
  });

  it("rejects empty skill_domains", () => {
    const result = QuestExtractionSchema.safeParse({ ...validQuest, skill_domains: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 3 skill_domains", () => {
    const result = QuestExtractionSchema.safeParse({
      ...validQuest,
      skill_domains: ["craft", "green", "care", "bridge"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid difficulty", () => {
    const result = QuestExtractionSchema.safeParse({ ...validQuest, difficulty: "legendary" });
    expect(result.success).toBe(false);
  });
});

describe("ModerationResultSchema", () => {
  it("validates safe content", () => {
    const result = ModerationResultSchema.safeParse({
      safe: true,
      reason: null,
      category: "safe",
    });
    expect(result.success).toBe(true);
  });

  it("validates unsafe content", () => {
    const result = ModerationResultSchema.safeParse({
      safe: false,
      reason: "Contains harassment",
      category: "harassment",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid category", () => {
    const result = ModerationResultSchema.safeParse({
      safe: false,
      reason: "Bad",
      category: "violence",
    });
    expect(result.success).toBe(false);
  });
});

describe("AdvocateResponseSchema", () => {
  it("accepts valid response with actions", () => {
    const result = AdvocateResponseSchema.safeParse({
      message: "I found some quests that match your skills!",
      actions: [
        { type: "find_quests", data: { domain: "craft" } },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than 3 actions", () => {
    const result = AdvocateResponseSchema.safeParse({
      message: "Doing many things",
      actions: [
        { type: "find_quests" },
        { type: "create_quest" },
        { type: "summarize_activity" },
        { type: "flag_concern" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty actions array", () => {
    const result = AdvocateResponseSchema.safeParse({
      message: "Just chatting!",
      actions: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("GovernanceAnalysisSchema", () => {
  it("validates complete analysis with power concerns", () => {
    const result = GovernanceAnalysisSchema.safeParse({
      summary: "This proposal changes voting thresholds.",
      who_benefits: "Active community members",
      who_bears_cost: "Newcomers who haven't built reputation yet",
      power_check: {
        concentrates_power: true,
        concerns: "Raises barrier for new voices in governance",
      },
      user_impact: "You would need 10 more renown to participate",
    });
    expect(result.success).toBe(true);
  });

  it("validates analysis without power concerns", () => {
    const result = GovernanceAnalysisSchema.safeParse({
      summary: "Minor charter wording update.",
      who_benefits: "Everyone equally",
      who_bears_cost: "No one significantly",
      power_check: {
        concentrates_power: false,
        concerns: null,
      },
      user_impact: "No direct impact on you",
    });
    expect(result.success).toBe(true);
  });
});

describe("IssueDecompositionSchema", () => {
  const validDecomposition = {
    quests: [
      {
        title: "Survey the damaged sidewalk",
        description: "Walk the affected blocks and document cracks and trip hazards.",
        difficulty: "spark",
        skill_domains: ["signal"],
        max_party_size: 2,
        rationale: "Need baseline data before any repair work",
        regulatory_notes: "Check if city has reporting hotline",
      },
      {
        title: "Organize repair volunteers",
        description: "Recruit and coordinate volunteers for the repair effort.",
        difficulty: "ember",
        skill_domains: ["weave"],
        max_party_size: 3,
        rationale: "Coordination is needed before physical work begins",
        regulatory_notes: null,
      },
    ],
    regulatory_awareness: {
      general_notes: "Sidewalk repair may require city permits.",
      disclaimer: "This is general awareness, not legal advice. Consult local authorities for specific requirements.",
      suggested_contacts: ["City Public Works Department"],
    },
    decomposition_rationale: "Broken into survey and coordination phases to enable parallel work.",
  };

  it("accepts valid decomposition with 2-8 quests", () => {
    const result = IssueDecompositionSchema.safeParse(validDecomposition);
    expect(result.success).toBe(true);
  });

  it("rejects fewer than 2 quests", () => {
    const result = IssueDecompositionSchema.safeParse({
      ...validDecomposition,
      quests: [validDecomposition.quests[0]],
    });
    expect(result.success).toBe(false);
  });

  it("validates regulatory_awareness structure", () => {
    const result = IssueDecompositionSchema.safeParse(validDecomposition);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.regulatory_awareness).toHaveProperty("general_notes");
      expect(result.data.regulatory_awareness).toHaveProperty("disclaimer");
      expect(result.data.regulatory_awareness).toHaveProperty("suggested_contacts");
    }
  });
});
