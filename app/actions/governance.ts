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
    .select("community_id, renown_tier")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.community_id) {
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

  // W18: Insert directly as "deliberation" (skip draft state)
  const { data: proposal, error } = await admin
    .from("governance_proposals")
    .insert({
      community_id: profile.community_id,
      guild_id: parsed.data.guild_id ?? null,
      author_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      status: "deliberation",
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

  // Check proposal is in voting phase (no longer need votes_for/against — RPC handles tallies)
  const { data: proposal } = await admin
    .from("governance_proposals")
    .select("id, status, vote_type, voting_ends_at, community_id")
    .eq("id", data.proposal_id)
    .single();

  if (!proposal || proposal.status !== "voting") {
    return { success: false as const, error: "Proposal is not in voting phase" };
  }

  if (proposal.voting_ends_at && new Date(proposal.voting_ends_at) < new Date()) {
    return { success: false as const, error: "Voting period has ended" };
  }

  // W1: Community scoping
  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (!userProfile?.community_id) {
    return { success: false as const, error: "Profile not found" };
  }

  if (proposal.community_id !== userProfile.community_id) {
    return { success: false as const, error: "Proposal is not in your community" };
  }

  // C4: Validate and bound credits (1-100 integers only)
  const creditsSchema = z.number().int().min(1).max(100);
  const creditsParsed = creditsSchema.safeParse(data.credits_spent ?? 1);
  if (!creditsParsed.success) {
    return { success: false as const, error: "Credits must be an integer between 1 and 100" };
  }

  // Calculate vote weight based on type
  let creditsSpent = creditsParsed.data;
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

  // C7: Use atomic RPC to increment vote tallies (prevents race conditions)
  const weightedVote = Math.round(voteWeight);
  await admin.rpc("increment_proposal_votes", {
    p_proposal_id: data.proposal_id,
    p_for_delta: data.in_favor ? weightedVote : 0,
    p_against_delta: data.in_favor ? 0 : weightedVote,
  });

  return { success: true as const };
}

export async function getCommunityProposals(communityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false as const, error: "Unauthorized" };
  }

  const admin = createServiceClient();

  // W1: Verify user belongs to this community
  const { data: userProfile } = await admin
    .from("profiles")
    .select("community_id")
    .eq("id", user.id)
    .single();

  if (userProfile?.community_id !== communityId) {
    return { success: false as const, error: "Not your community" };
  }

  const { data: proposals, error } = await admin
    .from("governance_proposals")
    .select(`
      id, title, description, category, status, vote_type,
      votes_for, votes_against, quorum,
      deliberation_ends_at, voting_ends_at, created_at,
      author_id, profiles!governance_proposals_author_id_fkey(display_name, renown_tier)
    `)
    .eq("community_id", communityId)
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

  // W6: Enforce deliberation period — cannot advance before it ends
  if (new Date(proposal.deliberation_ends_at) > new Date()) {
    return {
      success: false as const,
      error: "Deliberation period has not ended yet",
    };
  }

  await admin
    .from("governance_proposals")
    .update({ status: "voting" })
    .eq("id", proposalId);

  return { success: true as const };
}
