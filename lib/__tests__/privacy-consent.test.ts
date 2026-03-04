import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import {
  CURRENT_POLICY_VERSION,
  REQUIRED_CONSENTS,
  OPTIONAL_CONSENTS,
  hasConsent,
} from "@/lib/privacy/consent";
import { createClient } from "@/lib/supabase/server";

const mockedCreateClient = vi.mocked(createClient);

describe("consent constants", () => {
  it("CURRENT_POLICY_VERSION is a valid semver string", () => {
    expect(CURRENT_POLICY_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("REQUIRED_CONSENTS includes terms_of_service and privacy_policy", () => {
    expect(REQUIRED_CONSENTS).toContain("terms_of_service");
    expect(REQUIRED_CONSENTS).toContain("privacy_policy");
  });

  it("OPTIONAL_CONSENTS includes ai_processing", () => {
    expect(OPTIONAL_CONSENTS).toContain("ai_processing");
  });

  it("required and optional consents do not overlap", () => {
    const required = new Set<string>(REQUIRED_CONSENTS);
    for (const consent of OPTIONAL_CONSENTS) {
      expect(required.has(consent)).toBe(false);
    }
  });
});

describe("hasConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when consent record exists", async () => {
    const query = {
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      limit: vi.fn(() => query),
      single: vi.fn(async () => ({ data: { id: "consent-1" }, error: null })),
    };

    mockedCreateClient.mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => query),
      })),
    } as never);

    const result = await hasConsent("user-1", "terms_of_service");
    expect(result).toBe(true);
  });

  it("returns false when no consent record exists", async () => {
    const query = {
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      limit: vi.fn(() => query),
      single: vi.fn(async () => ({ data: null, error: null })),
    };

    mockedCreateClient.mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => query),
      })),
    } as never);

    const result = await hasConsent("user-1", "terms_of_service");
    expect(result).toBe(false);
  });
});
