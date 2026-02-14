"use client";

interface DiffProps {
  draft: {
    questTypes: Array<{ slug: string; label: string; base_recognition?: number; baseRecognition?: number }>;
    skillDomains: Array<{ slug: string; label: string }>;
    recognitionTiers: Array<{ tier_number?: number; tierNumber?: number; name: string; threshold_value?: number; thresholdValue?: number }>;
    recognitionSources: Array<{ source_type?: string; sourceType?: string; amount: number }>;
  };
  active: {
    questTypes: Array<{ slug: string; label: string; baseRecognition: number }>;
    skillDomains: Array<{ slug: string; label: string }>;
    recognitionTiers: Array<{ tierNumber: number; name: string; thresholdValue: number }>;
    recognitionSources: Array<{ sourceType: string; amount: number }>;
  };
}

function DiffSection({
  title,
  added,
  removed,
  unchanged,
}: {
  title: string;
  added: string[];
  removed: string[];
  unchanged: string[];
}) {
  if (added.length === 0 && removed.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/50 p-4">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="space-y-1 text-sm">
        {added.map((item) => (
          <div key={`add-${item}`} className="text-primary flex items-center gap-2">
            <span className="text-xs">+</span> {item}
          </div>
        ))}
        {removed.map((item) => (
          <div key={`rm-${item}`} className="text-destructive flex items-center gap-2">
            <span className="text-xs">-</span> {item}
          </div>
        ))}
        {unchanged.length > 0 && (
          <div className="text-muted-foreground mt-1">
            {unchanged.length} unchanged
          </div>
        )}
      </div>
    </div>
  );
}

export function GameDesignDiff({ draft, active }: DiffProps) {
  // Quest types diff
  const draftQTSlugs = new Set(draft.questTypes.map((qt) => qt.slug));
  const activeQTSlugs = new Set(active.questTypes.map((qt) => qt.slug));
  const addedQT = draft.questTypes
    .filter((qt) => !activeQTSlugs.has(qt.slug))
    .map((qt) => `${qt.label} (${qt.slug})`);
  const removedQT = active.questTypes
    .filter((qt) => !draftQTSlugs.has(qt.slug))
    .map((qt) => `${qt.label} (${qt.slug})`);
  const unchangedQT = draft.questTypes.filter((qt) => activeQTSlugs.has(qt.slug));

  // Skill domains diff
  const draftSDSlugs = new Set(draft.skillDomains.map((sd) => sd.slug));
  const activeSDSlugs = new Set(active.skillDomains.map((sd) => sd.slug));
  const addedSD = draft.skillDomains
    .filter((sd) => !activeSDSlugs.has(sd.slug))
    .map((sd) => sd.label);
  const removedSD = active.skillDomains
    .filter((sd) => !draftSDSlugs.has(sd.slug))
    .map((sd) => sd.label);
  const unchangedSD = draft.skillDomains.filter((sd) => activeSDSlugs.has(sd.slug));

  // Recognition tiers diff
  const draftTierNames = new Set(draft.recognitionTiers.map((rt) => rt.name));
  const activeTierNames = new Set(active.recognitionTiers.map((rt) => rt.name));
  const addedTiers = draft.recognitionTiers
    .filter((rt) => !activeTierNames.has(rt.name))
    .map((rt) => rt.name);
  const removedTiers = active.recognitionTiers
    .filter((rt) => !draftTierNames.has(rt.name))
    .map((rt) => rt.name);
  const unchangedTiers = draft.recognitionTiers.filter((rt) => activeTierNames.has(rt.name));

  // Recognition sources diff
  const draftSrcTypes = new Set(draft.recognitionSources.map((rs) => rs.source_type ?? rs.sourceType));
  const activeSrcTypes = new Set(active.recognitionSources.map((rs) => rs.sourceType));
  const addedSrc = draft.recognitionSources
    .filter((rs) => !activeSrcTypes.has(rs.source_type ?? rs.sourceType ?? ""))
    .map((rs) => (rs.source_type ?? rs.sourceType ?? "").replace(/_/g, " "));
  const removedSrc = active.recognitionSources
    .filter((rs) => !draftSrcTypes.has(rs.sourceType))
    .map((rs) => rs.sourceType.replace(/_/g, " "));
  const unchangedSrc = draft.recognitionSources.filter((rs) =>
    activeSrcTypes.has(rs.source_type ?? rs.sourceType ?? ""),
  );

  const hasChanges =
    addedQT.length > 0 ||
    removedQT.length > 0 ||
    addedSD.length > 0 ||
    removedSD.length > 0 ||
    addedTiers.length > 0 ||
    removedTiers.length > 0 ||
    addedSrc.length > 0 ||
    removedSrc.length > 0;

  return (
    <section className="rounded-xl bg-card p-6 shadow-sm">
      <h2 className="font-serif text-xl font-semibold mb-4">
        Changes vs Active Design
      </h2>
      {!hasChanges ? (
        <p className="text-sm text-muted-foreground">
          No structural changes from the active design.
        </p>
      ) : (
        <div className="space-y-3">
          <DiffSection
            title="Quest Types"
            added={addedQT}
            removed={removedQT}
            unchanged={unchangedQT.map((qt) => qt.label)}
          />
          <DiffSection
            title="Skill Domains"
            added={addedSD}
            removed={removedSD}
            unchanged={unchangedSD.map((sd) => sd.label)}
          />
          <DiffSection
            title="Recognition Tiers"
            added={addedTiers}
            removed={removedTiers}
            unchanged={unchangedTiers.map((rt) => rt.name)}
          />
          <DiffSection
            title="Recognition Sources"
            added={addedSrc}
            removed={removedSrc}
            unchanged={unchangedSrc.map((rs) =>
              (rs.source_type ?? rs.sourceType ?? "").replace(/_/g, " "),
            )}
          />
        </div>
      )}
    </section>
  );
}
