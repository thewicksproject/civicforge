import { createClient } from "@/lib/supabase/server";

/**
 * Export all user data as a JSON object.
 * Implements the right to data portability (GDPR Art. 20, CCPA/CPRA right to know).
 *
 * Covers all 14 tables in the schema where user data may exist:
 *   profiles, posts (with post_photos), responses, thanks, invitations,
 *   membership_requests, ai_matches, ai_usage, user_consents, audit_log,
 *   deletion_requests, post_flags
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
    { data: aiMatches },
    { data: aiUsage },
    { data: auditLogEntries },
    { data: deletionRequests },
    { data: invitations },
    { data: membershipRequests },
    { data: postFlags },
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
    supabase
      .from("ai_matches")
      .select("*")
      .eq("suggested_user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("ai_usage")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false }),
    supabase
      .from("audit_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("deletion_requests")
      .select("*")
      .eq("user_id", userId)
      .order("requested_at", { ascending: false }),
    supabase
      .from("invitations")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("membership_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("post_flags")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
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
    ai_matches: aiMatches,
    ai_usage: aiUsage,
    audit_log: auditLogEntries,
    deletion_requests: deletionRequests,
    invitations,
    membership_requests: membershipRequests,
    post_flags: postFlags,
  };
}
