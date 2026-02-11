"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CommunityPicker } from "@/components/community-picker";
import { createCommunity } from "@/app/actions/communities";
import { updateProfile } from "@/app/actions/profiles";
import { redeemInvitation } from "@/app/actions/invitations";
import { requestMembership } from "@/app/actions/membership";
import { OnboardingWelcomeIllustration } from "@/components/illustrations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Step = "name" | "community" | "invite" | "pending" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [displayName, setDisplayName] = useState("");
  const [communityId, setCommunityId] = useState<string | undefined>();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // New community form state
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newZip, setNewZip] = useState("");

  const progressStep =
    step === "pending" || step === "done" ? "invite" : step;

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    setError("");
    setStep("community");
  }

  async function handleCommunitySubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Always save display name first.
    const profileFormData = new FormData();
    profileFormData.set("display_name", displayName);
    const profileResult = await updateProfile(profileFormData);
    if (!profileResult.success) {
      setError(profileResult.error ?? "Failed to save profile name");
      setLoading(false);
      return;
    }

    // Create new community if selected. Existing community joins require
    // invitation redemption or membership approval request in the next step.
    if (showCreateCommunity) {
      const communityFormData = new FormData();
      communityFormData.set("name", newName);
      communityFormData.set("city", newCity);
      communityFormData.set("state", newState);
      communityFormData.set("zip_codes", newZip);
      const result = await createCommunity(communityFormData);
      if (!result.success) {
        setError(result.error ?? "Failed to create community");
        setLoading(false);
        return;
      }

      setLoading(false);
      setStep("done");
      router.push("/board");
      return;
    }

    if (!communityId) {
      setError("Please select a community.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("invite");
  }

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await redeemInvitation(inviteCode.trim().toUpperCase());
    if (!result.success) {
      setError(result.error ?? "Invalid invitation code");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("done");
    router.push("/board");
  }

  async function handleRequestMembership() {
    if (!communityId) {
      setError("Please select a community.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await requestMembership(communityId);
    if (!result.success) {
      if (
        result.error?.toLowerCase().includes("already have a pending request")
      ) {
        setLoading(false);
        setStep("pending");
        return;
      }
      setError(result.error ?? "Failed to request membership");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("pending");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["name", "community", "invite"] as const).map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                progressStep === s
                  ? "w-8 bg-primary"
                  : i <
                      ["name", "community", "invite"].indexOf(progressStep)
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Display Name */}
        {step === "name" && (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <OnboardingWelcomeIllustration className="h-28 w-auto mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-1">Welcome!</h1>
              <p className="text-sm text-muted-foreground">
                What should your neighbors call you?
              </p>
            </div>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              required
              minLength={2}
              maxLength={50}
              className="text-center text-lg"
              autoFocus
            />
            <Button type="submit" className="w-full" size="lg">
              Continue
            </Button>
          </form>
        )}

        {/* Step 2: Community */}
        {step === "community" && (
          <form onSubmit={handleCommunitySubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold mb-1">
                Find Your Community
              </h1>
              <p className="text-sm text-muted-foreground">
                Join an existing community or start a new one.
              </p>
            </div>

            {!showCreateCommunity ? (
              <>
                <CommunityPicker
                  onSelect={setCommunityId}
                  selectedId={communityId}
                />
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowCreateCommunity(true)}
                  >
                    Or create a new community
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Community name"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="City"
                    required
                  />
                  <Input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    placeholder="State"
                    required
                    maxLength={2}
                  />
                </div>
                <Input
                  type="text"
                  value={newZip}
                  onChange={(e) => setNewZip(e.target.value)}
                  placeholder="Zip code(s), comma-separated"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateCommunity(false)}
                  className="text-sm"
                >
                  Back to search
                </Button>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Setting up..." : "Continue"}
            </Button>
          </form>
        )}

        {/* Step 3: Invitation Code */}
        {step === "invite" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold mb-1">
                Join This Community
              </h1>
              <p className="text-sm text-muted-foreground">
                Existing communities require either a valid invite code or an
                approved membership request.
              </p>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <Input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter 8-character code"
                maxLength={8}
                className="text-center text-lg tracking-widest uppercase"
              />
              <Button
                type="submit"
                disabled={loading || inviteCode.length < 8}
                className="w-full"
                size="lg"
              >
                {loading ? "Verifying..." : "Redeem Code"}
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              onClick={handleRequestMembership}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Submitting..." : "Request Membership Approval"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep("community")}
              disabled={loading}
              className="w-full text-sm text-muted-foreground"
            >
              Choose a different community
            </Button>
          </div>
        )}

        {/* Step 4: Pending */}
        {step === "pending" && (
          <div className="space-y-6 text-center">
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                Membership Request Sent
              </h1>
              <p className="text-sm text-muted-foreground">
                A community steward will review your request. You can return
                here later with an invite code for immediate access.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setStep("community")}
            >
              Select a different community
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={() => router.push("/")}
            >
              Back to home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
