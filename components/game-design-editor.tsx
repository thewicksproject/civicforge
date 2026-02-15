"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updateDraft,
  addQuestType,
  removeQuestType,
  addSkillDomain,
  removeSkillDomain,
  addRecognitionTier,
  removeRecognitionTier,
  submitForGovernance,
} from "@/app/actions/game-designs";
import { cn } from "@/lib/utils";

interface EditorProps {
  designId: string;
  design: {
    name: string;
    description: string | null;
    valueStatement: string;
    designRationale: string;
    sunsetAt: string;
  };
  questTypes: Array<{
    id: string;
    slug: string;
    label: string;
    description: string | null;
    validation_method: string;
    validation_threshold: number;
    recognition_type: string;
    base_recognition: number;
    cooldown_hours: number;
    max_party_size: number;
    sort_order: number;
  }>;
  skillDomains: Array<{
    id: string;
    slug: string;
    label: string;
    description: string | null;
    examples: string[];
    visibility_default: string;
    sort_order: number;
  }>;
  recognitionTiers: Array<{
    id: string;
    tier_number: number;
    name: string;
    threshold_type: string;
    threshold_value: number;
    unlocks: string[];
  }>;
  recognitionSources: Array<{
    id: string;
    source_type: string;
    amount: number;
    max_per_day: number | null;
  }>;
}

type Tab = "identity" | "quests" | "skills" | "tiers" | "sources";

const TABS: { key: Tab; label: string }[] = [
  { key: "identity", label: "Identity" },
  { key: "quests", label: "Quest Types" },
  { key: "skills", label: "Skill Domains" },
  { key: "tiers", label: "Recognition" },
  { key: "sources", label: "Sources" },
];

