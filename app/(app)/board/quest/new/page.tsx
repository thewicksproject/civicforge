import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { QuestForm } from "@/components/quest-form";

export const metadata = { title: "Create Quest" };

export default async function NewQuestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("renown_tier, community_id")
    .eq("id", user.id)
    .single();

  if (!profile?.community_id) {
    redirect("/onboarding");
  }

  if ((profile.renown_tier ?? 1) < 2) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <h2 className="text-xl font-semibold mb-2">
          Quest creation requires Confirmed status
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          You need to be at least Tier 2 (Confirmed) to create quests.
          Get an invitation code from a neighbor to level up.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Create a Quest</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Define a task for your community with clear completion criteria.
      </p>
      <QuestForm />
    </div>
  );
}
