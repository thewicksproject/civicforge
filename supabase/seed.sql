-- ============================================================================
-- CivicForge V2.5 UAT Seed Data
-- ~625 rows across 25 tables, 5 communities, 50 users
-- Run with: npm run db:seed (psql $DATABASE_URL -f supabase/seed.sql)
-- Idempotent: every INSERT uses ON CONFLICT DO NOTHING
-- Requires superuser/service_role to disable FK checks for circular deps
-- ============================================================================

BEGIN;

-- Disable FK checks for circular dependency: communities <-> profiles
SET session_replication_role = 'replica';

-- ============================================================================
-- SECTION 1: Communities (5)
-- UUID pattern: 00000000-0000-0000-0001-NNNNNNNNNNNN
-- ============================================================================

INSERT INTO communities (id, name, city, state, zip_codes, description, created_by, created_at) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Maplewood Heights', 'Portland', 'OR', ARRAY['97201','97205'], 'A friendly tree-lined community near the park. Retired teachers, young families, and avid gardeners look out for each other.', '00000000-0000-0000-0002-000000000001', now() - interval '90 days'),
  ('00000000-0000-0000-0001-000000000002', 'Riverside Commons', 'Austin', 'TX', ARRAY['78701','78702'], 'Young professionals building sustainable community along the river trail. Tech meetups, urban farming, and bike culture.', '00000000-0000-0000-0002-000000000013', now() - interval '88 days'),
  ('00000000-0000-0000-0001-000000000003', 'Harbor Point', 'Baltimore', 'MD', ARRAY['21230','21231'], 'Blue-collar, multigenerational neighborhood near the harbor. Strong trades tradition and mutual aid.', '00000000-0000-0000-0002-000000000024', now() - interval '85 days'),
  ('00000000-0000-0000-0001-000000000004', 'Sunrise on the Monon', 'Carmel', 'IN', ARRAY['46032','46033'], 'Walkable trail neighborhood with strong hearth and weave culture. Porch conversations and block parties.', '00000000-0000-0000-0002-000000000034', now() - interval '75 days'),
  ('00000000-0000-0000-0001-000000000005', 'Sunset Ridge', 'Tucson', 'AZ', ARRAY['85701','85702'], 'Retirees and university students sharing companionship and skills across generations.', '00000000-0000-0000-0002-000000000043', now() - interval '70 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 2: Profiles (50)
-- UUID pattern: 00000000-0000-0000-0002-NNNNNNNNNNNN
-- Distribution: 16 T1, 16 T2, 9 T3, 6 T4, 3 T5
-- ============================================================================

-- === Maplewood Heights (12 users: 3 T1, 4 T2, 2 T3, 2 T4, 1 T5) ===
INSERT INTO profiles (id, display_name, community_id, bio, skills, reputation_score, renown_tier, renown_score, privacy_tier, phone_verified, created_at) VALUES
  ('00000000-0000-0000-0002-000000000001', 'Maria Santos', '00000000-0000-0000-0001-000000000001', 'Retired teacher of 30 years, avid gardener. Founded Maplewood Heights to bring neighbors together.', ARRAY['gardening','tutoring','cooking','organizing','mentoring'], 50, 5, 520, 'mentor', true, now() - interval '90 days'),
  ('00000000-0000-0000-0002-000000000002', 'James Chen', '00000000-0000-0000-0001-000000000001', 'Software engineer and weekend woodworker. Happy to help with tech or home repairs.', ARRAY['tech help','home repair','plumbing','carpentry','woodworking'], 30, 4, 245, 'open', true, now() - interval '88 days'),
  ('00000000-0000-0000-0002-000000000003', 'Priya Patel', '00000000-0000-0000-0001-000000000001', 'Nurse and mom of two. Great at meal prep and first aid.', ARRAY['cooking','childcare','first aid','meal prep'], 25, 4, 210, 'open', true, now() - interval '87 days'),
  ('00000000-0000-0000-0002-000000000004', 'Tom Rodriguez', '00000000-0000-0000-0001-000000000001', 'Retired electrician, handy with anything that has wires. Volunteers at the community center.', ARRAY['electrical','home repair','mentoring'], 18, 3, 85, 'quiet', true, now() - interval '85 days'),
  ('00000000-0000-0000-0002-000000000005', 'Sarah Kim', '00000000-0000-0000-0001-000000000001', 'College student, available most evenings. Loves dogs and tutoring kids.', ARRAY['pet care','tutoring','errands'], 12, 3, 62, 'open', true, now() - interval '80 days'),
  ('00000000-0000-0000-0002-000000000006', 'David Washington', '00000000-0000-0000-0001-000000000001', 'Landscape architect who loves helping neighbors with yard projects.', ARRAY['landscaping','gardening','composting'], 8, 2, 28, 'quiet', true, now() - interval '78 days'),
  ('00000000-0000-0000-0002-000000000007', 'Linda Olsen', '00000000-0000-0000-0001-000000000001', 'Retired librarian. Hosts a weekly book club and loves baking.', ARRAY['baking','organizing','tutoring'], 6, 2, 20, 'open', false, now() - interval '70 days'),
  ('00000000-0000-0000-0002-000000000008', 'Marcus Webb', '00000000-0000-0000-0001-000000000001', 'Plumber by trade, happy to help with leaks and clogs on weekends.', ARRAY['plumbing','home repair'], 5, 2, 15, 'quiet', true, now() - interval '65 days'),
  ('00000000-0000-0000-0002-000000000009', 'Emily Tran', '00000000-0000-0000-0001-000000000001', 'Graphic designer working from home. Can help with flyers and event posters.', ARRAY['design','tech help','event planning'], 4, 2, 12, 'quiet', false, now() - interval '55 days'),
  ('00000000-0000-0000-0002-000000000010', 'Carlos Mendez', '00000000-0000-0000-0001-000000000001', 'Just moved to the neighborhood with my family. Eager to meet everyone!', ARRAY['cooking','moving'], 1, 1, 3, 'ghost', false, now() - interval '20 days'),
  ('00000000-0000-0000-0002-000000000011', 'Aisha Johnson', '00000000-0000-0000-0001-000000000001', 'Nursing student looking for community while finishing school.', ARRAY['first aid','errands'], 0, 1, 0, 'quiet', false, now() - interval '15 days'),
  ('00000000-0000-0000-0002-000000000012', 'Ryan O''Brien', '00000000-0000-0000-0001-000000000001', 'New to Portland, working remotely. Looking for weekend activities.', ARRAY['tech help','hiking'], 0, 1, 0, 'ghost', false, now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- === Riverside Commons (11 users: 3 T1, 4 T2, 2 T3, 1 T4, 1 T5) ===
INSERT INTO profiles (id, display_name, community_id, bio, skills, reputation_score, renown_tier, renown_score, privacy_tier, phone_verified, created_at) VALUES
  ('00000000-0000-0000-0002-000000000013', 'Kai Nakamura', '00000000-0000-0000-0001-000000000002', 'Community organizer and sustainability advocate. Co-founded Riverside Commons.', ARRAY['organizing','composting','event planning','mediation','governance'], 45, 5, 540, 'mentor', true, now() - interval '88 days'),
  ('00000000-0000-0000-0002-000000000014', 'Zoe Martinez', '00000000-0000-0000-0001-000000000002', 'Urban farmer and permaculture teacher. Runs the community garden.', ARRAY['gardening','composting','urban farming','teaching'], 28, 4, 230, 'mentor', true, now() - interval '86 days'),
  ('00000000-0000-0000-0002-000000000015', 'Dev Krishnan', '00000000-0000-0000-0001-000000000002', 'Full-stack developer, bike commuter, and amateur baker.', ARRAY['tech help','baking','cycling'], 16, 3, 75, 'open', true, now() - interval '82 days'),
  ('00000000-0000-0000-0002-000000000016', 'Mia Chang', '00000000-0000-0000-0001-000000000002', 'Environmental scientist working on water quality. Loves trail running.', ARRAY['science','tutoring','running'], 14, 3, 58, 'open', true, now() - interval '78 days'),
  ('00000000-0000-0000-0002-000000000017', 'Jordan Blake', '00000000-0000-0000-0001-000000000002', 'Freelance photographer and community documentarian.', ARRAY['photography','design','event planning'], 7, 2, 22, 'open', true, now() - interval '72 days'),
  ('00000000-0000-0000-0002-000000000018', 'Sofia Reyes', '00000000-0000-0000-0001-000000000002', 'Yoga instructor and meal prep enthusiast. Bilingual English/Spanish.', ARRAY['cooking','teaching','translation'], 5, 2, 16, 'quiet', true, now() - interval '65 days'),
  ('00000000-0000-0000-0002-000000000019', 'Alex Petrov', '00000000-0000-0000-0001-000000000002', 'Mechanical engineer, good with bikes and small engines.', ARRAY['bike repair','mechanical','home repair'], 4, 2, 10, 'quiet', false, now() - interval '58 days'),
  ('00000000-0000-0000-0002-000000000020', 'Hannah Lee', '00000000-0000-0000-0001-000000000002', 'Social worker passionate about intergenerational connection.', ARRAY['counseling','organizing','childcare'], 3, 2, 8, 'open', false, now() - interval '50 days'),
  ('00000000-0000-0000-0002-000000000021', 'Tyler Green', '00000000-0000-0000-0001-000000000002', 'Just graduated from UT Austin. Looking for community outside of campus.', ARRAY['tutoring','errands','tech help'], 1, 1, 2, 'quiet', false, now() - interval '25 days'),
  ('00000000-0000-0000-0002-000000000022', 'Noor Farah', '00000000-0000-0000-0001-000000000002', 'New to Austin, originally from Minneapolis. Love cooking Somali food.', ARRAY['cooking','sewing'], 0, 1, 0, 'ghost', false, now() - interval '18 days'),
  ('00000000-0000-0000-0002-000000000023', 'Ben Torres', '00000000-0000-0000-0001-000000000002', 'Musician and barista, available most mornings.', ARRAY['music','errands'], 0, 1, 0, 'quiet', false, now() - interval '8 days')
ON CONFLICT (id) DO NOTHING;

-- === Harbor Point (10 users: 3 T1, 3 T2, 2 T3, 1 T4, 1 T5) ===
INSERT INTO profiles (id, display_name, community_id, bio, skills, reputation_score, renown_tier, renown_score, privacy_tier, phone_verified, created_at) VALUES
  ('00000000-0000-0000-0002-000000000024', 'Frank Kowalski', '00000000-0000-0000-0001-000000000003', 'Third-generation dockworker turned community builder. Founded Harbor Point to keep the neighborhood strong.', ARRAY['carpentry','plumbing','electrical','mentoring','organizing'], 40, 5, 510, 'open', true, now() - interval '85 days'),
  ('00000000-0000-0000-0002-000000000025', 'Diane Brooks', '00000000-0000-0000-0001-000000000003', 'School bus driver and neighborhood grandma. Knows everyone on the block.', ARRAY['childcare','cooking','transportation','organizing'], 22, 4, 215, 'mentor', true, now() - interval '83 days'),
  ('00000000-0000-0000-0002-000000000026', 'Ray Thompson', '00000000-0000-0000-0001-000000000003', 'Auto mechanic with 25 years experience. Can fix anything with an engine.', ARRAY['auto repair','mechanical','welding'], 15, 3, 70, 'quiet', true, now() - interval '80 days'),
  ('00000000-0000-0000-0002-000000000027', 'Angela Rossi', '00000000-0000-0000-0001-000000000003', 'Runs the corner bakery. Always has extra bread for neighbors.', ARRAY['baking','cooking','event planning'], 13, 3, 55, 'open', true, now() - interval '76 days'),
  ('00000000-0000-0000-0002-000000000028', 'Jerome Davis', '00000000-0000-0000-0001-000000000003', 'Construction foreman, coaches little league on weekends.', ARRAY['construction','carpentry','coaching'], 7, 2, 25, 'quiet', true, now() - interval '70 days'),
  ('00000000-0000-0000-0002-000000000029', 'Patty Nguyen', '00000000-0000-0000-0001-000000000003', 'Retired nurse, volunteers at the free clinic twice a week.', ARRAY['first aid','eldercare','cooking'], 5, 2, 18, 'open', true, now() - interval '62 days'),
  ('00000000-0000-0000-0002-000000000030', 'Mike Sullivan', '00000000-0000-0000-0001-000000000003', 'Off-duty firefighter, always ready to lend a hand.', ARRAY['emergency','home repair','moving'], 4, 2, 11, 'quiet', false, now() - interval '55 days'),
  ('00000000-0000-0000-0002-000000000031', 'Tasha Williams', '00000000-0000-0000-0001-000000000003', 'Single mom working nights. Grateful for the childcare help.', ARRAY['cleaning','errands'], 1, 1, 2, 'ghost', false, now() - interval '30 days'),
  ('00000000-0000-0000-0002-000000000032', 'Eddie Park', '00000000-0000-0000-0001-000000000003', 'College intern at the harbor authority. Learning the trades.', ARRAY['errands','tech help'], 0, 1, 0, 'quiet', false, now() - interval '20 days'),
  ('00000000-0000-0000-0002-000000000033', 'Rosa Hernandez', '00000000-0000-0000-0001-000000000003', 'Just moved from DC. Looking for a tight-knit community.', ARRAY['cooking','translation'], 0, 1, 0, 'quiet', false, now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;

-- === Sunrise on the Monon (9 users: 3 T1, 3 T2, 2 T3, 1 T4, 0 T5) ===
INSERT INTO profiles (id, display_name, community_id, bio, skills, reputation_score, renown_tier, renown_score, privacy_tier, phone_verified, created_at) VALUES
  ('00000000-0000-0000-0002-000000000034', 'Victor Wicks', '00000000-0000-0000-0001-000000000004', 'Builder of CivicForge. Believes neighbors are the original social network.', ARRAY['tech help','organizing','governance','woodworking','cooking'], 20, 4, 220, 'mentor', true, now() - interval '75 days'),
  ('00000000-0000-0000-0002-000000000035', 'Jenny Lawson', '00000000-0000-0000-0001-000000000004', 'Stay-at-home mom who organizes the best block parties on the Monon.', ARRAY['event planning','cooking','childcare','gardening'], 14, 3, 68, 'open', true, now() - interval '72 days'),
  ('00000000-0000-0000-0002-000000000036', 'Rick Adler', '00000000-0000-0000-0001-000000000004', 'Retired teacher, now the unofficial trail historian. Walks the Monon daily.', ARRAY['tutoring','mentoring','writing'], 12, 3, 52, 'open', true, now() - interval '68 days'),
  ('00000000-0000-0000-0002-000000000037', 'Sam Patel', '00000000-0000-0000-0001-000000000004', 'Dentist by day, barbecue pitmaster by weekend. Always smoking something.', ARRAY['cooking','grilling','home repair'], 6, 2, 19, 'quiet', true, now() - interval '60 days'),
  ('00000000-0000-0000-0002-000000000038', 'Claire Dubois', '00000000-0000-0000-0001-000000000004', 'French teacher at Carmel High. Offers free conversational French on Saturdays.', ARRAY['teaching','translation','tutoring'], 4, 2, 13, 'open', false, now() - interval '52 days'),
  ('00000000-0000-0000-0002-000000000039', 'Omar Hassan', '00000000-0000-0000-0001-000000000004', 'IT consultant, helps neighbors with wifi and smart home setup.', ARRAY['tech help','networking','smart home'], 3, 2, 9, 'quiet', true, now() - interval '45 days'),
  ('00000000-0000-0000-0002-000000000040', 'Beth Kowalski', '00000000-0000-0000-0001-000000000004', 'New to the trail neighborhood, loves running and meeting people.', ARRAY['running','pet care'], 1, 1, 2, 'quiet', false, now() - interval '22 days'),
  ('00000000-0000-0000-0002-000000000041', 'Derek Sims', '00000000-0000-0000-0001-000000000004', 'Grad student at IUPUI. Bikes the Monon to campus every day.', ARRAY['bike repair','tutoring'], 0, 1, 0, 'ghost', false, now() - interval '14 days'),
  ('00000000-0000-0000-0002-000000000042', 'Nina Alvarez', '00000000-0000-0000-0001-000000000004', 'Just bought a house off the trail. Excited about the porch culture here!', ARRAY['cooking','gardening'], 0, 1, 0, 'quiet', false, now() - interval '7 days')
ON CONFLICT (id) DO NOTHING;

-- === Sunset Ridge (8 users: 4 T1, 2 T2, 1 T3, 1 T4, 0 T5) ===
INSERT INTO profiles (id, display_name, community_id, bio, skills, reputation_score, renown_tier, renown_score, privacy_tier, phone_verified, created_at) VALUES
  ('00000000-0000-0000-0002-000000000043', 'Gloria Fuentes', '00000000-0000-0000-0001-000000000005', 'Retired professor of sociology. Founded Sunset Ridge to bridge the generation gap.', ARRAY['teaching','mentoring','writing','organizing','governance'], 18, 4, 205, 'mentor', true, now() - interval '70 days'),
  ('00000000-0000-0000-0002-000000000044', 'Harold Jenkins', '00000000-0000-0000-0001-000000000005', 'Vietnam vet, master woodworker. Teaches free classes at the senior center.', ARRAY['woodworking','carpentry','mentoring','teaching'], 13, 3, 56, 'open', true, now() - interval '65 days'),
  ('00000000-0000-0000-0002-000000000045', 'Chloe Dunn', '00000000-0000-0000-0001-000000000005', 'UA grad student in social work. Connects elders with campus volunteers.', ARRAY['counseling','organizing','errands','tutoring'], 5, 2, 17, 'open', true, now() - interval '55 days'),
  ('00000000-0000-0000-0002-000000000046', 'Walt Benson', '00000000-0000-0000-0001-000000000005', 'Retired postal worker, knows every address in the neighborhood.', ARRAY['delivery','errands','transportation'], 4, 2, 14, 'quiet', true, now() - interval '48 days'),
  ('00000000-0000-0000-0002-000000000047', 'Lily Zhang', '00000000-0000-0000-0001-000000000005', 'Pre-med student looking for volunteer hours and community.', ARRAY['first aid','tutoring','errands'], 1, 1, 3, 'quiet', false, now() - interval '28 days'),
  ('00000000-0000-0000-0002-000000000048', 'Bob Whitaker', '00000000-0000-0000-0001-000000000005', 'Recently widowed. Joined to find some company and stay active.', ARRAY['gardening','cooking'], 0, 1, 1, 'ghost', false, now() - interval '22 days'),
  ('00000000-0000-0000-0002-000000000049', 'Jasmine Reed', '00000000-0000-0000-0001-000000000005', 'Freshman at UA. First time living away from home.', ARRAY['pet care','cleaning'], 0, 1, 0, 'quiet', false, now() - interval '12 days'),
  ('00000000-0000-0000-0002-000000000050', 'Art Morales', '00000000-0000-0000-0001-000000000005', 'Semi-retired handyman. Still takes small jobs to keep busy.', ARRAY['home repair','plumbing','electrical'], 0, 1, 0, 'ghost', false, now() - interval '4 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 3: Posts (60)
-- UUID pattern: 00000000-0000-0000-0003-NNNNNNNNNNNN
-- All 12 categories, all 4 statuses, all urgencies, AI-assisted, flagged/hidden
-- ============================================================================

-- === Maplewood Heights posts (15) ===
INSERT INTO posts (id, author_id, community_id, type, title, description, category, urgency, status, location_hint, available_times, ai_assisted, review_status, flag_count, hidden, created_at) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'need', 'Leaky kitchen faucet — need a hand', 'Kitchen faucet has been dripping for a week. I have the replacement cartridge but not the right wrench. Should be a 30-minute job.', 'home_repair', 'medium', 'active', 'Near Maplewood Park', 'Weekday evenings after 6pm', false, 'none', 0, false, now() - interval '82 days'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001', 'offer', 'Meal prep Sunday — extra portions available!', 'Doing weekly meal prep this Sunday. Happy to drop off chicken tikka masala and veggie biryani to anyone nearby.', 'cooking_meals', null, 'active', null, 'Sunday afternoon', false, 'none', 0, false, now() - interval '78 days'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001', 'need', 'Babysitter needed for Friday evening', 'Looking for someone to watch my kids (ages 4 and 7) this Friday from 6-9pm. They have had dinner, mostly need bath time and bedtime stories.', 'childcare', 'medium', 'active', null, 'Friday 6-9pm', false, 'none', 0, false, now() - interval '75 days'),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'offer', 'Free tech help for seniors', 'Software engineer happy to help with computers, phones, WiFi setup, or smart home devices. No question is too basic.', 'tech_help', null, 'active', null, 'Weekends, most evenings', true, 'approved', 0, false, now() - interval '72 days'),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'need', 'Help moving raised garden beds', 'Rearranging backyard, need help moving 3 raised garden beds (4x8 cedar). Need 2-3 strong people for about an hour.', 'yard_garden', 'low', 'completed', 'Elm Street area', null, false, 'none', 0, false, now() - interval '70 days'),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'need', 'Help moving a couch to the second floor', 'Just bought a new sectional and delivery could not get it up the stairs. Need 2 people with strong backs.', 'moving', 'high', 'completed', null, null, false, 'none', 0, false, now() - interval '65 days'),
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'offer', 'Dog walking buddy — morning park trail', 'I walk my golden retriever around Maplewood Park every morning at 7am. Happy to bring your dog along.', 'pet_care', null, 'active', 'Maplewood Park', 'Every morning 7-8am', false, 'none', 0, false, now() - interval '60 days'),
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001', 'need', 'Math tutoring for 4th grader', 'My daughter is struggling with fractions and long division. Would love someone patient for an hour a week.', 'tutoring', 'low', 'in_progress', null, null, false, 'none', 0, false, now() - interval '55 days'),
  ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 'offer', 'FREE AMAZING DEAL — click here now!!!', 'This is a test spam post that was auto-hidden by the community flagging system.', 'other', null, 'active', null, null, false, 'pending_review', 3, true, now() - interval '50 days'),
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 'offer', 'Coffee and conversation for anyone feeling isolated', 'If you are new or living alone, come over for coffee. I have a cozy porch and nowhere to be.', 'companionship', null, 'active', null, null, false, 'none', 0, false, now() - interval '48 days'),
  ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000001', 'offer', 'Fall yard cleanup help available', 'Landscape architect offering free consultations and help raking leaves this fall.', 'yard_garden', null, 'expired', null, 'Saturdays in October', false, 'none', 0, false, now() - interval '45 days'),
  ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000001', 'offer', 'Dog sitting over Thanksgiving break', 'Going home for the holiday? I can watch your dog at my place. Experienced with all sizes.', 'pet_care', null, 'active', null, 'Nov 20-30', false, 'none', 0, false, now() - interval '30 days'),
  ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000001', 'need', 'Need ride to airport early Monday morning', 'Flight at 6am, need a ride by 4am. Happy to pay for gas.', 'transportation', 'high', 'active', null, 'Monday 4am', true, 'pending_review', 0, false, now() - interval '10 days'),
  ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000001', 'offer', 'Homemade cookies for new neighbors', 'Just baked a huge batch. If you moved in recently, let me know and I will bring some over!', 'cooking_meals', null, 'active', null, null, false, 'none', 0, false, now() - interval '8 days'),
  ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000001', 'need', 'Quick errand — pharmacy pickup', 'Stuck in a deadline and need my prescription picked up before pharmacy closes at 6. Will be quick!', 'errands', 'high', 'completed', null, 'Today before 6pm', true, 'approved', 0, false, now() - interval '3 days')
