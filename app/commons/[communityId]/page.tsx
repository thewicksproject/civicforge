import { getCommonsData } from "@/app/actions/commons";
import { CommonsDashboard } from "../commons-dashboard";

export default async function CommunityCommonsPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { communityId } = await params;
  const data = await getCommonsData(communityId);

  return <CommonsDashboard data={data} />;
}
