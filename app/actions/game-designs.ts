"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  GameDesignDraftSchema,
  QuestTypeSchema,
  SkillDomainSchema,
  RecognitionTierSchema,
  RecognitionSourceSchema,
} from "@/lib/game-config/schemas";
import { validateGameDesignGuardrails } from "@/lib/game-config/guardrails";
import { seedFromTemplate, type TemplateConfig } from "@/lib/game-config/template-seeder";
import { invalidateGameConfig } from "@/lib/game-config/resolver";
import { UUID_FORMAT } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null as never, error: "You must be logged in" as const };
  return { user, error: null };
}

async function requireKeeper(userId: string) {
  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("community_id, renown_tier")
    .eq("id", userId)
    .single();

  if (!profile || !profile.community_id) {
    return { profile: null as never, error: "Profile not found" as const };
  }
  if (profile.renown_tier < 4) {
    return {
      profile: null as never,
      error: "You must be a Keeper (Renown Tier 4) to manage game designs" as const,
    };
  }
  return { profile, error: null };
}

async function requireDraftOwner(designId: string, userId: string) {
  const admin = createServiceClient();
  const { data: design } = await admin
    .from("game_designs")
    .select("*")
    .eq("id", designId)
    .single();

  if (!design) {
    return { design: null as never, error: "Game design not found" as const };
  }
  if (design.created_by !== userId) {
    return { design: null as never, error: "Only the draft creator can edit this design" as const };
  }
  if (design.status !== "draft") {
    return { design: null as never, error: "Only draft designs can be edited" as const };
  }
  if (design.submitted_proposal_id) {
    return { design: null as never, error: "This draft is locked — it has been submitted for governance" as const };
  }
  return { design, error: null };
}

// ---------------------------------------------------------------------------
// Read actions
// ---------------------------------------------------------------------------

export async function getGameTemplates() {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();
  const { data: templates, error } = await admin
    .from("game_templates")
    .select("id, name, slug, description, value_statement, ceremony_level, quantification_level")
    .order("name");

  if (error) return { success: false as const, error: "Failed to load templates" };
  return { success: true as const, templates: templates ?? [] };
}

export async function getCommunityDrafts(communityId: string) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();

  // Verify user belongs to community
  const { data: profile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", auth.user.id)
    .single();

  if (profile?.community_id !== communityId) {
    return { success: false as const, error: "Not your community" };
  }

  const { data: drafts, error } = await admin
    .from("game_designs")
    .select(`
      id, name, description, status, version, created_at, updated_at,
      submitted_proposal_id,
      profiles!game_designs_created_by_fkey(display_name)
    `)
    .eq("community_id", communityId)
    .eq("status", "draft")
    .order("created_at", { ascending: false });

  if (error) return { success: false as const, error: "Failed to load drafts" };
  return { success: true as const, drafts: drafts ?? [] };
}

export async function getUserDrafts() {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", auth.user.id)
    .single();

  if (!profile?.community_id) {
    return { success: false as const, error: "No community" };
  }

  const { data: drafts, error } = await admin
    .from("game_designs")
    .select("id, name, status, updated_at, submitted_proposal_id")
    .eq("created_by", auth.user.id)
    .eq("status", "draft")
    .order("updated_at", { ascending: false });

  if (error) return { success: false as const, error: "Failed to load drafts" };
  return { success: true as const, drafts: drafts ?? [] };
}

export async function getGameDesignDraft(designId: string) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  if (!UUID_FORMAT.test(designId)) {
    return { success: false as const, error: "Invalid design ID" };
  }

  const admin = createServiceClient();

  const { data: design } = await admin
    .from("game_designs")
    .select("*")
    .eq("id", designId)
    .single();

  if (!design) return { success: false as const, error: "Game design not found" };

  // Verify user belongs to same community
  const { data: profile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", auth.user.id)
    .single();

  if (profile?.community_id !== design.community_id) {
    return { success: false as const, error: "Not your community" };
  }

  // Fetch all child rows
  const [questTypes, skillDomains, tiers, sources] = await Promise.all([
    admin.from("game_quest_types").select("*").eq("game_design_id", designId).order("sort_order"),
    admin.from("game_skill_domains").select("*").eq("game_design_id", designId).order("sort_order"),
    admin.from("game_recognition_tiers").select("*").eq("game_design_id", designId).order("tier_number"),
    admin.from("game_recognition_sources").select("*").eq("game_design_id", designId),
  ]);

  return {
    success: true as const,
    design,
    questTypes: questTypes.data ?? [],
    skillDomains: skillDomains.data ?? [],
    recognitionTiers: tiers.data ?? [],
    recognitionSources: sources.data ?? [],
  };
}

