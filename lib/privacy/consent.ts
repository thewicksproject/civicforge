import { createClient } from "@/lib/supabase/server";

export const CURRENT_POLICY_VERSION = "1.0.0";

export const REQUIRED_CONSENTS = [
  "terms_of_service",
  "privacy_policy",
] as const;

export const OPTIONAL_CONSENTS = ["ai_processing"] as const;

/**
 * Record user consent for a specific type.
 */
export async function recordConsent(
  userId: string,
  consentType: string,
  policyVersion: string = CURRENT_POLICY_VERSION
) {
  const supabase = await createClient();
  const { error } = await supabase.from("user_consents").insert({
    user_id: userId,
    consent_type: consentType,
    policy_version: policyVersion,
    granted_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/**
 * Revoke a specific consent.
 */
export async function revokeConsent(userId: string, consentType: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_consents")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("consent_type", consentType)
    .is("revoked_at", null);
  if (error) throw error;
}

/**
 * Check if user has granted a specific active consent.
 */
export async function hasConsent(
  userId: string,
  consentType: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_consents")
    .select("id")
    .eq("user_id", userId)
    .eq("consent_type", consentType)
    .is("revoked_at", null)
    .limit(1)
    .single();
  return !!data;
}

/**
 * Get all active consents for a user.
 */
export async function getUserConsents(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_consents")
    .select("*")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("granted_at", { ascending: false });
  if (error) throw error;
  return data;
}
