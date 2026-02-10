import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { RENOWN_TIER_LABELS, type RenownLegacyTier } from "@/lib/types";
import { ReputationBadge } from "@/components/reputation-badge";

export const metadata = { title: "Community Members" };

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createServiceClient();

  const { data: community } = await admin
    .from("communities")
    .select("*")
    .eq("id", id)
    .single();

  if (!community) notFound();

  // Check if current user is an admin (Tier 2+ in this community)
  const { data: profile } = await admin
    .from("profiles")
    .select("renown_tier, community_id")
    .eq("id", user.id)
    .single();

  if (!profile?.community_id || profile.community_id !== id) {
    notFound();
  }

  const isAdmin = (profile.renown_tier ?? 1) >= 2;

  // Get members
  const { data: members } = await admin
    .from("profiles")
    .select("id, display_name, reputation_score, renown_tier, created_at")
    .eq("community_id", id)
    .order("reputation_score", { ascending: false });

  // Get pending membership requests (if admin)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pendingRequests: any[] = [];
  if (isAdmin) {
    const { data } = await admin
      .from("membership_requests")
      .select("id, user_id, message, created_at, user:profiles!user_id(display_name)")
      .eq("community_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    pendingRequests = data ?? [];
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{community.name}</h1>
          <p className="text-sm text-muted-foreground">
            {community.city}, {community.state} &middot;{" "}
            {members?.length ?? 0} members
          </p>
        </div>
        {isAdmin && (
          <Link
            href={`/community/${id}/invite`}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Invite
          </Link>
        )}
      </div>

      {/* Pending requests */}
      {isAdmin && pendingRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-2">
            {pendingRequests.map((req) => {
              const reqUser = Array.isArray(req.user)
                ? req.user[0]
                : req.user;
              return (
                <div
                  key={req.id}
                  className="rounded-lg border border-golden-hour/30 bg-golden-hour/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">
                        {reqUser?.display_name ?? "Unknown"}
                      </span>
                      {req.message && (
                        <p className="text-xs text-muted-foreground mt-1">
                          &quot;{req.message}&quot;
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <form action={`/api/membership/${req.id}/approve`} method="POST">
                        <button className="rounded-lg bg-offer/10 text-offer px-3 py-1.5 text-xs font-medium hover:bg-offer/20 transition-colors">
                          Approve
                        </button>
                      </form>
                      <form action={`/api/membership/${req.id}/deny`} method="POST">
                        <button className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
                          Deny
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Member list */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Members</h2>
        <div className="space-y-2">
          {members?.map((member) => (
            <Link
              key={member.id}
              href={`/profile/${member.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                  {member.display_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-sm font-medium">
                    {member.display_name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {
                      RENOWN_TIER_LABELS[
                        (member.renown_tier ?? 1) as RenownLegacyTier
                      ]
                    }
                  </span>
                </div>
              </div>
              <ReputationBadge score={member.reputation_score ?? 0} size="sm" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