// ---------------------------------------------------------------------------
// Create actions
// ---------------------------------------------------------------------------

export async function createFromTemplate(templateId: string) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const keeper = await requireKeeper(auth.user.id);
  if (keeper.error) return { success: false as const, error: keeper.error };

  if (!UUID_FORMAT.test(templateId)) {
    return { success: false as const, error: "Invalid template ID" };
  }

  const admin = createServiceClient();

  const { data: template } = await admin
    .from("game_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (!template) return { success: false as const, error: "Template not found" };

  const config = template.config as TemplateConfig;

  // Create the draft design
  const sunsetAt = new Date();
  sunsetAt.setFullYear(sunsetAt.getFullYear() + 1);

  const { data: design, error } = await admin
    .from("game_designs")
    .insert({
      community_id: keeper.profile.community_id,
      name: `${template.name} (Draft)`,
      description: template.description,
      value_statement: template.value_statement,
      design_rationale: "Based on the " + template.name + " template. Edit this to describe why your community chose these rules.",
      status: "draft",
      sunset_at: sunsetAt.toISOString(),
      version: 1,
      template_id: templateId,
      created_by: auth.user.id,
    })
    .select("id")
    .single();

  if (error || !design) {
    return { success: false as const, error: "Failed to create draft" };
  }

  // Seed child rows from template
  const seedResult = await seedFromTemplate(design.id, config);
  if (seedResult.errors.length > 0) {
    // Clean up the draft if seeding failed
    await admin.from("game_designs").delete().eq("id", design.id);
    return { success: false as const, error: `Template seeding failed: ${seedResult.errors[0]}` };
  }

  return { success: true as const, designId: design.id };
}

export async function forkActiveDesign() {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const keeper = await requireKeeper(auth.user.id);
  if (keeper.error) return { success: false as const, error: keeper.error };

  const admin = createServiceClient();

  // Get the active design
  const { data: active } = await admin
    .from("game_designs")
    .select("*")
    .eq("community_id", keeper.profile.community_id)
    .eq("status", "active")
    .single();

  if (!active) {
    return { success: false as const, error: "No active game design to fork" };
  }

  // Create fork as draft
  const sunsetAt = new Date();
  sunsetAt.setFullYear(sunsetAt.getFullYear() + 1);

  const { data: draft, error } = await admin
    .from("game_designs")
    .insert({
      community_id: keeper.profile.community_id,
      name: `${active.name} (Fork)`,
      description: active.description,
      value_statement: active.value_statement,
      design_rationale: active.design_rationale,
      status: "draft",
      sunset_at: sunsetAt.toISOString(),
      version: active.version + 1,
      previous_version_id: active.id,
      template_id: active.template_id,
      created_by: auth.user.id,
    })
    .select("id")
    .single();

  if (error || !draft) {
    return { success: false as const, error: "Failed to create fork" };
  }

  // Copy all child rows from active design
  const [questTypes, skillDomains, tiers, sources] = await Promise.all([
    admin.from("game_quest_types").select("*").eq("game_design_id", active.id),
    admin.from("game_skill_domains").select("*").eq("game_design_id", active.id),
    admin.from("game_recognition_tiers").select("*").eq("game_design_id", active.id),
    admin.from("game_recognition_sources").select("*").eq("game_design_id", active.id),
  ]);

  const errors: string[] = [];

  if (questTypes.data?.length) {
    const { error: e } = await admin.from("game_quest_types").insert(
      questTypes.data.map(({ id, ...rest }) => ({ ...rest, game_design_id: draft.id })),
    );
    if (e) errors.push(`Quest types: ${e.message}`);
  }

  if (skillDomains.data?.length) {
    const { error: e } = await admin.from("game_skill_domains").insert(
      skillDomains.data.map(({ id, ...rest }) => ({ ...rest, game_design_id: draft.id })),
    );
    if (e) errors.push(`Skill domains: ${e.message}`);
  }

  if (tiers.data?.length) {
    const { error: e } = await admin.from("game_recognition_tiers").insert(
      tiers.data.map(({ id, ...rest }) => ({ ...rest, game_design_id: draft.id })),
    );
    if (e) errors.push(`Recognition tiers: ${e.message}`);
  }

  if (sources.data?.length) {
    const { error: e } = await admin.from("game_recognition_sources").insert(
      sources.data.map(({ id, ...rest }) => ({ ...rest, game_design_id: draft.id })),
    );
    if (e) errors.push(`Recognition sources: ${e.message}`);
  }

  if (errors.length > 0) {
    await admin.from("game_designs").delete().eq("id", draft.id);
    return { success: false as const, error: `Fork failed: ${errors[0]}` };
  }

  return { success: true as const, designId: draft.id };
}

