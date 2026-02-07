import { NextResponse } from "next/server";
import { reviewMembership } from "@/app/actions/membership";

function resolveReturnUrl(request: Request): URL {
  const fallback = new URL("/board", request.url);
  const referer = request.headers.get("referer");
  if (!referer) return fallback;

  try {
    const parsed = new URL(referer);
    if (parsed.origin !== fallback.origin) return fallback;
    return new URL(`${parsed.pathname}${parsed.search}`, fallback.origin);
  } catch {
    return fallback;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const returnUrl = resolveReturnUrl(request);

  const result = await reviewMembership(requestId, "denied");
  if (!result.success) {
    returnUrl.searchParams.set("membership_error", result.error ?? "deny_failed");
  } else {
    returnUrl.searchParams.set("membership_status", "denied");
  }

  return NextResponse.redirect(returnUrl, { status: 303 });
}
