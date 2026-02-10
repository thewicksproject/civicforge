"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";

interface CommonsHeaderProps {
  communities: { id: string; name: string }[];
  currentCommunityId?: string;
  currentCommunityName?: string;
  generatedAt: string;
}

export function CommonsHeader({
  communities,
  currentCommunityId,
  currentCommunityName,
  generatedAt,
}: CommonsHeaderProps) {
  const router = useRouter();

  const formattedTime = new Date(generatedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Link
          href="/commons"
          className="flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
        >
          <Globe className="h-6 w-6" aria-hidden="true" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            The Commons
          </h1>
        </Link>
        {currentCommunityName && (
          <span className="text-2xl font-bold tracking-tight text-muted-foreground sm:text-3xl">
            / {currentCommunityName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <select
          value={currentCommunityId ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            if (id) {
              router.push(`/commons/${id}`);
            } else {
              router.push("/commons");
            }
          }}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
          aria-label="Select community"
        >
          <option value="">All Communities</option>
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <span className="text-xs text-muted-foreground">
          Generated {formattedTime}
        </span>
      </div>
    </header>
  );
}