// ---------------------------------------------------------------------------
// Update draft (top-level fields)
// ---------------------------------------------------------------------------

export async function updateDraft(
  designId: string,
  data: {
    name?: string;
    description?: string | null;
    valueStatement?: string;
    designRationale?: string;
    sunsetAt?: string;
  },
) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const owner = await requireDraftOwner(designId, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  // Validate partial fields
  const partial = GameDesignDraftSchema.partial().safeParse({
    name: data.name,
    description: data.description,
    valueStatement: data.valueStatement,
    designRationale: data.designRationale,
    sunsetAt: data.sunsetAt,
  });
  if (!partial.success) {
    return { success: false as const, error: partial.error.issues[0].message };
  }

  const admin = createServiceClient();
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.valueStatement !== undefined) updateData.value_statement = data.valueStatement;
  if (data.designRationale !== undefined) updateData.design_rationale = data.designRationale;
  if (data.sunsetAt !== undefined) updateData.sunset_at = data.sunsetAt;

  const { error } = await admin
    .from("game_designs")
    .update(updateData)
    .eq("id", designId);

  if (error) return { success: false as const, error: "Failed to update draft" };
  return { success: true as const };
}

// ---------------------------------------------------------------------------
// Quest type mutations
// ---------------------------------------------------------------------------

export async function addQuestType(
  designId: string,
  data: z.infer<typeof QuestTypeSchema>,
) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const owner = await requireDraftOwner(designId, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  const parsed = QuestTypeSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0].message };

  const admin = createServiceClient();

  // Check count guardrail
  const { count } = await admin
    .from("game_quest_types")
    .select("id", { count: "exact", head: true })
    .eq("game_design_id", designId);

  if ((count ?? 0) >= 20) {
    return { success: false as const, error: "Maximum 20 quest types allowed" };
  }

  const { data: row, error } = await admin
    .from("game_quest_types")
    .insert({
      game_design_id: designId,
      slug: parsed.data.slug,
      label: parsed.data.label,
      description: parsed.data.description ?? null,
      validation_method: parsed.data.validationMethod,
      validation_threshold: parsed.data.validationThreshold,
      recognition_type: parsed.data.recognitionType,
      base_recognition: parsed.data.baseRecognition,
      narrative_prompt: parsed.data.narrativePrompt ?? null,
      cooldown_hours: parsed.data.cooldownHours,
      max_party_size: parsed.data.maxPartySize,
      sort_order: parsed.data.sortOrder,
      color: parsed.data.color ?? null,
      icon: parsed.data.icon ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { success: false as const, error: "A quest type with this slug already exists" };
    return { success: false as const, error: "Failed to add quest type" };
  }

  return { success: true as const, questTypeId: row!.id };
}

export async function updateQuestType(
  questTypeId: string,
  data: Partial<z.infer<typeof QuestTypeSchema>>,
) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();

  const { data: qt } = await admin
    .from("game_quest_types")
    .select("game_design_id")
    .eq("id", questTypeId)
    .single();

  if (!qt) return { success: false as const, error: "Quest type not found" };

  const owner = await requireDraftOwner(qt.game_design_id, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  const updateData: Record<string, unknown> = {};
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.label !== undefined) updateData.label = data.label;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.validationMethod !== undefined) updateData.validation_method = data.validationMethod;
  if (data.validationThreshold !== undefined) updateData.validation_threshold = data.validationThreshold;
  if (data.recognitionType !== undefined) updateData.recognition_type = data.recognitionType;
  if (data.baseRecognition !== undefined) updateData.base_recognition = data.baseRecognition;
  if (data.narrativePrompt !== undefined) updateData.narrative_prompt = data.narrativePrompt;
  if (data.cooldownHours !== undefined) updateData.cooldown_hours = data.cooldownHours;
  if (data.maxPartySize !== undefined) updateData.max_party_size = data.maxPartySize;
  if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.icon !== undefined) updateData.icon = data.icon;

  const { error } = await admin.from("game_quest_types").update(updateData).eq("id", questTypeId);
  if (error) return { success: false as const, error: "Failed to update quest type" };
  return { success: true as const };
}

