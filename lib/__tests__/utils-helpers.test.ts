import { describe, expect, it } from "vitest";
import { truncate, slugify, generateInviteCode } from "@/lib/utils";

describe("truncate", () => {
  it("returns original string when under limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns original string when exactly at limit", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates with ellipsis when over limit", () => {
    const result = truncate("hello world", 6);
    expect(result).toBe("hello\u2026");
    expect(result.length).toBe(6);
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("slugify", () => {
  it("lowercases input", () => {
    expect(slugify("Hello")).toBe("hello");
  });

  it("replaces non-alphanumeric characters with dashes", () => {
    expect(slugify("hello world")).toBe("hello-world");
    expect(slugify("hello & world!")).toBe("hello-world");
  });

  it("strips leading and trailing dashes", () => {
    expect(slugify("--hello--")).toBe("hello");
    expect(slugify("!hello!")).toBe("hello");
  });

  it("collapses multiple non-alnum chars into single dash", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("handles mixed case and special chars", () => {
    expect(slugify("Hello, World! How's it going?")).toBe("hello-world-how-s-it-going");
  });
});

describe("generateInviteCode", () => {
  const ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  it("generates an 8-character code", () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(8);
  });

  it("only uses allowed charset (no 0, 1, I, O)", () => {
    for (let i = 0; i < 10; i++) {
      const code = generateInviteCode();
      for (const char of code) {
        expect(ALLOWED_CHARS).toContain(char);
      }
    }
  });

  it("produces different codes on successive calls", () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateInviteCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});
