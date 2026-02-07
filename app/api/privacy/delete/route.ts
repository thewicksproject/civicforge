import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requestDeletion } from "@/lib/privacy/deletion";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await requestDeletion(user.id);
  return NextResponse.json({ success: true, message: "Deletion requested. Your data will be removed within 30 days." });
}
