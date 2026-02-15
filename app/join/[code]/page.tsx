import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { JoinButton } from "./join-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const admin = createServiceClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("community_id, communities!inner(name)")
    .eq("code", code.toUpperCase())
    .single();

  if (!invitation) return { title: "Invitation Not Found" };
  const community = Array.isArray(invitation.communities)
    ? invitation.communities[0]
    : invitation.communities;
  return { title: `Join ${community?.name ?? "Community"} on CivicForge` };
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const admin = createServiceClient();

  // Look up invitation
  const { data: invitation } = await admin
    .from("invitations")
    .select("id, code, max_uses, use_count, expires_at, community_id, communities!inner(name, city, state)")
    .eq("code", code.toUpperCase())
    .single();

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-semibold mb-2">Invitation Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This invitation code doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            Go to CivicForge
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invitation.expires_at) < new Date();
  const isFullyUsed = invitation.use_count >= (invitation.max_uses ?? 1);

  if (isExpired || isFullyUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-semibold mb-2">Invitation Unavailable</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isExpired
              ? "This invitation has expired."
              : "This invitation has reached its usage limit."}
          </p>
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            Go to CivicForge
          </Link>
        </div>
      </div>
    );
  }

  const community = Array.isArray(invitation.communities)
    ? invitation.communities[0]
    : invitation.communities;

  // Check if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, show the public page with a login CTA
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-3xl font-bold text-primary mb-1">CivicForge</h1>
          <p className="text-sm text-muted-foreground mb-8">
            You&apos;ve been invited to join a community.
          </p>

          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 mb-6">
            <p className="text-lg font-semibold mb-1">
              {community?.name ?? "Community"}
            </p>
            {community?.city && (
              <p className="text-sm text-muted-foreground">
                {community.city}, {community.state}
              </p>
            )}
          </div>

          <Link
            href={`/login?redirect=${encodeURIComponent(`/join/${invitation.code}`)}`}
            className="inline-block rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Sign In to Join
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            You&apos;ll be redirected back here after signing in.
          </p>
        </div>
      </div>
    );
  }

  // User is logged in — check if they already belong to a community
  const { data: profile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  // If user already belongs to this community, redirect to board
  if (profile?.community_id === invitation.community_id) {
    redirect("/board");
  }

  // If user belongs to a different community, show error
  if (profile?.community_id && profile.community_id !== invitation.community_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-semibold mb-2">Already in a Community</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You already belong to a different community. This invitation is for {community?.name ?? "another community"}.
          </p>
          <Link
            href="/board"
            className="text-sm text-primary hover:underline"
          >
            Go to Your Board
          </Link>
        </div>
      </div>
    );
  }

  // User is logged in and ready to join — show join button
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-3xl font-bold text-primary mb-1">CivicForge</h1>
        <p className="text-sm text-muted-foreground mb-8">
          You&apos;ve been invited to join a community.
        </p>

        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 mb-6">
          <p className="text-lg font-semibold mb-1">
            {community?.name ?? "Community"}
          </p>
          {community?.city && (
            <p className="text-sm text-muted-foreground">
              {community.city}, {community.state}
            </p>
          )}
        </div>

        <JoinButton code={invitation.code} />
      </div>
    </div>
  );
}
