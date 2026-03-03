"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPushover } from "@/lib/notify/pushover";

const EmailSchema = z.string().email("Please enter a valid email address").max(320);

export async function submitAlphaInterest(email: string) {
  const parsed = EmailSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("alpha_interest")
    .upsert({ email: parsed.data }, { onConflict: "email" });

  if (error) {
    return { success: false as const, error: "Something went wrong. Please try again." };
  }

  await sendPushover({
    title: "CivicForge Alpha Interest",
    message: `New interest signup: ${parsed.data}`,
    priority: -1,
  });

  return { success: true as const };
}
