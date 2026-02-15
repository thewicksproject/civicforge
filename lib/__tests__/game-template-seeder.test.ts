import { describe, it, expect } from "vitest";
import { validateTemplateConfig, type TemplateConfig } from "../game-config/template-seeder";

const classicConfig: TemplateConfig = {
  quest_types: [
    { slug: "spark", label: "Spark", description: "Quick task", validation_method: "self_report", validation_threshold: 0, base_recognition: 5 },
    { slug: "ember", label: "Ember", description: "Peer task", validation_method: "peer_confirm", validation_threshold: 1, base_recognition: 15 },
    { slug: "flame", label: "Flame", description: "Photo task", validation_method: "photo_and_peer", validation_threshold: 1, base_recognition: 35 },
    { slug: "blaze", label: "Blaze", description: "Vote task", validation_method: "community_vote", validation_threshold: 3, base_recognition: 75 },
    { slug: "inferno", label: "Inferno", description: "Major project", validation_method: "community_vote_and_evidence", validation_threshold: 5, base_recognition: 150 },
  ],
  skill_domains: [
    { slug: "craft", label: "Craft", description: "Building", examples: ["Repair"], color: "rose-clay", icon: "Hammer" },
    { slug: "green", label: "Green", description: "Growing", examples: ["Gardening"], color: "meadow", icon: "Leaf" },
    { slug: "care", label: "Care", description: "Caring", examples: ["Childcare"], color: "horizon", icon: "Heart" },
    { slug: "bridge", label: "Bridge", description: "Moving", examples: ["Transport"], color: "golden-hour", icon: "Truck" },
    { slug: "signal", label: "Signal", description: "Connecting", examples: ["Tech help"], color: "horizon", icon: "Radio" },
    { slug: "hearth", label: "Hearth", description: "Gathering", examples: ["Cooking"], color: "rose-clay", icon: "Flame" },
    { slug: "weave", label: "Weave", description: "Coordinating", examples: ["Planning"], color: "golden-hour", icon: "Network" },
  ],
  recognition_tiers: [
    { tier_number: 1, name: "Newcomer", threshold_value: 0, unlocks: ["Browse"] },
    { tier_number: 2, name: "Neighbor", threshold_value: 0, unlocks: ["Post offers"] },
    { tier_number: 3, name: "Pillar", threshold_value: 50, additional_requirements: { vouches_required: 2 }, unlocks: ["Moderate"] },
    { tier_number: 4, name: "Keeper", threshold_value: 200, unlocks: ["Governance"] },
    { tier_number: 5, name: "Founder", threshold_value: 500, unlocks: ["Cross-community"] },
  ],
  recognition_sources: [
    { source_type: "quest_completion", amount: 1 },
    { source_type: "endorsement_given", amount: 0.5 },
    { source_type: "endorsement_received", amount: 1 },
  ],
};

describe("validateTemplateConfig", () => {
  it("accepts valid Classic config", () => {
    const errors = validateTemplateConfig(classicConfig);
    expect(errors).toHaveLength(0);
  });

  it("produces correct child row counts", () => {
    expect(classicConfig.quest_types).toHaveLength(5);
    expect(classicConfig.skill_domains).toHaveLength(7);
    expect(classicConfig.recognition_tiers).toHaveLength(5);
    expect(classicConfig.recognition_sources).toHaveLength(3);
  });

  it("rejects config with invalid quest type slug", () => {
    const bad: TemplateConfig = {
      ...classicConfig,
      quest_types: [
        { slug: "", label: "Bad", validation_method: "self_report", validation_threshold: 0, base_recognition: 5 },
      ],
    };
    const errors = validateTemplateConfig(bad);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("Quest type 0");
  });

  it("rejects config with negative recognition amount", () => {
    const bad: TemplateConfig = {
      ...classicConfig,
      recognition_sources: [
        { source_type: "quest_completion", amount: -1 },
      ],
    };
    const errors = validateTemplateConfig(bad);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("Recognition source 0");
  });

  it("rejects config with empty skill domain label", () => {
    const bad: TemplateConfig = {
      ...classicConfig,
      skill_domains: [
        { slug: "test", label: "", description: "Test" },
      ],
    };
    const errors = validateTemplateConfig(bad);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("Skill domain 0");
  });

  it("rejects config with empty tier name", () => {
    const bad: TemplateConfig = {
      ...classicConfig,
      recognition_tiers: [
        { tier_number: 1, name: "", threshold_value: 0 },
      ],
    };
    const errors = validateTemplateConfig(bad);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("Recognition tier 0");
  });

  it("accepts Low Ceremony config with narrative recognition", () => {
    const lowCeremony: TemplateConfig = {
      quest_types: [
        { slug: "quick-help", label: "Quick Help", validation_method: "self_report", validation_threshold: 0, recognition_type: "narrative", base_recognition: 0, narrative_prompt: "What happened?" },
        { slug: "project", label: "Project", validation_method: "peer_confirm", validation_threshold: 1, recognition_type: "narrative", base_recognition: 0 },
      ],
      skill_domains: [
        { slug: "helping", label: "Helping", description: "All forms of assistance" },
        { slug: "organizing", label: "Organizing", description: "Bringing people together" },
      ],
      recognition_tiers: [
        { tier_number: 1, name: "New", threshold_value: 0 },
        { tier_number: 2, name: "Trusted", threshold_type: "quests_completed", threshold_value: 3 },
      ],
      recognition_sources: [
        { source_type: "quest_completion", amount: 1 },
      ],
    };
    const errors = validateTemplateConfig(lowCeremony);
    expect(errors).toHaveLength(0);
  });
});
