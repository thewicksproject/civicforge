"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSameCommunity } from "@/lib/security/authorization";
import { notify } from "@/lib/notify/dispatcher";

const ThanksSchema = z.object({
  toUserId: z.string().uuid("Invalid recipient user ID"),
  postId: z.string().uuid("Invalid post ID").nullable(),
  message: z
    .string()
    .min(1, "Message must not be empty")
    .max(500, "Message must be at most 500 characters")
    .nullable(),
});

export async function createThanks(
  toUserId: string,
  postId: string | null,
  message: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const parsed = ThanksSchema.safeParse({ toUserId, postId, message });
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  if (parsed.data.toUserId === user.id) {
    return { success: false as const, error: "You cannot thank yourself" };
  }

  const admin = createServiceClient();

  const { data: senderProfile, error: senderProfileError } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (senderProfileError || !senderProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  // Verify recipient exists
  const { data: recipient, error: recipientError } = await admin
    .from("profiles")
    .select("id, community_id")
    .eq("id", parsed.data.toUserId)
    .single();

  if (recipientError || !recipient || !recipient.community_id) {
    return { success: false as const, error: "Recipient not found" };
  }

  if (!isSameCommunity(senderProfile.community_id, recipient.community_id)) {
    return {
      success: false as const,
      error: "You can only send thanks within your community",
    };
  }

  // If postId is provided, verify the post exists
  if (parsed.data.postId) {
    const { data: post, error: postError } = await admin
      .from("posts")
      .select("id, author_id, community_id")
      .eq("id", parsed.data.postId)
      .single();

    if (postError || !post) {
      return { success: false as const, error: "Post not found" };
    }

    if (!isSameCommunity(senderProfile.community_id, post.community_id)) {
      return { success: false as const, error: "Post not found" };
    }

    if (post.author_id !== parsed.data.toUserId) {
      return {
        success: false as const,
        error: "Thanks recipient does not match the post author",
      };
    }
  }

  // Insert thanks
  const { data: thanksRecord, error: insertError } = await admin
    .from("thanks")
    .insert({
      from_user: user.id,
      to_user: parsed.data.toUserId,
      post_id: parsed.data.postId,
      message: parsed.data.message,
    })
    .select()
    .single();

  if (insertError) {
    return { success: false as const, error: "Failed to create thanks" };
  }

  // Notify the recipient
  notify({
    recipientId: parsed.data.toUserId,
    type: "thanks_received",
    title: "Someone sent you thanks!",
    body: parsed.data.message ?? undefined,
    resourceType: parsed.data.postId ? "post" : undefined,
    resourceId: parsed.data.postId ?? undefined,
    actorId: user.id,
  });

  // Increment recipient's reputation_score atomically.
  const { error: updateError } = await admin.rpc("increment_reputation", {
    p_user_id: parsed.data.toUserId,
    p_amount: 1,
  });

  if (updateError) {
    // Thanks was created but reputation update failed -- log but don't fail
    console.error("Failed to increment reputation_score:", updateError);
  }

  return { success: true as const, data: thanksRecord };
}
