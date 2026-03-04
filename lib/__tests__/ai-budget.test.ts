import { describe, expect, it, vi } from "vitest";
import { checkDailyBudget } from "@/lib/ai/budget";
import { AI_DAILY_TOKEN_BUDGET } from "@/lib/types";

function createMockSupabase(queryResult: { data: unknown; error: unknown }) {
  const query = {
    eq: vi.fn(() => query),
    single: vi.fn(async () => queryResult),
  };
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => query),
    })),
  };
}

describe("checkDailyBudget", () => {
  it("returns allowed: true when under budget", async () => {
    const supabase = createMockSupabase({
      data: { tokens_used: 100 },
      error: null,
    });

    const result = await checkDailyBudget(supabase as never, "user-1");
    expect(result.allowed).toBe(true);
    expect(result.used).toBe(100);
  });

  it("returns allowed: false when at budget limit", async () => {
    const supabase = createMockSupabase({
      data: { tokens_used: AI_DAILY_TOKEN_BUDGET },
      error: null,
    });

    const result = await checkDailyBudget(supabase as never, "user-1");
    expect(result.allowed).toBe(false);
    expect(result.used).toBe(AI_DAILY_TOKEN_BUDGET);
  });

  it("returns allowed: false when over budget", async () => {
    const supabase = createMockSupabase({
      data: { tokens_used: AI_DAILY_TOKEN_BUDGET + 1000 },
      error: null,
    });

    const result = await checkDailyBudget(supabase as never, "user-1");
    expect(result.allowed).toBe(false);
  });

  it("returns used: 0 when no usage record exists", async () => {
    const supabase = createMockSupabase({
      data: null,
      error: null,
    });

    const result = await checkDailyBudget(supabase as never, "user-1");
    expect(result.allowed).toBe(true);
    expect(result.used).toBe(0);
  });

  it("queries the correct table with today's date", async () => {
    const supabase = createMockSupabase({
      data: null,
      error: null,
    });

    await checkDailyBudget(supabase as never, "user-123");

    expect(supabase.from).toHaveBeenCalledWith("ai_usage");
  });
});
