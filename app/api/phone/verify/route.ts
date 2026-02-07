import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkVerificationCode } from "@/lib/phone/twilio";
import { recordConsent } from "@/lib/privacy/consent";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { phone, code } = body;

  if (!phone || typeof phone !== "string") {
    return NextResponse.json(
      { error: "Phone number is required" },
      { status: 400 }
    );
  }

  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json(
      { error: "A 6-digit verification code is required" },
      { status: 400 }
    );
  }

  try {
    const result = await checkVerificationCode(phone, code);

    if (!result.valid) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

    // Set phone_verified = true on profile
    await supabase
      .from("profiles")
      .update({ phone_verified: true })
      .eq("id", user.id);

    // Record consent for phone verification
    await recordConsent(user.id, "phone_verification", "1.0.0");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
