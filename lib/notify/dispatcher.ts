import { createServiceClient } from "@/lib/supabase/server";

interface NotifyParams {
  recipientId: string;
  type: string;
  title: string;
  body?: string;
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
}

/**
 * Insert a notification row for a user. Fire-and-forget —
 * failures are logged but never block the parent action.
 */
export async function notify(params: NotifyParams): Promise<void> {
  try {
    const admin = createServiceClient();
    await admin.from("notifications").insert({
      recipient_id: params.recipientId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      resource_type: params.resourceType ?? null,
      resource_id: params.resourceId ?? null,
      actor_id: params.actorId ?? null,
    });
  } catch (err) {
    console.error("notify: failed to insert notification", err);
  }
}
