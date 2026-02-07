"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { NeighborhoodPicker } from "@/components/neighborhood-picker";
import { createNeighborhood } from "@/app/actions/neighborhoods";
import { updateProfile } from "@/app/actions/profiles";
import { redeemInvitation } from "@/app/actions/invitations";

type Step = "name" | "neighborhood" | "invite" | "done";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [displayName, setDisplayName] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState<string | undefined>();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // New neighborhood form state
  const [showCreateNeighborhood, setShowCreateNeighborhood] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newZip, setNewZip] = useState("");

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    setError("");
    setStep("neighborhood");
  }

  async function handleNeighborhoodSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let nhId = neighborhoodId;

    // Create new neighborhood if needed
    if (showCreateNeighborhood) {
      const formData = new FormData();
      formData.set("name", newName);
      formData.set("city", newCity);
      formData.set("state", newState);
      formData.set("zip_codes", newZip);
      const result = await createNeighborhood(formData);
      if (!result.success) {
        setError(result.error ?? "Failed to create neighborhood");
        setLoading(false);
        return;
      }
      nhId = result.data?.id;
    }

    if (!nhId) {
      setError("Please select or create a neighborhood.");
      setLoading(false);
      return;
    }

    // Update profile with name and neighborhood
    const formData = new FormData();
    formData.set("display_name", displayName);
    formData.set("neighborhood_id", nhId);
    const result = await updateProfile(formData);

    if (!result.success) {
      setError(result.error ?? "Failed to update profile");
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

  function skipInvite() {
    router.push("/board");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["name", "neighborhood", "invite"] as const).map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                step === s
                  ? "w-8 bg-primary"
                  : i <
                      ["name", "neighborhood", "invite"].indexOf(step)
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
              <h1 className="text-2xl font-semibold mb-1">Welcome!</h1>
              <p className="text-sm text-muted-foreground">
                What should your neighbors call you?
              </p>
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              required
              minLength={2}
              maxLength={50}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-lg"
              autoFocus
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </form>
        )}

        {/* Step 2: Neighborhood */}
        {step === "neighborhood" && (
          <form onSubmit={handleNeighborhoodSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold mb-1">
                Find Your Neighborhood
              </h1>
              <p className="text-sm text-muted-foreground">
                Join an existing neighborhood or start a new one.
              </p>
            </div>

            {!showCreateNeighborhood ? (
              <>
                <NeighborhoodPicker
                  onSelect={setNeighborhoodId}
                  selectedId={neighborhoodId}
                />
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowCreateNeighborhood(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Or create a new neighborhood
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Neighborhood name"
                  required
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="City"
                    required
                    className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    placeholder="State"
                    required
                    maxLength={2}
                    className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <input
                  type="text"
                  value={newZip}
                  onChange={(e) => setNewZip(e.target.value)}
                  placeholder="Zip code(s), comma-separated"
                  required
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowCreateNeighborhood(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to search
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Continue"}
            </button>
          </form>
        )}

        {/* Step 3: Invitation Code */}
        {step === "invite" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold mb-1">
                Got an Invite Code?
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter a code from a neighbor to unlock posting. You can browse
                the board without one.
              </p>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter 8-character code"
                maxLength={8}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center text-lg tracking-widest uppercase"
              />
              <button
                type="submit"
                disabled={loading || inviteCode.length < 8}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Redeem Code"}
              </button>
            </form>

            <button
              onClick={skipInvite}
              className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
            >
              Skip for now — I&apos;ll just browse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
