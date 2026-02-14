import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TemplatePicker } from "@/components/template-picker";

export const metadata = { title: "New Game Design" };

export default async function NewDesignPage({
  searchParams,
}: {
  searchParams: Promise<{ fork?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile?.community_id) redirect("/onboarding");
  if ((profile.renown_tier ?? 1) < 4) redirect("/game");

  const params = await searchParams;
  const isFork = params.fork === "true";

  // Fetch templates
  const { data: templates } = await admin
    .from("game_templates")
    .select("id, name, slug, description, value_statement, ceremony_level, quantification_level")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">
          {isFork ? "Fork Current Design" : "New Game Design"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isFork
            ? "Create a copy of the current active design and customize it."
            : "Choose a template to start from. You can customize everything after."}
        </p>
      </div>

      <TemplatePicker
        templates={templates ?? []}
        isFork={isFork}
      />
    </div>
  );
}
