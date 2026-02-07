"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/profiles";
import { createClient } from "@/lib/supabase/client";

type ActionState = { success: boolean; error: string };
const initialState: ActionState = { success: false, error: "" };

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<{
    display_name: string;
    bio: string;
    skills: string[];
  } | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const boundAction = async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
    const result = await updateProfile(formData);
    return { success: result.success, error: result.error ?? "" };
  };
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, bio, skills")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    }
    load();
  }, []);

  async function handleExport() {
    setExportLoading(true);
    const res = await fetch("/api/privacy/export");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "civicforge-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
    setExportLoading(false);
  }

  async function handleDelete() {
    const res = await fetch("/api/privacy/delete", { method: "POST" });
    if (res.ok) {
      await supabase.auth.signOut();
      router.push("/");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      {/* Edit Profile */}
      <section className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        {state.success && (
          <p className="text-sm text-offer mb-3">Profile updated!</p>
        )}
        {state.error && (
          <p className="text-sm text-destructive mb-3">{state.error}</p>
        )}
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium mb-1">
              Display Name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={profile.display_name}
              required
              minLength={2}
              maxLength={50}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={profile.bio ?? ""}
              maxLength={500}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium mb-1">
              Skills (comma-separated)
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              defaultValue={profile.skills?.join(", ") ?? ""}
              placeholder="e.g., plumbing, cooking, tutoring"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Invitation code */}
      <section className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="text-lg font-semibold mb-2">Invitation Code</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Have a code from a neighbor? Enter it to unlock posting.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="8-character code"
            maxLength={8}
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            disabled={inviteCode.length < 8}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Redeem
          </button>
        </div>
      </section>

      {/* Privacy */}
      <section className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Privacy & Data</h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="w-full text-left rounded-lg border border-border p-3 text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            {exportLoading ? "Preparing export..." : "Export My Data (JSON)"}
          </button>
          <a
            href="/privacy"
            className="block rounded-lg border border-border p-3 text-sm hover:bg-muted transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="block rounded-lg border border-border p-3 text-sm hover:bg-muted transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 mb-6">
        <h2 className="text-lg font-semibold mb-2 text-destructive">
          Danger Zone
        </h2>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="rounded-lg border border-destructive/30 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              This will permanently delete all your data within 30 days. This
              cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full rounded-lg border border-border p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