ON CONFLICT (id) DO NOTHING;

-- === Riverside Commons posts (13) ===
INSERT INTO posts (id, author_id, community_id, type, title, description, category, urgency, status, location_hint, available_times, ai_assisted, review_status, flag_count, hidden, created_at) VALUES
  ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0001-000000000002', 'offer', 'Community garden volunteer day', 'Join us Saturday morning to plant the winter cover crop. No experience needed!', 'yard_garden', null, 'active', 'River Trail Community Garden', 'Saturday 9am-noon', false, 'none', 0, false, now() - interval '80 days'),
  ('00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0002-000000000015', '00000000-0000-0000-0001-000000000002', 'offer', 'Bike tune-up clinic this weekend', 'Bringing my tools to the park pavilion. Basic tune-ups, brake adjustments, tire changes — all free.', 'other', null, 'completed', 'Park pavilion', 'Saturday 10am-2pm', false, 'none', 0, false, now() - interval '75 days'),
  ('00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0002-000000000016', '00000000-0000-0000-0001-000000000002', 'need', 'Help testing water quality in local creek', 'Need volunteers to help collect water samples at 5 points along Shoal Creek.', 'other', 'low', 'in_progress', 'Shoal Creek', 'Weekend mornings', false, 'none', 0, false, now() - interval '68 days'),
  ('00000000-0000-0000-0003-000000000019', '00000000-0000-0000-0002-000000000018', '00000000-0000-0000-0001-000000000002', 'offer', 'Spanish conversation practice over lunch', 'Native speaker offering casual practice over tacos. All levels welcome.', 'companionship', null, 'active', null, 'Tuesdays noon', false, 'none', 0, false, now() - interval '60 days'),
  ('00000000-0000-0000-0003-000000000020', '00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0001-000000000002', 'offer', 'Free headshots for community members', 'Professional photographer offering free headshots. Great for LinkedIn or community profiles.', 'other', null, 'active', null, 'By appointment', false, 'none', 0, false, now() - interval '55 days'),
  ('00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000002', 'need', 'Volunteers for trail cleanup day', 'Riverside Commons monthly cleanup. Bags and gloves provided. Bring water.', 'yard_garden', 'medium', 'completed', 'River Trail mile 3-5', 'First Saturday 8am', false, 'none', 0, false, now() - interval '50 days'),
  ('00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0002-000000000019', '00000000-0000-0000-0001-000000000002', 'offer', 'Bike repair — small engine work too', 'Mechanical engineer happy to fix bikes or troubleshoot lawn mowers and small engines.', 'home_repair', null, 'active', null, 'Weekends', false, 'none', 0, false, now() - interval '42 days'),
  ('00000000-0000-0000-0003-000000000023', '00000000-0000-0000-0002-000000000020', '00000000-0000-0000-0001-000000000002', 'need', 'Childcare swap — Tuesday/Thursday afternoons', 'Looking for another parent to trade childcare. I take yours Tuesday, you take mine Thursday.', 'childcare', 'medium', 'active', null, 'Tue/Thu 2-5pm', false, 'none', 0, false, now() - interval '35 days'),
  ('00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0002-000000000021', '00000000-0000-0000-0001-000000000002', 'need', 'Looking for Python tutor', 'Want to learn Python for data analysis. Happy to trade tutoring in math or writing.', 'tutoring', 'low', 'active', null, null, true, 'approved', 0, false, now() - interval '22 days'),
  ('00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0002-000000000022', '00000000-0000-0000-0001-000000000002', 'offer', 'Somali cooking class — this Saturday', 'Teaching how to make sambusa and bariis. All ingredients provided. Donations welcome.', 'cooking_meals', null, 'active', null, 'Saturday 3-6pm', false, 'none', 0, false, now() - interval '15 days'),
  ('00000000-0000-0000-0003-000000000026', '00000000-0000-0000-0002-000000000015', '00000000-0000-0000-0001-000000000002', 'need', 'Help setting up projector for movie night', 'Planning outdoor movie night and need help with the AV setup. Have projector but need a screen solution.', 'tech_help', 'medium', 'active', 'Community pavilion', 'Friday evening', false, 'none', 0, false, now() - interval '5 days'),
  ('00000000-0000-0000-0003-000000000027', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0001-000000000002', 'offer', 'Compost bin building workshop', 'Learn to build your own 3-bin composting system. Materials cost ~$40, labor is free.', 'yard_garden', null, 'active', 'Community garden shed', 'Next Saturday 9am', false, 'none', 0, false, now() - interval '2 days'),
  ('00000000-0000-0000-0003-000000000028', '00000000-0000-0000-0002-000000000023', '00000000-0000-0000-0001-000000000002', 'need', 'Moving help — studio apartment', 'Moving to a new place just 2 blocks away. Not much stuff but need help with the couch and bookshelf.', 'moving', 'medium', 'active', null, 'This weekend', false, 'none', 0, false, now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- === Harbor Point posts (12) ===
INSERT INTO posts (id, author_id, community_id, type, title, description, category, urgency, status, location_hint, available_times, ai_assisted, review_status, flag_count, hidden, created_at) VALUES
  ('00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0001-000000000003', 'need', 'Porch railing repair — rotted posts', 'Three porch rail posts need replacing. I have the lumber, need someone who knows their way around a saw.', 'home_repair', 'medium', 'completed', 'Harbor Ave', null, false, 'none', 0, false, now() - interval '78 days'),
  ('00000000-0000-0000-0003-000000000030', '00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0001-000000000003', 'offer', 'After-school pickup and snacks', 'I pick up my grandkids from PS 42 at 3pm. Happy to grab yours too. Snacks and homework help until 5:30.', 'childcare', null, 'active', 'PS 42 school', 'Weekdays 3-5:30pm', false, 'none', 0, false, now() - interval '72 days'),
  ('00000000-0000-0000-0003-000000000031', '00000000-0000-0000-0002-000000000026', '00000000-0000-0000-0001-000000000003', 'offer', 'Free car diagnostic — bring your check engine light', 'Auto mechanic offering free OBD scans and basic diagnostics. Save yourself a shop visit.', 'other', null, 'active', 'Ray''s garage on 5th', 'Saturdays 8am-noon', false, 'none', 0, false, now() - interval '65 days'),
  ('00000000-0000-0000-0003-000000000032', '00000000-0000-0000-0002-000000000027', '00000000-0000-0000-0001-000000000003', 'offer', 'Fresh bread every Wednesday', 'Bakery has day-olds every Wednesday evening. Free to neighbors — just come by before 7pm.', 'cooking_meals', null, 'active', 'Rossi''s Bakery', 'Wednesdays before 7pm', false, 'none', 0, false, now() - interval '58 days'),
  ('00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0002-000000000028', '00000000-0000-0000-0001-000000000003', 'need', 'Volunteers for little league field cleanup', 'Season starts in 2 weeks. Field needs weeding, line painting, and backstop repair.', 'yard_garden', 'medium', 'completed', 'Harbor Point Field', 'This Saturday 8am', false, 'none', 0, false, now() - interval '52 days'),
  ('00000000-0000-0000-0003-000000000034', '00000000-0000-0000-0002-000000000029', '00000000-0000-0000-0001-000000000003', 'offer', 'Blood pressure checks — free clinic', 'Come by the community center Thursday for free BP checks and health questions.', 'other', null, 'active', 'Community center', 'Thursdays 10am-1pm', false, 'none', 0, false, now() - interval '45 days'),
  ('00000000-0000-0000-0003-000000000035', '00000000-0000-0000-0002-000000000030', '00000000-0000-0000-0001-000000000003', 'offer', 'Smoke detector battery check', 'Firefighter offering free home safety checks — smoke detectors, CO alarms, fire extinguisher inspection.', 'home_repair', null, 'active', null, 'By appointment', false, 'none', 0, false, now() - interval '38 days'),
  ('00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0002-000000000031', '00000000-0000-0000-0001-000000000003', 'need', 'Evening childcare — night shift worker', 'Work 7pm-7am three nights a week. Need someone reliable for my 6-year-old on those evenings.', 'childcare', 'high', 'in_progress', null, 'Mon/Wed/Fri evenings', false, 'none', 0, false, now() - interval '28 days'),
  ('00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0001-000000000003', 'need', 'Wheelchair ramp for front porch', 'Building a ramp for elderly neighbor. Need help with concrete footings and lumber framing.', 'home_repair', 'high', 'in_progress', 'Oak Street', null, false, 'none', 0, false, now() - interval '18 days'),
  ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0002-000000000032', '00000000-0000-0000-0001-000000000003', 'need', 'Help with resume and job applications', 'Looking for someone to review my resume and help with cover letters. First real job search.', 'other', 'medium', 'active', null, null, true, 'approved', 0, false, now() - interval '12 days'),
  ('00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0001-000000000003', 'need', 'Ride to doctor appointment', 'Need a ride to Johns Hopkins outpatient on Tuesday at 10am. Should be back by noon.', 'transportation', 'medium', 'active', null, 'Tuesday 10am', false, 'none', 0, false, now() - interval '6 days'),
  ('00000000-0000-0000-0003-000000000040', '00000000-0000-0000-0002-000000000033', '00000000-0000-0000-0001-000000000003', 'offer', 'Tamales for the block — holiday tradition', 'Making 200 tamales this weekend. Pork, chicken, and veggie. Come by Saturday after 2pm.', 'cooking_meals', null, 'active', null, 'Saturday after 2pm', false, 'none', 0, false, now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- === Sunrise on the Monon posts (11) ===
INSERT INTO posts (id, author_id, community_id, type, title, description, category, urgency, status, location_hint, available_times, ai_assisted, review_status, flag_count, hidden, created_at) VALUES
  ('00000000-0000-0000-0003-000000000041', '00000000-0000-0000-0002-000000000034', '00000000-0000-0000-0001-000000000004', 'offer', 'Smart home setup help', 'Happy to help neighbors get their smart locks, thermostats, and cameras working together.', 'tech_help', null, 'active', null, 'Evenings and weekends', false, 'none', 0, false, now() - interval '70 days'),
  ('00000000-0000-0000-0003-000000000042', '00000000-0000-0000-0002-000000000035', '00000000-0000-0000-0001-000000000004', 'offer', 'Block party planning committee', 'Starting to plan the annual Monon block party. Need volunteers for food, music, and activities.', 'other', null, 'active', 'Monon Trail at Main St', null, false, 'none', 0, false, now() - interval '62 days'),
  ('00000000-0000-0000-0003-000000000043', '00000000-0000-0000-0002-000000000036', '00000000-0000-0000-0001-000000000004', 'offer', 'Walking history tour of the Monon', 'Retired teacher offering guided walks along the trail with local history stories.', 'companionship', null, 'active', 'Monon trailhead', 'Saturday mornings', false, 'none', 0, false, now() - interval '55 days'),
  ('00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0002-000000000037', '00000000-0000-0000-0001-000000000004', 'offer', 'Weekend BBQ — bring a side dish', 'Smoking brisket and ribs this Saturday. Everyone welcome, just bring a side or dessert.', 'cooking_meals', null, 'completed', 'Sam''s backyard', 'Saturday noon', false, 'none', 0, false, now() - interval '48 days'),
  ('00000000-0000-0000-0003-000000000045', '00000000-0000-0000-0002-000000000038', '00000000-0000-0000-0001-000000000004', 'offer', 'French conversation over coffee', 'Native French speaker offering casual conversation practice. Beginners welcome!', 'tutoring', null, 'active', 'Local coffee shop', 'Saturdays 10am', false, 'none', 0, false, now() - interval '42 days'),
  ('00000000-0000-0000-0003-000000000046', '00000000-0000-0000-0002-000000000039', '00000000-0000-0000-0001-000000000004', 'offer', 'WiFi troubleshooting for the block', 'IT consultant here. If your internet is slow or spotty, I can help optimize your setup for free.', 'tech_help', null, 'active', null, 'Evenings', false, 'none', 0, false, now() - interval '35 days'),
  ('00000000-0000-0000-0003-000000000047', '00000000-0000-0000-0002-000000000034', '00000000-0000-0000-0001-000000000004', 'need', 'Help building a Little Free Library', 'Want to build and install a Little Free Library near the trailhead. Need help with construction.', 'home_repair', 'low', 'in_progress', 'Monon trailhead', null, false, 'none', 0, false, now() - interval '25 days'),
  ('00000000-0000-0000-0003-000000000048', '00000000-0000-0000-0002-000000000040', '00000000-0000-0000-0001-000000000004', 'need', 'Running buddy for morning Monon runs', 'New to the neighborhood, looking for someone to run with. I do 3-5 miles, any pace.', 'companionship', null, 'active', 'Monon Trail', 'Weekday mornings 6am', false, 'none', 0, false, now() - interval '18 days'),
  ('00000000-0000-0000-0003-000000000049', '00000000-0000-0000-0002-000000000041', '00000000-0000-0000-0001-000000000004', 'need', 'Bike flat repair tools?', 'Got a flat on the Monon and do not have a patch kit. Anyone nearby who can help?', 'errands', 'high', 'completed', 'Monon Trail mile marker 2', 'ASAP', false, 'none', 0, false, now() - interval '12 days'),
  ('00000000-0000-0000-0003-000000000050', '00000000-0000-0000-0002-000000000035', '00000000-0000-0000-0001-000000000004', 'need', 'Porch light installation', 'Bought new porch lights but nervous about electrical work. Anyone handy with wiring?', 'home_repair', 'low', 'active', null, null, false, 'none', 0, false, now() - interval '6 days'),
  ('00000000-0000-0000-0003-000000000051', '00000000-0000-0000-0002-000000000042', '00000000-0000-0000-0001-000000000004', 'need', 'Gardening advice for Indiana clay soil', 'First-time homeowner, the soil is pure clay. What can I even grow here?', 'yard_garden', 'low', 'active', null, null, true, 'pending_review', 0, false, now() - interval '3 days')
ON CONFLICT (id) DO NOTHING;

-- === Sunset Ridge posts (9) ===
INSERT INTO posts (id, author_id, community_id, type, title, description, category, urgency, status, location_hint, available_times, ai_assisted, review_status, flag_count, hidden, created_at) VALUES
  ('00000000-0000-0000-0003-000000000052', '00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0001-000000000005', 'offer', 'Writing workshop for memoirs', 'Retired professor offering a free 4-week memoir writing workshop at the senior center.', 'tutoring', null, 'active', 'Senior center', 'Wednesdays 2-4pm', false, 'none', 0, false, now() - interval '60 days'),
  ('00000000-0000-0000-0003-000000000053', '00000000-0000-0000-0002-000000000044', '00000000-0000-0000-0001-000000000005', 'offer', 'Woodworking basics — learn to build a birdhouse', 'Master woodworker teaching free classes. This week: build your own birdhouse from scrap wood.', 'other', null, 'active', 'Senior center workshop', 'Saturdays 10am', false, 'none', 0, false, now() - interval '52 days'),
  ('00000000-0000-0000-0003-000000000054', '00000000-0000-0000-0002-000000000045', '00000000-0000-0000-0001-000000000005', 'offer', 'Campus volunteers for elder visits', 'Connecting UA students with homebound elders for weekly companionship visits.', 'companionship', null, 'active', null, 'Flexible', false, 'none', 0, false, now() - interval '45 days'),
  ('00000000-0000-0000-0003-000000000055', '00000000-0000-0000-0002-000000000046', '00000000-0000-0000-0001-000000000005', 'offer', 'Grocery delivery for homebound neighbors', 'I drive by Safeway every day. Happy to pick up groceries for anyone who cannot get out.', 'errands', null, 'active', null, 'Daily after 4pm', false, 'none', 0, false, now() - interval '38 days'),
  ('00000000-0000-0000-0003-000000000056', '00000000-0000-0000-0002-000000000048', '00000000-0000-0000-0001-000000000005', 'need', 'Looking for card game group', 'Recently widowed and looking for regular social activity. Anyone play bridge or canasta?', 'companionship', null, 'active', null, 'Afternoons', false, 'none', 0, false, now() - interval '20 days'),
  ('00000000-0000-0000-0003-000000000057', '00000000-0000-0000-0002-000000000047', '00000000-0000-0000-0001-000000000005', 'need', 'Study group for MCAT prep', 'Looking for other pre-med students to form a study group.', 'tutoring', 'low', 'active', 'UA library', 'Evenings', false, 'none', 0, false, now() - interval '15 days'),
  ('00000000-0000-0000-0003-000000000058', '00000000-0000-0000-0002-000000000050', '00000000-0000-0000-0001-000000000005', 'offer', 'Handyman services — small jobs', 'Semi-retired but still sharp. Can fix leaky faucets, sticky doors, wobbly furniture.', 'home_repair', null, 'active', null, 'Weekdays', false, 'none', 0, false, now() - interval '3 days'),
  ('00000000-0000-0000-0003-000000000059', '00000000-0000-0000-0002-000000000049', '00000000-0000-0000-0001-000000000005', 'need', 'Pet sitter for winter break', 'Going home for 3 weeks in December. Need someone for my cat (very chill, just needs food and cuddles).', 'pet_care', 'low', 'active', null, 'Dec 15-Jan 5', false, 'none', 0, false, now() - interval '2 days'),
  ('00000000-0000-0000-0003-000000000060', '00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0001-000000000005', 'need', 'Help with slow laptop — possible malware', 'My laptop has been running slow and getting pop-ups. Can anyone take a look?', 'tech_help', 'medium', 'active', null, null, false, 'none', 1, false, now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 4: Post Photos (8)
-- UUID pattern: 00000000-0000-0000-0005-NNNNNNNNNNNN
-- ============================================================================

INSERT INTO post_photos (id, post_id, url, thumbnail_url, uploaded_by, created_at) VALUES
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0003-000000000005', 'https://placeholder.civicforge.org/photos/garden-beds-1.jpg', 'https://placeholder.civicforge.org/photos/thumbs/garden-beds-1.jpg', '00000000-0000-0000-0002-000000000001', now() - interval '70 days'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0003-000000000005', 'https://placeholder.civicforge.org/photos/garden-beds-2.jpg', 'https://placeholder.civicforge.org/photos/thumbs/garden-beds-2.jpg', '00000000-0000-0000-0002-000000000001', now() - interval '70 days'),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0003-000000000016', 'https://placeholder.civicforge.org/photos/community-garden.jpg', 'https://placeholder.civicforge.org/photos/thumbs/community-garden.jpg', '00000000-0000-0000-0002-000000000014', now() - interval '80 days'),
  ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0003-000000000017', 'https://placeholder.civicforge.org/photos/bike-clinic.jpg', 'https://placeholder.civicforge.org/photos/thumbs/bike-clinic.jpg', '00000000-0000-0000-0002-000000000015', now() - interval '75 days'),
  ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0003-000000000029', 'https://placeholder.civicforge.org/photos/porch-railing.jpg', 'https://placeholder.civicforge.org/photos/thumbs/porch-railing.jpg', '00000000-0000-0000-0002-000000000024', now() - interval '78 days'),
  ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0003-000000000033', 'https://placeholder.civicforge.org/photos/field-cleanup.jpg', 'https://placeholder.civicforge.org/photos/thumbs/field-cleanup.jpg', '00000000-0000-0000-0002-000000000028', now() - interval '52 days'),
  ('00000000-0000-0000-0005-000000000007', '00000000-0000-0000-0003-000000000044', 'https://placeholder.civicforge.org/photos/bbq-spread.jpg', 'https://placeholder.civicforge.org/photos/thumbs/bbq-spread.jpg', '00000000-0000-0000-0002-000000000037', now() - interval '48 days'),
  ('00000000-0000-0000-0005-000000000008', '00000000-0000-0000-0003-000000000047', 'https://placeholder.civicforge.org/photos/little-library-wip.jpg', 'https://placeholder.civicforge.org/photos/thumbs/little-library-wip.jpg', '00000000-0000-0000-0002-000000000034', now() - interval '25 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 5: Post Flags (12)
-- UUID pattern: 00000000-0000-0000-0004-NNNNNNNNNNNN
-- flag_count 1, 2, 3+ scenarios
-- ============================================================================

INSERT INTO post_flags (id, post_id, user_id, reason, created_at) VALUES
  -- Post 9 (spam) — 3 flags, hidden
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000001', 'Looks like spam', now() - interval '49 days'),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000003', 'Suspicious post, not a real offer', now() - interval '49 days'),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000005', null, now() - interval '48 days'),
  -- Post 60 (laptop help) — 1 flag
  ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0003-000000000060', '00000000-0000-0000-0002-000000000044', 'Might be soliciting free IT services', now() - interval '1 day'),
  -- Additional flags across communities for coverage
  ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000004', 'Seems like they want to charge for the ride', now() - interval '9 days'),
  ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000007', 'AI-generated content needs review', now() - interval '9 days'),
  ('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0003-000000000020', '00000000-0000-0000-0002-000000000016', 'Might be a commercial photography ad', now() - interval '54 days'),
  ('00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0002-000000000021', 'Seems like a business advertisement', now() - interval '41 days'),
  ('00000000-0000-0000-0004-000000000009', '00000000-0000-0000-0003-000000000031', '00000000-0000-0000-0002-000000000031', 'Is this actually free?', now() - interval '64 days'),
  ('00000000-0000-0000-0004-000000000010', '00000000-0000-0000-0003-000000000042', '00000000-0000-0000-0002-000000000040', 'Not clear what help is needed', now() - interval '61 days'),
  ('00000000-0000-0000-0004-000000000011', '00000000-0000-0000-0003-000000000051', '00000000-0000-0000-0002-000000000037', 'AI-generated post needs human review', now() - interval '2 days'),
  ('00000000-0000-0000-0004-000000000012', '00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0002-000000000017', 'Mentions donations — is this commercial?', now() - interval '14 days')
ON CONFLICT (post_id, user_id) DO NOTHING;

-- ============================================================================
-- SECTION 6: Responses (40)
-- UUID pattern: 00000000-0000-0000-0006-NNNNNNNNNNNN
-- All 3 statuses: pending, accepted, declined
-- ============================================================================

INSERT INTO responses (id, post_id, responder_id, message, status, created_at) VALUES
  -- Maplewood responses
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000004', 'I have a basin wrench and 20 years of experience. Free Saturday morning?', 'accepted', now() - interval '81 days'),
  ('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000008', 'Plumber here, happy to help if Tom is busy.', 'declined', now() - interval '81 days'),
  ('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000002', 'The tikka masala sounds amazing! No allergies.', 'accepted', now() - interval '77 days'),
  ('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000005', 'I love kids! Available Friday evening.', 'accepted', now() - interval '74 days'),
  ('00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000002', 'Happy to help! I can bring my friend too.', 'accepted', now() - interval '69 days'),
  ('00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000006', 'Count me in. I have a wheelbarrow.', 'accepted', now() - interval '69 days'),
  ('00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000003', 'My husband and I can help this afternoon!', 'accepted', now() - interval '64 days'),
  ('00000000-0000-0000-0006-000000000008', '00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000001', 'I taught math for 30 years! The library sounds perfect.', 'accepted', now() - interval '54 days'),
  ('00000000-0000-0000-0006-000000000009', '00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000011', 'I would love to come by. Just moved here and do not know anyone yet.', 'pending', now() - interval '14 days'),
  ('00000000-0000-0000-0006-000000000010', '00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000010', 'Can you watch my golden retriever? He is very friendly.', 'pending', now() - interval '28 days'),
  ('00000000-0000-0000-0006-000000000011', '00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0002-000000000005', 'I can run by the pharmacy, it is on my way home.', 'accepted', now() - interval '3 days'),
  -- Riverside responses
  ('00000000-0000-0000-0006-000000000012', '00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0002-000000000017', 'I will be there with my camera to document the event!', 'accepted', now() - interval '79 days'),
  ('00000000-0000-0000-0006-000000000013', '00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0002-000000000021', 'Never done gardening but want to learn. Count me in!', 'accepted', now() - interval '79 days'),
  ('00000000-0000-0000-0006-000000000014', '00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0002-000000000019', 'I can help with the mechanical side. I will bring my bike stand.', 'accepted', now() - interval '74 days'),
  ('00000000-0000-0000-0006-000000000015', '00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0002-000000000015', 'I have water testing kits from my lab work. Happy to donate some.', 'accepted', now() - interval '67 days'),
  ('00000000-0000-0000-0006-000000000016', '00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0002-000000000017', 'I will do photos before and after for the community page.', 'accepted', now() - interval '49 days'),
  ('00000000-0000-0000-0006-000000000017', '00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0002-000000000020', 'Bringing my kids — teaching them about community service.', 'accepted', now() - interval '49 days'),
  ('00000000-0000-0000-0006-000000000018', '00000000-0000-0000-0003-000000000023', '00000000-0000-0000-0002-000000000018', 'My daughter is the same age! This would be perfect.', 'pending', now() - interval '34 days'),
  ('00000000-0000-0000-0006-000000000019', '00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0002-000000000015', 'I am a full-stack dev and can teach Python. Want to meet at the library?', 'accepted', now() - interval '21 days'),
  ('00000000-0000-0000-0006-000000000020', '00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0002-000000000018', 'I would love to come! Can I bring a friend?', 'pending', now() - interval '14 days'),
  ('00000000-0000-0000-0006-000000000021', '00000000-0000-0000-0003-000000000026', '00000000-0000-0000-0002-000000000019', 'I have a portable projector screen you can borrow.', 'pending', now() - interval '4 days'),
  ('00000000-0000-0000-0006-000000000022', '00000000-0000-0000-0003-000000000028', '00000000-0000-0000-0002-000000000019', 'I have a truck and can help. Saturday morning work?', 'pending', now() - interval '1 day'),
  -- Harbor Point responses
  ('00000000-0000-0000-0006-000000000023', '00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0002-000000000028', 'I have done this exact job before. I will bring my circular saw.', 'accepted', now() - interval '77 days'),
  ('00000000-0000-0000-0006-000000000024', '00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0002-000000000030', 'I am in. I will bring the line painter from the fire station.', 'accepted', now() - interval '51 days'),
  ('00000000-0000-0000-0006-000000000025', '00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0002-000000000026', 'Count me in for the backstop repair.', 'accepted', now() - interval '51 days'),
  ('00000000-0000-0000-0006-000000000026', '00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0002-000000000025', 'I can watch your little one Mon/Wed. My grandkids will be here too.', 'accepted', now() - interval '27 days'),
  ('00000000-0000-0000-0006-000000000027', '00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0002-000000000028', 'I have framing experience. Let me know when to start.', 'accepted', now() - interval '17 days'),
  ('00000000-0000-0000-0006-000000000028', '00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0002-000000000030', 'I can help with the concrete work.', 'accepted', now() - interval '17 days'),
  ('00000000-0000-0000-0006-000000000029', '00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0002-000000000025', 'I used to help with hiring. Happy to review your resume.', 'accepted', now() - interval '11 days'),
  ('00000000-0000-0000-0006-000000000030', '00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0002-000000000030', 'I can drive you. My truck is comfortable.', 'pending', now() - interval '5 days'),
  -- Sunrise on the Monon responses
  ('00000000-0000-0000-0006-000000000031', '00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0002-000000000035', 'I will bring my famous mac and cheese!', 'accepted', now() - interval '47 days'),
  ('00000000-0000-0000-0006-000000000032', '00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0002-000000000038', 'I will bring a French apple tart for dessert.', 'accepted', now() - interval '47 days'),
  ('00000000-0000-0000-0006-000000000033', '00000000-0000-0000-0003-000000000047', '00000000-0000-0000-0002-000000000037', 'I have some scrap lumber that would be perfect for this.', 'accepted', now() - interval '24 days'),
  ('00000000-0000-0000-0006-000000000034', '00000000-0000-0000-0003-000000000049', '00000000-0000-0000-0002-000000000039', 'I have a patch kit in my garage. I will walk it over.', 'accepted', now() - interval '12 days'),
  ('00000000-0000-0000-0006-000000000035', '00000000-0000-0000-0003-000000000050', '00000000-0000-0000-0002-000000000034', 'I can help with the wiring. Done it many times.', 'pending', now() - interval '5 days'),
  -- Sunset Ridge responses
  ('00000000-0000-0000-0006-000000000036', '00000000-0000-0000-0003-000000000052', '00000000-0000-0000-0002-000000000048', 'I have so many stories to tell. Is it OK for a beginner writer?', 'accepted', now() - interval '59 days'),
  ('00000000-0000-0000-0006-000000000037', '00000000-0000-0000-0003-000000000054', '00000000-0000-0000-0002-000000000047', 'I would love to volunteer! I am free Thursday afternoons.', 'accepted', now() - interval '44 days'),
  ('00000000-0000-0000-0006-000000000038', '00000000-0000-0000-0003-000000000056', '00000000-0000-0000-0002-000000000044', 'I play bridge! Tuesdays work for me.', 'accepted', now() - interval '19 days'),
  ('00000000-0000-0000-0006-000000000039', '00000000-0000-0000-0003-000000000056', '00000000-0000-0000-0002-000000000043', 'I know canasta! Would love a regular game.', 'accepted', now() - interval '19 days'),
  ('00000000-0000-0000-0006-000000000040', '00000000-0000-0000-0003-000000000059', '00000000-0000-0000-0002-000000000045', 'I love cats! Happy to stop by daily.', 'pending', now() - interval '1 day')
ON CONFLICT (post_id, responder_id) DO NOTHING;

-- ============================================================================
-- SECTION 7: Thanks (20)
-- UUID pattern: 00000000-0000-0000-0007-NNNNNNNNNNNN
-- Linked to completed posts
-- ============================================================================

INSERT INTO thanks (id, from_user, to_user, post_id, message, created_at) VALUES
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0003-000000000001', 'Tom, you saved me a plumber bill! Faucet is perfect now.', now() - interval '80 days'),
  ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000005', 'James and crew moved those garden beds in no time!', now() - interval '68 days'),
  ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0003-000000000005', 'David, your wheelbarrow was a lifesaver!', now() - interval '68 days'),
  ('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0003-000000000006', 'Priya and her husband were lifesavers — couch is upstairs!', now() - interval '63 days'),
  ('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000008', 'Maria is the best tutor! My daughter actually likes fractions now.', now() - interval '45 days'),
  ('00000000-0000-0000-0007-000000000006', '00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0003-000000000015', 'Sarah got my prescription just in time. Thank you!', now() - interval '2 days'),
  ('00000000-0000-0000-0007-000000000007', '00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0003-000000000016', 'Great photos of the garden planting day, Jordan!', now() - interval '78 days'),
  ('00000000-0000-0000-0007-000000000008', '00000000-0000-0000-0002-000000000015', '00000000-0000-0000-0002-000000000019', '00000000-0000-0000-0003-000000000017', 'Alex was a huge help at the bike clinic. Thanks!', now() - interval '73 days'),
  ('00000000-0000-0000-0007-000000000009', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0002-000000000017', '00000000-0000-0000-0003-000000000021', 'Jordan documented the whole trail cleanup beautifully.', now() - interval '48 days'),
  ('00000000-0000-0000-0007-000000000010', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0002-000000000020', '00000000-0000-0000-0003-000000000021', 'Hannah brought her kids and they were amazing helpers!', now() - interval '48 days'),
  ('00000000-0000-0000-0007-000000000011', '00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0002-000000000028', '00000000-0000-0000-0003-000000000029', 'Jerome did beautiful work on the porch railing. Good as new.', now() - interval '76 days'),
  ('00000000-0000-0000-0007-000000000012', '00000000-0000-0000-0002-000000000028', '00000000-0000-0000-0002-000000000030', '00000000-0000-0000-0003-000000000033', 'Mike brought the line painter and the field looks amazing.', now() - interval '50 days'),
  ('00000000-0000-0000-0007-000000000013', '00000000-0000-0000-0002-000000000028', '00000000-0000-0000-0002-000000000026', '00000000-0000-0000-0003-000000000033', 'Ray fixed the backstop perfectly. Thank you!', now() - interval '50 days'),
  ('00000000-0000-0000-0007-000000000014', '00000000-0000-0000-0002-000000000037', '00000000-0000-0000-0002-000000000035', '00000000-0000-0000-0003-000000000044', 'Jenny''s mac and cheese was the hit of the BBQ!', now() - interval '46 days'),
  ('00000000-0000-0000-0007-000000000015', '00000000-0000-0000-0002-000000000037', '00000000-0000-0000-0002-000000000038', '00000000-0000-0000-0003-000000000044', 'Claire''s apple tart was magnifique!', now() - interval '46 days'),
  ('00000000-0000-0000-0007-000000000016', '00000000-0000-0000-0002-000000000041', '00000000-0000-0000-0002-000000000039', '00000000-0000-0000-0003-000000000049', 'Omar walked over with a patch kit in 5 minutes. Saved my commute!', now() - interval '11 days'),
  ('00000000-0000-0000-0007-000000000017', '00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0002-000000000048', '00000000-0000-0000-0003-000000000052', 'Bob, your memoir chapter about the post office was wonderful.', now() - interval '55 days'),
  ('00000000-0000-0000-0007-000000000018', '00000000-0000-0000-0002-000000000048', '00000000-0000-0000-0002-000000000044', '00000000-0000-0000-0003-000000000056', 'Harold is a great bridge partner. Made my week!', now() - interval '15 days'),
  ('00000000-0000-0000-0007-000000000019', '00000000-0000-0000-0002-000000000048', '00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0003-000000000056', 'Gloria knows every canasta trick in the book!', now() - interval '15 days'),
  ('00000000-0000-0000-0007-000000000020', '00000000-0000-0000-0002-000000000032', '00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0003-000000000038', 'Diane helped me rewrite my resume and I already got an interview!', now() - interval '8 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 8: Invitations (15)
-- UUID pattern: 00000000-0000-0000-0008-NNNNNNNNNNNN
-- Used, active, expired
-- ============================================================================

INSERT INTO invitations (id, code, community_id, created_by, used_by, expires_at, created_at) VALUES
  -- Maplewood (5)
  ('00000000-0000-0000-0008-000000000001', 'MAPLE001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000002', now() + interval '7 days', now() - interval '89 days'),
  ('00000000-0000-0000-0008-000000000002', 'MAPLE002', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000003', now() + interval '7 days', now() - interval '88 days'),
  ('00000000-0000-0000-0008-000000000003', 'MAPLE003', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', null, now() + interval '7 days', now() - interval '10 days'),
  ('00000000-0000-0000-0008-000000000004', 'MAPLE004', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002', null, now() - interval '1 day', now() - interval '30 days'),
  ('00000000-0000-0000-0008-000000000005', 'MAPLE005', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0002-000000000010', now() + interval '14 days', now() - interval '22 days'),
  -- Riverside (3)
  ('00000000-0000-0000-0008-000000000006', 'RIVER001', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0002-000000000015', now() + interval '7 days', now() - interval '85 days'),
  ('00000000-0000-0000-0008-000000000007', 'RIVER002', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000013', null, now() + interval '14 days', now() - interval '5 days'),
  ('00000000-0000-0000-0008-000000000008', 'RIVER003', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000014', null, now() - interval '3 days', now() - interval '20 days'),
  -- Harbor Point (3)
  ('00000000-0000-0000-0008-000000000009', 'HARBOR01', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0002-000000000026', now() + interval '7 days', now() - interval '82 days'),
  ('00000000-0000-0000-0008-000000000010', 'HARBOR02', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000024', null, now() + interval '7 days', now() - interval '8 days'),
  ('00000000-0000-0000-0008-000000000011', 'HARBOR03', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0002-000000000033', now() + interval '14 days', now() - interval '12 days'),
  -- Sunrise (2)
  ('00000000-0000-0000-0008-000000000012', 'MONON001', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000034', '00000000-0000-0000-0002-000000000035', now() + interval '7 days', now() - interval '74 days'),
  ('00000000-0000-0000-0008-000000000013', 'MONON002', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000034', null, now() + interval '7 days', now() - interval '3 days'),
  -- Sunset Ridge (2)
  ('00000000-0000-0000-0008-000000000014', 'SUNSET01', '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0002-000000000045', now() + interval '7 days', now() - interval '58 days'),
  ('00000000-0000-0000-0008-000000000015', 'SUNSET02', '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000043', null, now() + interval '14 days', now() - interval '2 days')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SECTION 9: Membership Requests (8)
-- UUID pattern: 00000000-0000-0000-0009-NNNNNNNNNNNN
-- All 3 statuses: pending, approved, denied
-- ============================================================================

INSERT INTO membership_requests (id, user_id, community_id, status, reviewed_by, message, created_at) VALUES
  ('00000000-0000-0000-0009-000000000001', '00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000001', 'pending', null, 'New to Portland, working remotely. Would love to join!', now() - interval '5 days'),
  ('00000000-0000-0000-0009-000000000002', '00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000001', 'approved', '00000000-0000-0000-0002-000000000001', 'Nursing student looking for community.', now() - interval '16 days'),
  ('00000000-0000-0000-0009-000000000003', '00000000-0000-0000-0002-000000000023', '00000000-0000-0000-0001-000000000002', 'pending', null, 'Musician looking for creative community.', now() - interval '8 days'),
  ('00000000-0000-0000-0009-000000000004', '00000000-0000-0000-0002-000000000022', '00000000-0000-0000-0001-000000000002', 'approved', '00000000-0000-0000-0002-000000000013', 'Just moved from Minneapolis. Excited to meet people!', now() - interval '20 days'),
  ('00000000-0000-0000-0009-000000000005', '00000000-0000-0000-0002-000000000032', '00000000-0000-0000-0001-000000000003', 'approved', '00000000-0000-0000-0002-000000000024', 'College intern at harbor authority.', now() - interval '22 days'),
  ('00000000-0000-0000-0009-000000000006', '00000000-0000-0000-0002-000000000042', '00000000-0000-0000-0001-000000000004', 'pending', null, 'Just bought a house on the trail. Excited about porch culture!', now() - interval '7 days'),
  ('00000000-0000-0000-0009-000000000007', '00000000-0000-0000-0002-000000000050', '00000000-0000-0000-0001-000000000005', 'denied', '00000000-0000-0000-0002-000000000043', 'Looking for handyman gigs.', now() - interval '6 days'),
  ('00000000-0000-0000-0009-000000000008', '00000000-0000-0000-0002-000000000049', '00000000-0000-0000-0001-000000000005', 'approved', '00000000-0000-0000-0002-000000000043', 'First year at UA, looking for community.', now() - interval '14 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 10: AI Matches (12)
-- UUID pattern: 00000000-0000-0000-000a-NNNNNNNNNNNN
-- Score range 0.3–0.95
-- ============================================================================

INSERT INTO ai_matches (id, post_id, suggested_user_id, match_score, match_reason, created_at) VALUES
  ('00000000-0000-0000-000a-000000000001', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000004', 0.92, 'Tom has 20+ years electrical/home repair experience and is near the post location.', now() - interval '82 days'),
  ('00000000-0000-0000-000a-000000000002', '00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000008', 0.88, 'Marcus is a professional plumber with faucet repair skills.', now() - interval '82 days'),
  ('00000000-0000-0000-000a-000000000003', '00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000005', 0.85, 'Sarah has childcare experience and is available Friday evenings.', now() - interval '75 days'),
  ('00000000-0000-0000-000a-000000000004', '00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000001', 0.95, 'Maria taught math for 30 years — perfect match for tutoring.', now() - interval '55 days'),
  ('00000000-0000-0000-000a-000000000005', '00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000004', 0.55, 'Tom has a car and is sometimes available early mornings.', now() - interval '10 days'),
  ('00000000-0000-0000-000a-000000000006', '00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0002-000000000015', 0.90, 'Dev is a full-stack developer who can teach Python.', now() - interval '22 days'),
  ('00000000-0000-0000-000a-000000000007', '00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0002-000000000025', 0.87, 'Diane has childcare experience and is available evenings.', now() - interval '28 days'),
  ('00000000-0000-0000-000a-000000000008', '00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0002-000000000028', 0.93, 'Jerome is a construction foreman with framing experience.', now() - interval '18 days'),
  ('00000000-0000-0000-000a-000000000009', '00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0002-000000000025', 0.72, 'Diane has organizational skills and hiring experience.', now() - interval '12 days'),
  ('00000000-0000-0000-000a-000000000010', '00000000-0000-0000-0003-000000000050', '00000000-0000-0000-0002-000000000034', 0.78, 'Victor has electrical and woodworking experience.', now() - interval '6 days'),
  ('00000000-0000-0000-000a-000000000011', '00000000-0000-0000-0003-000000000057', '00000000-0000-0000-0002-000000000045', 0.45, 'Chloe has tutoring skills but is not pre-med focused.', now() - interval '15 days'),
  ('00000000-0000-0000-000a-000000000012', '00000000-0000-0000-0003-000000000060', '00000000-0000-0000-0002-000000000045', 0.30, 'Chloe has basic tech skills but is not a specialist.', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 11: AI Usage (30)
-- UUID pattern: 00000000-0000-0000-000b-NNNNNNNNNNNN
-- Multi-day spread for active users
-- ============================================================================

INSERT INTO ai_usage (id, user_id, date, tokens_used, requests_count) VALUES
  ('00000000-0000-0000-000b-000000000001', '00000000-0000-0000-0002-000000000002', (now() - interval '82 days')::date, 1500, 3),
  ('00000000-0000-0000-000b-000000000002', '00000000-0000-0000-0002-000000000002', (now() - interval '72 days')::date, 2200, 4),
  ('00000000-0000-0000-000b-000000000003', '00000000-0000-0000-0002-000000000002', (now() - interval '50 days')::date, 800, 2),
  ('00000000-0000-0000-000b-000000000004', '00000000-0000-0000-0002-000000000003', (now() - interval '75 days')::date, 1200, 2),
  ('00000000-0000-0000-000b-000000000005', '00000000-0000-0000-0002-000000000003', (now() - interval '55 days')::date, 950, 2),
  ('00000000-0000-0000-000b-000000000006', '00000000-0000-0000-0002-000000000009', (now() - interval '3 days')::date, 1800, 3),
  ('00000000-0000-0000-000b-000000000007', '00000000-0000-0000-0002-000000000010', (now() - interval '10 days')::date, 2500, 5),
  ('00000000-0000-0000-000b-000000000008', '00000000-0000-0000-0002-000000000013', (now() - interval '60 days')::date, 3200, 6),
  ('00000000-0000-0000-000b-000000000009', '00000000-0000-0000-0002-000000000013', (now() - interval '40 days')::date, 1100, 2),
  ('00000000-0000-0000-000b-000000000010', '00000000-0000-0000-0002-000000000013', (now() - interval '20 days')::date, 2800, 5),
  ('00000000-0000-0000-000b-000000000011', '00000000-0000-0000-0002-000000000015', (now() - interval '22 days')::date, 1600, 3),
  ('00000000-0000-0000-000b-000000000012', '00000000-0000-0000-0002-000000000015', (now() - interval '5 days')::date, 900, 2),
  ('00000000-0000-0000-000b-000000000013', '00000000-0000-0000-0002-000000000021', (now() - interval '22 days')::date, 2100, 4),
  ('00000000-0000-0000-000b-000000000014', '00000000-0000-0000-0002-000000000024', (now() - interval '50 days')::date, 1400, 3),
  ('00000000-0000-0000-000b-000000000015', '00000000-0000-0000-0002-000000000025', (now() - interval '30 days')::date, 700, 1),
  ('00000000-0000-0000-000b-000000000016', '00000000-0000-0000-0002-000000000032', (now() - interval '12 days')::date, 3500, 7),
  ('00000000-0000-0000-000b-000000000017', '00000000-0000-0000-0002-000000000034', (now() - interval '70 days')::date, 2000, 4),
  ('00000000-0000-0000-000b-000000000018', '00000000-0000-0000-0002-000000000034', (now() - interval '45 days')::date, 1300, 3),
  ('00000000-0000-0000-000b-000000000019', '00000000-0000-0000-0002-000000000034', (now() - interval '25 days')::date, 1800, 3),
  ('00000000-0000-0000-000b-000000000020', '00000000-0000-0000-0002-000000000034', (now() - interval '6 days')::date, 900, 2),
  ('00000000-0000-0000-000b-000000000021', '00000000-0000-0000-0002-000000000035', (now() - interval '40 days')::date, 1100, 2),
  ('00000000-0000-0000-000b-000000000022', '00000000-0000-0000-0002-000000000042', (now() - interval '3 days')::date, 2400, 5),
  ('00000000-0000-0000-000b-000000000023', '00000000-0000-0000-0002-000000000043', (now() - interval '55 days')::date, 1700, 3),
  ('00000000-0000-0000-000b-000000000024', '00000000-0000-0000-0002-000000000043', (now() - interval '30 days')::date, 1200, 2),
  ('00000000-0000-0000-000b-000000000025', '00000000-0000-0000-0002-000000000043', (now() - interval '1 day')::date, 800, 1),
  ('00000000-0000-0000-000b-000000000026', '00000000-0000-0000-0002-000000000045', (now() - interval '40 days')::date, 1500, 3),
  ('00000000-0000-0000-000b-000000000027', '00000000-0000-0000-0002-000000000045', (now() - interval '15 days')::date, 2000, 4),
  ('00000000-0000-0000-000b-000000000028', '00000000-0000-0000-0002-000000000001', (now() - interval '80 days')::date, 1000, 2),
  ('00000000-0000-0000-000b-000000000029', '00000000-0000-0000-0002-000000000001', (now() - interval '48 days')::date, 1400, 3),
  ('00000000-0000-0000-000b-000000000030', '00000000-0000-0000-0002-000000000014', (now() - interval '35 days')::date, 1900, 4)
ON CONFLICT (user_id, date) DO NOTHING;

-- ============================================================================
-- SECTION 12: User Consents (50)
-- UUID pattern: 00000000-0000-0000-000c-NNNNNNNNNNNN
-- All 4 consent types, 1 revoked
-- ============================================================================

INSERT INTO user_consents (id, user_id, consent_type, policy_version, granted_at, revoked_at) VALUES
  -- All 50 users get terms_of_service consent (using first 50 IDs)
  ('00000000-0000-0000-000c-000000000001', '00000000-0000-0000-0002-000000000001', 'terms_of_service', '1.0', now() - interval '90 days', null),
  ('00000000-0000-0000-000c-000000000002', '00000000-0000-0000-0002-000000000002', 'terms_of_service', '1.0', now() - interval '88 days', null),
  ('00000000-0000-0000-000c-000000000003', '00000000-0000-0000-0002-000000000003', 'terms_of_service', '1.0', now() - interval '87 days', null),
  ('00000000-0000-0000-000c-000000000004', '00000000-0000-0000-0002-000000000004', 'terms_of_service', '1.0', now() - interval '85 days', null),
  ('00000000-0000-0000-000c-000000000005', '00000000-0000-0000-0002-000000000005', 'terms_of_service', '1.0', now() - interval '80 days', null),
  ('00000000-0000-0000-000c-000000000006', '00000000-0000-0000-0002-000000000013', 'terms_of_service', '1.0', now() - interval '88 days', null),
  ('00000000-0000-0000-000c-000000000007', '00000000-0000-0000-0002-000000000014', 'terms_of_service', '1.0', now() - interval '86 days', null),
  ('00000000-0000-0000-000c-000000000008', '00000000-0000-0000-0002-000000000024', 'terms_of_service', '1.0', now() - interval '85 days', null),
  ('00000000-0000-0000-000c-000000000009', '00000000-0000-0000-0002-000000000034', 'terms_of_service', '1.0', now() - interval '75 days', null),
  ('00000000-0000-0000-000c-000000000010', '00000000-0000-0000-0002-000000000043', 'terms_of_service', '1.0', now() - interval '70 days', null),
  -- Privacy policy consents for key users
  ('00000000-0000-0000-000c-000000000011', '00000000-0000-0000-0002-000000000001', 'privacy_policy', '1.0', now() - interval '90 days', null),
  ('00000000-0000-0000-000c-000000000012', '00000000-0000-0000-0002-000000000002', 'privacy_policy', '1.0', now() - interval '88 days', null),
  ('00000000-0000-0000-000c-000000000013', '00000000-0000-0000-0002-000000000003', 'privacy_policy', '1.0', now() - interval '87 days', null),
  ('00000000-0000-0000-000c-000000000014', '00000000-0000-0000-0002-000000000013', 'privacy_policy', '1.0', now() - interval '88 days', null),
  ('00000000-0000-0000-000c-000000000015', '00000000-0000-0000-0002-000000000024', 'privacy_policy', '1.0', now() - interval '85 days', null),
  ('00000000-0000-0000-000c-000000000016', '00000000-0000-0000-0002-000000000034', 'privacy_policy', '1.0', now() - interval '75 days', null),
  ('00000000-0000-0000-000c-000000000017', '00000000-0000-0000-0002-000000000043', 'privacy_policy', '1.0', now() - interval '70 days', null),
  -- AI processing consents
  ('00000000-0000-0000-000c-000000000018', '00000000-0000-0000-0002-000000000001', 'ai_processing', '1.0', now() - interval '90 days', null),
  ('00000000-0000-0000-000c-000000000019', '00000000-0000-0000-0002-000000000002', 'ai_processing', '1.0', now() - interval '88 days', null),
  ('00000000-0000-0000-000c-000000000020', '00000000-0000-0000-0002-000000000003', 'ai_processing', '1.0', now() - interval '87 days', null),
  ('00000000-0000-0000-000c-000000000021', '00000000-0000-0000-0002-000000000013', 'ai_processing', '1.0', now() - interval '88 days', null),
  ('00000000-0000-0000-000c-000000000022', '00000000-0000-0000-0002-000000000015', 'ai_processing', '1.0', now() - interval '82 days', null),
  ('00000000-0000-0000-000c-000000000023', '00000000-0000-0000-0002-000000000034', 'ai_processing', '1.0', now() - interval '75 days', null),
  ('00000000-0000-0000-000c-000000000024', '00000000-0000-0000-0002-000000000043', 'ai_processing', '1.0', now() - interval '70 days', null),
  -- Phone verification consents
  ('00000000-0000-0000-000c-000000000025', '00000000-0000-0000-0002-000000000001', 'phone_verification', '1.0', now() - interval '90 days', null),
  ('00000000-0000-0000-000c-000000000026', '00000000-0000-0000-0002-000000000002', 'phone_verification', '1.0', now() - interval '88 days', null),
  ('00000000-0000-0000-000c-000000000027', '00000000-0000-0000-0002-000000000003', 'phone_verification', '1.0', now() - interval '87 days', null),
  ('00000000-0000-0000-000c-000000000028', '00000000-0000-0000-0002-000000000004', 'phone_verification', '1.0', now() - interval '85 days', null),
  ('00000000-0000-0000-000c-000000000029', '00000000-0000-0000-0002-000000000013', 'phone_verification', '1.0', now() - interval '88 days', null),
  ('00000000-0000-0000-000c-000000000030', '00000000-0000-0000-0002-000000000014', 'phone_verification', '1.0', now() - interval '86 days', null),
  ('00000000-0000-0000-000c-000000000031', '00000000-0000-0000-0002-000000000024', 'phone_verification', '1.0', now() - interval '85 days', null),
  ('00000000-0000-0000-000c-000000000032', '00000000-0000-0000-0002-000000000025', 'phone_verification', '1.0', now() - interval '83 days', null),
  ('00000000-0000-0000-000c-000000000033', '00000000-0000-0000-0002-000000000034', 'phone_verification', '1.0', now() - interval '75 days', null),
  ('00000000-0000-0000-000c-000000000034', '00000000-0000-0000-0002-000000000043', 'phone_verification', '1.0', now() - interval '70 days', null),
  -- Remaining TOS consents for other users
  ('00000000-0000-0000-000c-000000000035', '00000000-0000-0000-0002-000000000006', 'terms_of_service', '1.0', now() - interval '78 days', null),
  ('00000000-0000-0000-000c-000000000036', '00000000-0000-0000-0002-000000000007', 'terms_of_service', '1.0', now() - interval '70 days', null),
  ('00000000-0000-0000-000c-000000000037', '00000000-0000-0000-0002-000000000008', 'terms_of_service', '1.0', now() - interval '65 days', null),
  ('00000000-0000-0000-000c-000000000038', '00000000-0000-0000-0002-000000000009', 'terms_of_service', '1.0', now() - interval '55 days', null),
  ('00000000-0000-0000-000c-000000000039', '00000000-0000-0000-0002-000000000010', 'terms_of_service', '1.0', now() - interval '20 days', null),
  ('00000000-0000-0000-000c-000000000040', '00000000-0000-0000-0002-000000000015', 'terms_of_service', '1.0', now() - interval '82 days', null),
  ('00000000-0000-0000-000c-000000000041', '00000000-0000-0000-0002-000000000016', 'terms_of_service', '1.0', now() - interval '78 days', null),
  ('00000000-0000-0000-000c-000000000042', '00000000-0000-0000-0002-000000000025', 'terms_of_service', '1.0', now() - interval '83 days', null),
  ('00000000-0000-0000-000c-000000000043', '00000000-0000-0000-0002-000000000026', 'terms_of_service', '1.0', now() - interval '80 days', null),
  ('00000000-0000-0000-000c-000000000044', '00000000-0000-0000-0002-000000000035', 'terms_of_service', '1.0', now() - interval '72 days', null),
  ('00000000-0000-0000-000c-000000000045', '00000000-0000-0000-0002-000000000036', 'terms_of_service', '1.0', now() - interval '68 days', null),
  ('00000000-0000-0000-000c-000000000046', '00000000-0000-0000-0002-000000000044', 'terms_of_service', '1.0', now() - interval '65 days', null),
  ('00000000-0000-0000-000c-000000000047', '00000000-0000-0000-0002-000000000045', 'terms_of_service', '1.0', now() - interval '55 days', null),
  ('00000000-0000-0000-000c-000000000048', '00000000-0000-0000-0002-000000000046', 'terms_of_service', '1.0', now() - interval '48 days', null),
  -- 1 revoked AI processing consent
  ('00000000-0000-0000-000c-000000000049', '00000000-0000-0000-0002-000000000010', 'ai_processing', '1.0', now() - interval '20 days', now() - interval '5 days'),
  ('00000000-0000-0000-000c-000000000050', '00000000-0000-0000-0002-000000000048', 'terms_of_service', '1.0', now() - interval '22 days', null)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 13: Audit Log (25)
-- UUID pattern: 00000000-0000-0000-000d-NNNNNNNNNNNN
-- ============================================================================

INSERT INTO audit_log (id, user_id, action, resource_type, resource_id, metadata, created_at) VALUES
  ('00000000-0000-0000-000d-000000000001', '00000000-0000-0000-0002-000000000001', 'create', 'community', '00000000-0000-0000-0001-000000000001', '{"name": "Maplewood Heights"}', now() - interval '90 days'),
  ('00000000-0000-0000-000d-000000000002', '00000000-0000-0000-0002-000000000013', 'create', 'community', '00000000-0000-0000-0001-000000000002', '{"name": "Riverside Commons"}', now() - interval '88 days'),
  ('00000000-0000-0000-000d-000000000003', '00000000-0000-0000-0002-000000000024', 'create', 'community', '00000000-0000-0000-0001-000000000003', '{"name": "Harbor Point"}', now() - interval '85 days'),
  ('00000000-0000-0000-000d-000000000004', '00000000-0000-0000-0002-000000000034', 'create', 'community', '00000000-0000-0000-0001-000000000004', '{"name": "Sunrise on the Monon"}', now() - interval '75 days'),
  ('00000000-0000-0000-000d-000000000005', '00000000-0000-0000-0002-000000000043', 'create', 'community', '00000000-0000-0000-0001-000000000005', '{"name": "Sunset Ridge"}', now() - interval '70 days'),
  ('00000000-0000-0000-000d-000000000006', '00000000-0000-0000-0002-000000000002', 'create', 'post', '00000000-0000-0000-0003-000000000001', '{"type": "need", "category": "home_repair"}', now() - interval '82 days'),
  ('00000000-0000-0000-000d-000000000007', '00000000-0000-0000-0002-000000000001', 'flag', 'post', '00000000-0000-0000-0003-000000000009', '{"reason": "spam", "flag_count": 3}', now() - interval '49 days'),
  ('00000000-0000-0000-000d-000000000008', null, 'auto_hide', 'post', '00000000-0000-0000-0003-000000000009', '{"flag_count": 3, "threshold": 3}', now() - interval '48 days'),
  ('00000000-0000-0000-000d-000000000009', '00000000-0000-0000-0002-000000000001', 'approve_membership', 'membership_request', '00000000-0000-0000-0009-000000000002', '{"user": "Aisha Johnson"}', now() - interval '15 days'),
  ('00000000-0000-0000-000d-000000000010', '00000000-0000-0000-0002-000000000013', 'create', 'quest', '00000000-0000-0000-0010-000000000001', '{"difficulty": "ember", "title": "Trail Cleanup Sprint"}', now() - interval '65 days'),
  ('00000000-0000-0000-000d-000000000011', '00000000-0000-0000-0002-000000000001', 'create', 'guild', '00000000-0000-0000-0015-000000000001', '{"name": "Maplewood Green Thumbs", "domain": "green"}', now() - interval '55 days'),
  ('00000000-0000-0000-000d-000000000012', '00000000-0000-0000-0002-000000000002', 'complete', 'quest', '00000000-0000-0000-0010-000000000005', '{"xp_awarded": 35, "domain": "craft"}', now() - interval '40 days'),
  ('00000000-0000-0000-000d-000000000013', '00000000-0000-0000-0002-000000000013', 'create', 'proposal', '00000000-0000-0000-0018-000000000001', '{"title": "Riverside Trail Maintenance Charter", "category": "charter_amendment"}', now() - interval '35 days'),
  ('00000000-0000-0000-000d-000000000014', '00000000-0000-0000-0002-000000000014', 'vote', 'proposal', '00000000-0000-0000-0018-000000000001', '{"vote_type": "quadratic", "in_favor": true, "credits": 4}', now() - interval '28 days'),
  ('00000000-0000-0000-000d-000000000015', '00000000-0000-0000-0002-000000000024', 'endorse', 'profile', '00000000-0000-0000-0002-000000000028', '{"domain": "craft", "skill": "carpentry"}', now() - interval '45 days'),
  ('00000000-0000-0000-000d-000000000016', '00000000-0000-0000-0002-000000000010', 'revoke_consent', 'consent', '00000000-0000-0000-000c-000000000049', '{"type": "ai_processing"}', now() - interval '5 days'),
  ('00000000-0000-0000-000d-000000000017', '00000000-0000-0000-0002-000000000043', 'deny_membership', 'membership_request', '00000000-0000-0000-0009-000000000007', '{"reason": "commercial intent"}', now() - interval '5 days'),
  ('00000000-0000-0000-000d-000000000018', '00000000-0000-0000-0002-000000000034', 'create', 'quest', '00000000-0000-0000-0010-000000000015', '{"difficulty": "flame", "title": "Little Free Library Build"}', now() - interval '25 days'),
  ('00000000-0000-0000-000d-000000000019', '00000000-0000-0000-0002-000000000001', 'update', 'profile', '00000000-0000-0000-0002-000000000001', '{"field": "privacy_tier", "from": "open", "to": "mentor"}', now() - interval '60 days'),
  ('00000000-0000-0000-000d-000000000020', '00000000-0000-0000-0002-000000000013', 'create', 'guild', '00000000-0000-0000-0015-000000000003', '{"name": "River Stewards", "domain": "green"}', now() - interval '50 days'),
  ('00000000-0000-0000-000d-000000000021', '00000000-0000-0000-0002-000000000024', 'create', 'guild', '00000000-0000-0000-0015-000000000005', '{"name": "Harbor Trades", "domain": "craft"}', now() - interval '48 days'),
  ('00000000-0000-0000-000d-000000000022', null, 'system', 'sunset_rule', '00000000-0000-0000-001a-000000000001', '{"type": "community_charter", "enacted": true}', now() - interval '35 days'),
  ('00000000-0000-0000-000d-000000000023', '00000000-0000-0000-0002-000000000034', 'request_deletion', 'profile', '00000000-0000-0000-0002-000000000041', '{"status": "pending"}', now() - interval '2 days'),
  ('00000000-0000-0000-000d-000000000024', '00000000-0000-0000-0002-000000000001', 'ai_review', 'post', '00000000-0000-0000-0003-000000000004', '{"result": "approved", "model": "claude-sonnet"}', now() - interval '72 days'),
  ('00000000-0000-0000-000d-000000000025', '00000000-0000-0000-0002-000000000043', 'create', 'proposal', '00000000-0000-0000-0018-000000000005', '{"title": "Sunset Ridge Community Charter", "category": "charter_amendment"}', now() - interval '30 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 14: Deletion Requests (3)
-- UUID pattern: 00000000-0000-0000-000e-NNNNNNNNNNNN
-- 1 pending, 1 processing, 1 completed
-- ============================================================================

INSERT INTO deletion_requests (id, user_id, status, requested_at, completed_at) VALUES
  ('00000000-0000-0000-000e-000000000001', '00000000-0000-0000-0002-000000000041', 'pending', now() - interval '2 days', null),
  ('00000000-0000-0000-000e-000000000002', '00000000-0000-0000-0002-000000000012', 'processing', now() - interval '4 days', null),
  ('00000000-0000-0000-000e-000000000003', '00000000-0000-0000-0002-000000000011', 'completed', now() - interval '10 days', now() - interval '8 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 15: Quests (35)
-- UUID pattern: 00000000-0000-0000-0010-NNNNNNNNNNNN
-- All 5 difficulties, all 7 statuses, all 5 validation methods
-- skill_domains cast as skill_domain[] enum array
-- ============================================================================

INSERT INTO quests (id, post_id, community_id, created_by, title, description, difficulty, validation_method, status, skill_domains, xp_reward, max_party_size, requested_by_other, validation_count, validation_threshold, is_emergency, is_seasonal, expires_at, completed_at, created_at) VALUES
  -- Maplewood quests (8)
  ('00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', 'Move the Garden Beds', 'Help Maria move 3 raised cedar garden beds to their new spots.', 'ember', 'peer_confirm', 'completed', ARRAY['green']::skill_domain[], 15, 3, false, 1, 1, false, false, now() + interval '30 days', now() - interval '68 days', now() - interval '70 days'),
  ('00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002', 'Couch Carry Challenge', 'Move a sectional couch up a narrow staircase — teamwork required.', 'ember', 'peer_confirm', 'completed', ARRAY['bridge','craft']::skill_domain[], 15, 2, true, 1, 1, false, false, now() + interval '30 days', now() - interval '63 days', now() - interval '65 days'),
  ('00000000-0000-0000-0010-000000000003', null, '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', 'Neighborhood Litter Sweep', 'Pick up litter along Elm Street and around Maplewood Park.', 'spark', 'self_report', 'completed', ARRAY['green']::skill_domain[], 5, 1, false, 0, 0, false, false, now() + interval '30 days', now() - interval '60 days', now() - interval '62 days'),
  ('00000000-0000-0000-0010-000000000004', '00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000003', 'Tutor a Young Mathematician', 'Help a 4th grader conquer fractions and long division over 4 weekly sessions.', 'flame', 'photo_and_peer', 'in_progress', ARRAY['signal','care']::skill_domain[], 35, 1, true, 0, 1, false, false, now() + interval '60 days', null, now() - interval '55 days'),
  ('00000000-0000-0000-0010-000000000005', null, '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002', 'Fix the Community Center Wiring', 'Rewire the community center stage lighting — needs licensed electrician oversight.', 'flame', 'photo_and_peer', 'completed', ARRAY['craft']::skill_domain[], 35, 2, false, 2, 1, false, false, now() + interval '30 days', now() - interval '40 days', now() - interval '50 days'),
  ('00000000-0000-0000-0010-000000000006', null, '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', 'Holiday Meal Drive', 'Organize and deliver holiday meals to 20 homebound neighbors.', 'blaze', 'community_vote', 'completed', ARRAY['hearth','weave']::skill_domain[], 75, 5, false, 4, 3, false, true, now() + interval '30 days', now() - interval '30 days', now() - interval '45 days'),
  ('00000000-0000-0000-0010-000000000007', '00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000009', 'Emergency Pharmacy Run', 'Pick up a prescription before the pharmacy closes.', 'spark', 'self_report', 'completed', ARRAY['bridge']::skill_domain[], 5, 1, true, 0, 0, true, false, null, now() - interval '2 days', now() - interval '3 days'),
  ('00000000-0000-0000-0010-000000000008', null, '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000004', 'Rewire Mrs. Henderson Porch Light', 'Install a new motion-sensor porch light for an elderly neighbor.', 'ember', 'peer_confirm', 'open', ARRAY['craft']::skill_domain[], 15, 1, false, 0, 1, false, false, now() + interval '14 days', null, now() - interval '8 days'),
  -- Riverside quests (9)
  ('00000000-0000-0000-0010-000000000009', '00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000014', 'Plant the Winter Cover Crop', 'Help plant cover crops across the community garden plots.', 'ember', 'peer_confirm', 'completed', ARRAY['green']::skill_domain[], 15, 4, false, 2, 1, false, true, now() + interval '30 days', now() - interval '78 days', now() - interval '80 days'),
  ('00000000-0000-0000-0010-000000000010', '00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000015', 'Bike Tune-Up Clinic', 'Run a free bike repair clinic at the park pavilion.', 'flame', 'photo_and_peer', 'completed', ARRAY['craft']::skill_domain[], 35, 3, false, 2, 1, false, false, now() + interval '30 days', now() - interval '73 days', now() - interval '75 days'),
  ('00000000-0000-0000-0010-000000000011', '00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000013', 'Trail Cleanup Sprint', 'Clean up litter and debris on miles 3-5 of the river trail.', 'ember', 'peer_confirm', 'completed', ARRAY['green']::skill_domain[], 15, 6, false, 3, 1, false, false, now() + interval '30 days', now() - interval '48 days', now() - interval '50 days'),
  ('00000000-0000-0000-0010-000000000012', null, '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000013', 'Riverside Sustainability Plan', 'Draft a 12-month sustainability roadmap for the community garden and trail system.', 'inferno', 'community_vote_and_evidence', 'in_progress', ARRAY['green','weave']::skill_domain[], 150, 4, false, 0, 5, false, false, now() + interval '90 days', null, now() - interval '40 days'),
  ('00000000-0000-0000-0010-000000000013', '00000000-0000-0000-0003-000000000027', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000013', 'Build Compost Bins', 'Teach neighbors to build 3-bin composting systems and build 5 sets.', 'flame', 'photo_and_peer', 'open', ARRAY['green','craft']::skill_domain[], 35, 3, false, 0, 1, false, false, now() + interval '30 days', null, now() - interval '2 days'),
  ('00000000-0000-0000-0010-000000000014', null, '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000016', 'Creek Water Quality Monitoring', 'Collect and analyze water samples from 5 points along Shoal Creek monthly for 3 months.', 'blaze', 'community_vote', 'pending_validation', ARRAY['green','signal']::skill_domain[], 75, 2, false, 2, 3, false, false, now() + interval '60 days', null, now() - interval '68 days'),
  ('00000000-0000-0000-0010-000000000015', null, '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000014', 'Community Movie Night Setup', 'Set up outdoor movie screening with projector, screen, and sound system.', 'ember', 'peer_confirm', 'claimed', ARRAY['signal']::skill_domain[], 15, 2, false, 0, 1, false, false, now() + interval '14 days', null, now() - interval '5 days'),
  ('00000000-0000-0000-0010-000000000016', null, '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000018', 'Spanish Storytime at the Library', 'Read bilingual stories to kids at the public library for 4 weeks.', 'flame', 'photo_and_peer', 'expired', ARRAY['care','signal']::skill_domain[], 35, 1, false, 0, 1, false, true, now() - interval '5 days', null, now() - interval '60 days'),
  ('00000000-0000-0000-0010-000000000017', null, '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000015', 'Fix Park Pavilion Bench', 'Repair cracked bench slats at the park pavilion.', 'spark', 'self_report', 'cancelled', ARRAY['craft']::skill_domain[], 5, 1, false, 0, 0, false, false, null, null, now() - interval '30 days'),
  -- Harbor Point quests (7)
  ('00000000-0000-0000-0010-000000000018', '00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000024', 'Porch Railing Rebuild', 'Replace 3 rotted porch rail posts with new pressure-treated lumber.', 'flame', 'photo_and_peer', 'completed', ARRAY['craft']::skill_domain[], 35, 2, false, 2, 1, false, false, now() + interval '30 days', now() - interval '76 days', now() - interval '78 days'),
  ('00000000-0000-0000-0010-000000000019', '00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000028', 'Little League Field Revival', 'Weed, paint lines, and repair backstop at Harbor Point Field.', 'blaze', 'community_vote', 'completed', ARRAY['green','craft']::skill_domain[], 75, 5, false, 4, 3, false, true, now() + interval '30 days', now() - interval '50 days', now() - interval '52 days'),
  ('00000000-0000-0000-0010-000000000020', '00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000024', 'Wheelchair Ramp Build', 'Build an ADA-compliant wheelchair ramp for an elderly neighbor.', 'blaze', 'community_vote', 'in_progress', ARRAY['craft']::skill_domain[], 75, 4, true, 0, 3, true, false, now() + interval '14 days', null, now() - interval '18 days'),
  ('00000000-0000-0000-0010-000000000021', null, '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000025', 'Weekly Meal Train for Tasha', 'Organize weekly meal deliveries for single mom working night shifts.', 'flame', 'photo_and_peer', 'in_progress', ARRAY['hearth','care']::skill_domain[], 35, 3, true, 0, 1, false, false, now() + interval '60 days', null, now() - interval '25 days'),
  ('00000000-0000-0000-0010-000000000022', null, '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000026', 'Teach Basic Auto Maintenance', 'Run a 3-session course on oil changes, tire rotation, and brake inspection.', 'flame', 'photo_and_peer', 'open', ARRAY['craft','signal']::skill_domain[], 35, 1, false, 0, 1, false, false, now() + interval '30 days', null, now() - interval '10 days'),
  ('00000000-0000-0000-0010-000000000023', null, '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000029', 'Senior Health Check Day', 'Organize a free health screening event at the community center.', 'blaze', 'community_vote', 'open', ARRAY['care','weave']::skill_domain[], 75, 4, false, 0, 3, false, false, now() + interval '30 days', null, now() - interval '5 days'),
  ('00000000-0000-0000-0010-000000000024', null, '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000024', 'Harbor Block Party', 'Plan and execute the annual Harbor Point block party.', 'inferno', 'community_vote_and_evidence', 'open', ARRAY['hearth','weave']::skill_domain[], 150, 8, false, 0, 5, false, true, now() + interval '60 days', null, now() - interval '3 days'),
  -- Sunrise on the Monon quests (6)
  ('00000000-0000-0000-0010-000000000025', '00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000037', 'Monon BBQ Cookout', 'Host a neighborhood BBQ with smoked brisket and community sides.', 'ember', 'peer_confirm', 'completed', ARRAY['hearth']::skill_domain[], 15, 4, false, 2, 1, false, false, now() + interval '30 days', now() - interval '46 days', now() - interval '48 days'),
  ('00000000-0000-0000-0010-000000000026', '00000000-0000-0000-0003-000000000047', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000034', 'Little Free Library Build', 'Design, build, and install a Little Free Library at the Monon trailhead.', 'flame', 'photo_and_peer', 'in_progress', ARRAY['craft','care']::skill_domain[], 35, 2, false, 0, 1, false, false, now() + interval '30 days', null, now() - interval '25 days'),
  ('00000000-0000-0000-0010-000000000027', '00000000-0000-0000-0003-000000000049', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000041', 'Trailside Bike Rescue', 'Bring patch kit and tools to fix a flat tire on the Monon.', 'spark', 'self_report', 'completed', ARRAY['craft']::skill_domain[], 5, 1, true, 0, 0, true, false, null, now() - interval '11 days', now() - interval '12 days'),
  ('00000000-0000-0000-0010-000000000028', null, '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000035', 'Monon Block Party Planning', 'Coordinate food, music, activities, and permits for the annual block party.', 'blaze', 'community_vote', 'pending_validation', ARRAY['hearth','weave']::skill_domain[], 75, 6, false, 2, 3, false, true, now() + interval '30 days', null, now() - interval '62 days'),
  ('00000000-0000-0000-0010-000000000029', null, '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000036', 'Monon Trail History Markers', 'Research and install 5 historical markers along the Monon trail.', 'inferno', 'community_vote_and_evidence', 'claimed', ARRAY['signal','weave']::skill_domain[], 150, 3, false, 0, 5, false, false, now() + interval '90 days', null, now() - interval '20 days'),
  ('00000000-0000-0000-0010-000000000030', null, '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000039', 'WiFi Mesh Network Setup', 'Help 10 neighbors optimize their home WiFi with proper mesh placement.', 'ember', 'peer_confirm', 'open', ARRAY['signal']::skill_domain[], 15, 1, false, 0, 1, false, false, now() + interval '30 days', null, now() - interval '10 days'),
  -- Sunset Ridge quests (5)
  ('00000000-0000-0000-0010-000000000031', '00000000-0000-0000-0003-000000000052', '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000043', 'Memoir Writing Workshop', 'Lead a 4-week memoir writing workshop for community members.', 'flame', 'photo_and_peer', 'completed', ARRAY['signal','care']::skill_domain[], 35, 1, false, 1, 1, false, false, now() + interval '30 days', now() - interval '45 days', now() - interval '60 days'),
  ('00000000-0000-0000-0010-000000000032', '00000000-0000-0000-0003-000000000053', '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000044', 'Birdhouse Building Class', 'Teach 8 people to build birdhouses from scrap wood.', 'ember', 'peer_confirm', 'completed', ARRAY['craft']::skill_domain[], 15, 8, false, 3, 1, false, false, now() + interval '30 days', now() - interval '48 days', now() - interval '52 days'),
  ('00000000-0000-0000-0010-000000000033', '00000000-0000-0000-0003-000000000054', '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000045', 'Elder Companionship Visits', 'Coordinate weekly visits from campus volunteers to homebound elders.', 'blaze', 'community_vote', 'in_progress', ARRAY['care','weave']::skill_domain[], 75, 4, false, 1, 3, false, false, now() + interval '60 days', null, now() - interval '45 days'),
  ('00000000-0000-0000-0010-000000000034', null, '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000043', 'Intergenerational Storytelling Night', 'Organize an evening where elders share stories with students over dinner.', 'ember', 'peer_confirm', 'open', ARRAY['hearth','care']::skill_domain[], 15, 3, false, 0, 1, false, false, now() + interval '30 days', null, now() - interval '8 days'),
  ('00000000-0000-0000-0010-000000000035', null, '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000046', 'Grocery Delivery Route Optimization', 'Map the most efficient route to serve 15 homebound neighbors weekly.', 'spark', 'self_report', 'completed', ARRAY['bridge']::skill_domain[], 5, 1, false, 0, 0, false, false, null, now() - interval '30 days', now() - interval '35 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 16: Quest Validations (45)
-- UUID pattern: 00000000-0000-0000-0011-NNNNNNNNNNNN
-- Approved/rejected mix, some with photos
-- ============================================================================

INSERT INTO quest_validations (id, quest_id, validator_id, approved, message, photo_url, created_at) VALUES
  -- Quest 1 (garden beds - completed)
  ('00000000-0000-0000-0011-000000000001', '00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0002-000000000002', true, 'Beds are in their new spots. Looks great!', null, now() - interval '68 days'),
  -- Quest 2 (couch carry - completed)
  ('00000000-0000-0000-0011-000000000002', '00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0002-000000000003', true, 'Couch is upstairs. What a workout!', null, now() - interval '63 days'),
  -- Quest 5 (wiring - completed, flame)
  ('00000000-0000-0000-0011-000000000003', '00000000-0000-0000-0010-000000000005', '00000000-0000-0000-0002-000000000001', true, 'Stage lighting works perfectly now.', 'https://placeholder.civicforge.org/validations/wiring-done.jpg', now() - interval '41 days'),
  ('00000000-0000-0000-0011-000000000004', '00000000-0000-0000-0010-000000000005', '00000000-0000-0000-0002-000000000004', true, 'Inspected the work — clean and up to code.', null, now() - interval '40 days'),
  -- Quest 6 (holiday meals - completed, blaze, 4 votes)
  ('00000000-0000-0000-0011-000000000005', '00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0002-000000000002', true, 'Delivered to 8 homes on my route. Everyone was grateful.', null, now() - interval '31 days'),
  ('00000000-0000-0000-0011-000000000006', '00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0002-000000000004', true, 'Saw the whole operation. Incredibly well organized.', null, now() - interval '31 days'),
  ('00000000-0000-0000-0011-000000000007', '00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0002-000000000005', true, 'I helped deliver and it was heartwarming.', null, now() - interval '30 days'),
  ('00000000-0000-0000-0011-000000000008', '00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0002-000000000006', true, 'All 20 households received meals. Confirmed.', null, now() - interval '30 days'),
  -- Quest 9 (winter cover crop - completed)
  ('00000000-0000-0000-0011-000000000009', '00000000-0000-0000-0010-000000000009', '00000000-0000-0000-0002-000000000017', true, 'Took photos of the finished planting.', 'https://placeholder.civicforge.org/validations/cover-crop.jpg', now() - interval '78 days'),
  ('00000000-0000-0000-0011-000000000010', '00000000-0000-0000-0010-000000000009', '00000000-0000-0000-0002-000000000013', true, 'Garden looks great for winter!', null, now() - interval '78 days'),
  -- Quest 10 (bike clinic - completed, flame)
  ('00000000-0000-0000-0011-000000000011', '00000000-0000-0000-0010-000000000010', '00000000-0000-0000-0002-000000000019', true, 'We tuned up 15 bikes. Great turnout!', 'https://placeholder.civicforge.org/validations/bike-clinic.jpg', now() - interval '73 days'),
  ('00000000-0000-0000-0011-000000000012', '00000000-0000-0000-0010-000000000010', '00000000-0000-0000-0002-000000000013', true, 'Confirmed — saw the event and it was well run.', null, now() - interval '73 days'),
  -- Quest 11 (trail cleanup - completed)
  ('00000000-0000-0000-0011-000000000013', '00000000-0000-0000-0010-000000000011', '00000000-0000-0000-0002-000000000017', true, 'Collected 8 bags of litter. Trail looks amazing.', 'https://placeholder.civicforge.org/validations/trail-clean.jpg', now() - interval '48 days'),
  ('00000000-0000-0000-0011-000000000014', '00000000-0000-0000-0010-000000000011', '00000000-0000-0000-0002-000000000020', true, 'Kids had fun helping. Great community event.', null, now() - interval '48 days'),
  ('00000000-0000-0000-0011-000000000015', '00000000-0000-0000-0010-000000000011', '00000000-0000-0000-0002-000000000015', true, 'Trail is spotless. Rode it today.', null, now() - interval '48 days'),
  -- Quest 14 (water quality - pending_validation, 2 of 3 needed)
  ('00000000-0000-0000-0011-000000000016', '00000000-0000-0000-0010-000000000014', '00000000-0000-0000-0002-000000000015', true, 'Data looks solid. pH and dissolved oxygen within range.', null, now() - interval '20 days'),
  ('00000000-0000-0000-0011-000000000017', '00000000-0000-0000-0010-000000000014', '00000000-0000-0000-0002-000000000013', true, 'Reviewed the methodology. Good science.', null, now() - interval '19 days'),
  -- Quest 18 (porch railing - completed, flame)
  ('00000000-0000-0000-0011-000000000018', '00000000-0000-0000-0010-000000000018', '00000000-0000-0000-0002-000000000024', true, 'Jerome did excellent work. Solid as a rock.', 'https://placeholder.civicforge.org/validations/porch-railing.jpg', now() - interval '76 days'),
  ('00000000-0000-0000-0011-000000000019', '00000000-0000-0000-0010-000000000018', '00000000-0000-0000-0002-000000000025', true, 'I walk by every day — railing looks brand new.', null, now() - interval '76 days'),
  -- Quest 19 (little league - completed, blaze, 4 votes)
  ('00000000-0000-0000-0011-000000000020', '00000000-0000-0000-0010-000000000019', '00000000-0000-0000-0002-000000000024', true, 'Field looks ready for opening day!', 'https://placeholder.civicforge.org/validations/field-ready.jpg', now() - interval '50 days'),
  ('00000000-0000-0000-0011-000000000021', '00000000-0000-0000-0010-000000000019', '00000000-0000-0000-0002-000000000025', true, 'Beautiful job. The kids are going to love it.', null, now() - interval '50 days'),
  ('00000000-0000-0000-0011-000000000022', '00000000-0000-0000-0010-000000000019', '00000000-0000-0000-0002-000000000029', true, 'Confirmed — field is game-ready.', null, now() - interval '50 days'),
  ('00000000-0000-0000-0011-000000000023', '00000000-0000-0000-0010-000000000019', '00000000-0000-0000-0002-000000000026', true, 'Backstop is solid. Good welding.', null, now() - interval '50 days'),
  -- Quest 25 (BBQ - completed)
  ('00000000-0000-0000-0011-000000000024', '00000000-0000-0000-0010-000000000025', '00000000-0000-0000-0002-000000000035', true, 'Best brisket on the Monon! 30+ people came.', null, now() - interval '46 days'),
  ('00000000-0000-0000-0011-000000000025', '00000000-0000-0000-0010-000000000025', '00000000-0000-0000-0002-000000000034', true, 'Great community event. Sam outdid himself.', null, now() - interval '46 days'),
  -- Quest 28 (block party planning - pending_validation, 2 of 3)
  ('00000000-0000-0000-0011-000000000026', '00000000-0000-0000-0010-000000000028', '00000000-0000-0000-0002-000000000034', true, 'Jenny did an amazing job coordinating everything.', null, now() - interval '15 days'),
  ('00000000-0000-0000-0011-000000000027', '00000000-0000-0000-0010-000000000028', '00000000-0000-0000-0002-000000000037', true, 'Permits secured, vendors confirmed. Ready to go.', null, now() - interval '14 days'),
  -- Quest 31 (memoir workshop - completed)
  ('00000000-0000-0000-0011-000000000028', '00000000-0000-0000-0010-000000000031', '00000000-0000-0000-0002-000000000044', true, 'Wonderful workshop. I wrote 3 chapters!', null, now() - interval '45 days'),
  -- Quest 32 (birdhouse class - completed)
  ('00000000-0000-0000-0011-000000000029', '00000000-0000-0000-0010-000000000032', '00000000-0000-0000-0002-000000000043', true, 'Harold is a patient teacher. All 8 birdhouses turned out great.', 'https://placeholder.civicforge.org/validations/birdhouses.jpg', now() - interval '48 days'),
  ('00000000-0000-0000-0011-000000000030', '00000000-0000-0000-0010-000000000032', '00000000-0000-0000-0002-000000000045', true, 'My birdhouse is already hanging in the yard!', null, now() - interval '48 days'),
  ('00000000-0000-0000-0011-000000000031', '00000000-0000-0000-0010-000000000032', '00000000-0000-0000-0002-000000000048', true, 'First time building anything. Had a blast.', null, now() - interval '47 days'),
  -- Quest 33 (elder visits - in_progress, 1 of 3)
  ('00000000-0000-0000-0011-000000000032', '00000000-0000-0000-0010-000000000033', '00000000-0000-0000-0002-000000000047', true, 'Visited Mrs. Chen twice. She loves having company.', null, now() - interval '30 days'),
  -- Some rejected validations
  ('00000000-0000-0000-0011-000000000033', '00000000-0000-0000-0010-000000000012', '00000000-0000-0000-0002-000000000017', false, 'Plan is too vague. Needs specific milestones and metrics.', null, now() - interval '35 days'),
  ('00000000-0000-0000-0011-000000000034', '00000000-0000-0000-0010-000000000012', '00000000-0000-0000-0002-000000000019', false, 'I do not see budget estimates. Hard to approve without that.', null, now() - interval '34 days'),
  -- More approved validations across communities
  ('00000000-0000-0000-0011-000000000035', '00000000-0000-0000-0010-000000000003', '00000000-0000-0000-0002-000000000005', true, 'Saw Maria picking up litter on Elm. Park looks great.', null, now() - interval '60 days'),
  ('00000000-0000-0000-0011-000000000036', '00000000-0000-0000-0010-000000000007', '00000000-0000-0000-0002-000000000003', true, 'Sarah got the prescription there in time!', null, now() - interval '2 days'),
  ('00000000-0000-0000-0011-000000000037', '00000000-0000-0000-0010-000000000027', '00000000-0000-0000-0002-000000000039', true, 'Fixed the flat right on the trail.', null, now() - interval '11 days'),
  ('00000000-0000-0000-0011-000000000038', '00000000-0000-0000-0010-000000000035', '00000000-0000-0000-0002-000000000043', true, 'Walt has been delivering groceries like clockwork.', null, now() - interval '30 days'),
  -- Additional validations for coverage
  ('00000000-0000-0000-0011-000000000039', '00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0002-000000000006', true, 'Garden beds are level and well placed.', null, now() - interval '68 days'),
  ('00000000-0000-0000-0011-000000000040', '00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0002-000000000001', true, 'Impressive teamwork getting that couch up the stairs.', null, now() - interval '63 days'),
  ('00000000-0000-0000-0011-000000000041', '00000000-0000-0000-0010-000000000009', '00000000-0000-0000-0002-000000000016', true, 'Cover crop is sprouting well already.', null, now() - interval '70 days'),
  ('00000000-0000-0000-0011-000000000042', '00000000-0000-0000-0010-000000000019', '00000000-0000-0000-0002-000000000030', true, 'Field drainage was improved too. Nice touch.', null, now() - interval '49 days'),
  ('00000000-0000-0000-0011-000000000043', '00000000-0000-0000-0010-000000000025', '00000000-0000-0000-0002-000000000036', true, 'Rick brought his famous cornbread. Great afternoon!', null, now() - interval '46 days'),
  ('00000000-0000-0000-0011-000000000044', '00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0002-000000000007', true, 'Helped pack the meals. Linda made amazing desserts.', null, now() - interval '30 days'),
  ('00000000-0000-0000-0011-000000000045', '00000000-0000-0000-0010-000000000032', '00000000-0000-0000-0002-000000000046', true, 'Harold showed us how to use a hand plane. Learned so much.', null, now() - interval '47 days')
ON CONFLICT (quest_id, validator_id) DO NOTHING;

-- ============================================================================
-- SECTION 17: Skill Progress (70)
-- UUID pattern: 00000000-0000-0000-0012-NNNNNNNNNNNN
-- All 7 domains, levels 0-5+, XP consistent with xpForLevel(level) = round(100 * ln(level + 2))
-- xpForLevel(0)=69, (1)=110, (2)=139, (3)=161, (4)=179, (5)=195
-- Level 0: 0-68 XP, Level 1: 69-178 XP, Level 2: 179-317 XP, Level 3: 318-478 XP, Level 4: 479-657 XP, Level 5: 658+
-- ============================================================================

INSERT INTO skill_progress (id, user_id, domain, total_xp, level, quests_completed, last_quest_at, created_at) VALUES
  -- Maria Santos (T5 Founder) — broad skills
  ('00000000-0000-0000-0012-000000000001', '00000000-0000-0000-0002-000000000001', 'green', 350, 3, 8, now() - interval '60 days', now() - interval '88 days'),
  ('00000000-0000-0000-0012-000000000002', '00000000-0000-0000-0002-000000000001', 'care', 250, 2, 5, now() - interval '45 days', now() - interval '88 days'),
  ('00000000-0000-0000-0012-000000000003', '00000000-0000-0000-0002-000000000001', 'hearth', 500, 4, 10, now() - interval '30 days', now() - interval '88 days'),
  ('00000000-0000-0000-0012-000000000004', '00000000-0000-0000-0002-000000000001', 'weave', 200, 2, 4, now() - interval '35 days', now() - interval '85 days'),
  -- James Chen (T4 Keeper)
  ('00000000-0000-0000-0012-000000000005', '00000000-0000-0000-0002-000000000002', 'craft', 480, 4, 9, now() - interval '40 days', now() - interval '86 days'),
  ('00000000-0000-0000-0012-000000000006', '00000000-0000-0000-0002-000000000002', 'signal', 180, 2, 4, now() - interval '50 days', now() - interval '80 days'),
  ('00000000-0000-0000-0012-000000000007', '00000000-0000-0000-0002-000000000002', 'bridge', 100, 1, 2, now() - interval '63 days', now() - interval '70 days'),
  -- Priya Patel (T4 Keeper)
  ('00000000-0000-0000-0012-000000000008', '00000000-0000-0000-0002-000000000003', 'care', 320, 3, 7, now() - interval '40 days', now() - interval '85 days'),
  ('00000000-0000-0000-0012-000000000009', '00000000-0000-0000-0002-000000000003', 'hearth', 250, 2, 5, now() - interval '45 days', now() - interval '82 days'),
  -- Tom Rodriguez (T3 Pillar)
  ('00000000-0000-0000-0012-000000000010', '00000000-0000-0000-0002-000000000004', 'craft', 320, 3, 6, now() - interval '50 days', now() - interval '83 days'),
  ('00000000-0000-0000-0012-000000000011', '00000000-0000-0000-0002-000000000004', 'signal', 80, 1, 2, now() - interval '60 days', now() - interval '75 days'),
  -- Sarah Kim (T3 Pillar)
  ('00000000-0000-0000-0012-000000000012', '00000000-0000-0000-0002-000000000005', 'care', 180, 2, 4, now() - interval '30 days', now() - interval '78 days'),
  ('00000000-0000-0000-0012-000000000013', '00000000-0000-0000-0002-000000000005', 'bridge', 70, 1, 2, now() - interval '3 days', now() - interval '60 days'),
  -- David Washington (T2)
  ('00000000-0000-0000-0012-000000000014', '00000000-0000-0000-0002-000000000006', 'green', 180, 2, 4, now() - interval '68 days', now() - interval '76 days'),
  -- Linda Olsen (T2)
  ('00000000-0000-0000-0012-000000000015', '00000000-0000-0000-0002-000000000007', 'hearth', 100, 1, 2, now() - interval '30 days', now() - interval '65 days'),
  -- Marcus Webb (T2)
  ('00000000-0000-0000-0012-000000000016', '00000000-0000-0000-0002-000000000008', 'craft', 100, 1, 2, now() - interval '55 days', now() - interval '60 days'),
  -- Emily Tran (T2)
  ('00000000-0000-0000-0012-000000000017', '00000000-0000-0000-0002-000000000009', 'signal', 75, 1, 2, now() - interval '3 days', now() - interval '50 days'),
  -- Kai Nakamura (T5 Founder)
  ('00000000-0000-0000-0012-000000000018', '00000000-0000-0000-0002-000000000013', 'green', 660, 5, 12, now() - interval '20 days', now() - interval '86 days'),
  ('00000000-0000-0000-0012-000000000019', '00000000-0000-0000-0002-000000000013', 'weave', 500, 4, 8, now() - interval '15 days', now() - interval '85 days'),
  ('00000000-0000-0000-0012-000000000020', '00000000-0000-0000-0002-000000000013', 'hearth', 180, 2, 3, now() - interval '48 days', now() - interval '80 days'),
  -- Zoe Martinez (T4 Keeper)
  ('00000000-0000-0000-0012-000000000021', '00000000-0000-0000-0002-000000000014', 'green', 480, 4, 10, now() - interval '30 days', now() - interval '84 days'),
  ('00000000-0000-0000-0012-000000000022', '00000000-0000-0000-0002-000000000014', 'signal', 100, 1, 2, now() - interval '50 days', now() - interval '70 days'),
  -- Dev Krishnan (T3 Pillar)
  ('00000000-0000-0000-0012-000000000023', '00000000-0000-0000-0002-000000000015', 'craft', 200, 2, 4, now() - interval '45 days', now() - interval '80 days'),
  ('00000000-0000-0000-0012-000000000024', '00000000-0000-0000-0002-000000000015', 'signal', 180, 2, 3, now() - interval '20 days', now() - interval '75 days'),
  -- Mia Chang (T3 Pillar)
  ('00000000-0000-0000-0012-000000000025', '00000000-0000-0000-0002-000000000016', 'green', 250, 2, 5, now() - interval '20 days', now() - interval '76 days'),
  ('00000000-0000-0000-0012-000000000026', '00000000-0000-0000-0002-000000000016', 'signal', 100, 1, 2, now() - interval '40 days', now() - interval '68 days'),
  -- Jordan Blake (T2)
  ('00000000-0000-0000-0012-000000000027', '00000000-0000-0000-0002-000000000017', 'signal', 100, 1, 3, now() - interval '48 days', now() - interval '70 days'),
  -- Sofia Reyes (T2)
  ('00000000-0000-0000-0012-000000000028', '00000000-0000-0000-0002-000000000018', 'hearth', 70, 1, 2, now() - interval '55 days', now() - interval '62 days'),
  ('00000000-0000-0000-0012-000000000029', '00000000-0000-0000-0002-000000000018', 'care', 40, 0, 1, now() - interval '55 days', now() - interval '60 days'),
  -- Alex Petrov (T2)
  ('00000000-0000-0000-0012-000000000030', '00000000-0000-0000-0002-000000000019', 'craft', 100, 1, 2, now() - interval '42 days', now() - interval '55 days'),
  -- Hannah Lee (T2)
  ('00000000-0000-0000-0012-000000000031', '00000000-0000-0000-0002-000000000020', 'care', 70, 1, 2, now() - interval '48 days', now() - interval '48 days'),
  ('00000000-0000-0000-0012-000000000032', '00000000-0000-0000-0002-000000000020', 'weave', 40, 0, 1, now() - interval '48 days', now() - interval '45 days'),
  -- Frank Kowalski (T5 Founder)
  ('00000000-0000-0000-0012-000000000033', '00000000-0000-0000-0002-000000000024', 'craft', 660, 5, 14, now() - interval '18 days', now() - interval '83 days'),
  ('00000000-0000-0000-0012-000000000034', '00000000-0000-0000-0002-000000000024', 'weave', 320, 3, 6, now() - interval '25 days', now() - interval '80 days'),
  ('00000000-0000-0000-0012-000000000035', '00000000-0000-0000-0002-000000000024', 'green', 100, 1, 2, now() - interval '50 days', now() - interval '75 days'),
  -- Diane Brooks (T4 Keeper)
  ('00000000-0000-0000-0012-000000000036', '00000000-0000-0000-0002-000000000025', 'care', 350, 3, 7, now() - interval '27 days', now() - interval '81 days'),
  ('00000000-0000-0000-0012-000000000037', '00000000-0000-0000-0002-000000000025', 'bridge', 200, 2, 4, now() - interval '30 days', now() - interval '78 days'),
  ('00000000-0000-0000-0012-000000000038', '00000000-0000-0000-0002-000000000025', 'hearth', 180, 2, 3, now() - interval '40 days', now() - interval '75 days'),
  -- Ray Thompson (T3 Pillar)
  ('00000000-0000-0000-0012-000000000039', '00000000-0000-0000-0002-000000000026', 'craft', 250, 2, 5, now() - interval '50 days', now() - interval '78 days'),
  -- Angela Rossi (T3 Pillar)
  ('00000000-0000-0000-0012-000000000040', '00000000-0000-0000-0002-000000000027', 'hearth', 200, 2, 4, now() - interval '45 days', now() - interval '74 days'),
  -- Jerome Davis (T2)
  ('00000000-0000-0000-0012-000000000041', '00000000-0000-0000-0002-000000000028', 'craft', 180, 2, 4, now() - interval '17 days', now() - interval '68 days'),
  ('00000000-0000-0000-0012-000000000042', '00000000-0000-0000-0002-000000000028', 'green', 80, 1, 2, now() - interval '50 days', now() - interval '60 days'),
  -- Patty Nguyen (T2)
  ('00000000-0000-0000-0012-000000000043', '00000000-0000-0000-0002-000000000029', 'care', 100, 1, 2, now() - interval '40 days', now() - interval '60 days'),
  -- Mike Sullivan (T2)
  ('00000000-0000-0000-0012-000000000044', '00000000-0000-0000-0002-000000000030', 'craft', 100, 1, 3, now() - interval '17 days', now() - interval '52 days'),
  ('00000000-0000-0000-0012-000000000045', '00000000-0000-0000-0002-000000000030', 'green', 40, 0, 1, now() - interval '50 days', now() - interval '50 days'),
  -- Victor Wicks (T4 Keeper)
  ('00000000-0000-0000-0012-000000000046', '00000000-0000-0000-0002-000000000034', 'craft', 200, 2, 4, now() - interval '25 days', now() - interval '73 days'),
  ('00000000-0000-0000-0012-000000000047', '00000000-0000-0000-0002-000000000034', 'weave', 320, 3, 5, now() - interval '15 days', now() - interval '73 days'),
  ('00000000-0000-0000-0012-000000000048', '00000000-0000-0000-0002-000000000034', 'signal', 180, 2, 3, now() - interval '20 days', now() - interval '68 days'),
  ('00000000-0000-0000-0012-000000000049', '00000000-0000-0000-0002-000000000034', 'hearth', 100, 1, 2, now() - interval '30 days', now() - interval '60 days'),
  -- Jenny Lawson (T3 Pillar)
  ('00000000-0000-0000-0012-000000000050', '00000000-0000-0000-0002-000000000035', 'hearth', 250, 2, 5, now() - interval '15 days', now() - interval '70 days'),
  ('00000000-0000-0000-0012-000000000051', '00000000-0000-0000-0002-000000000035', 'weave', 180, 2, 3, now() - interval '15 days', now() - interval '65 days'),
  -- Rick Adler (T3 Pillar)
  ('00000000-0000-0000-0012-000000000052', '00000000-0000-0000-0002-000000000036', 'signal', 200, 2, 4, now() - interval '20 days', now() - interval '66 days'),
  ('00000000-0000-0000-0012-000000000053', '00000000-0000-0000-0002-000000000036', 'care', 100, 1, 2, now() - interval '30 days', now() - interval '60 days'),
  -- Sam Patel (T2)
  ('00000000-0000-0000-0012-000000000054', '00000000-0000-0000-0002-000000000037', 'hearth', 100, 1, 2, now() - interval '46 days', now() - interval '58 days'),
  -- Claire Dubois (T2)
  ('00000000-0000-0000-0012-000000000055', '00000000-0000-0000-0002-000000000038', 'signal', 70, 1, 2, now() - interval '42 days', now() - interval '50 days'),
  ('00000000-0000-0000-0012-000000000056', '00000000-0000-0000-0002-000000000038', 'care', 40, 0, 1, now() - interval '42 days', now() - interval '48 days'),
  -- Omar Hassan (T2)
  ('00000000-0000-0000-0012-000000000057', '00000000-0000-0000-0002-000000000039', 'signal', 80, 1, 2, now() - interval '11 days', now() - interval '43 days'),
  -- Gloria Fuentes (T4 Keeper)
  ('00000000-0000-0000-0012-000000000058', '00000000-0000-0000-0002-000000000043', 'signal', 250, 2, 5, now() - interval '45 days', now() - interval '68 days'),
  ('00000000-0000-0000-0012-000000000059', '00000000-0000-0000-0002-000000000043', 'care', 200, 2, 4, now() - interval '19 days', now() - interval '65 days'),
  ('00000000-0000-0000-0012-000000000060', '00000000-0000-0000-0002-000000000043', 'weave', 320, 3, 6, now() - interval '10 days', now() - interval '60 days'),
  -- Harold Jenkins (T3 Pillar)
  ('00000000-0000-0000-0012-000000000061', '00000000-0000-0000-0002-000000000044', 'craft', 320, 3, 7, now() - interval '48 days', now() - interval '63 days'),
  ('00000000-0000-0000-0012-000000000062', '00000000-0000-0000-0002-000000000044', 'signal', 100, 1, 2, now() - interval '48 days', now() - interval '58 days'),
  -- Chloe Dunn (T2)
  ('00000000-0000-0000-0012-000000000063', '00000000-0000-0000-0002-000000000045', 'care', 100, 1, 3, now() - interval '30 days', now() - interval '53 days'),
  ('00000000-0000-0000-0012-000000000064', '00000000-0000-0000-0002-000000000045', 'weave', 70, 1, 2, now() - interval '30 days', now() - interval '50 days'),
  -- Walt Benson (T2)
  ('00000000-0000-0000-0012-000000000065', '00000000-0000-0000-0002-000000000046', 'bridge', 100, 1, 3, now() - interval '30 days', now() - interval '46 days'),
  -- Lily Zhang (T1)
  ('00000000-0000-0000-0012-000000000066', '00000000-0000-0000-0002-000000000047', 'care', 40, 0, 1, now() - interval '30 days', now() - interval '26 days'),
  -- Tyler Green (T1)
  ('00000000-0000-0000-0012-000000000067', '00000000-0000-0000-0002-000000000021', 'green', 20, 0, 1, now() - interval '22 days', now() - interval '24 days'),
  -- Beth Kowalski (T1)
  ('00000000-0000-0000-0012-000000000068', '00000000-0000-0000-0002-000000000040', 'care', 10, 0, 0, null, now() - interval '20 days'),
  -- Bob Whitaker (T1)
  ('00000000-0000-0000-0012-000000000069', '00000000-0000-0000-0002-000000000048', 'hearth', 20, 0, 1, now() - interval '15 days', now() - interval '20 days'),
  ('00000000-0000-0000-0012-000000000070', '00000000-0000-0000-0002-000000000048', 'craft', 15, 0, 1, now() - interval '47 days', now() - interval '48 days')
ON CONFLICT (user_id, domain) DO NOTHING;

-- ============================================================================
-- SECTION 18: Parties (10)
-- UUID pattern: 00000000-0000-0000-0013-NNNNNNNNNNNN
-- Active and disbanded
-- ============================================================================

INSERT INTO parties (id, quest_id, name, created_by, disbanded, created_at) VALUES
  ('00000000-0000-0000-0013-000000000001', '00000000-0000-0000-0010-000000000001', 'Garden Movers', '00000000-0000-0000-0002-000000000002', true, now() - interval '69 days'),
  ('00000000-0000-0000-0013-000000000002', '00000000-0000-0000-0010-000000000002', 'Couch Crew', '00000000-0000-0000-0002-000000000003', true, now() - interval '64 days'),
  ('00000000-0000-0000-0013-000000000003', '00000000-0000-0000-0010-000000000006', 'Meal Train Team', '00000000-0000-0000-0002-000000000001', true, now() - interval '44 days'),
  ('00000000-0000-0000-0013-000000000004', '00000000-0000-0000-0010-000000000011', 'Trail Blazers', '00000000-0000-0000-0002-000000000013', true, now() - interval '49 days'),
  ('00000000-0000-0000-0013-000000000005', '00000000-0000-0000-0010-000000000019', 'Field Crew', '00000000-0000-0000-0002-000000000028', true, now() - interval '51 days'),
  ('00000000-0000-0000-0013-000000000006', '00000000-0000-0000-0010-000000000020', 'Ramp Builders', '00000000-0000-0000-0002-000000000028', false, now() - interval '17 days'),
  ('00000000-0000-0000-0013-000000000007', '00000000-0000-0000-0010-000000000012', 'Sustainability Squad', '00000000-0000-0000-0002-000000000014', false, now() - interval '39 days'),
  ('00000000-0000-0000-0013-000000000008', '00000000-0000-0000-0010-000000000026', 'Library Builders', '00000000-0000-0000-0002-000000000034', false, now() - interval '24 days'),
  ('00000000-0000-0000-0013-000000000009', '00000000-0000-0000-0010-000000000033', 'Visit Volunteers', '00000000-0000-0000-0002-000000000045', false, now() - interval '44 days'),
  ('00000000-0000-0000-0013-000000000010', '00000000-0000-0000-0010-000000000028', 'Party Planners', '00000000-0000-0000-0002-000000000035', false, now() - interval '61 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 19: Party Members (25)
-- UUID pattern: 00000000-0000-0000-0014-NNNNNNNNNNNN
-- 2-4 per party
-- ============================================================================

INSERT INTO party_members (id, party_id, user_id, joined_at) VALUES
  -- Garden Movers (disbanded)
  ('00000000-0000-0000-0014-000000000001', '00000000-0000-0000-0013-000000000001', '00000000-0000-0000-0002-000000000002', now() - interval '69 days'),
  ('00000000-0000-0000-0014-000000000002', '00000000-0000-0000-0013-000000000001', '00000000-0000-0000-0002-000000000006', now() - interval '69 days'),
  -- Couch Crew (disbanded)
  ('00000000-0000-0000-0014-000000000003', '00000000-0000-0000-0013-000000000002', '00000000-0000-0000-0002-000000000003', now() - interval '64 days'),
  ('00000000-0000-0000-0014-000000000004', '00000000-0000-0000-0013-000000000002', '00000000-0000-0000-0002-000000000002', now() - interval '64 days'),
  -- Meal Train Team (disbanded)
  ('00000000-0000-0000-0014-000000000005', '00000000-0000-0000-0013-000000000003', '00000000-0000-0000-0002-000000000001', now() - interval '44 days'),
  ('00000000-0000-0000-0014-000000000006', '00000000-0000-0000-0013-000000000003', '00000000-0000-0000-0002-000000000003', now() - interval '44 days'),
  ('00000000-0000-0000-0014-000000000007', '00000000-0000-0000-0013-000000000003', '00000000-0000-0000-0002-000000000007', now() - interval '43 days'),
  -- Trail Blazers (disbanded)
  ('00000000-0000-0000-0014-000000000008', '00000000-0000-0000-0013-000000000004', '00000000-0000-0000-0002-000000000013', now() - interval '49 days'),
  ('00000000-0000-0000-0014-000000000009', '00000000-0000-0000-0013-000000000004', '00000000-0000-0000-0002-000000000017', now() - interval '49 days'),
  ('00000000-0000-0000-0014-000000000010', '00000000-0000-0000-0013-000000000004', '00000000-0000-0000-0002-000000000020', now() - interval '49 days'),
  -- Field Crew (disbanded)
  ('00000000-0000-0000-0014-000000000011', '00000000-0000-0000-0013-000000000005', '00000000-0000-0000-0002-000000000028', now() - interval '51 days'),
  ('00000000-0000-0000-0014-000000000012', '00000000-0000-0000-0013-000000000005', '00000000-0000-0000-0002-000000000030', now() - interval '51 days'),
  ('00000000-0000-0000-0014-000000000013', '00000000-0000-0000-0013-000000000005', '00000000-0000-0000-0002-000000000026', now() - interval '51 days'),
  -- Ramp Builders (active)
  ('00000000-0000-0000-0014-000000000014', '00000000-0000-0000-0013-000000000006', '00000000-0000-0000-0002-000000000028', now() - interval '17 days'),
  ('00000000-0000-0000-0014-000000000015', '00000000-0000-0000-0013-000000000006', '00000000-0000-0000-0002-000000000030', now() - interval '17 days'),
  ('00000000-0000-0000-0014-000000000016', '00000000-0000-0000-0013-000000000006', '00000000-0000-0000-0002-000000000024', now() - interval '16 days'),
  -- Sustainability Squad (active)
  ('00000000-0000-0000-0014-000000000017', '00000000-0000-0000-0013-000000000007', '00000000-0000-0000-0002-000000000014', now() - interval '39 days'),
  ('00000000-0000-0000-0014-000000000018', '00000000-0000-0000-0013-000000000007', '00000000-0000-0000-0002-000000000016', now() - interval '38 days'),
  ('00000000-0000-0000-0014-000000000019', '00000000-0000-0000-0013-000000000007', '00000000-0000-0000-0002-000000000013', now() - interval '38 days'),
  -- Library Builders (active)
  ('00000000-0000-0000-0014-000000000020', '00000000-0000-0000-0013-000000000008', '00000000-0000-0000-0002-000000000034', now() - interval '24 days'),
  ('00000000-0000-0000-0014-000000000021', '00000000-0000-0000-0013-000000000008', '00000000-0000-0000-0002-000000000037', now() - interval '24 days'),
  -- Visit Volunteers (active)
  ('00000000-0000-0000-0014-000000000022', '00000000-0000-0000-0013-000000000009', '00000000-0000-0000-0002-000000000045', now() - interval '44 days'),
  ('00000000-0000-0000-0014-000000000023', '00000000-0000-0000-0013-000000000009', '00000000-0000-0000-0002-000000000047', now() - interval '43 days'),
  -- Party Planners (active)
  ('00000000-0000-0000-0014-000000000024', '00000000-0000-0000-0013-000000000010', '00000000-0000-0000-0002-000000000035', now() - interval '61 days'),
  ('00000000-0000-0000-0014-000000000025', '00000000-0000-0000-0013-000000000010', '00000000-0000-0000-0002-000000000037', now() - interval '60 days')
ON CONFLICT (party_id, user_id) DO NOTHING;

-- ============================================================================
-- SECTION 20: Guilds (10)
-- UUID pattern: 00000000-0000-0000-0015-NNNNNNNNNNNN
-- All 7 domains covered, member_count = 0 (trigger handles)
-- ============================================================================

INSERT INTO guilds (id, community_id, name, domain, description, charter, charter_sunset_at, created_by, member_count, active, created_at) VALUES
  -- Maplewood guilds (3)
  ('00000000-0000-0000-0015-000000000001', '00000000-0000-0000-0001-000000000001', 'Maplewood Green Thumbs', 'green', 'Gardening and environmental stewardship for Maplewood Heights.', 'We cultivate community through growing. Monthly workdays, seed sharing, composting workshops.', now() + interval '300 days', '00000000-0000-0000-0002-000000000001', 0, true, now() - interval '55 days'),
  ('00000000-0000-0000-0015-000000000002', '00000000-0000-0000-0001-000000000001', 'Maplewood Fixers', 'craft', 'Home repair and maintenance guild. We help neighbors keep their homes in shape.', 'Mutual aid for home repairs. Tool library, skill sharing, safety first.', now() + interval '250 days', '00000000-0000-0000-0002-000000000002', 0, true, now() - interval '52 days'),
  -- Riverside guilds (3)
  ('00000000-0000-0000-0015-000000000003', '00000000-0000-0000-0001-000000000002', 'River Stewards', 'green', 'Environmental guardians of the river trail and community garden.', 'We protect and improve the trail ecosystem. Monthly monitoring, quarterly cleanups.', now() + interval '280 days', '00000000-0000-0000-0002-000000000013', 0, true, now() - interval '50 days'),
  ('00000000-0000-0000-0015-000000000004', '00000000-0000-0000-0001-000000000002', 'Riverside Signal Corps', 'signal', 'Tech support and digital literacy for the community.', 'Free tech help, digital skills workshops, community comms infrastructure.', now() + interval '200 days', '00000000-0000-0000-0002-000000000015', 0, true, now() - interval '45 days'),
  -- Harbor Point guilds (2)
  ('00000000-0000-0000-0015-000000000005', '00000000-0000-0000-0001-000000000003', 'Harbor Trades', 'craft', 'Skilled trades guild — carpentry, plumbing, electrical, welding.', 'Pass on the trades. Apprenticeship programs, tool sharing, safety standards.', now() + interval '320 days', '00000000-0000-0000-0002-000000000024', 0, true, now() - interval '48 days'),
  ('00000000-0000-0000-0015-000000000006', '00000000-0000-0000-0001-000000000003', 'Harbor Hearts', 'care', 'Caregiving network — childcare, eldercare, health support.', 'We care for each other. Meal trains, childcare swaps, health check events.', now() + interval '250 days', '00000000-0000-0000-0002-000000000025', 0, true, now() - interval '42 days'),
  -- Sunrise guild (1)
  ('00000000-0000-0000-0015-000000000007', '00000000-0000-0000-0001-000000000004', 'Monon Weavers', 'weave', 'Community coordination and governance for the trail neighborhood.', 'We weave the neighborhood together through events, governance, and coordination.', now() + interval '180 days', '00000000-0000-0000-0002-000000000034', 0, true, now() - interval '40 days'),
  -- Sunset Ridge guilds (2)
  ('00000000-0000-0000-0015-000000000008', '00000000-0000-0000-0001-000000000005', 'Sunset Bridge', 'bridge', 'Transportation and delivery network connecting homebound neighbors.', 'No one should be stuck at home. Rides, deliveries, errands.', now() + interval '200 days', '00000000-0000-0000-0002-000000000046', 0, true, now() - interval '35 days'),
  ('00000000-0000-0000-0015-000000000009', '00000000-0000-0000-0001-000000000005', 'Sunset Hearth', 'hearth', 'Gathering people together through food, stories, and fellowship.', 'We nourish the soul. Potlucks, game nights, intergenerational dinners.', now() + interval '150 days', '00000000-0000-0000-0002-000000000043', 0, true, now() - interval '30 days'),
  -- Inactive/disbanded guild
  ('00000000-0000-0000-0015-000000000010', '00000000-0000-0000-0001-000000000002', 'Riverside Crafters', 'craft', 'Former maker space guild.', 'Disbanded due to lack of consistent meeting space.', now() - interval '10 days', '00000000-0000-0000-0002-000000000019', 0, false, now() - interval '60 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 21: Guild Members (35)
-- UUID pattern: 00000000-0000-0000-0016-NNNNNNNNNNNN
-- Members + stewards, term states
-- ============================================================================

INSERT INTO guild_members (id, guild_id, user_id, role, steward_term_start, consecutive_terms, joined_at) VALUES
  -- Maplewood Green Thumbs (5 members)
  ('00000000-0000-0000-0016-000000000001', '00000000-0000-0000-0015-000000000001', '00000000-0000-0000-0002-000000000001', 'steward', now() - interval '55 days', 1, now() - interval '55 days'),
  ('00000000-0000-0000-0016-000000000002', '00000000-0000-0000-0015-000000000001', '00000000-0000-0000-0002-000000000006', 'member', null, 0, now() - interval '53 days'),
  ('00000000-0000-0000-0016-000000000003', '00000000-0000-0000-0015-000000000001', '00000000-0000-0000-0002-000000000005', 'member', null, 0, now() - interval '50 days'),
  ('00000000-0000-0000-0016-000000000004', '00000000-0000-0000-0015-000000000001', '00000000-0000-0000-0002-000000000007', 'member', null, 0, now() - interval '45 days'),
  -- Maplewood Fixers (4 members)
  ('00000000-0000-0000-0016-000000000005', '00000000-0000-0000-0015-000000000002', '00000000-0000-0000-0002-000000000002', 'steward', now() - interval '52 days', 2, now() - interval '52 days'),
  ('00000000-0000-0000-0016-000000000006', '00000000-0000-0000-0015-000000000002', '00000000-0000-0000-0002-000000000004', 'member', null, 0, now() - interval '50 days'),
  ('00000000-0000-0000-0016-000000000007', '00000000-0000-0000-0015-000000000002', '00000000-0000-0000-0002-000000000008', 'member', null, 0, now() - interval '48 days'),
  ('00000000-0000-0000-0016-000000000008', '00000000-0000-0000-0015-000000000002', '00000000-0000-0000-0002-000000000009', 'member', null, 0, now() - interval '40 days'),
  -- River Stewards (4 members)
  ('00000000-0000-0000-0016-000000000009', '00000000-0000-0000-0015-000000000003', '00000000-0000-0000-0002-000000000013', 'steward', now() - interval '50 days', 1, now() - interval '50 days'),
  ('00000000-0000-0000-0016-000000000010', '00000000-0000-0000-0015-000000000003', '00000000-0000-0000-0002-000000000014', 'member', null, 0, now() - interval '48 days'),
  ('00000000-0000-0000-0016-000000000011', '00000000-0000-0000-0015-000000000003', '00000000-0000-0000-0002-000000000016', 'member', null, 0, now() - interval '45 days'),
  ('00000000-0000-0000-0016-000000000012', '00000000-0000-0000-0015-000000000003', '00000000-0000-0000-0002-000000000020', 'member', null, 0, now() - interval '40 days'),
  -- Riverside Signal Corps (3 members)
  ('00000000-0000-0000-0016-000000000013', '00000000-0000-0000-0015-000000000004', '00000000-0000-0000-0002-000000000015', 'steward', now() - interval '45 days', 1, now() - interval '45 days'),
  ('00000000-0000-0000-0016-000000000014', '00000000-0000-0000-0015-000000000004', '00000000-0000-0000-0002-000000000017', 'member', null, 0, now() - interval '42 days'),
  ('00000000-0000-0000-0016-000000000015', '00000000-0000-0000-0015-000000000004', '00000000-0000-0000-0002-000000000019', 'member', null, 0, now() - interval '38 days'),
  -- Harbor Trades (5 members)
  ('00000000-0000-0000-0016-000000000016', '00000000-0000-0000-0015-000000000005', '00000000-0000-0000-0002-000000000024', 'steward', now() - interval '48 days', 1, now() - interval '48 days'),
  ('00000000-0000-0000-0016-000000000017', '00000000-0000-0000-0015-000000000005', '00000000-0000-0000-0002-000000000026', 'member', null, 0, now() - interval '46 days'),
  ('00000000-0000-0000-0016-000000000018', '00000000-0000-0000-0015-000000000005', '00000000-0000-0000-0002-000000000028', 'member', null, 0, now() - interval '44 days'),
  ('00000000-0000-0000-0016-000000000019', '00000000-0000-0000-0015-000000000005', '00000000-0000-0000-0002-000000000030', 'member', null, 0, now() - interval '42 days'),
  ('00000000-0000-0000-0016-000000000020', '00000000-0000-0000-0015-000000000005', '00000000-0000-0000-0002-000000000032', 'member', null, 0, now() - interval '15 days'),
  -- Harbor Hearts (3 members)
  ('00000000-0000-0000-0016-000000000021', '00000000-0000-0000-0015-000000000006', '00000000-0000-0000-0002-000000000025', 'steward', now() - interval '42 days', 1, now() - interval '42 days'),
  ('00000000-0000-0000-0016-000000000022', '00000000-0000-0000-0015-000000000006', '00000000-0000-0000-0002-000000000029', 'member', null, 0, now() - interval '40 days'),
  ('00000000-0000-0000-0016-000000000023', '00000000-0000-0000-0015-000000000006', '00000000-0000-0000-0002-000000000027', 'member', null, 0, now() - interval '38 days'),
  -- Monon Weavers (4 members)
  ('00000000-0000-0000-0016-000000000024', '00000000-0000-0000-0015-000000000007', '00000000-0000-0000-0002-000000000034', 'steward', now() - interval '40 days', 1, now() - interval '40 days'),
  ('00000000-0000-0000-0016-000000000025', '00000000-0000-0000-0015-000000000007', '00000000-0000-0000-0002-000000000035', 'member', null, 0, now() - interval '38 days'),
  ('00000000-0000-0000-0016-000000000026', '00000000-0000-0000-0015-000000000007', '00000000-0000-0000-0002-000000000036', 'member', null, 0, now() - interval '35 days'),
  ('00000000-0000-0000-0016-000000000027', '00000000-0000-0000-0015-000000000007', '00000000-0000-0000-0002-000000000037', 'member', null, 0, now() - interval '30 days'),
  -- Sunset Bridge (2 members)
  ('00000000-0000-0000-0016-000000000028', '00000000-0000-0000-0015-000000000008', '00000000-0000-0000-0002-000000000046', 'steward', now() - interval '35 days', 1, now() - interval '35 days'),
  ('00000000-0000-0000-0016-000000000029', '00000000-0000-0000-0015-000000000008', '00000000-0000-0000-0002-000000000045', 'member', null, 0, now() - interval '32 days'),
  -- Sunset Hearth (3 members)
  ('00000000-0000-0000-0016-000000000030', '00000000-0000-0000-0015-000000000009', '00000000-0000-0000-0002-000000000043', 'steward', now() - interval '30 days', 1, now() - interval '30 days'),
  ('00000000-0000-0000-0016-000000000031', '00000000-0000-0000-0015-000000000009', '00000000-0000-0000-0002-000000000044', 'member', null, 0, now() - interval '28 days'),
  ('00000000-0000-0000-0016-000000000032', '00000000-0000-0000-0015-000000000009', '00000000-0000-0000-0002-000000000048', 'member', null, 0, now() - interval '20 days'),
  -- Riverside Crafters (inactive, 3 members remain in DB)
  ('00000000-0000-0000-0016-000000000033', '00000000-0000-0000-0015-000000000010', '00000000-0000-0000-0002-000000000019', 'steward', now() - interval '60 days', 1, now() - interval '60 days'),
  ('00000000-0000-0000-0016-000000000034', '00000000-0000-0000-0015-000000000010', '00000000-0000-0000-0002-000000000015', 'member', null, 0, now() - interval '58 days'),
  ('00000000-0000-0000-0016-000000000035', '00000000-0000-0000-0015-000000000010', '00000000-0000-0000-0002-000000000017', 'member', null, 0, now() - interval '55 days')
ON CONFLICT (guild_id, user_id) DO NOTHING;

-- ============================================================================
-- SECTION 22: Endorsements (25)
-- UUID pattern: 00000000-0000-0000-0017-NNNNNNNNNNNN
-- All 7 domains, quest-linked and freestanding
-- Unique on (from_user, to_user, domain)
-- ============================================================================

INSERT INTO endorsements (id, from_user, to_user, domain, skill, message, quest_id, created_at) VALUES
  -- Craft endorsements
  ('00000000-0000-0000-0017-000000000001', '00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0002-000000000028', 'craft', 'carpentry', 'Jerome rebuilt my porch railing perfectly. True craftsman.', '00000000-0000-0000-0010-000000000018', now() - interval '75 days'),
  ('00000000-0000-0000-0017-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000004', 'craft', 'electrical', 'Tom rewired the community center stage. Expert work.', '00000000-0000-0000-0010-000000000005', now() - interval '40 days'),
  ('00000000-0000-0000-0017-000000000003', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0002-000000000008', 'craft', 'plumbing', 'Marcus knows his pipes! Fixed my sink in 20 minutes.', null, now() - interval '55 days'),
  ('00000000-0000-0000-0017-000000000004', '00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0002-000000000044', 'craft', 'woodworking', 'Harold taught 8 people to build birdhouses. Patient teacher.', '00000000-0000-0000-0010-000000000032', now() - interval '47 days'),
  -- Green endorsements
  ('00000000-0000-0000-0017-000000000005', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0002-000000000014', 'green', 'urban farming', 'Zoe runs the best community garden in Austin.', '00000000-0000-0000-0010-000000000009', now() - interval '77 days'),
  ('00000000-0000-0000-0017-000000000006', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0002-000000000006', 'green', 'landscaping', 'David helped me redesign my whole backyard. Amazing eye.', null, now() - interval '60 days'),
  ('00000000-0000-0000-0017-000000000007', '00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0002-000000000016', 'green', 'water quality', 'Mia brought real science to our creek monitoring.', '00000000-0000-0000-0010-000000000014', now() - interval '20 days'),
  -- Care endorsements
  ('00000000-0000-0000-0017-000000000008', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0002-000000000001', 'care', 'tutoring', 'Maria is the best math tutor. My daughter loves fractions now!', '00000000-0000-0000-0010-000000000004', now() - interval '45 days'),
  ('00000000-0000-0000-0017-000000000009', '00000000-0000-0000-0002-000000000031', '00000000-0000-0000-0002-000000000025', 'care', 'childcare', 'Diane is the best after-school caregiver. My daughter adores her.', null, now() - interval '35 days'),
  ('00000000-0000-0000-0017-000000000010', '00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0002-000000000045', 'care', 'elder companionship', 'Chloe organized wonderful visits for our homebound elders.', '00000000-0000-0000-0010-000000000033', now() - interval '28 days'),
  -- Bridge endorsements
  ('00000000-0000-0000-0017-000000000011', '00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0002-000000000046', 'bridge', 'delivery', 'Walt delivers groceries rain or shine. Reliable as the mail.', '00000000-0000-0000-0010-000000000035', now() - interval '28 days'),
  ('00000000-0000-0000-0017-000000000012', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0002-000000000003', 'bridge', 'moving', 'Priya and husband helped move my couch up impossible stairs.', '00000000-0000-0000-0010-000000000002', now() - interval '62 days'),
  -- Signal endorsements
  ('00000000-0000-0000-0017-000000000013', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0002-000000000015', 'signal', 'tech support', 'Dev ran an incredible bike tune-up and tech clinic.', '00000000-0000-0000-0010-000000000010', now() - interval '72 days'),
  ('00000000-0000-0000-0017-000000000014', '00000000-0000-0000-0002-000000000035', '00000000-0000-0000-0002-000000000039', 'signal', 'networking', 'Omar optimized our whole block WiFi setup. Fast internet!', null, now() - interval '30 days'),
  ('00000000-0000-0000-0017-000000000015', '00000000-0000-0000-0002-000000000036', '00000000-0000-0000-0002-000000000038', 'signal', 'teaching', 'Claire makes French feel easy. Wonderful teacher.', null, now() - interval '38 days'),
  -- Hearth endorsements
  ('00000000-0000-0000-0017-000000000016', '00000000-0000-0000-0002-000000000035', '00000000-0000-0000-0002-000000000037', 'hearth', 'cooking', 'Sam smokes the best brisket on the Monon. Incredible BBQ.', '00000000-0000-0000-0010-000000000025', now() - interval '45 days'),
  ('00000000-0000-0000-0017-000000000017', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000003', 'hearth', 'meal prep', 'Priya''s tikka masala is legendary. Feeds the whole street.', null, now() - interval '70 days'),
  ('00000000-0000-0000-0017-000000000018', '00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0002-000000000027', 'hearth', 'baking', 'Angela keeps the whole neighborhood fed with fresh bread.', null, now() - interval '50 days'),
  -- Weave endorsements
  ('00000000-0000-0000-0017-000000000019', '00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0002-000000000013', 'weave', 'organizing', 'Kai is the heart of Riverside Commons. Incredible organizer.', '00000000-0000-0000-0010-000000000011', now() - interval '47 days'),
  ('00000000-0000-0000-0017-000000000020', '00000000-0000-0000-0002-000000000037', '00000000-0000-0000-0002-000000000035', 'weave', 'event planning', 'Jenny coordinated the whole block party. Flawless execution.', '00000000-0000-0000-0010-000000000028', now() - interval '14 days'),
  ('00000000-0000-0000-0017-000000000021', '00000000-0000-0000-0002-000000000025', '00000000-0000-0000-0002-000000000024', 'weave', 'mentoring', 'Frank mentors young tradespeople with patience and wisdom.', null, now() - interval '40 days'),
  -- Cross-domain freestanding endorsements
  ('00000000-0000-0000-0017-000000000022', '00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0002-000000000001', 'green', 'gardening', 'Maria keeps the most beautiful garden in Maplewood.', null, now() - interval '55 days'),
  ('00000000-0000-0000-0017-000000000023', '00000000-0000-0000-0002-000000000034', '00000000-0000-0000-0002-000000000036', 'signal', 'history', 'Rick knows more about the Monon trail than anyone alive.', null, now() - interval '35 days'),
  ('00000000-0000-0000-0017-000000000024', '00000000-0000-0000-0002-000000000048', '00000000-0000-0000-0002-000000000043', 'weave', 'governance', 'Gloria bridges generations like no one else.', null, now() - interval '15 days'),
  ('00000000-0000-0000-0017-000000000025', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0002-000000000005', 'care', 'pet care', 'Sarah watched my dog for a week. He didn''t want to come home!', null, now() - interval '25 days')
ON CONFLICT (from_user, to_user, domain) DO NOTHING;

-- ============================================================================
-- SECTION 23: Governance Proposals (8)
-- UUID pattern: 00000000-0000-0000-0018-NNNNNNNNNNNN
-- All 6 statuses, all 3 vote types, all 8 categories
-- ============================================================================

INSERT INTO governance_proposals (id, community_id, guild_id, author_id, title, description, category, status, vote_type, votes_for, votes_against, quorum, deliberation_ends_at, voting_ends_at, created_at) VALUES
  -- Passed: charter amendment, quadratic (Riverside)
  ('00000000-0000-0000-0018-000000000001', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0015-000000000003', '00000000-0000-0000-0002-000000000013', 'Riverside Trail Maintenance Charter', 'Establish a formal charter for monthly trail maintenance with defined roles and responsibilities.', 'charter_amendment', 'passed', 'quadratic', 5, 2, 3, now() - interval '30 days', now() - interval '22 days', now() - interval '35 days'),
  -- Voting: quest template, approval (Maplewood)
  ('00000000-0000-0000-0018-000000000002', '00000000-0000-0000-0001-000000000001', null, '00000000-0000-0000-0002-000000000001', 'Seasonal Garden Quest Template', 'Create a reusable quest template for seasonal garden preparation tasks.', 'quest_template', 'voting', 'approval', 6, 0, 3, now() - interval '10 days', now() + interval '5 days', now() - interval '20 days'),
  -- Deliberation: threshold change, quadratic (Harbor Point)
  ('00000000-0000-0000-0018-000000000003', '00000000-0000-0000-0001-000000000003', null, '00000000-0000-0000-0002-000000000024', 'Raise Pillar Renown Threshold to 75', 'Increase the renown threshold for Pillar tier from 50 to 75 to ensure deeper community engagement.', 'threshold_change', 'deliberation', 'quadratic', 0, 0, 3, now() + interval '7 days', now() + interval '21 days', now() - interval '5 days'),
  -- Draft: seasonal quest (Sunrise)
  ('00000000-0000-0000-0018-000000000004', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0015-000000000007', '00000000-0000-0000-0002-000000000034', 'Monon Winter Festival Quest Series', 'A series of seasonal quests for the winter holiday festival on the trail.', 'seasonal_quest', 'draft', 'quadratic', 0, 0, 3, null, null, now() - interval '3 days'),
  -- Passed: charter amendment, quadratic (Sunset Ridge) — at exact quorum
  ('00000000-0000-0000-0018-000000000005', '00000000-0000-0000-0001-000000000005', null, '00000000-0000-0000-0002-000000000043', 'Sunset Ridge Community Charter', 'Establish the founding charter for Sunset Ridge with sunset clause and renewal process.', 'charter_amendment', 'passed', 'quadratic', 3, 0, 3, now() - interval '25 days', now() - interval '18 days', now() - interval '30 days'),
  -- Rejected: rule change (Riverside)
  ('00000000-0000-0000-0018-000000000006', '00000000-0000-0000-0001-000000000002', null, '00000000-0000-0000-0002-000000000015', 'Mandatory Photo Verification for All Quests', 'Require photo evidence for all quest completions, not just Flame and above.', 'rule_change', 'rejected', 'quadratic', 1, 5, 3, now() - interval '20 days', now() - interval '12 days', now() - interval '25 days'),
  -- Expired: guild charter (Harbor Point)
  ('00000000-0000-0000-0018-000000000007', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0015-000000000005', '00000000-0000-0000-0002-000000000026', 'Harbor Trades Apprenticeship Program', 'Create a formal apprenticeship track within Harbor Trades guild.', 'guild_charter', 'expired', 'approval', 2, 0, 5, now() - interval '30 days', now() - interval '15 days', now() - interval '40 days'),
  -- Voting: federation, liquid delegate (Maplewood + Riverside)
  ('00000000-0000-0000-0018-000000000008', '00000000-0000-0000-0001-000000000001', null, '00000000-0000-0000-0002-000000000001', 'Federation Agreement with Riverside Commons', 'Establish a reciprocal federation agreement allowing cross-community quest participation.', 'federation', 'voting', 'liquid_delegate', 2, 0, 3, now() - interval '8 days', now() + interval '7 days', now() - interval '15 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 24: Governance Votes (25)
-- UUID pattern: 00000000-0000-0000-0019-NNNNNNNNNNNN
-- Quadratic math: vote_weight = sqrt(credits_spent), N votes = N^2 credits
-- Liquid delegation, approval voting
-- ============================================================================

INSERT INTO governance_votes (id, proposal_id, voter_id, vote_type, credits_spent, vote_weight, delegate_to_id, in_favor, created_at) VALUES
  -- Proposal 1 (passed, quadratic): votes_for=5, votes_against=2
  -- For: 2+1+1+1 = 5 weight (4+1+1+1 = 7 credits)
  -- Against: 1+1 = 2 weight (1+1 = 2 credits) — includes vote 21
  ('00000000-0000-0000-0019-000000000001', '00000000-0000-0000-0018-000000000001', '00000000-0000-0000-0002-000000000014', 'quadratic', 4, 2.0, null, true, now() - interval '28 days'),
  ('00000000-0000-0000-0019-000000000002', '00000000-0000-0000-0018-000000000001', '00000000-0000-0000-0002-000000000015', 'quadratic', 1, 1.0, null, true, now() - interval '27 days'),
  ('00000000-0000-0000-0019-000000000003', '00000000-0000-0000-0018-000000000001', '00000000-0000-0000-0002-000000000016', 'quadratic', 1, 1.0, null, true, now() - interval '26 days'),
  ('00000000-0000-0000-0019-000000000004', '00000000-0000-0000-0018-000000000001', '00000000-0000-0000-0002-000000000020', 'quadratic', 1, 1.0, null, true, now() - interval '25 days'),
  ('00000000-0000-0000-0019-000000000005', '00000000-0000-0000-0018-000000000001', '00000000-0000-0000-0002-000000000019', 'quadratic', 1, 1.0, null, false, now() - interval '24 days'),
  -- Proposal 2 (voting, approval): votes_for=6 — includes votes 22,23,25
  ('00000000-0000-0000-0019-000000000006', '00000000-0000-0000-0018-000000000002', '00000000-0000-0000-0002-000000000002', 'approval', 1, 1.0, null, true, now() - interval '8 days'),
  ('00000000-0000-0000-0019-000000000007', '00000000-0000-0000-0018-000000000002', '00000000-0000-0000-0002-000000000003', 'approval', 1, 1.0, null, true, now() - interval '7 days'),
  ('00000000-0000-0000-0019-000000000008', '00000000-0000-0000-0018-000000000002', '00000000-0000-0000-0002-000000000006', 'approval', 1, 1.0, null, true, now() - interval '6 days'),
  -- Proposal 5 (passed, quadratic, at exact quorum): votes_for=3, votes_against=0
  -- 1+1+1 = 3 weight (1+1+1 = 3 credits)
  ('00000000-0000-0000-0019-000000000009', '00000000-0000-0000-0018-000000000005', '00000000-0000-0000-0002-000000000044', 'quadratic', 1, 1.0, null, true, now() - interval '20 days'),
  ('00000000-0000-0000-0019-000000000010', '00000000-0000-0000-0018-000000000005', '00000000-0000-0000-0002-000000000045', 'quadratic', 1, 1.0, null, true, now() - interval '19 days'),
  ('00000000-0000-0000-0019-000000000011', '00000000-0000-0000-0018-000000000005', '00000000-0000-0000-0002-000000000046', 'quadratic', 1, 1.0, null, true, now() - interval '19 days'),
  -- Proposal 6 (rejected, quadratic): votes_for=1, votes_against=5
  -- For: 1 weight (1 credit)
  -- Against: 2+1+1+1 = 5 weight (4+1+1+1 = 7 credits) — includes vote 24
  ('00000000-0000-0000-0019-000000000012', '00000000-0000-0000-0018-000000000006', '00000000-0000-0000-0002-000000000015', 'quadratic', 1, 1.0, null, true, now() - interval '15 days'),
  ('00000000-0000-0000-0019-000000000013', '00000000-0000-0000-0018-000000000006', '00000000-0000-0000-0002-000000000013', 'quadratic', 4, 2.0, null, false, now() - interval '14 days'),
  ('00000000-0000-0000-0019-000000000014', '00000000-0000-0000-0018-000000000006', '00000000-0000-0000-0002-000000000014', 'quadratic', 1, 1.0, null, false, now() - interval '14 days'),
  ('00000000-0000-0000-0019-000000000015', '00000000-0000-0000-0018-000000000006', '00000000-0000-0000-0002-000000000016', 'quadratic', 1, 1.0, null, false, now() - interval '13 days'),
  -- Proposal 7 (expired, approval): votes_for=2 (below quorum of 5)
  ('00000000-0000-0000-0019-000000000016', '00000000-0000-0000-0018-000000000007', '00000000-0000-0000-0002-000000000026', 'approval', 1, 1.0, null, true, now() - interval '20 days'),
  ('00000000-0000-0000-0019-000000000017', '00000000-0000-0000-0018-000000000007', '00000000-0000-0000-0002-000000000028', 'approval', 1, 1.0, null, true, now() - interval '18 days'),
  -- Proposal 8 (voting, liquid_delegate): votes_for=2, includes delegation
  ('00000000-0000-0000-0019-000000000018', '00000000-0000-0000-0018-000000000008', '00000000-0000-0000-0002-000000000002', 'quadratic', 1, 1.0, null, true, now() - interval '5 days'),
  ('00000000-0000-0000-0019-000000000019', '00000000-0000-0000-0018-000000000008', '00000000-0000-0000-0002-000000000004', 'liquid_delegate', 0, 0.0, '00000000-0000-0000-0002-000000000002', true, now() - interval '4 days'),
  ('00000000-0000-0000-0019-000000000020', '00000000-0000-0000-0018-000000000008', '00000000-0000-0000-0002-000000000003', 'quadratic', 1, 1.0, null, true, now() - interval '3 days'),
  -- Additional votes for coverage
  ('00000000-0000-0000-0019-000000000021', '00000000-0000-0000-0018-000000000001', '00000000-0000-0000-0002-000000000017', 'quadratic', 1, 1.0, null, false, now() - interval '23 days'),
  ('00000000-0000-0000-0019-000000000022', '00000000-0000-0000-0018-000000000002', '00000000-0000-0000-0002-000000000004', 'approval', 1, 1.0, null, true, now() - interval '5 days'),
  ('00000000-0000-0000-0019-000000000023', '00000000-0000-0000-0018-000000000002', '00000000-0000-0000-0002-000000000005', 'approval', 1, 1.0, null, true, now() - interval '4 days'),
  ('00000000-0000-0000-0019-000000000024', '00000000-0000-0000-0018-000000000006', '00000000-0000-0000-0002-000000000018', 'quadratic', 1, 1.0, null, false, now() - interval '13 days'),
  ('00000000-0000-0000-0019-000000000025', '00000000-0000-0000-0018-000000000002', '00000000-0000-0000-0002-000000000007', 'approval', 1, 1.0, null, true, now() - interval '4 days')
ON CONFLICT (proposal_id, voter_id) DO NOTHING;

-- ============================================================================
-- SECTION 25: Sunset Rules (12)
-- UUID pattern: 00000000-0000-0000-001a-NNNNNNNNNNNN
-- All 7 rule types, renewed/expired/approaching
-- ============================================================================

INSERT INTO sunset_rules (id, community_id, rule_type, resource_id, description, enacted_at, expires_at, renewal_count, last_renewed_at, renewal_proposal_id, active, created_at) VALUES
  -- Community charters
  ('00000000-0000-0000-001a-000000000001', '00000000-0000-0000-0001-000000000001', 'community_charter', '00000000-0000-0000-0001-000000000001', 'Maplewood Heights founding charter — community values and governance structure.', now() - interval '85 days', now() + interval '640 days', 0, null, null, true, now() - interval '85 days'),
  ('00000000-0000-0000-001a-000000000002', '00000000-0000-0000-0001-000000000002', 'community_charter', '00000000-0000-0000-0001-000000000002', 'Riverside Commons sustainability charter — environmental commitments and governance.', now() - interval '82 days', now() + interval '648 days', 0, null, null, true, now() - interval '82 days'),
  ('00000000-0000-0000-001a-000000000003', '00000000-0000-0000-0001-000000000005', 'community_charter', '00000000-0000-0000-0001-000000000005', 'Sunset Ridge intergenerational charter.', now() - interval '18 days', now() + interval '712 days', 0, null, '00000000-0000-0000-0018-000000000005', true, now() - interval '18 days'),
  -- Guild charters
  ('00000000-0000-0000-001a-000000000004', '00000000-0000-0000-0001-000000000001', 'guild_charter', '00000000-0000-0000-0015-000000000001', 'Maplewood Green Thumbs guild charter.', now() - interval '55 days', now() + interval '310 days', 0, null, null, true, now() - interval '55 days'),
  ('00000000-0000-0000-001a-000000000005', '00000000-0000-0000-0001-000000000003', 'guild_charter', '00000000-0000-0000-0015-000000000005', 'Harbor Trades guild charter — approaching renewal.', now() - interval '48 days', now() + interval '25 days', 0, null, null, true, now() - interval '48 days'),
  -- Tier threshold rule
  ('00000000-0000-0000-001a-000000000006', '00000000-0000-0000-0001-000000000001', 'tier_threshold', null, 'Pillar tier threshold set at 50 renown for Maplewood Heights.', now() - interval '80 days', now() + interval '285 days', 0, null, null, true, now() - interval '80 days'),
  -- Federation agreement rule
  ('00000000-0000-0000-001a-000000000007', '00000000-0000-0000-0001-000000000001', 'federation_agreement', '00000000-0000-0000-001b-000000000001', 'Federation terms with Riverside Commons.', now() - interval '10 days', now() + interval '355 days', 0, null, null, true, now() - interval '10 days'),
  -- Seasonal quest template
  ('00000000-0000-0000-001a-000000000008', '00000000-0000-0000-0001-000000000002', 'seasonal_quest_template', null, 'Winter cover crop planting quest template — annual renewal.', now() - interval '80 days', now() + interval '285 days', 1, now() - interval '10 days', '00000000-0000-0000-0018-000000000001', true, now() - interval '80 days'),
  -- Reputation multiplier rule
  ('00000000-0000-0000-001a-000000000009', '00000000-0000-0000-0001-000000000003', 'reputation_multiplier', null, 'Harbor Point emergency quest bonus multiplier (1.5x).', now() - interval '45 days', now() + interval '320 days', 0, null, null, true, now() - interval '45 days'),
  -- Moderation policy
  ('00000000-0000-0000-001a-000000000010', '00000000-0000-0000-0001-000000000001', 'moderation_policy', null, 'Maplewood Heights content flagging policy — 3 flags auto-hide.', now() - interval '85 days', now() + interval '280 days', 0, null, null, true, now() - interval '85 days'),
  -- Expired rule
  ('00000000-0000-0000-001a-000000000011', '00000000-0000-0000-0001-000000000002', 'moderation_policy', null, 'Riverside old moderation policy — expired, replaced.', now() - interval '82 days', now() - interval '5 days', 0, null, null, false, now() - interval '82 days'),
  -- Approaching expiry (within 30 days)
  ('00000000-0000-0000-001a-000000000012', '00000000-0000-0000-0001-000000000004', 'community_charter', '00000000-0000-0000-0001-000000000004', 'Sunrise on the Monon provisional charter — expires soon, needs renewal vote.', now() - interval '70 days', now() + interval '20 days', 0, null, null, true, now() - interval '70 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 26: Federation Agreements (2)
-- UUID pattern: 00000000-0000-0000-001b-NNNNNNNNNNNN
-- 1 active, 1 expired
-- ============================================================================

INSERT INTO federation_agreements (id, local_community_id, remote_instance_url, remote_community_name, terms, active, expires_at, created_at) VALUES
  ('00000000-0000-0000-001b-000000000001', '00000000-0000-0000-0001-000000000001', 'https://riverside.civicforge.org', 'Riverside Commons', 'Reciprocal quest participation: members of either community may claim and complete quests in the other. Skill XP earned counts toward both communities. Renown is community-specific.', true, now() + interval '355 days', now() - interval '10 days'),
  ('00000000-0000-0000-001b-000000000002', '00000000-0000-0000-0001-000000000003', 'https://example-community.civicforge.org', 'Bayview Heights', 'Pilot federation agreement for shared seasonal quests. Limited to Blaze+ difficulty quests only.', false, now() - interval '10 days', now() - interval '60 days')
ON CONFLICT (id) DO NOTHING;

-- Re-enable FK checks
SET session_replication_role = 'origin';

COMMIT;
