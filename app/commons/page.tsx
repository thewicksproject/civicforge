import { getCommonsData } from "@/app/actions/commons";
import { CommonsDashboard } from "./commons-dashboard";

export default async function CommonsPage() {
  const data = await getCommonsData();

  return <CommonsDashboard data={data} />;
}
