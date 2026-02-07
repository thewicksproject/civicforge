-- ============================================================================
-- CivicForge V2 Seed Data — "Maplewood Heights" neighborhood
-- Run with: psql -f supabase/seed.sql
-- ============================================================================

-- Use fixed UUIDs for reproducible test data
-- Neighborhood
INSERT INTO neighborhoods (id, name, city, state, zip_codes, description, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Maplewood Heights',
  'Portland',
  'OR',
  ARRAY['97201', '97205'],
  'A friendly tree-lined neighborhood near the park. We look out for each other.',
  '00000000-0000-0000-0000-000000000010'
) ON CONFLICT (id) DO NOTHING;

-- Users (5 test users at various trust tiers)
-- User 1: Maria Santos — Tier 3 admin (neighborhood creator)
INSERT INTO profiles (id, display_name, neighborhood_id, bio, skills, reputation_score, trust_tier, phone_verified)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Maria Santos',
  '00000000-0000-0000-0000-000000000001',
  'Retired teacher, avid gardener. Been in Maplewood Heights for 22 years.',
  ARRAY['gardening', 'tutoring', 'cooking', 'organizing'],
  15,
  3,
  true
) ON CONFLICT (id) DO NOTHING;

-- User 2: James Chen — Tier 2 confirmed
INSERT INTO profiles (id, display_name, neighborhood_id, bio, skills, reputation_score, trust_tier, phone_verified)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'James Chen',
  '00000000-0000-0000-0000-000000000001',
  'Software engineer, handy with tools. Always happy to help with tech or home repairs.',
  ARRAY['tech help', 'home repair', 'plumbing', 'carpentry'],
  8,
  2,
  true
) ON CONFLICT (id) DO NOTHING;

-- User 3: Priya Patel — Tier 2 confirmed
INSERT INTO profiles (id, display_name, neighborhood_id, bio, skills, reputation_score, trust_tier, phone_verified)
VALUES (
  '00000000-0000-0000-0000-000000000030',
  'Priya Patel',
  '00000000-0000-0000-0000-000000000001',
  'Nurse, mom of two. Great at meal prep and can help with basic first aid questions.',
  ARRAY['cooking', 'childcare', 'first aid', 'meal prep'],
  5,
  2,
  false
) ON CONFLICT (id) DO NOTHING;

-- User 4: Tom Rodriguez — Tier 1 neighbor (new, no invite yet)
INSERT INTO profiles (id, display_name, neighborhood_id, bio, skills, reputation_score, trust_tier, phone_verified)
VALUES (
  '00000000-0000-0000-0000-000000000040',
  'Tom Rodriguez',
  '00000000-0000-0000-0000-000000000001',
  'Just moved in! Looking to meet the neighbors.',
  ARRAY['moving', 'errands'],
  0,
  1,
  false
) ON CONFLICT (id) DO NOTHING;

-- User 5: Sarah Kim — Tier 1 neighbor
INSERT INTO profiles (id, display_name, neighborhood_id, bio, skills, reputation_score, trust_tier, phone_verified)
VALUES (
  '00000000-0000-0000-0000-000000000050',
  'Sarah Kim',
  '00000000-0000-0000-0000-000000000001',
  'College student, available most evenings. Love dogs!',
  ARRAY['pet care', 'tutoring', 'errands'],
  1,
  1,
  false
) ON CONFLICT (id) DO NOTHING;

-- Posts (10 across categories — needs, offers, varying states)

-- Post 1: Active need (home repair)
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, urgency, status, location_hint, available_times, ai_assisted, review_status)
VALUES (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'need',
  'Leaky kitchen faucet — need a hand',
  'My kitchen faucet has been dripping for a week and it''s driving me nuts. I have the replacement cartridge but not the right wrench. Anyone with plumbing experience willing to take a look? Should be a 30-minute job.',
  'home_repair',
  'medium',
  'active',
  'Near Maplewood Park',
  'Weekday evenings after 6pm, Saturday morning',
  false,
  'none'
) ON CONFLICT (id) DO NOTHING;

-- Post 2: Active offer (cooking)
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, urgency, status, available_times, ai_assisted, review_status)
VALUES (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'offer',
  'Meal prep Sunday — extra portions available!',
  'I''m doing my weekly meal prep this Sunday and making way too much. Happy to drop off containers of chicken tikka masala and veggie biryani to anyone nearby. First come, first served — just let me know any dietary restrictions.',
  'cooking_meals',
  null,
  'active',
  'Sunday afternoon',
  false,
  'none'
) ON CONFLICT (id) DO NOTHING;

-- Post 3: Active need (childcare)
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, urgency, status, available_times, ai_assisted, review_status)
VALUES (
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'need',
  'Babysitter needed for Friday evening',
  'Looking for someone to watch my kids (ages 4 and 7) this Friday from 6-9pm. They''ve had dinner, mostly need someone for bath time and bedtime stories. Both are easygoing.',
  'childcare',
  'medium',
  'active',
  'Friday 6-9pm',
  false,
  'none'
) ON CONFLICT (id) DO NOTHING;

