import { type SupabaseClient } from "@supabase/supabase-js";
import { AI_DAILY_TOKEN_BUDGET } from "@/lib/types";

/**
 * Pre-flight check for daily AI token budget.
 * Queries the ai_usage table for today's total and compares against the budget.
 * Returns whether the user is allowed to make another AI call.
 */
export async function checkDailyBudget(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; used: number }> {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("ai_usage")
    .select("tokens_used")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .single();

  const used = data?.tokens_used ?? 0;

  return {
    allowed: used < AI_DAILY_TOKEN_BUDGET,
    used,
  };
}