export function GameDesignEditor({
  designId,
  design,
  questTypes: initialQT,
  skillDomains: initialSD,
  recognitionTiers: initialRT,
  recognitionSources: initialRS,
}: EditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("identity");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Identity form state
  const [name, setName] = useState(design.name);
  const [description, setDescription] = useState(design.description ?? "");
  const [valueStatement, setValueStatement] = useState(design.valueStatement);
  const [designRationale, setDesignRationale] = useState(design.designRationale);
  const [sunsetAt, setSunsetAt] = useState(design.sunsetAt.slice(0, 10));

  // Lists (for display counts)
  const [qtCount, setQtCount] = useState(initialQT.length);
  const [sdCount, setSdCount] = useState(initialSD.length);
  const [rtCount, setRtCount] = useState(initialRT.length);

  // New item forms
  const [newQtSlug, setNewQtSlug] = useState("");
  const [newQtLabel, setNewQtLabel] = useState("");
  const [newSdSlug, setNewSdSlug] = useState("");
  const [newSdLabel, setNewSdLabel] = useState("");
  const [newTierNumber, setNewTierNumber] = useState(rtCount + 1);
  const [newTierName, setNewTierName] = useState("");

  function flash(msg: string, isError = false) {
    if (isError) {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => { setError(null); setSuccess(null); }, 3000);
  }

  async function handleSaveIdentity() {
    const result = await updateDraft(designId, {
      name,
      description: description || null,
      valueStatement,
      designRationale,
      sunsetAt: new Date(sunsetAt).toISOString(),
    });
    if (result.success) flash("Saved");
    else flash(result.error, true);
  }

  async function handleAddQuestType() {
    if (!newQtSlug || !newQtLabel) return flash("Slug and label required", true);
    const result = await addQuestType(designId, {
      slug: newQtSlug,
      label: newQtLabel,
      validationMethod: "self_report",
      validationThreshold: 0,
      recognitionType: "xp",
      baseRecognition: 5,
      cooldownHours: 0,
      maxPartySize: 1,
      sortOrder: qtCount,
    });
    if (result.success) {
      setQtCount((c) => c + 1);
      setNewQtSlug("");
      setNewQtLabel("");
      flash("Quest type added");
      startTransition(() => router.refresh());
    } else flash(result.error, true);
  }

  async function handleRemoveQuestType(id: string) {
    const result = await removeQuestType(id);
    if (result.success) {
      setQtCount((c) => c - 1);
      flash("Quest type removed");
      startTransition(() => router.refresh());
    } else flash(result.error, true);
  }

  async function handleAddSkillDomain() {
    if (!newSdSlug || !newSdLabel) return flash("Slug and label required", true);
    const result = await addSkillDomain(designId, {
      slug: newSdSlug,
      label: newSdLabel,
      examples: [],
      visibilityDefault: "private",
      sortOrder: sdCount,
    });
    if (result.success) {
      setSdCount((c) => c + 1);
      setNewSdSlug("");
      setNewSdLabel("");
      flash("Skill domain added");
      startTransition(() => router.refresh());
    } else flash(result.error, true);
  }

  async function handleRemoveSkillDomain(id: string) {
    const result = await removeSkillDomain(id);
    if (result.success) {
      setSdCount((c) => c - 1);
      flash("Skill domain removed");
      startTransition(() => router.refresh());
    } else flash(result.error, true);
  }

  async function handleAddTier() {
    if (!newTierName) return flash("Tier name required", true);
    const result = await addRecognitionTier(designId, {
      tierNumber: newTierNumber,
      name: newTierName,
      thresholdType: "points",
      thresholdValue: 0,
      unlocks: [],
    });
    if (result.success) {
      setRtCount((c) => c + 1);
      setNewTierNumber((n) => n + 1);
      setNewTierName("");
      flash("Tier added");
      startTransition(() => router.refresh());
    } else flash(result.error, true);
  }

  async function handleRemoveTier(id: string) {
    const result = await removeRecognitionTier(id);
    if (result.success) {
      setRtCount((c) => c - 1);
      flash("Tier removed");
      startTransition(() => router.refresh());
    } else flash(result.error, true);
  }

  async function handleSubmitForGovernance() {
    const result = await submitForGovernance(designId);
    if (result.success) {
      router.push(`/governance/${result.proposalId}`);
    } else flash(result.error, true);
  }

  return (
    <div className="space-y-4">
      {/* Status bar */}
      {(error || success) && (
        <div className={cn(
          "rounded-lg px-3 py-2 text-sm",
          error ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
        )}>
          {error || success}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg",
              tab === t.key
                ? "bg-card border border-b-transparent border-border text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.key === "quests" && <span className="ml-1.5 text-xs text-muted-foreground">{qtCount}/20</span>}
            {t.key === "skills" && <span className="ml-1.5 text-xs text-muted-foreground">{sdCount}/15</span>}
            {t.key === "tiers" && <span className="ml-1.5 text-xs text-muted-foreground">{rtCount}/7</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        {/* Identity */}
        {tab === "identity" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">Name</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="desc" className="block text-sm font-medium mb-1.5">Description</label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-20" />
            </div>
            <div>
              <label htmlFor="value" className="block text-sm font-medium mb-1.5">Value Statement</label>
              <Textarea id="value" value={valueStatement} onChange={(e) => setValueStatement(e.target.value)} className="min-h-24" />
            </div>
            <div>
              <label htmlFor="rationale" className="block text-sm font-medium mb-1.5">Design Rationale</label>
              <Textarea id="rationale" value={designRationale} onChange={(e) => setDesignRationale(e.target.value)} className="min-h-24" />
            </div>
            <div>
              <label htmlFor="sunset" className="block text-sm font-medium mb-1.5">Sunset Date</label>
              <Input id="sunset" type="date" value={sunsetAt} onChange={(e) => setSunsetAt(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Must be 3 months to 2 years from today.</p>
            </div>
            <Button onClick={handleSaveIdentity} disabled={isPending}>
              {isPending ? "Saving..." : "Save Identity"}
            </Button>
          </div>
        )}

        {/* Quest Types */}
        {tab === "quests" && (
          <div className="space-y-4">
            <div className="space-y-2">
              {initialQT.map((qt) => (
                <div key={qt.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{qt.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">({qt.slug})</span>
                    <span className="text-xs text-muted-foreground ml-2">{qt.base_recognition} XP</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestType(qt.id)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium mb-2">Add Quest Type</h3>
              <div className="flex gap-2">
                <Input placeholder="slug (e.g. spark)" value={newQtSlug} onChange={(e) => setNewQtSlug(e.target.value)} className="flex-1" />
                <Input placeholder="Label (e.g. Spark)" value={newQtLabel} onChange={(e) => setNewQtLabel(e.target.value)} className="flex-1" />
                <Button onClick={handleAddQuestType} disabled={isPending} variant="outline" className="shrink-0">Add</Button>
              </div>
            </div>
          </div>
        )}

        {/* Skill Domains */}
        {tab === "skills" && (
          <div className="space-y-4">
            <div className="space-y-2">
              {initialSD.map((sd) => (
                <div key={sd.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{sd.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">({sd.slug})</span>
                    <span className="text-xs text-muted-foreground ml-2">visibility: {sd.visibility_default}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillDomain(sd.id)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium mb-2">Add Skill Domain</h3>
              <div className="flex gap-2">
                <Input placeholder="slug (e.g. craft)" value={newSdSlug} onChange={(e) => setNewSdSlug(e.target.value)} className="flex-1" />
                <Input placeholder="Label (e.g. Craft)" value={newSdLabel} onChange={(e) => setNewSdLabel(e.target.value)} className="flex-1" />
                <Button onClick={handleAddSkillDomain} disabled={isPending} variant="outline" className="shrink-0">Add</Button>
              </div>
            </div>
          </div>
        )}

        {/* Recognition Tiers */}
        {tab === "tiers" && (
          <div className="space-y-4">
            <div className="space-y-2">
              {initialRT.map((rt) => (
                <div key={rt.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">Tier {rt.tier_number}: {rt.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {rt.threshold_value > 0 ? `${rt.threshold_value} ${rt.threshold_type}` : "No threshold"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(rt.id)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium mb-2">Add Tier</h3>
              <div className="flex gap-2">
                <Input type="number" placeholder="Tier #" value={newTierNumber} onChange={(e) => setNewTierNumber(Number(e.target.value))} className="w-20" />
                <Input placeholder="Name (e.g. Newcomer)" value={newTierName} onChange={(e) => setNewTierName(e.target.value)} className="flex-1" />
                <Button onClick={handleAddTier} disabled={isPending} variant="outline" className="shrink-0">Add</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Min 2, max 7 tiers.</p>
            </div>
          </div>
        )}

        {/* Recognition Sources */}
        {tab === "sources" && (
          <div className="space-y-4">
            <div className="space-y-2">
              {initialRS.map((rs) => (
                <div key={rs.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
                  <span className="text-sm">{rs.source_type.replace(/_/g, " ")}</span>
                  <span className="text-sm font-medium">
                    +{rs.amount} renown
                    {rs.max_per_day && <span className="text-xs text-muted-foreground ml-1">(max {rs.max_per_day}/day)</span>}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Recognition source editing is available via the detail view.
            </p>
          </div>
        )}
      </div>

      {/* Submit for governance */}
      <div className="rounded-xl bg-muted/50 p-6 space-y-3">
        <h2 className="font-serif text-lg font-semibold">Ready to Propose?</h2>
        <p className="text-sm text-muted-foreground">
          Submit this draft for a governance vote. Once submitted, the draft is locked
          and a 7-day deliberation + 7-day voting period begins.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleSubmitForGovernance} disabled={isPending}>
            {isPending ? "Submitting..." : "Submit for Governance Vote"}
          </Button>
          <Button variant="outline" onClick={() => router.push(`/game/design/${designId}`)}>
            View Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