export async function removeQuestType(questTypeId: string) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();

  const { data: qt } = await admin
    .from("game_quest_types")
    .select("game_design_id")
    .eq("id", questTypeId)
    .single();

  if (!qt) return { success: false as const, error: "Quest type not found" };

  const owner = await requireDraftOwner(qt.game_design_id, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  const { error } = await admin.from("game_quest_types").delete().eq("id", questTypeId);
  if (error) return { success: false as const, error: "Failed to remove quest type" };
  return { success: true as const };
}

// ---------------------------------------------------------------------------
// Skill domain mutations
// ---------------------------------------------------------------------------

export async function addSkillDomain(
  designId: string,
  data: z.infer<typeof SkillDomainSchema>,
) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const owner = await requireDraftOwner(designId, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  const parsed = SkillDomainSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0].message };

  const admin = createServiceClient();

  const { count } = await admin
    .from("game_skill_domains")
    .select("id", { count: "exact", head: true })
    .eq("game_design_id", designId);

  if ((count ?? 0) >= 15) {
    return { success: false as const, error: "Maximum 15 skill domains allowed" };
  }

  const { data: row, error } = await admin
    .from("game_skill_domains")
    .insert({
      game_design_id: designId,
      slug: parsed.data.slug,
      label: parsed.data.label,
      description: parsed.data.description ?? null,
      examples: parsed.data.examples,
      color: parsed.data.color ?? null,
      icon: parsed.data.icon ?? null,
      visibility_default: parsed.data.visibilityDefault,
      sort_order: parsed.data.sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { success: false as const, error: "A skill domain with this slug already exists" };
    return { success: false as const, error: "Failed to add skill domain" };
  }

  return { success: true as const, skillDomainId: row!.id };
}

export async function updateSkillDomain(
  domainId: string,
  data: Partial<z.infer<typeof SkillDomainSchema>>,
) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();

  const { data: sd } = await admin
    .from("game_skill_domains")
    .select("game_design_id")
    .eq("id", domainId)
    .single();

  if (!sd) return { success: false as const, error: "Skill domain not found" };

  const owner = await requireDraftOwner(sd.game_design_id, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  const updateData: Record<string, unknown> = {};
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.label !== undefined) updateData.label = data.label;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.examples !== undefined) updateData.examples = data.examples;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.visibilityDefault !== undefined) updateData.visibility_default = data.visibilityDefault;
  if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

  const { error } = await admin.from("game_skill_domains").update(updateData).eq("id", domainId);
  if (error) return { success: false as const, error: "Failed to update skill domain" };
  return { success: true as const };
}

export async function removeSkillDomain(domainId: string) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();

  const { data: sd } = await admin
    .from("game_skill_domains")
    .select("game_design_id")
    .eq("id", domainId)
    .single();

  if (!sd) return { success: false as const, error: "Skill domain not found" };

  const owner = await requireDraftOwner(sd.game_design_id, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  const { error } = await admin.from("game_skill_domains").delete().eq("id", domainId);
  if (error) return { success: false as const, error: "Failed to remove skill domain" };
  return { success: true as const };
}

// ---------------------------------------------------------------------------
// Recognition tier mutations
// ---------------------------------------------------------------------------

