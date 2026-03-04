import { describe, expect, it } from "vitest";
import {
  humanizeEnum,
  displayLabel,
  VALIDATION_METHOD_LABELS,
  RECOGNITION_TYPE_LABELS,
  THRESHOLD_TYPE_LABELS,
  SOURCE_TYPE_LABELS,
  VISIBILITY_LABELS,
  CEREMONY_LEVEL_LABELS,
  QUANTIFICATION_LEVEL_LABELS,
} from "@/lib/game-config/display-labels";

describe("humanizeEnum", () => {
  it("converts snake_case to Title Case", () => {
    expect(humanizeEnum("self_report")).toBe("Self report");
    expect(humanizeEnum("community_vote_and_evidence")).toBe("Community vote and evidence");
  });

  it("capitalizes single words", () => {
    expect(humanizeEnum("badge")).toBe("Badge");
  });

  it("handles already capitalized input", () => {
    expect(humanizeEnum("Already")).toBe("Already");
  });
});

describe("displayLabel", () => {
  it("returns mapped label when key exists", () => {
    expect(displayLabel(VALIDATION_METHOD_LABELS, "self_report")).toBe("Self-reported");
    expect(displayLabel(RECOGNITION_TYPE_LABELS, "xp")).toBe("Experience points");
  });

  it("falls back to humanizeEnum for unknown keys", () => {
    expect(displayLabel(VALIDATION_METHOD_LABELS, "unknown_method")).toBe("Unknown method");
  });
});

describe("label maps are non-empty and have string values", () => {
  const labelMaps = {
    VALIDATION_METHOD_LABELS,
    RECOGNITION_TYPE_LABELS,
    THRESHOLD_TYPE_LABELS,
    SOURCE_TYPE_LABELS,
    VISIBILITY_LABELS,
    CEREMONY_LEVEL_LABELS,
    QUANTIFICATION_LEVEL_LABELS,
  };

  for (const [name, map] of Object.entries(labelMaps)) {
    it(`${name} is non-empty with string values`, () => {
      const keys = Object.keys(map);
      expect(keys.length).toBeGreaterThan(0);
      for (const key of keys) {
        expect(typeof map[key]).toBe("string");
        expect(map[key].length).toBeGreaterThan(0);
      }
    });
  }
});
