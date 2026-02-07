import { createServiceClient } from "@/lib/supabase/server";

/**
 * Request account deletion. Sets up a 30-day pipeline.
 */
export async function requestDeletion(userId: string) {
  const supabase = await createServiceClient();

  const { error } = await supabase.from("deletion_requests").insert({
    user_id: userId,
    status: "pending",
    requested_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/**
 * Process pending deletion requests that are past the 30-day waiting period.
 * Intended to be called from a cron job or admin action.
 */
export async function processPendingDeletions() {
  const supabase = await createServiceClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: requests, error } = await supabase
    .from("deletion_requests")
    .select("*")
    .eq("status", "pending")
    .lt("requested_at", thirtyDaysAgo.toISOString());

  if (error) throw error;
  if (!requests?.length) return [];

  const results = [];
  for (const request of requests) {
    try {
      // Update status to processing
      await supabase
        .from("deletion_requests")
        .update({ status: "processing" })
        .eq("id", request.id);

      // Delete user's storage files
      const { data: photos } = await supabase
        .from("post_photos")
        .select("url, thumbnail_url")
        .eq("uploaded_by", request.user_id);

      if (photos?.length) {
        const paths = photos.flatMap((p) => {
          const urlParts = p.url.split("/");
          const thumbParts = p.thumbnail_url.split("/");
          return [
            urlParts.slice(-2).join("/"),
            thumbParts.slice(-2).join("/"),
          ];
        });
        await supabase.storage.from("post-photos").remove(paths);
      }

      // CASCADE DELETE handles most data via foreign keys on profiles table
      // Delete the profile (cascades to posts, responses, thanks, etc.)
      await supabase.from("profiles").delete().eq("id", request.user_id);

      // Delete the auth user
      await supabase.auth.admin.deleteUser(request.user_id);

      // Mark deletion as complete
      await supabase
        .from("deletion_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      results.push({ userId: request.user_id, status: "completed" });
    } catch (err) {
      results.push({ userId: request.user_id, status: "error", error: err });
    }
  }
  return results;
}

/**
 * Cancel a pending deletion request (user changed their mind).
 */
export async function cancelDeletion(userId: string) {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("deletion_requests")
    .delete()
    .eq("user_id", userId)
    .eq("status", "pending");
  if (error) throw error;
}
