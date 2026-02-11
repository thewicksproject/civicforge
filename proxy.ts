import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/login", "/privacy", "/terms", "/commons"];

export async function proxy(request: NextRequest) {
  // Update Supabase auth session
  const response = await updateSession(request);

  // Generate per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: *.supabase.co",
    "font-src 'self'",
    "connect-src 'self' *.supabase.co",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Detect Global Privacy Control signal
  const gpc = request.headers.get("sec-gpc");
  if (gpc === "1") {
    response.headers.set("x-gpc-honored", "true");
  }

  // Catch OAuth codes that arrive at the root (Supabase Site URL fallback)
  const path = request.nextUrl.pathname;
  const code = request.nextUrl.searchParams.get("code");
  if (path === "/" && code) {
    const callbackUrl = new URL("/api/auth/callback", request.url);
    callbackUrl.searchParams.set("code", code);
    return NextResponse.redirect(callbackUrl);
  }

  // Auth protection for non-public routes
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (!isPublicRoute && !path.startsWith("/api/")) {
    // The session refresh in updateSession already calls getUser()
    // If there's no valid user, redirect to login
    const {
      data: { user },
    } = await (await createMiddlewareClient(request, response)).auth.getUser();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

async function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  const { createServerClient } = await import("@supabase/ssr");
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
