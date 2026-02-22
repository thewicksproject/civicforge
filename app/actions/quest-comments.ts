"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { UUID_FORMAT } from "@/lib/utils";
import { notify } from "@/lib/notify/dispatcher";

const BodySchema = z
  .string()
  .min(1, "Comment cannot be empty")
  .max(2000, "Comment must be at most 2000 characters");

async function isQuestParticipant(
  admin: ReturnType<typeof createServiceClient>,
  questId: string,
  userId: string,
): Promise<boolean> {
  // Check if user is the quest creator
  const { data: quest } = await admin
    .from("quests")
    .select("created_by")
    .eq("id", questId)
    .single();

  if (quest?.created_by === userId) return true;

  // Check if user is a party member
  const { data: party } = await admin
    .from("parties")
    .select("id, party_members!inner(user_id)")
    .eq("quest_id", questId)
    .eq("party_members.user_id", userId)
    .limit(1)
    .maybeSingle();

  return !!party;
}

async function getQuestParticipantIds(
  admin: ReturnType<typeof createServiceClient>,
  questId: string,
): Promise<string[]> {
  const { data: quest } = await admin
    .from("quests")
    .select("created_by")
    .eq("id", questId)
    .single();

  const ids = new Set<string>();
  if (quest) ids.add(quest.created_by);

  const { data: parties } = await admin
    .from("parties")
    .select("id")
    .eq("quest_id", questId);

  const partyIds = (parties ?? []).map((p) => p.id);
  if (partyIds.length > 0) {
    const { data: members } = await admin
      .from("party_members")
      .select("user_id")
      .in("party_id", partyIds);

    for (const m of members ?? []) {
      ids.add(m.user_id);
    }
  }

  return Array.from(ids);
}

export async function createQuestComment(questId: string, body: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(questId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid quest ID" };
  }

  const bodyParsed = BodySchema.safeParse(body);
  if (!bodyParsed.success) {
    return { success: false as const, error: bodyParsed.error.issues[0].message };
  }

  const admin = createServiceClient();

  // Verify user is a quest participant
  if (!(await isQuestParticipant(admin, questId, user.id))) {
    return { success: false as const, error: "Only quest participants can post comments" };
  }

  const { data: comment, error } = await admin
    .from("quest_comments")
    .insert({
      quest_id: questId,
      author_id: user.id,
      body: bodyParsed.data,
    })
    .select("id, body, created_at")
    .single();

  if (error) {
    return { success: false as const, error: "Failed to post comment" };
  }

  // Notify other participants
  const participantIds = await getQuestParticipantIds(admin, questId);
  for (const pid of participantIds) {
    if (pid !== user.id) {
      notify({
        recipientId: pid,
        type: "quest_comment",
        title: "New message on your quest",
        body: bodyParsed.data.slice(0, 120),
        resourceType: "quest",
        resourceId: questId,
        actorId: user.id,
      });
    }
  }

  return { success: true as const, comment };
}

export async function getQuestComments(questId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(questId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid quest ID" };
  }

  const admin = createServiceClient();

  // Verify user is a quest participant
  if (!(await isQuestParticipant(admin, questId, user.id))) {
    return { success: false as const, error: "Only quest participants can view comments" };
  }

  const { data: comments, error } = await admin
    .from("quest_comments")
    .select(`
      id, body, created_at, author_id,
      author:profiles!quest_comments_author_id_fkey(display_name, avatar_url)
    `)
    .eq("quest_id", questId)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false as const, error: "Failed to load comments" };
  }

  return { success: true as const, comments: comments ?? [] };
}

export async function deleteQuestComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(commentId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid comment ID" };
  }

  const admin = createServiceClient();

  // Only the author can delete
  const { data: comment } = await admin
    .from("quest_comments")
    .select("id, author_id")
    .eq("id", commentId)
    .single();

  if (!comment) {
    return { success: false as const, error: "Comment not found" };
  }

  if (comment.author_id !== user.id) {
    return { success: false as const, error: "Only the author can delete this comment" };
  }

  await admin.from("quest_comments").delete().eq("id", commentId);

  return { success: true as const };
}