export async function addRecognitionTier(
  designId: string,
  data: z.infer<typeof RecognitionTierSchema>,
) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const owner = await requireDraftOwner(designId, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  const parsed = RecognitionTierSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0].message };

  const admin = createServiceClient();

  const { count } = await admin
    .from("game_recognition_tiers")
    .select("id", { count: "exact", head: true })
    .eq("game_design_id", designId);

  if ((count ?? 0) >= 7) {
    return { success: false as const, error: "Maximum 7 recognition tiers allowed" };
  }

  const { data: row, error } = await admin
    .from("game_recognition_tiers")
    .insert({
      game_design_id: designId,
      tier_number: parsed.data.tierNumber,
      name: parsed.data.name,
      threshold_type: parsed.data.thresholdType,
      threshold_value: parsed.data.thresholdValue,
      additional_requirements: parsed.data.additionalRequirements ?? null,
      unlocks: parsed.data.unlocks,
      color: parsed.data.color ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { success: false as const, error: "A tier with this number already exists" };
    return { success: false as const, error: "Failed to add recognition tier" };
  }

  return { success: true as const, tierId: row!.id };
}

export async function updateRecognitionTier(
  tierId: string,
  data: Partial<z.infer<typeof RecognitionTierSchema>>,
) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();

  const { data: rt } = await admin
    .from("game_recognition_tiers")
    .select("game_design_id")
    .eq("id", tierId)
    .single();

  if (!rt) return { success: false as const, error: "Recognition tier not found" };

  const owner = await requireDraftOwner(rt.game_design_id, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  const updateData: Record<string, unknown> = {};
  if (data.tierNumber !== undefined) updateData.tier_number = data.tierNumber;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.thresholdType !== undefined) updateData.threshold_type = data.thresholdType;
  if (data.thresholdValue !== undefined) updateData.threshold_value = data.thresholdValue;
  if (data.additionalRequirements !== undefined) updateData.additional_requirements = data.additionalRequirements;
  if (data.unlocks !== undefined) updateData.unlocks = data.unlocks;
  if (data.color !== undefined) updateData.color = data.color;

  const { error } = await admin.from("game_recognition_tiers").update(updateData).eq("id", tierId);
  if (error) return { success: false as const, error: "Failed to update recognition tier" };
  return { success: true as const };
}

export async function removeRecognitionTier(tierId: string) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();

  const { data: rt } = await admin
    .from("game_recognition_tiers")
    .select("game_design_id")
    .eq("id", tierId)
    .single();

  if (!rt) return { success: false as const, error: "Recognition tier not found" };

  const owner = await requireDraftOwner(rt.game_design_id, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  // Check min count guardrail
  const { count } = await admin
    .from("game_recognition_tiers")
    .select("id", { count: "exact", head: true })
    .eq("game_design_id", rt.game_design_id);

  if ((count ?? 0) <= 2) {
    return { success: false as const, error: "At least 2 recognition tiers required" };
  }

  const { error } = await admin.from("game_recognition_tiers").delete().eq("id", tierId);
  if (error) return { success: false as const, error: "Failed to remove recognition tier" };
  return { success: true as const };
}

// ---------------------------------------------------------------------------
// Recognition sources (replace all)
// ---------------------------------------------------------------------------

export async function updateRecognitionSources(
  designId: string,
  sources: z.infer<typeof RecognitionSourceSchema>[],
) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const owner = await requireDraftOwner(designId, auth.user.id);
  if (owner.error) return { success: false as const, error: owner.error };

  // Validate all sources
  for (const [i, src] of sources.entries()) {
    const parsed = RecognitionSourceSchema.safeParse(src);
    if (!parsed.success) {
      return { success: false as const, error: `Source ${i + 1}: ${parsed.error.issues[0].message}` };
    }
  }

  const admin = createServiceClient();

  // Delete existing and insert new
  await admin.from("game_recognition_sources").delete().eq("game_design_id", designId);

  if (sources.length > 0) {
    const { error } = await admin.from("game_recognition_sources").insert(
      sources.map((src) => ({
        game_design_id: designId,
        source_type: src.sourceType,
        amount: src.amount,
        max_per_day: src.maxPerDay ?? null,
      })),
    );
    if (error) return { success: false as const, error: "Failed to update recognition sources" };
  }

  return { success: true as const };
}

// ---------------------------------------------------------------------------
// Governance integration
// ---------------------------------------------------------------------------

