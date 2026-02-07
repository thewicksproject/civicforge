import { createClient } from "@/lib/supabase/server";

/**
 * Export all user data as a JSON object.
 * Implements the right to data portability (GDPR Art. 20, state privacy laws).
 */
export async function exportUserData(userId: string) {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: posts },
    { data: responses },
    { data: thanksGiven },
    { data: thanksReceived },
    { data: consents },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("posts")
      .select("*, post_photos(*)")
      .eq("author_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("responses")
      .select("*")
      .eq("responder_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("thanks")
      .select("*")
      .eq("from_user", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("thanks")
      .select("*")
      .eq("to_user", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_consents")
      .select("*")
      .eq("user_id", userId)
      .order("granted_at", { ascending: false }),
  ]);

  return {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile,
    posts,
    responses,
    thanks_given: thanksGiven,
    thanks_received: thanksReceived,
    consents,
  };
}
