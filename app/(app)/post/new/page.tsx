import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/post-form";

export const metadata = { title: "Create Post" };

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check trust tier — only Tier 2+ can post
  const { data: profile } = await supabase
    .from("profiles")
    .select("trust_tier, neighborhood_id")
    .eq("id", user!.id)
    .single();

  if (!profile?.neighborhood_id) {
    redirect("/onboarding");
  }

  if ((profile.trust_tier ?? 1) < 2) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-semibold mb-2">
          Posting requires Confirmed status
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          To post on the board, you need an invitation code from a neighbor or
          admin approval. This helps keep our community trusted.
        </p>
        <p className="text-xs text-muted-foreground">
          Have a code? Enter it in your profile settings.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Create a Post</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Share what you need or what you can offer to your neighborhood.
      </p>
      <PostForm />
    </div>
  );
}
