import type { ActivityItem } from "@/app/actions/activity";
import { ActivityItemCard } from "./activity-item";

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          No activity yet. Be the first to post a need or offer!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <ActivityItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
