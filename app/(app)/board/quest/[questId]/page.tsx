import { redirect } from "next/navigation";

export default async function OldQuestPage({
  params,
}: {
  params: Promise<{ questId: string }>;
}) {
  const { questId } = await params;
  redirect(`/quests/${questId}`);
}
