"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import { createQuestComment, deleteQuestComment } from "@/app/actions/quest-comments";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  author: { display_name: string; avatar_url: string | null } | null;
  authorId?: string;
};

interface QuestThreadProps {
  questId: string;
  initialComments: Comment[];
  currentUserId: string;
}

export function QuestThread({
  questId,
  initialComments,
  currentUserId,
}: QuestThreadProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setSending(true);
    setError(null);

    const res = await createQuestComment(questId, body.trim());

    if (res.success && res.comment) {
      // Optimistically add the comment
      setComments((prev) => [
        ...prev,
        {
          id: res.comment.id,
          body: res.comment.body,
          created_at: res.comment.created_at,
          author: { display_name: "You", avatar_url: null },
          authorId: currentUserId,
        },
      ]);
      setBody("");
    } else if (!res.success) {
      setError(res.error ?? "Failed to post comment");
    }

    setSending(false);
  }

  async function handleDelete(commentId: string) {
    const res = await deleteQuestComment(commentId);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Quest Thread</h3>
        <p className="text-xs text-muted-foreground">
          Coordinate with your quest team
        </p>
      </div>

      {/* Messages */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          comments.map((c) => {
            const author = Array.isArray(c.author) ? c.author[0] : c.author;
            return (
              <div key={c.id} className="group">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">
                        {author?.display_name ?? "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(c.created_at))}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">
                      {c.body}
                    </p>
                  </div>
                  {c.authorId === currentUserId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-all"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border p-3 flex gap-2"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message..."
          maxLength={2000}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={sending}
        />
        <Button
          type="submit"
          size="sm"
          disabled={sending || !body.trim()}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>

      {error && (
        <p className="text-xs text-destructive px-4 pb-2">{error}</p>
      )}
    </div>
  );
}
