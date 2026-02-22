"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { UUID_FORMAT } from "@/lib/utils";

export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const admin = createServiceClient();
  const { count, error } = await admin
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  if (error) {
    return { success: false as const, error: "Failed to get count" };
  }

  return { success: true as const, count: count ?? 0 };
}

export async function getNotifications(limit = 20, offset = 0) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("notifications")
    .select(`
      id, type, title, body, resource_type, resource_id,
      read, created_at,
      actor:profiles!notifications_actor_id_fkey(display_name, avatar_url)
    `)
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { success: false as const, error: "Failed to load notifications" };
  }

  return { success: true as const, notifications: data ?? [] };
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(notificationId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid notification ID" };
  }

  const admin = createServiceClient();
  await admin
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("recipient_id", user.id);

  return { success: true as const };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const admin = createServiceClient();
  await admin
    .from("notifications")
    .update({ read: true })
    .eq("recipient_id", user.id)
    .eq("read", false);

  return { success: true as const };
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const idParsed = z.string().regex(UUID_FORMAT).safeParse(notificationId);
  if (!idParsed.success) {
    return { success: false as const, error: "Invalid notification ID" };
  }

  const admin = createServiceClient();
  await admin
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("recipient_id", user.id);

  return { success: true as const };
}
