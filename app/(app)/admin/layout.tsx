import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("trust_tier")
    .eq("id", user.id)
    .single();

  if (!profile || profile.trust_tier < 3) {
    redirect("/board");
  }

  return <>{children}</>;
}
