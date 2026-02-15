-- ============================================================================
-- 0014: Game Designer — Community Game Configuration
-- ============================================================================
-- Adds tables for community-defined game rules (quest types, skill domains,
-- recognition tiers, recognition sources), game templates, quest narratives,
-- and FK columns on existing tables for backward-compatible linkage.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE game_design_status AS ENUM ('draft', 'active', 'sunset', 'archived');
CREATE TYPE recognition_type AS ENUM ('xp', 'narrative', 'badge', 'endorsement_prompt', 'none');
CREATE TYPE visibility_default AS ENUM ('private', 'opt_in', 'summary_only');
CREATE TYPE threshold_type AS ENUM ('points', 'quests_completed', 'endorsements', 'time_in_community', 'composite');
CREATE TYPE recognition_source_type AS ENUM ('quest_completion', 'endorsement_given', 'endorsement_received', 'mentoring');
CREATE TYPE ceremony_level AS ENUM ('minimal', 'low', 'medium', 'high');
CREATE TYPE quantification_level AS ENUM ('none', 'minimal', 'moderate', 'detailed');

-- ---------------------------------------------------------------------------
-- 1. Game Templates
-- ---------------------------------------------------------------------------

CREATE TABLE game_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  value_statement text NOT NULL,
  ceremony_level ceremony_level NOT NULL DEFAULT 'medium',
  quantification_level quantification_level NOT NULL DEFAULT 'moderate',
  config jsonb NOT NULL,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE game_templates ENABLE ROW LEVEL SECURITY;

-- Templates are readable by all authenticated users
CREATE POLICY "game_templates_select" ON game_templates
  FOR SELECT USING (true);

-- Only service role can insert/update/delete templates
CREATE POLICY "game_templates_insert" ON game_templates
  FOR INSERT WITH CHECK (false);
CREATE POLICY "game_templates_update" ON game_templates
  FOR UPDATE USING (false);
CREATE POLICY "game_templates_delete" ON game_templates
  FOR DELETE USING (false);

-- ---------------------------------------------------------------------------
-- 2. Game Designs
-- ---------------------------------------------------------------------------

CREATE TABLE game_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  value_statement text NOT NULL,
  design_rationale text NOT NULL,
  status game_design_status NOT NULL DEFAULT 'draft',
  sunset_at timestamptz NOT NULL,
  version integer NOT NULL DEFAULT 1,
  previous_version_id uuid REFERENCES game_designs(id) ON DELETE SET NULL,
  activated_by_proposal_id uuid REFERENCES governance_proposals(id) ON DELETE SET NULL,
  template_id uuid REFERENCES game_templates(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Guardrails
  CONSTRAINT game_designs_sunset_min CHECK (sunset_at > created_at + interval '3 months'),
  CONSTRAINT game_designs_sunset_max CHECK (sunset_at < created_at + interval '2 years 1 day')
);

-- Only one active game design per community
CREATE UNIQUE INDEX game_designs_active_uniq
  ON game_designs (community_id) WHERE status = 'active';

CREATE INDEX game_designs_community_idx ON game_designs(community_id);
CREATE INDEX game_designs_status_idx ON game_designs(status);
CREATE INDEX game_designs_template_idx ON game_designs(template_id);

ALTER TABLE game_designs ENABLE ROW LEVEL SECURITY;

-- Community members can read their community's game designs
CREATE POLICY "game_designs_select" ON game_designs
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Keepers+ can create drafts (tier >= 4)
CREATE POLICY "game_designs_insert" ON game_designs
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND community_id = game_designs.community_id
      AND renown_tier >= 4
    )
  );

-- Only service role updates (activation via governance)
CREATE POLICY "game_designs_update" ON game_designs
  FOR UPDATE USING (false);

-- ---------------------------------------------------------------------------
-- 3. Game Quest Types
-- ---------------------------------------------------------------------------

CREATE TABLE game_quest_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_design_id uuid NOT NULL REFERENCES game_designs(id) ON DELETE CASCADE,
  slug text NOT NULL,
  label text NOT NULL,
  description text,
  validation_method text NOT NULL,
  validation_threshold integer NOT NULL DEFAULT 1,
  recognition_type recognition_type NOT NULL DEFAULT 'xp',
  base_recognition integer NOT NULL DEFAULT 5,
  narrative_prompt text,
  cooldown_hours integer NOT NULL DEFAULT 0 CHECK (cooldown_hours >= 0),
  max_party_size integer NOT NULL DEFAULT 1 CHECK (max_party_size >= 1 AND max_party_size <= 10),
  sort_order integer NOT NULL DEFAULT 0,
  color text,
  icon text,

  UNIQUE (game_design_id, slug)
);

