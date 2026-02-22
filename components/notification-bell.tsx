"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  getUnreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/app/actions/notifications";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  resource_type: string | null;
  resource_id: string | null;
  read: boolean;
  created_at: string;
  actor: { display_name: string; avatar_url: string | null } | null;
};

function resourceHref(n: NotificationItem): string | null {
  if (!n.resource_type || !n.resource_id) return null;
  switch (n.resource_type) {
    case "post":
      return `/board/${n.resource_id}`;
    case "quest":
      return `/quests/${n.resource_id}`;
    case "guild":
      return `/guilds/${n.resource_id}`;
    case "profile":
      return `/profile/${n.resource_id}`;
    default:
      return null;
  }
}

export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Poll unread count every 60s
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const res = await getUnreadCount();
      if (!cancelled && res.success) setUnread(res.count);
    }
    tick();
    const interval = setInterval(tick, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    const res = await getNotifications(15, 0);
    if (res.success) {
      const raw = res.notifications as Array<
        Omit<NotificationItem, "actor"> & {
          actor:
            | { display_name: string; avatar_url: string | null }
            | { display_name: string; avatar_url: string | null }[]
            | null;
        }
      >;
      setItems(
        raw.map((n) => ({
          ...n,
          actor: Array.isArray(n.actor) ? n.actor[0] ?? null : n.actor,
        })),
      );
    }
    setLoading(false);
  }

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-clay text-[10px] font-bold text-white px-1">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Loading...
              </p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notifications yet
              </p>
            ) : (
              items.map((n) => {
                const href = resourceHref(n);
                const inner = (
                  <div
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-colors",
                      !n.read && "bg-primary/5",
                      href && "hover:bg-muted/50 cursor-pointer",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug", !n.read && "font-medium")}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(new Date(n.created_at))}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMarkRead(n.id);
                        }}
                        className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );

                if (href) {
                  return (
                    <Link
                      key={n.id}
                      href={href}
                      onClick={() => {
                        if (!n.read) handleMarkRead(n.id);
                        setOpen(false);
                      }}
                    >
                      {inner}
                    </Link>
                  );
                }

                return <div key={n.id}>{inner}</div>;
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
