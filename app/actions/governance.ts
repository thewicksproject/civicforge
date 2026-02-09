"use server";

import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const ProposalSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be at most 5000 characters"),
  category: z.enum([
    "charter_amendment",
    "quest_template",
    "threshold_change",
    "seasonal_quest",
    "rule_change",
    "guild_charter",
    "federation",
    "other",
  ] as const),
  vote_type: z.enum(["quadratic", "approval", "liquid_delegate"] as const).default("quadratic"),
  guild_id: z.string().uuid().optional(),
  deliberation_days: z.number().int().min(3).max(30).default(7),
  voting_days: z.number().int().min(3).max(14).default(7),
});

export async function createProposal(data: {
  title: string;
  description: string;
  category: string;
  vote_type?: string;
  guild_id?: string;
  deliberation_days?: number;
  voting_days?: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const parsed = ProposalSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const admin = createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("neighborhood_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.neighborhood_id) {
    return { success: false as const, error: "Profile not found" };
  }

  // Keeper (renown_tier >= 4) required to create proposals
  if (profile.renown_tier < 4) {
    return {
      success: false as const,
      error: "You must be a Keeper (Renown Tier 4) to create governance proposals",
    };
  }

  const now = new Date();
  const deliberationEnd = new Date(now);
  deliberationEnd.setDate(
    deliberationEnd.getDate() + (parsed.data.deliberation_days ?? 7)
  );
  const votingEnd = new Date(deliberationEnd);
  votingEnd.setDate(
    votingEnd.getDate() + (parsed.data.voting_days ?? 7)
  );

  const { data: proposal, error } = await admin
    .from("governance_proposals")
    .insert({
      neighborhood_id: profile.neighborhood_id,
      guild_id: parsed.data.guild_id ?? null,
      author_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      vote_type: parsed.data.vote_type ?? "quadratic",
      deliberation_ends_at: deliberationEnd.toISOString(),
      voting_ends_at: votingEnd.toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return { success: false as const, error: "Failed to create proposal" };
  }

  return { success: true as const, proposalId: proposal.id };
}

export async function castVote(data: {
  proposal_id: string;
  in_favor: boolean;
  credits_spent?: number;
  delegate_to_id?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  if (
    !data.proposal_id ||
    !z.string().uuid().safeParse(data.proposal_id).success
  ) {
    return { success: false as const, error: "Valid proposal ID required" };
  }

  const admin = createServiceClient();

  // Check user is eligible to vote (renown_tier >= 2)
  const { data: profile } = await admin
    .from("profiles")
    .select("renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile || profile.renown_tier < 2) {
    return {
      success: false as const,
      error: "You must be at least a Neighbor (Renown Tier 2) to vote",
    };
  }

  // Check proposal is in voting phase
  const { data: proposal } = await admin
    .from("governance_proposals")
    .select("id, status, vote_type, voting_ends_at, votes_for, votes_against")
    .eq("id", data.proposal_id)
    .single();

  if (!proposal || proposal.status !== "voting") {
    return { success: false as const, error: "Proposal is not in voting phase" };
  }

  if (proposal.voting_ends_at && new Date(proposal.voting_ends_at) < new Date()) {
    return { success: false as const, error: "Voting period has ended" };
  }

  // Calculate vote weight based on type
  let creditsSpent = data.credits_spent ?? 1;
  let voteWeight = 1;
  const voteType = proposal.vote_type;

  if (voteType === "quadratic") {
    // N votes costs N^2 credits; vote weight = sqrt(credits)
    voteWeight = Math.sqrt(creditsSpent);
  } else if (voteType === "liquid_delegate") {
    if (!data.delegate_to_id) {
      // Direct vote with weight 1
      voteWeight = 1;
      creditsSpent = 1;
    } else {
      // Delegation — will be resolved when tallying
      voteWeight = 0;
      creditsSpent = 0;
    }
  }

  const { error } = await admin.from("governance_votes").insert({
    proposal_id: data.proposal_id,
    voter_id: user.id,
    vote_type: voteType,
    credits_spent: creditsSpent,
    vote_weight: voteWeight,
    delegate_to_id: data.delegate_to_id ?? null,
    in_favor: data.in_favor,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false as const, error: "You already voted on this proposal" };
    }
    return { success: false as const, error: "Failed to cast vote" };
  }

  // Update vote tallies via direct update
  const weightedVote = Math.round(voteWeight);
  if (data.in_favor) {
    await admin
      .from("governance_proposals")
      .update({ votes_for: (proposal.votes_for ?? 0) + weightedVote })
      .eq("id", data.proposal_id);
  } else {
    await admin
      .from("governance_proposals")
      .update({ votes_against: (proposal.votes_against ?? 0) + weightedVote })
      .eq("id", data.proposal_id);
  }

  return { success: true as const };
}

export async function getNeighborhoodProposals(neighborhoodId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const admin = createServiceClient();

  const { data: proposals, error } = await admin
    .from("governance_proposals")
    .select(`
      id, title, description, category, status, vote_type,
      votes_for, votes_against, quorum,
      deliberation_ends_at, voting_ends_at, created_at,
      author_id, profiles!governance_proposals_author_id_fkey(display_name, renown_tier)
    `)
    .eq("neighborhood_id", neighborhoodId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return { success: false as const, error: "Failed to load proposals" };
  }

  return { success: true as const, proposals: proposals ?? [] };
}

/**
 * Transition a proposal from deliberation to voting phase.
 * Called by the author or by a cron job when deliberation period ends.
 */
export async function advanceProposalToVoting(proposalId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "You must be logged in" };
  }

  const admin = createServiceClient();

  const { data: proposal } = await admin
    .from("governance_proposals")
    .select("id, status, author_id, deliberation_ends_at")
    .eq("id", proposalId)
    .single();

  if (!proposal) {
    return { success: false as const, error: "Proposal not found" };
  }

  if (proposal.author_id !== user.id) {
    return { success: false as const, error: "Only the author can advance the proposal" };
  }

  if (proposal.status !== "deliberation") {
    return { success: false as const, error: "Proposal is not in deliberation phase" };
  }

  await admin
    .from("governance_proposals")
    .update({ status: "voting" })
    .eq("id", proposalId);

  return { success: true as const };
}
