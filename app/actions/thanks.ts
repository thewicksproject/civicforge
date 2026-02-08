"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

  // Verify recipient exists
  const { data: recipient, error: recipientError } = await admin
    .from("profiles")
    .select("id, reputation_score")
    .eq("id", parsed.data.toUserId)
    .single();

  if (recipientError || !recipient) {
    return { success: false as const, error: "Recipient not found" };
  }

  // If postId is provided, verify the post exists
  if (parsed.data.postId) {
    const { data: post, error: postError } = await admin
      .from("posts")
      .select("id")
      .eq("id", parsed.data.postId)
      .single();

    if (postError || !post) {
      return { success: false as const, error: "Post not found" };
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

  // Increment recipient's reputation_score by 1
  const { error: updateError } = await admin
    .from("profiles")
    .update({
      reputation_score: recipient.reputation_score + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.toUserId);

  if (updateError) {
    // Thanks was created but reputation update failed -- log but don't fail
    console.error("Failed to increment reputation_score:", updateError);
  }

  return { success: true as const, data: thanksRecord };
}
