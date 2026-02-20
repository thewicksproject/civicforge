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

  const data = await getCommonsData(user?.id ?? null, communityId);

  return <CommonsDashboard data={data} />;
}
