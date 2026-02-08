"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, getMyProfile } from "@/app/actions/profiles";
import { redeemInvitation } from "@/app/actions/invitations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneVerification } from "@/components/phone-verification";

type ActionState = { success: boolean; error: string };
const initialState: ActionState = { success: false, error: "" };

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    display_name: string;
    bio: string;
    skills: string[];
    phone_verified: boolean;
  } | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState("");
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
      const result = await getMyProfile();
      if (result.success && result.data) {
        setProfile({
          display_name: result.data.display_name,
          bio: result.data.bio ?? "",
          skills: result.data.skills ?? [],
          phone_verified: result.data.phone_verified ?? false,
        });
      }
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
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleRedeemInvite() {
    setInviteLoading(true);
    setInviteResult("");

    const result = await redeemInvitation(inviteCode.trim().toUpperCase());
    if (!result.success) {
      setInviteResult(result.error ?? "Failed to redeem invitation code");
      setInviteLoading(false);
      return;
    }

    setInviteCode("");
    setInviteResult("Invitation redeemed. Posting is now unlocked.");
    setInviteLoading(false);
    router.refresh();
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
            <Input
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={profile.display_name}
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio
            </label>
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={profile.bio ?? ""}
              maxLength={500}
              className="resize-y"
            />
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium mb-1">
              Skills (comma-separated)
            </label>
            <Input
              id="skills"
              name="skills"
              type="text"
              defaultValue={profile.skills?.join(", ") ?? ""}
              placeholder="e.g., plumbing, cooking, tutoring"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </section>

      {/* Phone verification */}
      <section className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="text-lg font-semibold mb-2">Phone Verification</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Verify your phone number to build trust with your neighbors.
        </p>
        <PhoneVerification isVerified={profile.phone_verified} />
      </section>

      {/* Invitation code */}
      <section className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="text-lg font-semibold mb-2">Invitation Code</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Have a code from a neighbor? Enter it to unlock posting.
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="8-character code"
            maxLength={8}
            className="flex-1 uppercase tracking-widest"
          />
          <Button
            onClick={handleRedeemInvite}
            disabled={inviteLoading || inviteCode.length < 8}
          >
            {inviteLoading ? "Redeeming..." : "Redeem"}
          </Button>
        </div>
        {inviteResult && (
          <p className="text-sm text-muted-foreground mt-2">{inviteResult}</p>
        )}
      </section>

      {/* Privacy */}
      <section className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Privacy & Data</h2>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportLoading}
            className="w-full justify-start"
          >
            {exportLoading ? "Preparing export..." : "Export My Data (JSON)"}
          </Button>
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
          <Button
            variant="outline"
            onClick={() => setDeleteConfirm(true)}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            Delete My Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              This will permanently delete all your data within 30 days. This
              cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete}>
                Yes, Delete Everything
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Sign out */}
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="w-full text-muted-foreground"
      >
        Sign Out
      </Button>
    </div>
  );
}