export async function submitForGovernance(designId: string) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const admin = createServiceClient();

  const { data: design } = await admin
    .from("game_designs")
    .select("*")
    .eq("id", designId)
    .single();

  if (!design) return { success: false as const, error: "Game design not found" };
  if (design.created_by !== auth.user.id) {
    return { success: false as const, error: "Only the draft creator can submit" };
  }
  if (design.status !== "draft") {
    return { success: false as const, error: "Only draft designs can be submitted" };
  }
  if (design.submitted_proposal_id) {
    return { success: false as const, error: "Already submitted for governance" };
  }

  // Count child rows for guardrail validation
  const [qtCount, sdCount, rtCount] = await Promise.all([
    admin.from("game_quest_types").select("id", { count: "exact", head: true }).eq("game_design_id", designId),
    admin.from("game_skill_domains").select("id", { count: "exact", head: true }).eq("game_design_id", designId),
    admin.from("game_recognition_tiers").select("id", { count: "exact", head: true }).eq("game_design_id", designId),
  ]);

  const guardrailErrors = validateGameDesignGuardrails({
    sunsetAt: design.sunset_at,
    questTypeCount: qtCount.count ?? 0,
    skillDomainCount: sdCount.count ?? 0,
    recognitionTierCount: rtCount.count ?? 0,
  });

  if (guardrailErrors.length > 0) {
    return {
      success: false as const,
      error: `Guardrail violations: ${guardrailErrors.map((e) => e.message).join("; ")}`,
    };
  }

  // Create governance proposal
  const now = new Date();
  const deliberationEnd = new Date(now);
  deliberationEnd.setDate(deliberationEnd.getDate() + 7);
  const votingEnd = new Date(deliberationEnd);
  votingEnd.setDate(votingEnd.getDate() + 7);

  const { data: proposal, error: proposalError } = await admin
    .from("governance_proposals")
    .insert({
      community_id: design.community_id,
      author_id: auth.user.id,
      title: `Game Design: ${design.name}`,
      description: `Proposal to adopt a new game design: "${design.name}"\n\nValue Statement: ${design.value_statement}\n\nRationale: ${design.design_rationale}`,
      category: "game_design",
      status: "deliberation",
      vote_type: "quadratic",
      deliberation_ends_at: deliberationEnd.toISOString(),
      voting_ends_at: votingEnd.toISOString(),
    })
    .select("id")
    .single();

  if (proposalError || !proposal) {
    return { success: false as const, error: "Failed to create governance proposal" };
  }

  // Lock the draft
  const { error: lockError } = await admin
    .from("game_designs")
    .update({ submitted_proposal_id: proposal.id, updated_at: new Date().toISOString() })
    .eq("id", designId);

  if (lockError) {
    await admin.from("governance_proposals").delete().eq("id", proposal.id);
    return { success: false as const, error: "Failed to lock draft — proposal rolled back" };
  }

  return { success: true as const, proposalId: proposal.id };
}

export async function activateGameDesign(proposalId: string) {
  const auth = await requireAuth();
  if (auth.error) return { success: false as const, error: auth.error };

  const keeper = await requireKeeper(auth.user.id);
  if (keeper.error) return { success: false as const, error: keeper.error };

  if (!UUID_FORMAT.test(proposalId)) {
    return { success: false as const, error: "Invalid proposal ID" };
  }

  const admin = createServiceClient();

  // Verify proposal passed
  const { data: proposal } = await admin
    .from("governance_proposals")
    .select("id, status, votes_for, votes_against, community_id")
    .eq("id", proposalId)
    .single();

  if (!proposal) return { success: false as const, error: "Proposal not found" };

  if (proposal.status !== "passed") {
    return { success: false as const, error: "Proposal has not passed" };
  }

  if (proposal.community_id !== keeper.profile.community_id) {
    return { success: false as const, error: "Proposal is not in your community" };
  }

  // Find the draft linked to this proposal
  const { data: draft } = await admin
    .from("game_designs")
    .select("id, community_id, version")
    .eq("submitted_proposal_id", proposalId)
    .eq("status", "draft")
    .single();

  if (!draft) {
    return { success: false as const, error: "No draft linked to this proposal" };
  }

  // Sunset current active design
  await admin
    .from("game_designs")
    .update({ status: "sunset", updated_at: new Date().toISOString() })
    .eq("community_id", draft.community_id)
    .eq("status", "active");

  // Activate the draft
  const { error } = await admin
    .from("game_designs")
    .update({
      status: "active",
      activated_by_proposal_id: proposalId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draft.id);

  if (error) return { success: false as const, error: "Failed to activate game design" };

  // Invalidate cache
  invalidateGameConfig(draft.community_id);

  return { success: true as const };
}
