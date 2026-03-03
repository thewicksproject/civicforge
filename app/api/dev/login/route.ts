/**
 * Dev-only: password login for test users.
 * Only works when NEXT_PUBLIC_APP_URL is localhost.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Safety: only allow on localhost + non-production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Dev-only endpoint" }, { status: 403 });
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (!appUrl.includes("localhost")) {
    return NextResponse.json({ error: "Dev-only endpoint" }, { status: 403 });
  }

  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user?.email, redirect: "/board" });
}
