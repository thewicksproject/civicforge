import { redirect } from "next/navigation";
import { getCommonsData } from "@/app/actions/commons";
import { createClient } from "@/lib/supabase/server";
import { CommonsDashboard } from "../commons-dashboard";

export default async function CommunityCommonsPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getCommonsData(user.id, communityId);

  return <CommonsDashboard data={data} />;
}