-- Post 4: Active offer (tech help) — AI-assisted
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, skills_relevant, status, available_times, ai_assisted, review_status)
VALUES (
  '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'offer',
  'Free tech help for seniors and anyone struggling with devices',
  'I''m a software engineer and I''d love to help anyone in the neighborhood who''s having trouble with their computer, phone, WiFi setup, or smart home devices. No question is too basic. Happy to come to you or meet at the community center.',
  'tech_help',
  ARRAY['computers', 'wifi', 'smartphones', 'smart home'],
  'active',
  'Weekends, most evenings',
  true,
  'none'
) ON CONFLICT (id) DO NOTHING;

-- Post 5: Active need (yard/garden)
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, urgency, status, location_hint, ai_assisted, review_status)
VALUES (
  '00000000-0000-0000-0000-000000000105',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'need',
  'Help moving raised garden beds',
  'I''m rearranging my backyard and need help moving 3 raised garden beds (4x8 cedar, they''re heavy!). Need 2-3 strong people for about an hour. I''ll provide lemonade and cookies!',
  'yard_garden',
  'low',
  'active',
  'Elm Street area',
  false,
  'none'
) ON CONFLICT (id) DO NOTHING;

-- Post 6: Completed post (moving help)
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, urgency, status, ai_assisted, review_status, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000106',
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'need',
  'Help moving a couch to the second floor',
  'Just bought a new sectional and the delivery guys couldn''t get it up the stairs. It''s currently sitting in my garage. Need 2 people with strong backs!',
  'moving',
  'high',
  'completed',
  false,
  'none',
  now() - interval '10 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 7: Active offer (pet care)
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, status, available_times, ai_assisted, review_status)
VALUES (
  '00000000-0000-0000-0000-000000000107',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'offer',
  'Dog walking buddy — I walk the park trail every morning',
  'I walk my golden retriever around Maplewood Park every morning at 7am. If anyone wants a walking buddy or needs their dog exercised while they''re at work, happy to bring yours along! Max 2 extra dogs.',
  'pet_care',
  'active',
  'Every morning 7-8am',
  false,
  'none'
) ON CONFLICT (id) DO NOTHING;

-- Post 8: Active need (tutoring)
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, urgency, status, ai_assisted, review_status)
VALUES (
  '00000000-0000-0000-0000-000000000108',
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000001',
  'need',
  'Math tutoring for 4th grader',
  'My daughter is struggling with fractions and long division. Would love to find someone patient who can work with her for an hour a week. We can host or meet at the library.',
  'tutoring',
  'low',
  'active',
  false,
  'none'
) ON CONFLICT (id) DO NOTHING;

-- Post 9: Auto-hidden post (flagged 3 times) — for testing admin review
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, status, flag_count, hidden, ai_assisted, review_status, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000109',
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'offer',
  'FREE AMAZING DEAL — click here now!!!',
  'This is a test spam post that was auto-hidden by the community flagging system.',
  'other',
  'active',
  3,
  true,
  false,
  'none',
  now() - interval '5 days'
) ON CONFLICT (id) DO NOTHING;

-- Post 10: Active offer (companionship)
INSERT INTO posts (id, author_id, neighborhood_id, type, title, description, category, status, ai_assisted, review_status)
VALUES (
  '00000000-0000-0000-0000-000000000110',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'offer',
  'Coffee and conversation for anyone feeling isolated',
  'If you''re new to the neighborhood, living alone, or just want someone to chat with, I''d love to have you over for coffee. I''ve got a cozy porch and nowhere to be. All ages welcome.',
  'companionship',
  'active',
  false,
  'none'
) ON CONFLICT (id) DO NOTHING;

-- Flags for the spam post
INSERT INTO post_flags (post_id, user_id, reason) VALUES
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000010', 'Looks like spam'),
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000030', 'Suspicious post'),
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000050', null)
ON CONFLICT DO NOTHING;

-- Responses (5 across posts)
INSERT INTO responses (id, post_id, responder_id, message, status) VALUES
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000010', 'I''ve got a basin wrench and 20 years of home repair experience. Free Saturday morning if that works?', 'accepted'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000020', 'The tikka masala sounds amazing! I''d love a container. No allergies.', 'pending'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000020', 'Happy to help! I can bring my friend too — we moved my own beds last summer.', 'pending'),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000010', 'I taught math for 30 years! I''d love to work with your daughter. The library sounds perfect.', 'accepted'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000030', 'My husband and I can help! We''re free this afternoon.', 'accepted')
ON CONFLICT DO NOTHING;

-- Thanks (3 between users)
INSERT INTO thanks (id, from_user, to_user, post_id, message) VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000101', 'Maria, you saved me a plumber bill! The faucet is perfect now. Thank you!'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000106', 'Priya and her husband were lifesavers — couch is upstairs!'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000108', 'Maria is the best tutor! My daughter actually likes fractions now.')
ON CONFLICT DO NOTHING;

-- Invitations (1 used, 1 active)
INSERT INTO invitations (id, code, neighborhood_id, created_by, used_by, expires_at) VALUES
  ('00000000-0000-0000-0000-000000000401', 'MAPLE001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', now() + interval '7 days'),
  ('00000000-0000-0000-0000-000000000402', 'MAPLE002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', null, now() + interval '7 days')
ON CONFLICT DO NOTHING;

-- Membership request (1 pending)
INSERT INTO membership_requests (id, user_id, neighborhood_id, status, message) VALUES
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', 'pending', 'Just moved to Elm Street! Would love to join the community.')
ON CONFLICT DO NOTHING;