CREATE INDEX game_quest_types_design_idx ON game_quest_types(game_design_id);

ALTER TABLE game_quest_types ENABLE ROW LEVEL SECURITY;

-- Readable by community members (through game_designs join)
CREATE POLICY "game_quest_types_select" ON game_quest_types
  FOR SELECT USING (
    game_design_id IN (
      SELECT gd.id FROM game_designs gd
      JOIN profiles p ON p.community_id = gd.community_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "game_quest_types_insert" ON game_quest_types
  FOR INSERT WITH CHECK (false);
CREATE POLICY "game_quest_types_update" ON game_quest_types
  FOR UPDATE USING (false);

-- ---------------------------------------------------------------------------
-- 4. Game Skill Domains
-- ---------------------------------------------------------------------------

CREATE TABLE game_skill_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_design_id uuid NOT NULL REFERENCES game_designs(id) ON DELETE CASCADE,
  slug text NOT NULL,
  label text NOT NULL,
  description text,
  examples text[] NOT NULL DEFAULT '{}',
  color text,
  icon text,
  visibility_default visibility_default NOT NULL DEFAULT 'private',
  sort_order integer NOT NULL DEFAULT 0,

  UNIQUE (game_design_id, slug)
);

CREATE INDEX game_skill_domains_design_idx ON game_skill_domains(game_design_id);

ALTER TABLE game_skill_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_skill_domains_select" ON game_skill_domains
  FOR SELECT USING (
    game_design_id IN (
      SELECT gd.id FROM game_designs gd
      JOIN profiles p ON p.community_id = gd.community_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "game_skill_domains_insert" ON game_skill_domains
  FOR INSERT WITH CHECK (false);
CREATE POLICY "game_skill_domains_update" ON game_skill_domains
  FOR UPDATE USING (false);

-- ---------------------------------------------------------------------------
-- 5. Game Recognition Tiers
-- ---------------------------------------------------------------------------

CREATE TABLE game_recognition_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_design_id uuid NOT NULL REFERENCES game_designs(id) ON DELETE CASCADE,
  tier_number integer NOT NULL,
  name text NOT NULL,
  threshold_type threshold_type NOT NULL DEFAULT 'points',
  threshold_value integer NOT NULL DEFAULT 0,
  additional_requirements jsonb,
  unlocks text[] NOT NULL DEFAULT '{}',
  color text,

  UNIQUE (game_design_id, tier_number)
);

CREATE INDEX game_recognition_tiers_design_idx ON game_recognition_tiers(game_design_id);

ALTER TABLE game_recognition_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_recognition_tiers_select" ON game_recognition_tiers
  FOR SELECT USING (
    game_design_id IN (
      SELECT gd.id FROM game_designs gd
      JOIN profiles p ON p.community_id = gd.community_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "game_recognition_tiers_insert" ON game_recognition_tiers
  FOR INSERT WITH CHECK (false);
CREATE POLICY "game_recognition_tiers_update" ON game_recognition_tiers
  FOR UPDATE USING (false);

-- ---------------------------------------------------------------------------
-- 6. Game Recognition Sources
-- ---------------------------------------------------------------------------

CREATE TABLE game_recognition_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_design_id uuid NOT NULL REFERENCES game_designs(id) ON DELETE CASCADE,
  source_type recognition_source_type NOT NULL,
  amount real NOT NULL CHECK (amount >= 0),
  max_per_day integer CHECK (max_per_day IS NULL OR max_per_day <= 500),

  UNIQUE (game_design_id, source_type)
);

CREATE INDEX game_recognition_sources_design_idx ON game_recognition_sources(game_design_id);

ALTER TABLE game_recognition_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_recognition_sources_select" ON game_recognition_sources
  FOR SELECT USING (
    game_design_id IN (
      SELECT gd.id FROM game_designs gd
      JOIN profiles p ON p.community_id = gd.community_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "game_recognition_sources_insert" ON game_recognition_sources
  FOR INSERT WITH CHECK (false);
CREATE POLICY "game_recognition_sources_update" ON game_recognition_sources
  FOR UPDATE USING (false);

-- ---------------------------------------------------------------------------
-- 7. Quest Narratives
-- ---------------------------------------------------------------------------

CREATE TABLE quest_narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  narrative_text text NOT NULL,
  prompt_used text,
  private boolean NOT NULL DEFAULT true,
  shared_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX quest_narratives_quest_idx ON quest_narratives(quest_id);
CREATE INDEX quest_narratives_user_idx ON quest_narratives(user_id);

ALTER TABLE quest_narratives ENABLE ROW LEVEL SECURITY;

-- Users can read their own narratives, or shared narratives from their community
CREATE POLICY "quest_narratives_select" ON quest_narratives
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      private = false
      AND quest_id IN (
        SELECT q.id FROM quests q
        JOIN profiles p ON p.community_id = q.community_id
        WHERE p.id = auth.uid()
      )
    )
  );

-- Users can insert their own narratives
CREATE POLICY "quest_narratives_insert" ON quest_narratives
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own narratives (e.g. share/unshare)
CREATE POLICY "quest_narratives_update" ON quest_narratives
  FOR UPDATE USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 8. Add FK columns to existing tables (nullable for backward compat)
-- ---------------------------------------------------------------------------

ALTER TABLE quests
  ADD COLUMN game_design_id uuid REFERENCES game_designs(id) ON DELETE SET NULL,
  ADD COLUMN quest_type_id uuid REFERENCES game_quest_types(id) ON DELETE SET NULL;

ALTER TABLE skill_progress
  ADD COLUMN game_domain_id uuid REFERENCES game_skill_domains(id) ON DELETE SET NULL;

ALTER TABLE endorsements
  ADD COLUMN game_domain_id uuid REFERENCES game_skill_domains(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 9. Seed "Classic CivicForge" template
-- ---------------------------------------------------------------------------

INSERT INTO game_templates (id, name, slug, description, value_statement, ceremony_level, quantification_level, config, is_system)
VALUES (
  '00000001-0000-0000-0000-000000000001',
  'Classic CivicForge',
  'classic',
  'The original CivicForge coordination game with escalating trust and multidimensional growth.',
  'We believe communities grow through mutual aid, progressive trust, and the recognition that everyone has something valuable to contribute across many domains of life.',
  'medium',
  'moderate',
  '{
    "quest_types": [
      {"slug": "spark", "label": "Spark", "description": "Quick, simple tasks like picking up litter or checking on a neighbor", "validation_method": "self_report", "validation_threshold": 0, "recognition_type": "xp", "base_recognition": 5, "cooldown_hours": 0, "max_party_size": 1},
      {"slug": "ember", "label": "Ember", "description": "Tasks needing one peer to confirm, like helping someone move a couch", "validation_method": "peer_confirm", "validation_threshold": 1, "recognition_type": "xp", "base_recognition": 15, "cooldown_hours": 0, "max_party_size": 1},
      {"slug": "flame", "label": "Flame", "description": "Substantial tasks with photo evidence, like repairing a fence", "validation_method": "photo_and_peer", "validation_threshold": 1, "recognition_type": "xp", "base_recognition": 35, "cooldown_hours": 0, "max_party_size": 1},
      {"slug": "blaze", "label": "Blaze", "description": "Multi-person efforts requiring 3+ community votes to validate", "validation_method": "community_vote", "validation_threshold": 3, "recognition_type": "xp", "base_recognition": 75, "cooldown_hours": 0, "max_party_size": 5},
      {"slug": "inferno", "label": "Inferno", "description": "Major projects spanning weeks with documented outcomes", "validation_method": "community_vote_and_evidence", "validation_threshold": 5, "recognition_type": "xp", "base_recognition": 150, "cooldown_hours": 0, "max_party_size": 5}
    ],
    "skill_domains": [
      {"slug": "craft", "label": "Craft", "description": "Building, repairing, and creating physical things", "examples": ["Home repair", "Woodworking", "Electrical", "Plumbing", "Sewing"], "color": "rose-clay", "icon": "Hammer"},
      {"slug": "green", "label": "Green", "description": "Nurturing growing things and stewarding the environment", "examples": ["Gardening", "Landscaping", "Composting", "Urban farming"], "color": "meadow", "icon": "Leaf"},
      {"slug": "care", "label": "Care", "description": "Supporting people through presence and attention", "examples": ["Childcare", "Eldercare", "Pet care", "Crisis support", "Tutoring"], "color": "horizon", "icon": "Heart"},
      {"slug": "bridge", "label": "Bridge", "description": "Moving people and things where they need to go", "examples": ["Transportation", "Moving help", "Delivery", "Errands"], "color": "golden-hour", "icon": "Truck"},
      {"slug": "signal", "label": "Signal", "description": "Connecting people through information and technology", "examples": ["Tech help", "Communications", "Translation", "Teaching"], "color": "horizon", "icon": "Radio"},
      {"slug": "hearth", "label": "Hearth", "description": "Gathering people together through food and fellowship", "examples": ["Cooking", "Meal prep", "Event hosting", "Community gathering"], "color": "rose-clay", "icon": "Flame"},
      {"slug": "weave", "label": "Weave", "description": "Coordinating people and processes toward shared goals", "examples": ["Coordination", "Project management", "Conflict resolution", "Governance"], "color": "golden-hour", "icon": "Network"}
    ],
    "recognition_tiers": [
      {"tier_number": 1, "name": "Newcomer", "threshold_type": "points", "threshold_value": 0, "unlocks": ["Browse, post needs, respond, receive help"], "color": "muted-foreground"},
      {"tier_number": 2, "name": "Neighbor", "threshold_type": "points", "threshold_value": 0, "unlocks": ["Post offers, create quests, join parties, earn skill XP"], "color": "offer"},
      {"tier_number": 3, "name": "Pillar", "threshold_type": "points", "threshold_value": 50, "additional_requirements": {"vouches_required": 2}, "unlocks": ["Create guilds, moderate, propose seasonal quests"], "color": "golden-hour"},
      {"tier_number": 4, "name": "Keeper", "threshold_type": "points", "threshold_value": 200, "unlocks": ["Governance council, propose rule changes, mentor"], "color": "horizon"},
      {"tier_number": 5, "name": "Founder", "threshold_type": "points", "threshold_value": 500, "unlocks": ["Cross-community coordination, system governance"], "color": "need"}
    ],
    "recognition_sources": [
      {"source_type": "quest_completion", "amount": 1, "max_per_day": null},
      {"source_type": "endorsement_given", "amount": 0.5, "max_per_day": null},
      {"source_type": "endorsement_received", "amount": 1, "max_per_day": null}
    ]
  }'::jsonb,
  true
);

-- Additional templates for variety
INSERT INTO game_templates (id, name, slug, description, value_statement, ceremony_level, quantification_level, config, is_system)
VALUES (
  '00000001-0000-0000-0000-000000000002',
  'Low Ceremony',
  'low-ceremony',
  'Neighbors helping neighbors with minimal overhead.',
  'We value simplicity and trust. Helping should be easy, not bureaucratic.',
  'minimal',
  'minimal',
  '{
    "quest_types": [
      {"slug": "quick-help", "label": "Quick Help", "description": "Small favors and everyday assistance", "validation_method": "self_report", "validation_threshold": 0, "recognition_type": "narrative", "base_recognition": 0, "narrative_prompt": "What happened? Who did you help?", "cooldown_hours": 0, "max_party_size": 1},
      {"slug": "project", "label": "Project", "description": "Bigger efforts that take planning", "validation_method": "peer_confirm", "validation_threshold": 1, "recognition_type": "narrative", "base_recognition": 0, "narrative_prompt": "Tell the story of this project. What was the outcome?", "cooldown_hours": 0, "max_party_size": 5}
    ],
    "skill_domains": [
      {"slug": "helping", "label": "Helping", "description": "All forms of community assistance", "examples": ["Repairs", "Errands", "Rides", "Meals"], "color": "meadow", "icon": "Heart"},
      {"slug": "organizing", "label": "Organizing", "description": "Bringing people together", "examples": ["Events", "Coordination", "Planning"], "color": "golden-hour", "icon": "Network"}
    ],
    "recognition_tiers": [
      {"tier_number": 1, "name": "New", "threshold_type": "points", "threshold_value": 0, "unlocks": ["Browse and post"], "color": "muted-foreground"},
      {"tier_number": 2, "name": "Trusted", "threshold_type": "quests_completed", "threshold_value": 3, "unlocks": ["Full access"], "color": "meadow"}
    ],
    "recognition_sources": [
      {"source_type": "quest_completion", "amount": 1, "max_per_day": null}
    ]
  }'::jsonb,
  true
);

-- ---------------------------------------------------------------------------
-- 10. Backfill: Create active game designs for existing communities
-- ---------------------------------------------------------------------------

-- For each existing community, create a Classic game design
INSERT INTO game_designs (
  community_id, name, description, value_statement, design_rationale,
  status, sunset_at, version, template_id, created_by
)
SELECT
  c.id,
  'Classic CivicForge',
  'The original CivicForge coordination game with escalating trust and multidimensional growth.',
  'We believe communities grow through mutual aid, progressive trust, and the recognition that everyone has something valuable to contribute across many domains of life.',
  'Five difficulty tiers create a natural progression from quick individual actions to ambitious community projects. Seven skill domains ensure no single path is valued above others. Five reputation tiers unlock increasing responsibility without ever punishing inactivity.',
  'active',
  now() + interval '2 years',
  1,
  '00000001-0000-0000-0000-000000000001',
  c.created_by
FROM communities c
WHERE c.created_by IS NOT NULL
ON CONFLICT DO NOTHING;

-- Seed quest types for each newly created game design
INSERT INTO game_quest_types (game_design_id, slug, label, description, validation_method, validation_threshold, recognition_type, base_recognition, cooldown_hours, max_party_size, sort_order)
SELECT
  gd.id, 'spark', 'Spark', 'Quick, simple tasks like picking up litter or checking on a neighbor',
  'self_report', 0, 'xp', 5, 0, 1, 0
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_quest_types (game_design_id, slug, label, description, validation_method, validation_threshold, recognition_type, base_recognition, cooldown_hours, max_party_size, sort_order)
SELECT
  gd.id, 'ember', 'Ember', 'Tasks needing one peer to confirm, like helping someone move a couch',
  'peer_confirm', 1, 'xp', 15, 0, 1, 1
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_quest_types (game_design_id, slug, label, description, validation_method, validation_threshold, recognition_type, base_recognition, cooldown_hours, max_party_size, sort_order)
SELECT
  gd.id, 'flame', 'Flame', 'Substantial tasks with photo evidence, like repairing a fence',
  'photo_and_peer', 1, 'xp', 35, 0, 1, 2
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_quest_types (game_design_id, slug, label, description, validation_method, validation_threshold, recognition_type, base_recognition, cooldown_hours, max_party_size, sort_order)
SELECT
  gd.id, 'blaze', 'Blaze', 'Multi-person efforts requiring 3+ community votes to validate',
  'community_vote', 3, 'xp', 75, 0, 5, 3
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_quest_types (game_design_id, slug, label, description, validation_method, validation_threshold, recognition_type, base_recognition, cooldown_hours, max_party_size, sort_order)
SELECT
  gd.id, 'inferno', 'Inferno', 'Major projects spanning weeks with documented outcomes',
  'community_vote_and_evidence', 5, 'xp', 150, 0, 5, 4
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

-- Seed skill domains for each game design
INSERT INTO game_skill_domains (game_design_id, slug, label, description, examples, color, icon, visibility_default, sort_order)
SELECT gd.id, 'craft', 'Craft', 'Building, repairing, and creating physical things',
  ARRAY['Home repair', 'Woodworking', 'Electrical', 'Plumbing', 'Sewing'], 'rose-clay', 'Hammer', 'private', 0
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_skill_domains (game_design_id, slug, label, description, examples, color, icon, visibility_default, sort_order)
SELECT gd.id, 'green', 'Green', 'Nurturing growing things and stewarding the environment',
  ARRAY['Gardening', 'Landscaping', 'Composting', 'Urban farming'], 'meadow', 'Leaf', 'private', 1
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_skill_domains (game_design_id, slug, label, description, examples, color, icon, visibility_default, sort_order)
SELECT gd.id, 'care', 'Care', 'Supporting people through presence and attention',
  ARRAY['Childcare', 'Eldercare', 'Pet care', 'Crisis support', 'Tutoring'], 'horizon', 'Heart', 'private', 2
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_skill_domains (game_design_id, slug, label, description, examples, color, icon, visibility_default, sort_order)
SELECT gd.id, 'bridge', 'Bridge', 'Moving people and things where they need to go',
  ARRAY['Transportation', 'Moving help', 'Delivery', 'Errands'], 'golden-hour', 'Truck', 'private', 3
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_skill_domains (game_design_id, slug, label, description, examples, color, icon, visibility_default, sort_order)
SELECT gd.id, 'signal', 'Signal', 'Connecting people through information and technology',
  ARRAY['Tech help', 'Communications', 'Translation', 'Teaching'], 'horizon', 'Radio', 'private', 4
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_skill_domains (game_design_id, slug, label, description, examples, color, icon, visibility_default, sort_order)
SELECT gd.id, 'hearth', 'Hearth', 'Gathering people together through food and fellowship',
  ARRAY['Cooking', 'Meal prep', 'Event hosting', 'Community gathering'], 'rose-clay', 'Flame', 'private', 5
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_skill_domains (game_design_id, slug, label, description, examples, color, icon, visibility_default, sort_order)
SELECT gd.id, 'weave', 'Weave', 'Coordinating people and processes toward shared goals',
  ARRAY['Coordination', 'Project management', 'Conflict resolution', 'Governance'], 'golden-hour', 'Network', 'private', 6
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

-- Seed recognition tiers for each game design
INSERT INTO game_recognition_tiers (game_design_id, tier_number, name, threshold_type, threshold_value, unlocks, color)
SELECT gd.id, 1, 'Newcomer', 'points', 0,
  ARRAY['Browse, post needs, respond, receive help'], 'muted-foreground'
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_recognition_tiers (game_design_id, tier_number, name, threshold_type, threshold_value, additional_requirements, unlocks, color)
SELECT gd.id, 2, 'Neighbor', 'points', 0, NULL,
  ARRAY['Post offers, create quests, join parties, earn skill XP'], 'offer'
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_recognition_tiers (game_design_id, tier_number, name, threshold_type, threshold_value, additional_requirements, unlocks, color)
SELECT gd.id, 3, 'Pillar', 'points', 50, '{"vouches_required": 2}'::jsonb,
  ARRAY['Create guilds, moderate, propose seasonal quests'], 'golden-hour'
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_recognition_tiers (game_design_id, tier_number, name, threshold_type, threshold_value, unlocks, color)
SELECT gd.id, 4, 'Keeper', 'points', 200,
  ARRAY['Governance council, propose rule changes, mentor'], 'horizon'
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_recognition_tiers (game_design_id, tier_number, name, threshold_type, threshold_value, unlocks, color)
SELECT gd.id, 5, 'Founder', 'points', 500,
  ARRAY['Cross-community coordination, system governance'], 'need'
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

-- Seed recognition sources for each game design
INSERT INTO game_recognition_sources (game_design_id, source_type, amount)
SELECT gd.id, 'quest_completion', 1
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_recognition_sources (game_design_id, source_type, amount)
SELECT gd.id, 'endorsement_given', 0.5
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

INSERT INTO game_recognition_sources (game_design_id, source_type, amount)
SELECT gd.id, 'endorsement_received', 1
FROM game_designs gd WHERE gd.status = 'active'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 11. Backfill FK columns on existing quests
-- ---------------------------------------------------------------------------

-- Link existing quests to their community's active game design
UPDATE quests q
SET game_design_id = gd.id
FROM game_designs gd
WHERE gd.community_id = q.community_id
  AND gd.status = 'active'
  AND q.game_design_id IS NULL;

-- Link existing quests to matching quest types by difficulty slug
UPDATE quests q
SET quest_type_id = gqt.id
FROM game_quest_types gqt
WHERE gqt.game_design_id = q.game_design_id
  AND gqt.slug = q.difficulty::text
  AND q.quest_type_id IS NULL;

-- Link existing skill_progress to matching game skill domains
UPDATE skill_progress sp
SET game_domain_id = gsd.id
FROM game_skill_domains gsd
JOIN game_designs gd ON gd.id = gsd.game_design_id AND gd.status = 'active'
JOIN profiles p ON p.community_id = gd.community_id
WHERE p.id = sp.user_id
  AND gsd.slug = sp.domain::text
  AND sp.game_domain_id IS NULL;

-- Link existing endorsements to matching game skill domains
UPDATE endorsements e
SET game_domain_id = gsd.id
FROM game_skill_domains gsd
JOIN game_designs gd ON gd.id = gsd.game_design_id AND gd.status = 'active'
JOIN profiles p ON p.community_id = gd.community_id
WHERE p.id = e.from_user
  AND gsd.slug = e.domain::text
  AND e.game_domain_id IS NULL;
