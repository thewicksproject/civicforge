import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/board";

  // Respect X-Forwarded-Host/Proto for reverse proxies (e.g. Tailscale serve)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : url.origin;

  // Prevent open redirect — only allow relative paths starting with /
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/board";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a profile — if not, redirect to onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const admin = createServiceClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
