import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/post-form";
import { PostingLockedIllustration } from "@/components/illustrations";

export const metadata = { title: "Create Post" };

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceClient();

  // Check renown tier — only Tier 2+ can post
  const { data: profile } = await admin
    .from("profiles")
    .select("renown_tier, community_id")
    .eq("id", user!.id)
    .single();

  if (!profile?.community_id) {
    redirect("/onboarding");
  }

  if ((profile.renown_tier ?? 1) < 2) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <PostingLockedIllustration className="h-28 w-auto mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">
          You&apos;re almost there!
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          Once you have an invitation code from a neighbor or admin approval,
          you can post on the board. This helps keep our community trusted.
        </p>
        <p className="text-xs text-muted-foreground">
          Have a code? Enter it in your{" "}
          <Link href="/settings/privacy" className="underline underline-offset-4 hover:text-foreground transition-colors">
            account settings
          </Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Create a Post</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Share what you need or what you can offer to your community.
      </p>
      <PostForm />
    </div>
  );
}
