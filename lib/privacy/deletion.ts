import { createServiceClient } from "@/lib/supabase/server";

export interface DeletionRequestResult {
  requestId: string;
  subjectUserId: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  alreadyPending: boolean;
}

export interface DeletionProcessResult {
  requestId: string;
  subjectUserId: string;
  status: "completed" | "failed";
  reason?: string;
}

function normalizeStoragePath(value: string): string | null {
  if (!value) return null;
  if (!value.includes("://")) return value;

  try {
    const parsed = new URL(value);
    const parts = parsed.pathname.split("/post-photos/");
    if (parts.length !== 2) return null;
    const path = parts[1]?.split("?")[0];
    return path || null;
  } catch {
    return null;
  }
}

/**
 * Request account deletion. Idempotent: returns the existing open request
 * when one is already pending/processing.
 */
export async function requestDeletion(
  userId: string
): Promise<DeletionRequestResult> {
  const supabase = createServiceClient();

  const { data: existing, error: existingError } = await supabase
    .from("deletion_requests")
    .select("id, subject_user_id, status, requested_at")
    .eq("subject_user_id", userId)
    .in("status", ["pending", "processing"])
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    return {
      requestId: existing.id,
      subjectUserId: existing.subject_user_id,
      status: existing.status,
      requestedAt: existing.requested_at,
      alreadyPending: true,
    };
  }

  const nowIso = new Date().toISOString();

  const { data: created, error: createError } = await supabase
    .from("deletion_requests")
    .insert({
      user_id: userId,
      subject_user_id: userId,
      status: "pending",
      requested_at: nowIso,
      attempts: 0,
      updated_at: nowIso,
      failure_reason: null,
    })
    .select("id, subject_user_id, status, requested_at")
    .single();

  if (!createError && created) {
    return {
      requestId: created.id,
      subjectUserId: created.subject_user_id,
      status: created.status,
      requestedAt: created.requested_at,
      alreadyPending: false,
    };
  }

  // Unique partial index race: fetch the request that won.
  if (createError?.code === "23505") {
    const { data: racedExisting, error: raceFetchError } = await supabase
      .from("deletion_requests")
      .select("id, subject_user_id, status, requested_at")
      .eq("subject_user_id", userId)
      .in("status", ["pending", "processing"])
      .order("requested_at", { ascending: false })
      .limit(1)
      .single();

    if (raceFetchError) throw raceFetchError;

    return {
      requestId: racedExisting.id,
      subjectUserId: racedExisting.subject_user_id,
      status: racedExisting.status,
      requestedAt: racedExisting.requested_at,
      alreadyPending: true,
    };
  }

  if (createError) throw createError;

  throw new Error("Failed to create deletion request");
}

async function markRequestFailed(
  supabase: ReturnType<typeof createServiceClient>,
  requestId: string,
  reason: string
): Promise<void> {
  await supabase
    .from("deletion_requests")
    .update({
      status: "failed",
      failure_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .in("status", ["pending", "processing"]);
}

/**
 * Process pending deletion requests that are past the 30-day waiting period.
 * Intended to be called from a cron job or admin action.
 */
export async function processPendingDeletions(): Promise<DeletionProcessResult[]> {
  const supabase = createServiceClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: requests, error } = await supabase
    .from("deletion_requests")
    .select("id, subject_user_id, status, requested_at, attempts")
    .eq("status", "pending")
    .lt("requested_at", thirtyDaysAgo.toISOString());

  if (error) throw error;
  if (!requests?.length) return [];

  const results: DeletionProcessResult[] = [];

  for (const request of requests) {
    const nowIso = new Date().toISOString();

    // Acquire the request (race-safe) and increment attempts.
    const { data: acquired, error: acquireError } = await supabase
      .from("deletion_requests")
      .update({
        status: "processing",
        failure_reason: null,
        attempts: (request.attempts ?? 0) + 1,
        updated_at: nowIso,
      })
      .eq("id", request.id)
      .eq("status", "pending")
      .select("id, subject_user_id")
      .maybeSingle();

    if (acquireError) {
      const reason = `state_transition_failed: ${acquireError.message}`;
      await markRequestFailed(supabase, request.id, reason);
      results.push({
        requestId: request.id,
        subjectUserId: request.subject_user_id,
        status: "failed",
        reason,
      });
      continue;
    }

    if (!acquired) {
      results.push({
        requestId: request.id,
        subjectUserId: request.subject_user_id,
        status: "failed",
        reason: "state_transition_failed: request_not_pending",
      });
      continue;
    }

    try {
      // Delete user's storage files
      const { data: photos, error: photosError } = await supabase
        .from("post_photos")
        .select("url, thumbnail_url")
        .eq("uploaded_by", request.subject_user_id);

      if (photosError) {
        throw new Error(`post_photos_lookup_failed: ${photosError.message}`);
      }

      if (photos?.length) {
        const paths = Array.from(
          new Set(
            photos
              .flatMap((p) => [
                normalizeStoragePath(p.url),
                normalizeStoragePath(p.thumbnail_url),
              ])
              .filter((path): path is string => !!path)
          )
        );

        if (paths.length > 0) {
          const { error: removeError } = await supabase.storage
            .from("post-photos")
            .remove(paths);
          if (removeError) {
            throw new Error(`storage_remove_failed: ${removeError.message}`);
          }
        }
      }

      // CASCADE DELETE handles most data via foreign keys on profiles table.
      const { error: profileDeleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", request.subject_user_id);
      if (profileDeleteError) {
        throw new Error(`profile_delete_failed: ${profileDeleteError.message}`);
      }

      // Delete the auth user (ignore already deleted users).
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
        request.subject_user_id
      );
      if (
        authDeleteError &&
        !/not\s*found/i.test(authDeleteError.message ?? "")
      ) {
        throw new Error(`auth_delete_failed: ${authDeleteError.message}`);
      }

      // Mark deletion as complete.
      const { data: completedRow, error: completeError } = await supabase
        .from("deletion_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          failure_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.id)
        .eq("status", "processing")
        .select("id")
        .maybeSingle();

      if (completeError || !completedRow) {
        const reason = completeError
          ? `completion_state_transition_failed: ${completeError.message}`
          : "completion_state_transition_failed: missing_processing_row";
          await markRequestFailed(supabase, request.id, reason);
        results.push({
          requestId: request.id,
          subjectUserId: request.subject_user_id,
          status: "failed",
          reason,
        });
        continue;
      }

      results.push({
        requestId: request.id,
        subjectUserId: request.subject_user_id,
        status: "completed",
      });
    } catch (errorInRequest) {
      const reason =
        errorInRequest instanceof Error
          ? errorInRequest.message
          : "unknown_processing_error";
      await markRequestFailed(supabase, request.id, reason);
      results.push({
        requestId: request.id,
        subjectUserId: request.subject_user_id,
        status: "failed",
        reason,
      });
    }
  }

  return results;
}

/**
 * Cancel a pending deletion request (user changed their mind).
 */
export async function cancelDeletion(userId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("deletion_requests")
    .delete()
    .eq("subject_user_id", userId)
    .eq("status", "pending");
  if (error) throw error;
}
