-- ============================================================================
-- CivicForge V2.5 UAT Seed Data
-- ~1175 rows across 25 tables, 5 communities, 110 users
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
ON CONFLICT (id) DO NOTHING;

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


-- ============================================================================
-- SEED DATA EXPANSION: Richer Commons Dashboard Visualizations
-- Adds ~550 rows across profiles, quests, validations, skills, guilds,
-- endorsements, governance, and sunset rules to fill K-anonymity gaps.
-- ============================================================================

-- ============================================================================
-- CivicForge Seed Data Expansion #1
-- 60 profiles, 170 skill_progress rows, 60 user_consents rows
-- Generated 2026-02-09
-- ============================================================================

-- ============================================================================
-- SECTION 2: PROFILES (60 rows, IDs 51-110)
-- ============================================================================

INSERT INTO profiles (id, display_name, community_id, bio, skills, reputation_score, renown_tier, renown_score, privacy_tier, phone_verified, created_at) VALUES

-- Maplewood Heights (Portland, OR) — IDs 51-62
('00000000-0000-0000-0002-000000000051', 'Kenji Yamamoto', '00000000-0000-0000-0001-000000000001', 'Master carpenter and former shop teacher. Volunteers at Habitat for Humanity builds.', ARRAY['carpentry','woodworking','home repair','mentoring','gardening'], 45, 5, 550, 'mentor', true, now() - interval '84 days'),
('00000000-0000-0000-0002-000000000052', 'Dorothy Fletcher', '00000000-0000-0000-0001-000000000001', 'Retired pediatrician and community grandma. Organizes neighborhood potlucks.', ARRAY['eldercare','childcare','cooking','organizing','mentoring'], 42, 5, 530, 'mentor', true, now() - interval '82 days'),
('00000000-0000-0000-0002-000000000053', 'Raj Gupta', '00000000-0000-0000-0001-000000000001', 'Data scientist at a health tech startup. Teaches coding workshops at the library.', ARRAY['tech help','coding','tutoring','data analysis'], 28, 4, 240, 'open', true, now() - interval '79 days'),
('00000000-0000-0000-0002-000000000054', 'Anna Sokolova', '00000000-0000-0000-0001-000000000001', 'Environmental consultant and permaculture enthusiast. Runs composting workshops.', ARRAY['composting','gardening','environmental','teaching'], 24, 4, 220, 'open', true, now() - interval '76 days'),
('00000000-0000-0000-0002-000000000055', 'Miguel Herrera', '00000000-0000-0000-0001-000000000001', 'Uber driver and handyman. Knows every shortcut in Portland.', ARRAY['transportation','delivery','home repair','moving'], 16, 3, 90, 'open', true, now() - interval '72 days'),
('00000000-0000-0000-0002-000000000056', 'Grace Park', '00000000-0000-0000-0001-000000000001', 'Pediatric nurse who runs first aid workshops for parents.', ARRAY['first aid','childcare','teaching','meal prep'], 14, 3, 75, 'open', true, now() - interval '66 days'),
('00000000-0000-0000-0002-000000000057', 'Thomas Bailey', '00000000-0000-0000-0001-000000000001', 'Landscape designer working on native plant restoration projects.', ARRAY['landscaping','gardening','composting','organizing'], 11, 3, 60, 'quiet', true, now() - interval '58 days'),
('00000000-0000-0000-0002-000000000058', 'Fatima Al-Rashid', '00000000-0000-0000-0001-000000000001', 'Home baker who makes the best baklava on the block. Hosts baking classes.', ARRAY['baking','cooking','event planning'], 7, 2, 30, 'quiet', true, now() - interval '50 days'),
('00000000-0000-0000-0002-000000000059', 'Kevin Murphy', '00000000-0000-0000-0001-000000000001', 'Off-duty paramedic. Handy with drywall and basic plumbing.', ARRAY['first aid','home repair','plumbing'], 6, 2, 22, 'open', true, now() - interval '42 days'),
('00000000-0000-0000-0002-000000000060', 'Lily Nakamura', '00000000-0000-0000-0001-000000000001', 'UX designer working remotely. Helps neighbors with tech and design.', ARRAY['tech help','design','photography'], 5, 2, 18, 'quiet', false, now() - interval '35 days'),
('00000000-0000-0000-0002-000000000061', 'Jasper Doyle', '00000000-0000-0000-0001-000000000001', 'Just finished grad school. Looking for community while job hunting.', ARRAY['tutoring','writing'], 1, 1, 4, 'quiet', false, now() - interval '16 days'),
('00000000-0000-0000-0002-000000000062', 'Mei-Lin Wu', '00000000-0000-0000-0001-000000000001', 'Recently relocated from San Francisco. Works in biotech.', ARRAY['science','cooking'], 0, 1, 0, 'ghost', false, now() - interval '8 days'),

-- Riverside Commons (Austin, TX) — IDs 63-74
('00000000-0000-0000-0002-000000000063', 'Maya Jackson', '00000000-0000-0000-0001-000000000002', 'Community mediator and nonprofit director. Bridges divides through dialogue.', ARRAY['mediation','organizing','governance','counseling','teaching'], 48, 5, 560, 'mentor', true, now() - interval '85 days'),
('00000000-0000-0000-0002-000000000064', 'Carlos Gutierrez', '00000000-0000-0000-0001-000000000002', 'Urban farmer and composting evangelist. Runs a community seed library.', ARRAY['urban farming','composting','gardening','delivery','cooking'], 43, 5, 510, 'mentor', true, now() - interval '83 days'),
('00000000-0000-0000-0002-000000000065', 'Priya Anand', '00000000-0000-0000-0001-000000000002', 'Software architect who builds apps for community organizations.', ARRAY['coding','tech help','teaching','data analysis'], 29, 4, 250, 'open', true, now() - interval '77 days'),
('00000000-0000-0000-0002-000000000066', 'Liam O''Sullivan', '00000000-0000-0000-0001-000000000002', 'Bicycle mechanic and DIY solar panel installer. Sustainability through action.', ARRAY['bike repair','solar','home repair','welding','delivery'], 22, 4, 210, 'open', true, now() - interval '73 days'),
('00000000-0000-0000-0002-000000000067', 'Amara Osei', '00000000-0000-0000-0001-000000000002', 'Social worker specializing in youth programs. Runs after-school tutoring.', ARRAY['counseling','childcare','tutoring','cooking'], 15, 3, 80, 'open', true, now() - interval '68 days'),
('00000000-0000-0000-0002-000000000068', 'Ethan Rivers', '00000000-0000-0000-0001-000000000002', 'Environmental science grad student. Passionate about native plant restoration.', ARRAY['gardening','composting','science','hiking'], 13, 3, 65, 'quiet', true, now() - interval '60 days'),
('00000000-0000-0000-0002-000000000069', 'Luna Vasquez', '00000000-0000-0000-0001-000000000002', 'Freelance web developer and community radio host. Bilingual English/Spanish.', ARRAY['tech help','translation','event planning','writing'], 11, 3, 55, 'open', true, now() - interval '53 days'),
('00000000-0000-0000-0002-000000000070', 'Jin Park', '00000000-0000-0000-0001-000000000002', 'Bike courier and amateur mechanic. Delivers for local co-ops.', ARRAY['delivery','bike repair','moving','errands'], 7, 2, 25, 'quiet', true, now() - interval '45 days'),
('00000000-0000-0000-0002-000000000071', 'Sage Williams', '00000000-0000-0000-0001-000000000002', 'Herbalist and backyard beekeeper. Sells honey at the farmers market.', ARRAY['gardening','beekeeping','herbalism'], 5, 2, 18, 'quiet', false, now() - interval '38 days'),
('00000000-0000-0000-0002-000000000072', 'Ruby Chen', '00000000-0000-0000-0001-000000000002', 'Pastry chef at a local bakery. Brings treats to every community event.', ARRAY['baking','cooking','event planning'], 4, 2, 12, 'open', false, now() - interval '30 days'),
('00000000-0000-0000-0002-000000000073', 'Diego Moreno', '00000000-0000-0000-0001-000000000002', 'New to Austin from Mexico City. Looking for community and pickup soccer.', ARRAY['cooking','soccer'], 1, 1, 3, 'quiet', false, now() - interval '17 days'),
('00000000-0000-0000-0002-000000000074', 'Iris Kim', '00000000-0000-0000-0001-000000000002', 'UT Austin freshman studying environmental engineering.', ARRAY['science','tutoring'], 0, 1, 0, 'ghost', false, now() - interval '9 days'),

-- Harbor Point (Baltimore, MD) — IDs 75-86
('00000000-0000-0000-0002-000000000075', 'Reggie Carter', '00000000-0000-0000-0001-000000000003', 'Master electrician and union steward. Mentors apprentices on weekends.', ARRAY['electrical','carpentry','welding','mentoring','organizing'], 44, 5, 540, 'open', true, now() - interval '83 days'),
('00000000-0000-0000-0002-000000000076', 'Mary O''Malley', '00000000-0000-0000-0001-000000000003', 'Retired school principal. Runs the neighborhood homework help center.', ARRAY['tutoring','childcare','organizing','cooking','teaching'], 41, 5, 505, 'mentor', true, now() - interval '80 days'),
('00000000-0000-0000-0002-000000000077', 'Tyrone Jackson', '00000000-0000-0000-0001-000000000003', 'Roofer with 15 years experience. Volunteers for emergency storm repairs.', ARRAY['roofing','carpentry','home repair','gardening'], 26, 4, 235, 'open', true, now() - interval '75 days'),
('00000000-0000-0000-0002-000000000078', 'Kim Tran', '00000000-0000-0000-0001-000000000003', 'Home health aide and CPR instructor. Always calm in a crisis.', ARRAY['eldercare','first aid','childcare','cooking','teaching'], 21, 4, 205, 'open', true, now() - interval '71 days'),
('00000000-0000-0000-0002-000000000079', 'Darnell Washington', '00000000-0000-0000-0001-000000000003', 'Truck driver and amateur BBQ pitmaster. Delivers furniture on the side.', ARRAY['transportation','delivery','moving','grilling'], 16, 3, 85, 'open', true, now() - interval '66 days'),
('00000000-0000-0000-0002-000000000080', 'Oksana Petrov', '00000000-0000-0000-0001-000000000003', 'Ukrainian baker. Her pierogies bring the whole block together.', ARRAY['baking','cooking','event planning','eldercare'], 13, 3, 70, 'quiet', true, now() - interval '59 days'),
('00000000-0000-0000-0002-000000000081', 'Jamal Brooks', '00000000-0000-0000-0001-000000000003', 'Youth basketball coach and community organizer. Keeps kids off the streets.', ARRAY['coaching','organizing','mentoring','event planning'], 10, 3, 55, 'open', true, now() - interval '52 days'),
('00000000-0000-0000-0002-000000000082', 'Colleen Murphy', '00000000-0000-0000-0001-000000000003', 'Visiting nurse who checks in on elderly neighbors after her shifts.', ARRAY['eldercare','first aid','transportation','cooking'], 7, 2, 28, 'quiet', true, now() - interval '44 days'),
('00000000-0000-0000-0002-000000000083', 'Huy Nguyen', '00000000-0000-0000-0001-000000000003', 'HVAC technician. Helps neighbors with heating and cooling problems.', ARRAY['hvac','home repair','electrical'], 5, 2, 20, 'open', true, now() - interval '36 days'),
('00000000-0000-0000-0002-000000000084', 'Destiny Adams', '00000000-0000-0000-0001-000000000003', 'Community college student studying horticulture. Starting a rooftop garden.', ARRAY['gardening','composting','errands'], 4, 2, 14, 'quiet', false, now() - interval '28 days'),
('00000000-0000-0000-0002-000000000085', 'Tommy Doyle', '00000000-0000-0000-0001-000000000003', 'Just got back from the Navy. Getting reacquainted with the neighborhood.', ARRAY['mechanical','errands'], 1, 1, 5, 'quiet', false, now() - interval '18 days'),
('00000000-0000-0000-0002-000000000086', 'Yuki Sato', '00000000-0000-0000-0001-000000000003', 'Johns Hopkins nursing student. Looking for a neighborhood to belong to.', ARRAY['first aid','tutoring'], 0, 1, 0, 'ghost', false, now() - interval '6 days'),

-- Sunrise on the Monon (Carmel, IN) — IDs 87-98
('00000000-0000-0000-0002-000000000087', 'Eleanor Whitfield', '00000000-0000-0000-0001-000000000004', 'Retired school superintendent. Bridges generations through community governance.', ARRAY['governance','organizing','mentoring','teaching','writing'], 47, 5, 570, 'mentor', true, now() - interval '73 days'),
('00000000-0000-0000-0002-000000000088', 'Marcus Chen', '00000000-0000-0000-0001-000000000004', 'Contractor and trail maintenance volunteer. Builds anything from decks to pergolas.', ARRAY['carpentry','home repair','landscaping','woodworking','gardening'], 43, 5, 520, 'mentor', true, now() - interval '71 days'),
('00000000-0000-0000-0002-000000000089', 'Patricia Wicks', '00000000-0000-0000-0001-000000000004', 'Cookbook author and neighborhood hostess. Her porch is always open.', ARRAY['cooking','baking','event planning','gardening','mentoring'], 41, 5, 505, 'open', true, now() - interval '69 days'),
('00000000-0000-0000-0002-000000000090', 'Amir Patel', '00000000-0000-0000-0001-000000000004', 'Cybersecurity engineer. Sets up home networks and teaches digital safety.', ARRAY['tech help','networking','coding','teaching'], 27, 4, 245, 'open', true, now() - interval '65 days'),
('00000000-0000-0000-0002-000000000091', 'Stephanie Lang', '00000000-0000-0000-0001-000000000004', 'Master gardener and farmer''s market organizer. Grows the best tomatoes in Carmel.', ARRAY['gardening','composting','cooking','organizing','teaching'], 23, 4, 215, 'open', true, now() - interval '61 days'),
('00000000-0000-0000-0002-000000000092', 'Jake Morrison', '00000000-0000-0000-0001-000000000004', 'Handyman and Monon trail maintenance crew lead. Built half the benches on the path.', ARRAY['carpentry','home repair','moving','landscaping'], 17, 3, 95, 'open', true, now() - interval '56 days'),
('00000000-0000-0000-0002-000000000093', 'Anita Sharma', '00000000-0000-0000-0001-000000000004', 'Yoga instructor and meal prep queen. Feeds the block on potluck nights.', ARRAY['cooking','childcare','teaching','meal prep'], 14, 3, 72, 'quiet', true, now() - interval '49 days'),
('00000000-0000-0000-0002-000000000094', 'Will Cooper', '00000000-0000-0000-0001-000000000004', 'Urban beekeeper and native plant advocate. His honey is legendary.', ARRAY['beekeeping','gardening','composting','organizing'], 12, 3, 58, 'open', true, now() - interval '42 days'),
('00000000-0000-0000-0002-000000000095', 'Hana Sato', '00000000-0000-0000-0001-000000000004', 'IT support specialist. Fixes printers and routers for the whole block.', ARRAY['tech help','networking','tutoring'], 6, 2, 26, 'quiet', true, now() - interval '34 days'),
('00000000-0000-0000-0002-000000000096', 'Brian Kelly', '00000000-0000-0000-0001-000000000004', 'FedEx driver who helps neighbors move packages and furniture.', ARRAY['delivery','moving','transportation'], 4, 2, 15, 'quiet', true, now() - interval '26 days'),
('00000000-0000-0000-0002-000000000097', 'Zara Ahmed', '00000000-0000-0000-0001-000000000004', 'New mom looking for playdate friends and neighborhood connections.', ARRAY['childcare','cooking'], 1, 1, 4, 'quiet', false, now() - interval '16 days'),
('00000000-0000-0000-0002-000000000098', 'Cody Barnes', '00000000-0000-0000-0001-000000000004', 'College student at Butler. Bikes the Monon daily and loves pickup basketball.', ARRAY['tutoring','errands'], 0, 1, 0, 'ghost', false, now() - interval '6 days'),

-- Sunset Ridge (Tucson, AZ) — IDs 99-110
('00000000-0000-0000-0002-000000000099', 'Isabel Reyes', '00000000-0000-0000-0001-000000000005', 'Retired social worker and neighborhood elder. Advocates for intergenerational connection.', ARRAY['counseling','organizing','mentoring','governance','eldercare'], 46, 5, 545, 'mentor', true, now() - interval '68 days'),
('00000000-0000-0000-0002-000000000100', 'Henry Nakamura', '00000000-0000-0000-0001-000000000005', 'Retired engineer and master gardener. Builds raised beds for neighbors.', ARRAY['carpentry','gardening','home repair','mentoring','woodworking'], 42, 5, 515, 'mentor', true, now() - interval '64 days'),
('00000000-0000-0000-0002-000000000101', 'Margaret Williams', '00000000-0000-0000-0001-000000000005', 'Church choir director who hosts Sunday suppers for the whole street.', ARRAY['cooking','event planning','music','mentoring','organizing'], 40, 5, 500, 'open', true, now() - interval '60 days'),
('00000000-0000-0000-0002-000000000102', 'Tomas Gutierrez', '00000000-0000-0000-0001-000000000005', 'Retired postal carrier turned neighborhood shuttle driver. Still knows every address.', ARRAY['transportation','delivery','errands','moving','mentoring'], 25, 4, 240, 'open', true, now() - interval '56 days'),
('00000000-0000-0000-0002-000000000103', 'Susan Park', '00000000-0000-0000-0001-000000000005', 'UA professor of education. Runs free tutoring for local kids.', ARRAY['tutoring','teaching','tech help','mentoring'], 22, 4, 210, 'mentor', true, now() - interval '51 days'),
('00000000-0000-0000-0002-000000000104', 'Andre Johnson', '00000000-0000-0000-0001-000000000005', 'Retired plumber who still helps with leaky faucets and backed-up drains.', ARRAY['plumbing','home repair','gardening','mentoring'], 15, 3, 88, 'open', true, now() - interval '46 days'),
('00000000-0000-0000-0002-000000000105', 'Mei Chen', '00000000-0000-0000-0001-000000000005', 'UA computer science grad student. Helps elders with phones and tablets.', ARRAY['tech help','tutoring','coding','translation'], 12, 3, 68, 'quiet', true, now() - interval '40 days'),
('00000000-0000-0000-0002-000000000106', 'Roberto Alvarez', '00000000-0000-0000-0001-000000000005', 'Retired bus driver. Now drives neighbors to appointments and runs errands.', ARRAY['transportation','delivery','errands','organizing'], 10, 3, 55, 'open', true, now() - interval '34 days'),
('00000000-0000-0000-0002-000000000107', 'Karen O''Brien', '00000000-0000-0000-0001-000000000005', 'Hospice volunteer and grief counselor. Brings comfort when it matters most.', ARRAY['eldercare','counseling','cooking'], 6, 2, 25, 'quiet', true, now() - interval '28 days'),
('00000000-0000-0000-0002-000000000108', 'David Yazzie', '00000000-0000-0000-0001-000000000005', 'Retired botanist with a passion for desert native plants. Teaches xeriscaping.', ARRAY['gardening','teaching','composting'], 5, 2, 18, 'quiet', true, now() - interval '22 days'),
('00000000-0000-0000-0002-000000000109', 'Samantha Liu', '00000000-0000-0000-0001-000000000005', 'UA culinary arts student. Cooks dinner for her elderly neighbors twice a week.', ARRAY['cooking','baking','meal prep'], 3, 2, 12, 'open', false, now() - interval '16 days'),
('00000000-0000-0000-0002-000000000110', 'Jason Cruz', '00000000-0000-0000-0001-000000000005', 'Just moved from Phoenix. Working at a call center while figuring out life.', ARRAY['errands','tech help'], 1, 1, 4, 'quiet', false, now() - interval '10 days')

ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- SECTION 17: SKILL PROGRESS (170 rows)
-- ============================================================================

INSERT INTO skill_progress (id, user_id, domain, total_xp, level, quests_completed, last_quest_at, created_at) VALUES

-- ── Maplewood Heights ──

-- 51 Kenji Yamamoto (T5): craft=500/L4, green=350/L3, signal=200/L2
('00000000-0000-0000-0012-000000000071', '00000000-0000-0000-0002-000000000051', 'craft',  500, 4, 18, now() - interval '3 days',  now() - interval '83 days'),
('00000000-0000-0000-0012-000000000072', '00000000-0000-0000-0002-000000000051', 'green',  350, 3, 12, now() - interval '7 days',  now() - interval '80 days'),
('00000000-0000-0000-0012-000000000073', '00000000-0000-0000-0002-000000000051', 'signal', 200, 2,  8, now() - interval '10 days', now() - interval '75 days'),

-- 52 Dorothy Fletcher (T5): care=400/L3, hearth=350/L3, weave=300/L2
('00000000-0000-0000-0012-000000000074', '00000000-0000-0000-0002-000000000052', 'care',   400, 3, 15, now() - interval '4 days',  now() - interval '81 days'),
('00000000-0000-0000-0012-000000000075', '00000000-0000-0000-0002-000000000052', 'hearth', 350, 3, 12, now() - interval '6 days',  now() - interval '78 days'),
('00000000-0000-0000-0012-000000000076', '00000000-0000-0000-0002-000000000052', 'weave',  300, 2, 10, now() - interval '9 days',  now() - interval '74 days'),

-- 53 Raj Gupta (T4): signal=380/L3, craft=250/L2
('00000000-0000-0000-0012-000000000077', '00000000-0000-0000-0002-000000000053', 'signal', 380, 3, 13, now() - interval '5 days',  now() - interval '78 days'),
('00000000-0000-0000-0012-000000000078', '00000000-0000-0000-0002-000000000053', 'craft',  250, 2,  9, now() - interval '8 days',  now() - interval '72 days'),

-- 54 Anna Sokolova (T4): green=350/L3, care=200/L2
('00000000-0000-0000-0012-000000000079', '00000000-0000-0000-0002-000000000054', 'green',  350, 3, 12, now() - interval '6 days',  now() - interval '75 days'),
('00000000-0000-0000-0012-000000000080', '00000000-0000-0000-0002-000000000054', 'care',   200, 2,  7, now() - interval '10 days', now() - interval '70 days'),

-- 55 Miguel Herrera (T3): bridge=200/L2, craft=150/L1
('00000000-0000-0000-0012-000000000081', '00000000-0000-0000-0002-000000000055', 'bridge', 200, 2,  7, now() - interval '8 days',  now() - interval '71 days'),
('00000000-0000-0000-0012-000000000082', '00000000-0000-0000-0002-000000000055', 'craft',  150, 1,  5, now() - interval '12 days', now() - interval '65 days'),

-- 56 Grace Park (T3): care=200/L2, signal=100/L1
('00000000-0000-0000-0012-000000000083', '00000000-0000-0000-0002-000000000056', 'care',   200, 2,  7, now() - interval '9 days',  now() - interval '65 days'),
('00000000-0000-0000-0012-000000000084', '00000000-0000-0000-0002-000000000056', 'signal', 100, 1,  4, now() - interval '14 days', now() - interval '60 days'),

-- 57 Thomas Bailey (T3): green=180/L2, weave=100/L1
('00000000-0000-0000-0012-000000000085', '00000000-0000-0000-0002-000000000057', 'green',  180, 2,  6, now() - interval '10 days', now() - interval '57 days'),
('00000000-0000-0000-0012-000000000086', '00000000-0000-0000-0002-000000000057', 'weave',  100, 1,  3, now() - interval '15 days', now() - interval '50 days'),

-- 58 Fatima Al-Rashid (T2): hearth=80/L1
('00000000-0000-0000-0012-000000000087', '00000000-0000-0000-0002-000000000058', 'hearth',  80, 1,  3, now() - interval '14 days', now() - interval '48 days'),

-- 59 Kevin Murphy (T2): craft=70/L1
('00000000-0000-0000-0012-000000000088', '00000000-0000-0000-0002-000000000059', 'craft',   70, 1,  2, now() - interval '16 days', now() - interval '40 days'),

-- 60 Lily Nakamura (T2): signal=60/L0
('00000000-0000-0000-0012-000000000089', '00000000-0000-0000-0002-000000000060', 'signal',  60, 0,  2, now() - interval '18 days', now() - interval '33 days'),

-- 61 Jasper (T1): no skill rows
-- 62 Mei-Lin (T1): no skill rows

-- ── Riverside Commons ──

-- 63 Maya Jackson (T5): weave=500/L4, care=350/L3, signal=200/L2
('00000000-0000-0000-0012-000000000090', '00000000-0000-0000-0002-000000000063', 'weave',  500, 4, 18, now() - interval '2 days',  now() - interval '84 days'),
('00000000-0000-0000-0012-000000000091', '00000000-0000-0000-0002-000000000063', 'care',   350, 3, 12, now() - interval '5 days',  now() - interval '80 days'),
('00000000-0000-0000-0012-000000000092', '00000000-0000-0000-0002-000000000063', 'signal', 200, 2,  7, now() - interval '9 days',  now() - interval '76 days'),

-- 64 Carlos Gutierrez (T5): green=450/L3, bridge=300/L2, hearth=200/L2
('00000000-0000-0000-0012-000000000093', '00000000-0000-0000-0002-000000000064', 'green',  450, 3, 16, now() - interval '3 days',  now() - interval '82 days'),
('00000000-0000-0000-0012-000000000094', '00000000-0000-0000-0002-000000000064', 'bridge', 300, 2, 10, now() - interval '6 days',  now() - interval '78 days'),
('00000000-0000-0000-0012-000000000095', '00000000-0000-0000-0002-000000000064', 'hearth', 200, 2,  7, now() - interval '10 days', now() - interval '74 days'),

-- 65 Priya Anand (T4): signal=350/L3, green=200/L2
('00000000-0000-0000-0012-000000000096', '00000000-0000-0000-0002-000000000065', 'signal', 350, 3, 12, now() - interval '4 days',  now() - interval '76 days'),
('00000000-0000-0000-0012-000000000097', '00000000-0000-0000-0002-000000000065', 'green',  200, 2,  7, now() - interval '8 days',  now() - interval '70 days'),

-- 66 Liam O'Sullivan (T4): craft=300/L2, bridge=200/L2
('00000000-0000-0000-0012-000000000098', '00000000-0000-0000-0002-000000000066', 'craft',  300, 2, 10, now() - interval '5 days',  now() - interval '72 days'),
('00000000-0000-0000-0012-000000000099', '00000000-0000-0000-0002-000000000066', 'bridge', 200, 2,  7, now() - interval '9 days',  now() - interval '67 days'),

-- 67 Amara Osei (T3): care=200/L2, hearth=100/L1
('00000000-0000-0000-0012-000000000100', '00000000-0000-0000-0002-000000000067', 'care',   200, 2,  7, now() - interval '7 days',  now() - interval '67 days'),
('00000000-0000-0000-0012-000000000101', '00000000-0000-0000-0002-000000000067', 'hearth', 100, 1,  4, now() - interval '12 days', now() - interval '60 days'),

-- 68 Ethan Rivers (T3): green=180/L2, craft=100/L1
('00000000-0000-0000-0012-000000000102', '00000000-0000-0000-0002-000000000068', 'green',  180, 2,  6, now() - interval '9 days',  now() - interval '59 days'),
('00000000-0000-0000-0012-000000000103', '00000000-0000-0000-0002-000000000068', 'craft',  100, 1,  3, now() - interval '14 days', now() - interval '53 days'),

-- 69 Luna Vasquez (T3): signal=150/L1, weave=100/L1
('00000000-0000-0000-0012-000000000104', '00000000-0000-0000-0002-000000000069', 'signal', 150, 1,  5, now() - interval '8 days',  now() - interval '52 days'),
('00000000-0000-0000-0012-000000000105', '00000000-0000-0000-0002-000000000069', 'weave',  100, 1,  3, now() - interval '13 days', now() - interval '46 days'),

-- 70 Jin Park (T2): bridge=80/L1, craft=50/L0
('00000000-0000-0000-0012-000000000106', '00000000-0000-0000-0002-000000000070', 'bridge',  80, 1,  3, now() - interval '15 days', now() - interval '44 days'),
('00000000-0000-0000-0012-000000000107', '00000000-0000-0000-0002-000000000070', 'craft',   50, 0,  2, now() - interval '20 days', now() - interval '40 days'),

-- 71 Sage Williams (T2): green=60/L0
('00000000-0000-0000-0012-000000000108', '00000000-0000-0000-0002-000000000071', 'green',   60, 0,  2, now() - interval '16 days', now() - interval '36 days'),

-- 72 Ruby Chen (T2): hearth=50/L0
('00000000-0000-0000-0012-000000000109', '00000000-0000-0000-0002-000000000072', 'hearth',  50, 0,  2, now() - interval '18 days', now() - interval '28 days'),

-- 73 Diego (T1): no skill rows
-- 74 Iris (T1): no skill rows

-- ── Harbor Point ──

-- 75 Reggie Carter (T5): craft=550/L4, weave=300/L2, bridge=200/L2
('00000000-0000-0000-0012-000000000110', '00000000-0000-0000-0002-000000000075', 'craft',  550, 4, 20, now() - interval '2 days',  now() - interval '82 days'),
('00000000-0000-0000-0012-000000000111', '00000000-0000-0000-0002-000000000075', 'weave',  300, 2, 10, now() - interval '5 days',  now() - interval '78 days'),
('00000000-0000-0000-0012-000000000112', '00000000-0000-0000-0002-000000000075', 'bridge', 200, 2,  7, now() - interval '8 days',  now() - interval '74 days'),

-- 76 Mary O'Malley (T5): care=450/L3, hearth=300/L2, signal=200/L2
('00000000-0000-0000-0012-000000000113', '00000000-0000-0000-0002-000000000076', 'care',   450, 3, 16, now() - interval '3 days',  now() - interval '79 days'),
('00000000-0000-0000-0012-000000000114', '00000000-0000-0000-0002-000000000076', 'hearth', 300, 2, 10, now() - interval '6 days',  now() - interval '75 days'),
('00000000-0000-0000-0012-000000000115', '00000000-0000-0000-0002-000000000076', 'signal', 200, 2,  7, now() - interval '10 days', now() - interval '71 days'),

-- 77 Tyrone Jackson (T4): craft=350/L3, green=200/L2
('00000000-0000-0000-0012-000000000116', '00000000-0000-0000-0002-000000000077', 'craft',  350, 3, 12, now() - interval '4 days',  now() - interval '74 days'),
('00000000-0000-0000-0012-000000000117', '00000000-0000-0000-0002-000000000077', 'green',  200, 2,  7, now() - interval '9 days',  now() - interval '68 days'),

-- 78 Kim Tran (T4): care=300/L2, signal=200/L2
('00000000-0000-0000-0012-000000000118', '00000000-0000-0000-0002-000000000078', 'care',   300, 2, 10, now() - interval '5 days',  now() - interval '70 days'),
('00000000-0000-0000-0012-000000000119', '00000000-0000-0000-0002-000000000078', 'signal', 200, 2,  7, now() - interval '9 days',  now() - interval '65 days'),

-- 79 Darnell Washington (T3): bridge=200/L2, craft=150/L1
('00000000-0000-0000-0012-000000000120', '00000000-0000-0000-0002-000000000079', 'bridge', 200, 2,  7, now() - interval '7 days',  now() - interval '65 days'),
('00000000-0000-0000-0012-000000000121', '00000000-0000-0000-0002-000000000079', 'craft',  150, 1,  5, now() - interval '12 days', now() - interval '58 days'),

-- 80 Oksana Petrov (T3): hearth=180/L2, care=100/L1
('00000000-0000-0000-0012-000000000122', '00000000-0000-0000-0002-000000000080', 'hearth', 180, 2,  6, now() - interval '8 days',  now() - interval '58 days'),
('00000000-0000-0000-0012-000000000123', '00000000-0000-0000-0002-000000000080', 'care',   100, 1,  4, now() - interval '13 days', now() - interval '52 days'),

-- 81 Jamal Brooks (T3): weave=150/L1, signal=100/L1
('00000000-0000-0000-0012-000000000124', '00000000-0000-0000-0002-000000000081', 'weave',  150, 1,  5, now() - interval '9 days',  now() - interval '51 days'),
('00000000-0000-0000-0012-000000000125', '00000000-0000-0000-0002-000000000081', 'signal', 100, 1,  3, now() - interval '14 days', now() - interval '45 days'),

-- 82 Colleen Murphy (T2): care=80/L1, bridge=50/L0
('00000000-0000-0000-0012-000000000126', '00000000-0000-0000-0002-000000000082', 'care',    80, 1,  3, now() - interval '14 days', now() - interval '43 days'),
('00000000-0000-0000-0012-000000000127', '00000000-0000-0000-0002-000000000082', 'bridge',  50, 0,  2, now() - interval '20 days', now() - interval '38 days'),

-- 83 Huy Nguyen (T2): craft=70/L1
('00000000-0000-0000-0012-000000000128', '00000000-0000-0000-0002-000000000083', 'craft',   70, 1,  2, now() - interval '16 days', now() - interval '34 days'),

-- 84 Destiny Adams (T2): green=60/L0
('00000000-0000-0000-0012-000000000129', '00000000-0000-0000-0002-000000000084', 'green',   60, 0,  2, now() - interval '18 days', now() - interval '26 days'),

-- 85 Tommy (T1): no skill rows
-- 86 Yuki (T1): no skill rows

-- ── Sunrise on the Monon ──

-- 87 Eleanor Whitfield (T5): weave=500/L4, signal=350/L3, care=250/L2
('00000000-0000-0000-0012-000000000130', '00000000-0000-0000-0002-000000000087', 'weave',  500, 4, 18, now() - interval '2 days',  now() - interval '72 days'),
('00000000-0000-0000-0012-000000000131', '00000000-0000-0000-0002-000000000087', 'signal', 350, 3, 12, now() - interval '5 days',  now() - interval '68 days'),
('00000000-0000-0000-0012-000000000132', '00000000-0000-0000-0002-000000000087', 'care',   250, 2,  9, now() - interval '8 days',  now() - interval '64 days'),

-- 88 Marcus Chen (T5): craft=480/L4, green=300/L2, bridge=200/L2
('00000000-0000-0000-0012-000000000133', '00000000-0000-0000-0002-000000000088', 'craft',  480, 4, 17, now() - interval '3 days',  now() - interval '70 days'),
('00000000-0000-0000-0012-000000000134', '00000000-0000-0000-0002-000000000088', 'green',  300, 2, 10, now() - interval '6 days',  now() - interval '66 days'),
('00000000-0000-0000-0012-000000000135', '00000000-0000-0000-0002-000000000088', 'bridge', 200, 2,  7, now() - interval '9 days',  now() - interval '62 days'),

-- 89 Patricia Wicks (T5): hearth=450/L3, weave=300/L2, care=200/L2
('00000000-0000-0000-0012-000000000136', '00000000-0000-0000-0002-000000000089', 'hearth', 450, 3, 16, now() - interval '2 days',  now() - interval '68 days'),
('00000000-0000-0000-0012-000000000137', '00000000-0000-0000-0002-000000000089', 'weave',  300, 2, 10, now() - interval '5 days',  now() - interval '64 days'),
('00000000-0000-0000-0012-000000000138', '00000000-0000-0000-0002-000000000089', 'care',   200, 2,  7, now() - interval '9 days',  now() - interval '60 days'),

-- 90 Amir Patel (T4): signal=350/L3, craft=200/L2
('00000000-0000-0000-0012-000000000139', '00000000-0000-0000-0002-000000000090', 'signal', 350, 3, 12, now() - interval '4 days',  now() - interval '64 days'),
('00000000-0000-0000-0012-000000000140', '00000000-0000-0000-0002-000000000090', 'craft',  200, 2,  7, now() - interval '8 days',  now() - interval '58 days'),

-- 91 Stephanie Lang (T4): green=300/L2, care=200/L2
('00000000-0000-0000-0012-000000000141', '00000000-0000-0000-0002-000000000091', 'green',  300, 2, 10, now() - interval '5 days',  now() - interval '60 days'),
('00000000-0000-0000-0012-000000000142', '00000000-0000-0000-0002-000000000091', 'care',   200, 2,  7, now() - interval '9 days',  now() - interval '55 days'),

-- 92 Jake Morrison (T3): craft=200/L2, bridge=150/L1
('00000000-0000-0000-0012-000000000143', '00000000-0000-0000-0002-000000000092', 'craft',  200, 2,  7, now() - interval '7 days',  now() - interval '55 days'),
('00000000-0000-0000-0012-000000000144', '00000000-0000-0000-0002-000000000092', 'bridge', 150, 1,  5, now() - interval '12 days', now() - interval '48 days'),

-- 93 Anita Sharma (T3): care=180/L2, hearth=100/L1
('00000000-0000-0000-0012-000000000145', '00000000-0000-0000-0002-000000000093', 'care',   180, 2,  6, now() - interval '8 days',  now() - interval '48 days'),
('00000000-0000-0000-0012-000000000146', '00000000-0000-0000-0002-000000000093', 'hearth', 100, 1,  4, now() - interval '13 days', now() - interval '42 days'),

-- 94 Will Cooper (T3): green=170/L1, weave=100/L1
('00000000-0000-0000-0012-000000000147', '00000000-0000-0000-0002-000000000094', 'green',  170, 1,  6, now() - interval '9 days',  now() - interval '41 days'),
('00000000-0000-0000-0012-000000000148', '00000000-0000-0000-0002-000000000094', 'weave',  100, 1,  3, now() - interval '14 days', now() - interval '35 days'),

-- 95 Hana Sato (T2): signal=70/L1
('00000000-0000-0000-0012-000000000149', '00000000-0000-0000-0002-000000000095', 'signal',  70, 1,  2, now() - interval '15 days', now() - interval '33 days'),

-- 96 Brian Kelly (T2): bridge=60/L0
('00000000-0000-0000-0012-000000000150', '00000000-0000-0000-0002-000000000096', 'bridge',  60, 0,  2, now() - interval '17 days', now() - interval '25 days'),

-- 97 Zara (T1): no skill rows
-- 98 Cody (T1): no skill rows

-- ── Sunset Ridge ──

-- 99 Isabel Reyes (T5): care=500/L4, weave=350/L3, signal=200/L2
('00000000-0000-0000-0012-000000000151', '00000000-0000-0000-0002-000000000099', 'care',   500, 4, 18, now() - interval '2 days',  now() - interval '67 days'),
('00000000-0000-0000-0012-000000000152', '00000000-0000-0000-0002-000000000099', 'weave',  350, 3, 12, now() - interval '5 days',  now() - interval '63 days'),
('00000000-0000-0000-0012-000000000153', '00000000-0000-0000-0002-000000000099', 'signal', 200, 2,  7, now() - interval '9 days',  now() - interval '58 days'),

-- 100 Henry Nakamura (T5): craft=480/L4, green=300/L2, bridge=200/L2
('00000000-0000-0000-0012-000000000154', '00000000-0000-0000-0002-000000000100', 'craft',  480, 4, 17, now() - interval '3 days',  now() - interval '63 days'),
('00000000-0000-0000-0012-000000000155', '00000000-0000-0000-0002-000000000100', 'green',  300, 2, 10, now() - interval '6 days',  now() - interval '59 days'),
('00000000-0000-0000-0012-000000000156', '00000000-0000-0000-0002-000000000100', 'bridge', 200, 2,  7, now() - interval '10 days', now() - interval '55 days'),

-- 101 Margaret Williams (T5): hearth=400/L3, weave=300/L2, care=250/L2
('00000000-0000-0000-0012-000000000157', '00000000-0000-0000-0002-000000000101', 'hearth', 400, 3, 14, now() - interval '3 days',  now() - interval '59 days'),
('00000000-0000-0000-0012-000000000158', '00000000-0000-0000-0002-000000000101', 'weave',  300, 2, 10, now() - interval '6 days',  now() - interval '55 days'),
('00000000-0000-0000-0012-000000000159', '00000000-0000-0000-0002-000000000101', 'care',   250, 2,  9, now() - interval '9 days',  now() - interval '51 days'),

-- 102 Tomas Gutierrez (T4): bridge=350/L3, craft=200/L2
('00000000-0000-0000-0012-000000000160', '00000000-0000-0000-0002-000000000102', 'bridge', 350, 3, 12, now() - interval '4 days',  now() - interval '55 days'),
('00000000-0000-0000-0012-000000000161', '00000000-0000-0000-0002-000000000102', 'craft',  200, 2,  7, now() - interval '8 days',  now() - interval '50 days'),

-- 103 Susan Park (T4): signal=300/L2, care=200/L2
('00000000-0000-0000-0012-000000000162', '00000000-0000-0000-0002-000000000103', 'signal', 300, 2, 10, now() - interval '5 days',  now() - interval '50 days'),
('00000000-0000-0000-0012-000000000163', '00000000-0000-0000-0002-000000000103', 'care',   200, 2,  7, now() - interval '9 days',  now() - interval '45 days'),

-- 104 Andre Johnson (T3): craft=200/L2, green=100/L1
('00000000-0000-0000-0012-000000000164', '00000000-0000-0000-0002-000000000104', 'craft',  200, 2,  7, now() - interval '7 days',  now() - interval '45 days'),
('00000000-0000-0000-0012-000000000165', '00000000-0000-0000-0002-000000000104', 'green',  100, 1,  3, now() - interval '13 days', now() - interval '39 days'),

-- 105 Mei Chen (T3): signal=180/L2, hearth=80/L1
('00000000-0000-0000-0012-000000000166', '00000000-0000-0000-0002-000000000105', 'signal', 180, 2,  6, now() - interval '8 days',  now() - interval '39 days'),
('00000000-0000-0000-0012-000000000167', '00000000-0000-0000-0002-000000000105', 'hearth',  80, 1,  3, now() - interval '14 days', now() - interval '33 days'),

-- 106 Roberto Alvarez (T3): bridge=150/L1, weave=100/L1
('00000000-0000-0000-0012-000000000168', '00000000-0000-0000-0002-000000000106', 'bridge', 150, 1,  5, now() - interval '9 days',  now() - interval '33 days'),
('00000000-0000-0000-0012-000000000169', '00000000-0000-0000-0002-000000000106', 'weave',  100, 1,  3, now() - interval '14 days', now() - interval '28 days'),

-- 107 Karen O'Brien (T2): care=70/L1
('00000000-0000-0000-0012-000000000170', '00000000-0000-0000-0002-000000000107', 'care',    70, 1,  2, now() - interval '15 days', now() - interval '27 days'),

-- 108 David Yazzie (T2): green=60/L0
('00000000-0000-0000-0012-000000000171', '00000000-0000-0000-0002-000000000108', 'green',   60, 0,  2, now() - interval '16 days', now() - interval '21 days'),

-- 109 Samantha Liu (T2): hearth=50/L0
('00000000-0000-0000-0012-000000000172', '00000000-0000-0000-0002-000000000109', 'hearth',  50, 0,  2, now() - interval '12 days', now() - interval '15 days')

-- 110 Jason (T1): no skill rows

ON CONFLICT (user_id, domain) DO NOTHING;


-- ============================================================================
-- SECTION 12: USER CONSENTS (60 rows)
-- ============================================================================

INSERT INTO user_consents (id, user_id, consent_type, policy_version, granted_at, revoked_at) VALUES

-- Maplewood Heights (IDs 51-62)
('00000000-0000-0000-000c-000000000051', '00000000-0000-0000-0002-000000000051', 'terms_of_service', '1.0', now() - interval '84 days', NULL),
('00000000-0000-0000-000c-000000000052', '00000000-0000-0000-0002-000000000052', 'terms_of_service', '1.0', now() - interval '82 days', NULL),
('00000000-0000-0000-000c-000000000053', '00000000-0000-0000-0002-000000000053', 'terms_of_service', '1.0', now() - interval '79 days', NULL),
('00000000-0000-0000-000c-000000000054', '00000000-0000-0000-0002-000000000054', 'terms_of_service', '1.0', now() - interval '76 days', NULL),
('00000000-0000-0000-000c-000000000055', '00000000-0000-0000-0002-000000000055', 'terms_of_service', '1.0', now() - interval '72 days', NULL),
('00000000-0000-0000-000c-000000000056', '00000000-0000-0000-0002-000000000056', 'terms_of_service', '1.0', now() - interval '66 days', NULL),
('00000000-0000-0000-000c-000000000057', '00000000-0000-0000-0002-000000000057', 'terms_of_service', '1.0', now() - interval '58 days', NULL),
('00000000-0000-0000-000c-000000000058', '00000000-0000-0000-0002-000000000058', 'terms_of_service', '1.0', now() - interval '50 days', NULL),
('00000000-0000-0000-000c-000000000059', '00000000-0000-0000-0002-000000000059', 'terms_of_service', '1.0', now() - interval '42 days', NULL),
('00000000-0000-0000-000c-000000000060', '00000000-0000-0000-0002-000000000060', 'terms_of_service', '1.0', now() - interval '35 days', NULL),
('00000000-0000-0000-000c-000000000061', '00000000-0000-0000-0002-000000000061', 'terms_of_service', '1.0', now() - interval '16 days', NULL),
('00000000-0000-0000-000c-000000000062', '00000000-0000-0000-0002-000000000062', 'terms_of_service', '1.0', now() - interval '8 days', NULL),

-- Riverside Commons (IDs 63-74)
('00000000-0000-0000-000c-000000000063', '00000000-0000-0000-0002-000000000063', 'terms_of_service', '1.0', now() - interval '85 days', NULL),
('00000000-0000-0000-000c-000000000064', '00000000-0000-0000-0002-000000000064', 'terms_of_service', '1.0', now() - interval '83 days', NULL),
('00000000-0000-0000-000c-000000000065', '00000000-0000-0000-0002-000000000065', 'terms_of_service', '1.0', now() - interval '77 days', NULL),
('00000000-0000-0000-000c-000000000066', '00000000-0000-0000-0002-000000000066', 'terms_of_service', '1.0', now() - interval '73 days', NULL),
('00000000-0000-0000-000c-000000000067', '00000000-0000-0000-0002-000000000067', 'terms_of_service', '1.0', now() - interval '68 days', NULL),
('00000000-0000-0000-000c-000000000068', '00000000-0000-0000-0002-000000000068', 'terms_of_service', '1.0', now() - interval '60 days', NULL),
('00000000-0000-0000-000c-000000000069', '00000000-0000-0000-0002-000000000069', 'terms_of_service', '1.0', now() - interval '53 days', NULL),
('00000000-0000-0000-000c-000000000070', '00000000-0000-0000-0002-000000000070', 'terms_of_service', '1.0', now() - interval '45 days', NULL),
('00000000-0000-0000-000c-000000000071', '00000000-0000-0000-0002-000000000071', 'terms_of_service', '1.0', now() - interval '38 days', NULL),
('00000000-0000-0000-000c-000000000072', '00000000-0000-0000-0002-000000000072', 'terms_of_service', '1.0', now() - interval '30 days', NULL),
('00000000-0000-0000-000c-000000000073', '00000000-0000-0000-0002-000000000073', 'terms_of_service', '1.0', now() - interval '17 days', NULL),
('00000000-0000-0000-000c-000000000074', '00000000-0000-0000-0002-000000000074', 'terms_of_service', '1.0', now() - interval '9 days', NULL),

-- Harbor Point (IDs 75-86)
('00000000-0000-0000-000c-000000000075', '00000000-0000-0000-0002-000000000075', 'terms_of_service', '1.0', now() - interval '83 days', NULL),
('00000000-0000-0000-000c-000000000076', '00000000-0000-0000-0002-000000000076', 'terms_of_service', '1.0', now() - interval '80 days', NULL),
('00000000-0000-0000-000c-000000000077', '00000000-0000-0000-0002-000000000077', 'terms_of_service', '1.0', now() - interval '75 days', NULL),
('00000000-0000-0000-000c-000000000078', '00000000-0000-0000-0002-000000000078', 'terms_of_service', '1.0', now() - interval '71 days', NULL),
('00000000-0000-0000-000c-000000000079', '00000000-0000-0000-0002-000000000079', 'terms_of_service', '1.0', now() - interval '66 days', NULL),
('00000000-0000-0000-000c-000000000080', '00000000-0000-0000-0002-000000000080', 'terms_of_service', '1.0', now() - interval '59 days', NULL),
('00000000-0000-0000-000c-000000000081', '00000000-0000-0000-0002-000000000081', 'terms_of_service', '1.0', now() - interval '52 days', NULL),
('00000000-0000-0000-000c-000000000082', '00000000-0000-0000-0002-000000000082', 'terms_of_service', '1.0', now() - interval '44 days', NULL),
('00000000-0000-0000-000c-000000000083', '00000000-0000-0000-0002-000000000083', 'terms_of_service', '1.0', now() - interval '36 days', NULL),
('00000000-0000-0000-000c-000000000084', '00000000-0000-0000-0002-000000000084', 'terms_of_service', '1.0', now() - interval '28 days', NULL),
('00000000-0000-0000-000c-000000000085', '00000000-0000-0000-0002-000000000085', 'terms_of_service', '1.0', now() - interval '18 days', NULL),
('00000000-0000-0000-000c-000000000086', '00000000-0000-0000-0002-000000000086', 'terms_of_service', '1.0', now() - interval '6 days', NULL),

-- Sunrise on the Monon (IDs 87-98)
('00000000-0000-0000-000c-000000000087', '00000000-0000-0000-0002-000000000087', 'terms_of_service', '1.0', now() - interval '73 days', NULL),
('00000000-0000-0000-000c-000000000088', '00000000-0000-0000-0002-000000000088', 'terms_of_service', '1.0', now() - interval '71 days', NULL),
('00000000-0000-0000-000c-000000000089', '00000000-0000-0000-0002-000000000089', 'terms_of_service', '1.0', now() - interval '69 days', NULL),
('00000000-0000-0000-000c-000000000090', '00000000-0000-0000-0002-000000000090', 'terms_of_service', '1.0', now() - interval '65 days', NULL),
('00000000-0000-0000-000c-000000000091', '00000000-0000-0000-0002-000000000091', 'terms_of_service', '1.0', now() - interval '61 days', NULL),
('00000000-0000-0000-000c-000000000092', '00000000-0000-0000-0002-000000000092', 'terms_of_service', '1.0', now() - interval '56 days', NULL),
('00000000-0000-0000-000c-000000000093', '00000000-0000-0000-0002-000000000093', 'terms_of_service', '1.0', now() - interval '49 days', NULL),
('00000000-0000-0000-000c-000000000094', '00000000-0000-0000-0002-000000000094', 'terms_of_service', '1.0', now() - interval '42 days', NULL),
('00000000-0000-0000-000c-000000000095', '00000000-0000-0000-0002-000000000095', 'terms_of_service', '1.0', now() - interval '34 days', NULL),
('00000000-0000-0000-000c-000000000096', '00000000-0000-0000-0002-000000000096', 'terms_of_service', '1.0', now() - interval '26 days', NULL),
('00000000-0000-0000-000c-000000000097', '00000000-0000-0000-0002-000000000097', 'terms_of_service', '1.0', now() - interval '16 days', NULL),
('00000000-0000-0000-000c-000000000098', '00000000-0000-0000-0002-000000000098', 'terms_of_service', '1.0', now() - interval '6 days', NULL),

-- Sunset Ridge (IDs 99-110)
('00000000-0000-0000-000c-000000000099', '00000000-0000-0000-0002-000000000099', 'terms_of_service', '1.0', now() - interval '68 days', NULL),
('00000000-0000-0000-000c-000000000100', '00000000-0000-0000-0002-000000000100', 'terms_of_service', '1.0', now() - interval '64 days', NULL),
('00000000-0000-0000-000c-000000000101', '00000000-0000-0000-0002-000000000101', 'terms_of_service', '1.0', now() - interval '60 days', NULL),
('00000000-0000-0000-000c-000000000102', '00000000-0000-0000-0002-000000000102', 'terms_of_service', '1.0', now() - interval '56 days', NULL),
('00000000-0000-0000-000c-000000000103', '00000000-0000-0000-0002-000000000103', 'terms_of_service', '1.0', now() - interval '51 days', NULL),
('00000000-0000-0000-000c-000000000104', '00000000-0000-0000-0002-000000000104', 'terms_of_service', '1.0', now() - interval '46 days', NULL),
('00000000-0000-0000-000c-000000000105', '00000000-0000-0000-0002-000000000105', 'terms_of_service', '1.0', now() - interval '40 days', NULL),
('00000000-0000-0000-000c-000000000106', '00000000-0000-0000-0002-000000000106', 'terms_of_service', '1.0', now() - interval '34 days', NULL),
('00000000-0000-0000-000c-000000000107', '00000000-0000-0000-0002-000000000107', 'terms_of_service', '1.0', now() - interval '28 days', NULL),
('00000000-0000-0000-000c-000000000108', '00000000-0000-0000-0002-000000000108', 'terms_of_service', '1.0', now() - interval '22 days', NULL),
('00000000-0000-0000-000c-000000000109', '00000000-0000-0000-0002-000000000109', 'terms_of_service', '1.0', now() - interval '16 days', NULL),
('00000000-0000-0000-000c-000000000110', '00000000-0000-0000-0002-000000000110', 'terms_of_service', '1.0', now() - interval '10 days', NULL)

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CivicForge Seed Expansion 2: Quests & Quest Validations
-- 60 quests (IDs 36-95) + 75 quest validations (IDs 46-120)
-- Generated 2026-02-09
-- ============================================================================

-- ============================================================================
-- QUESTS (60 rows)
-- ============================================================================

INSERT INTO quests (
  id, post_id, community_id, created_by, title, description, difficulty,
  validation_method, status, skill_domains, xp_reward, max_party_size,
  requested_by_other, validation_count, validation_threshold, is_emergency,
  is_seasonal, expires_at, completed_at, created_at
) VALUES

-- --------------------------------------------------------------------------
-- Maplewood Heights (Portland, OR) — Quest IDs 36-47
-- --------------------------------------------------------------------------

-- Q36: spark, green, completed 56d ago
(
  '00000000-0000-0000-0010-000000000036', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000054',
  'Sidewalk Weed Pull on Elm Street',
  'Help clear the sidewalks along Elm Street of overgrown weeds so pedestrians and wheelchair users can pass safely. Bring gloves and a bucket.',
  'spark', 'self_report', 'completed',
  ARRAY['green']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, now() - interval '56 days', now() - interval '58 days'
),

-- Q37: ember, craft, completed 49d ago
(
  '00000000-0000-0000-0010-000000000037', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000051',
  'Fix Mrs. Henderson''s Fence Gate',
  'The front gate on Mrs. Henderson''s fence has a broken hinge and won''t latch properly. Needs someone with basic carpentry skills and a drill.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['craft']::skill_domain[], 15, 1,
  true, 1, 1, false, false,
  NULL, now() - interval '49 days', now() - interval '52 days'
),

-- Q38: flame, signal, completed 42d ago
(
  '00000000-0000-0000-0010-000000000038', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000053',
  'Set Up Community WiFi Hotspot at Park Pavilion',
  'Install and configure a weatherproof WiFi hotspot at the Maplewood Park pavilion so community members can access internet during events and gatherings.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['signal']::skill_domain[], 35, 2,
  false, 2, 1, false, false,
  NULL, now() - interval '42 days', now() - interval '45 days'
),

-- Q39: ember, care, completed 35d ago
(
  '00000000-0000-0000-0010-000000000039', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000056',
  'Organize Flu Shot Clinic at Community Center',
  'Coordinate with the local pharmacy to host a walk-in flu shot clinic at the community center. Handle scheduling, signage, and day-of logistics.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['care']::skill_domain[], 15, 3,
  false, 1, 1, false, true,
  NULL, now() - interval '35 days', now() - interval '38 days'
),

-- Q40: spark, bridge, completed 28d ago
(
  '00000000-0000-0000-0010-000000000040', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000055',
  'Airport Run for Elderly Neighbor',
  'Drive Mr. Torres to PDX airport for his 7am flight on Saturday. He has one suitcase and needs help with check-in.',
  'spark', 'self_report', 'completed',
  ARRAY['bridge']::skill_domain[], 5, 1,
  true, 0, 0, false, false,
  NULL, now() - interval '28 days', now() - interval '30 days'
),

-- Q41: flame, hearth, completed 21d ago
(
  '00000000-0000-0000-0010-000000000041', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000052',
  'Holiday Cookie Exchange and Bake Sale',
  'Organize and host the annual Maplewood cookie exchange at the community center. Coordinate sign-ups, set up tables, handle leftover donations to the food bank.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['hearth']::skill_domain[], 35, 5,
  false, 2, 1, false, true,
  NULL, now() - interval '21 days', now() - interval '24 days'
),

-- Q42: ember, weave, completed 14d ago
(
  '00000000-0000-0000-0010-000000000042', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000057',
  'Draft Community Garden Rules Update',
  'Review feedback from gardeners and draft an updated set of community garden rules addressing plot maintenance timelines, composting standards, and guest access.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['weave']::skill_domain[], 15, 1,
  false, 1, 1, false, false,
  NULL, now() - interval '14 days', now() - interval '17 days'
),

-- Q43: blaze, green, completed 7d ago
(
  '00000000-0000-0000-0010-000000000043', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000054',
  'Maplewood Park Native Plant Restoration',
  'Lead a multi-day effort to remove invasive species and replant native Oregon plants in the east section of Maplewood Park. Coordinate volunteers, source plants from local nursery, and ensure proper planting technique.',
  'blaze', 'community_vote', 'completed',
  ARRAY['green']::skill_domain[], 75, 8,
  false, 3, 3, false, false,
  NULL, now() - interval '7 days', now() - interval '10 days'
),

-- Q44: spark, care, open
(
  '00000000-0000-0000-0010-000000000044', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000056',
  'Check in on Homebound Neighbors This Week',
  'Visit or call at least three homebound neighbors on our list to check on their wellbeing, see if they need groceries or prescriptions, and just say hello.',
  'spark', 'self_report', 'open',
  ARRAY['care']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, NULL, now() - interval '5 days'
),

-- Q45: inferno, weave, in_progress
(
  '00000000-0000-0000-0010-000000000045', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000001',
  'Maplewood Heights Annual Neighborhood Plan',
  'Facilitate the annual neighborhood planning process: gather input from residents, synthesize priorities, draft a community action plan, and present to the neighborhood association for ratification.',
  'inferno', 'community_vote_and_evidence', 'in_progress',
  ARRAY['weave']::skill_domain[], 150, 10,
  false, 0, 5, false, false,
  now() + interval '90 days', NULL, now() - interval '15 days'
),

-- Q46: ember, craft, claimed
(
  '00000000-0000-0000-0010-000000000046', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000051',
  'Repair Community Center Back Door',
  'The back door of the Maplewood community center is sticking and the weather stripping is worn. Needs someone to plane the door and replace the seal.',
  'ember', 'peer_confirm', 'claimed',
  ARRAY['craft']::skill_domain[], 15, 1,
  false, 0, 1, false, false,
  NULL, NULL, now() - interval '4 days'
),

-- Q47: flame, signal, open
(
  '00000000-0000-0000-0010-000000000047', NULL,
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0002-000000000053',
  'Digital Literacy Workshop for Seniors',
  'Plan and lead a two-hour workshop at the community center teaching seniors how to use smartphones for video calls, messaging, and online safety. Provide printed handouts.',
  'flame', 'photo_and_peer', 'open',
  ARRAY['signal']::skill_domain[], 35, 3,
  false, 0, 1, false, false,
  NULL, NULL, now() - interval '3 days'
),

-- --------------------------------------------------------------------------
-- Riverside Commons (Austin, TX) — Quest IDs 48-59
-- --------------------------------------------------------------------------

-- Q48: ember, green, completed 63d ago
(
  '00000000-0000-0000-0010-000000000048', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000064',
  'Compost Bin Rotation Day',
  'Organize the quarterly compost bin rotation at the Riverside community garden. Turn all six bins, check temperatures, and sort any contamination.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['green']::skill_domain[], 15, 3,
  false, 1, 1, false, false,
  NULL, now() - interval '63 days', now() - interval '66 days'
),

-- Q49: flame, craft, completed 56d ago
(
  '00000000-0000-0000-0010-000000000049', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000066',
  'Build Shade Structure for Community Garden',
  'Design and construct a shade structure over the seating area at the Riverside community garden using reclaimed lumber. Must withstand Austin summer heat.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['craft']::skill_domain[], 35, 4,
  false, 2, 1, false, false,
  NULL, now() - interval '56 days', now() - interval '59 days'
),

-- Q50: spark, care, completed 42d ago
(
  '00000000-0000-0000-0010-000000000050', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000067',
  'Neighborhood First Aid Kit Refill',
  'Check and restock the three neighborhood first aid kits located at the community center, garden shed, and playground. Replace expired items.',
  'spark', 'self_report', 'completed',
  ARRAY['care']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, now() - interval '42 days', now() - interval '44 days'
),

-- Q51: ember, bridge, completed 35d ago
(
  '00000000-0000-0000-0010-000000000051', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000070',
  'Bike Delivery Run for Homebound Seniors',
  'Use a cargo bike to deliver groceries and prescriptions to four homebound seniors on the east side of Riverside. Route and addresses provided.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['bridge']::skill_domain[], 15, 1,
  true, 1, 1, false, false,
  NULL, now() - interval '35 days', now() - interval '38 days'
),

-- Q52: flame, signal, completed 28d ago
(
  '00000000-0000-0000-0010-000000000052', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000065',
  'Set Up Community Bulletin Board App',
  'Configure and launch a simple community bulletin board app for Riverside residents. Handle setup, user onboarding guide, and initial content migration from the physical board.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['signal']::skill_domain[], 35, 2,
  false, 2, 1, false, false,
  NULL, now() - interval '28 days', now() - interval '31 days'
),

-- Q53: ember, hearth, completed 21d ago
(
  '00000000-0000-0000-0010-000000000053', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000072',
  'Riverside Potluck Dinner Night',
  'Coordinate the monthly potluck dinner at the Riverside pavilion. Handle sign-ups, table setup, dietary accommodation tracking, and cleanup crew.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['hearth']::skill_domain[], 15, 5,
  false, 1, 1, false, false,
  NULL, now() - interval '21 days', now() - interval '24 days'
),

-- Q54: spark, weave, completed 14d ago
(
  '00000000-0000-0000-0010-000000000054', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000063',
  'Write Up Trail Cleanup Report for City Council',
  'Compile volunteer hours, before/after photos, and waste data from the recent trail cleanup into a report for the Austin City Council parks committee.',
  'spark', 'self_report', 'completed',
  ARRAY['weave']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, now() - interval '14 days', now() - interval '16 days'
),

-- Q55: blaze, green, completed 7d ago
(
  '00000000-0000-0000-0010-000000000055', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000014',
  'Community Garden Expansion — Phase 2',
  'Lead the second phase of the Riverside community garden expansion: clear the new plot area, build eight raised beds, install drip irrigation, and coordinate soil delivery.',
  'blaze', 'community_vote', 'completed',
  ARRAY['green']::skill_domain[], 75, 10,
  false, 3, 3, false, false,
  NULL, now() - interval '7 days', now() - interval '10 days'
),

-- Q56: flame, care, open
(
  '00000000-0000-0000-0010-000000000056', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000067',
  'Organize Monthly Childcare Co-op',
  'Set up a rotating childcare co-op for Riverside families. Create the schedule, establish safety guidelines, and coordinate the first three sessions.',
  'flame', 'photo_and_peer', 'open',
  ARRAY['care']::skill_domain[], 35, 4,
  false, 0, 1, false, false,
  NULL, NULL, now() - interval '6 days'
),

-- Q57: inferno, weave, in_progress
(
  '00000000-0000-0000-0010-000000000057', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000063',
  'Riverside Sustainability Roadmap v2',
  'Facilitate community-wide input process to update the Riverside sustainability roadmap. Includes survey design, town hall facilitation, synthesis of feedback, and final document preparation for community vote.',
  'inferno', 'community_vote_and_evidence', 'in_progress',
  ARRAY['weave']::skill_domain[], 150, 10,
  false, 0, 5, false, false,
  now() + interval '90 days', NULL, now() - interval '20 days'
),

-- Q58: ember, craft, claimed
(
  '00000000-0000-0000-0010-000000000058', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000068',
  'Fix Leaky Irrigation at Community Garden',
  'Diagnose and repair the leaking drip irrigation line in plots 4-7 of the Riverside community garden. Parts are in the garden shed.',
  'ember', 'peer_confirm', 'claimed',
  ARRAY['craft']::skill_domain[], 15, 1,
  false, 0, 1, false, false,
  NULL, NULL, now() - interval '3 days'
),

-- Q59: spark, bridge, open
(
  '00000000-0000-0000-0010-000000000059', NULL,
  '00000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0002-000000000070',
  'Saturday Morning Farmers Market Delivery Run',
  'Pick up pre-ordered produce from the Saturday farmers market and deliver to five households who can''t make it in person. Route sheet provided.',
  'spark', 'self_report', 'open',
  ARRAY['bridge']::skill_domain[], 5, 1,
  true, 0, 0, false, false,
  NULL, NULL, now() - interval '2 days'
),

-- --------------------------------------------------------------------------
-- Harbor Point (Baltimore, MD) — Quest IDs 60-71
-- --------------------------------------------------------------------------

-- Q60: ember, craft, completed 70d ago
(
  '00000000-0000-0000-0010-000000000060', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000075',
  'Replace Rotted Window Frames on Oak Street',
  'Remove and replace two rotted wooden window frames at the Oak Street row house. Measure, cut, and install new frames with proper weatherproofing.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['craft']::skill_domain[], 15, 2,
  true, 1, 1, false, false,
  NULL, now() - interval '70 days', now() - interval '73 days'
),

-- Q61: flame, green, completed 63d ago
(
  '00000000-0000-0000-0010-000000000061', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000084',
  'Harbor Community Garden Spring Prep',
  'Prepare the Harbor Point community garden for spring planting season. Clear debris, turn soil in all beds, repair raised bed frames, and set up the tool lending station.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['green']::skill_domain[], 35, 6,
  false, 2, 1, false, true,
  NULL, now() - interval '63 days', now() - interval '66 days'
),

-- Q62: spark, care, completed 56d ago
(
  '00000000-0000-0000-0010-000000000062', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000078',
  'Senior Wellness Check-In Round',
  'Visit six seniors on the Harbor Point wellness list for a friendly check-in. Note any concerns about health, home safety, or isolation.',
  'spark', 'self_report', 'completed',
  ARRAY['care']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, now() - interval '56 days', now() - interval '58 days'
),

-- Q63: ember, bridge, completed 42d ago
(
  '00000000-0000-0000-0010-000000000063', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000079',
  'Grocery Run for Three Homebound Neighbors',
  'Pick up grocery orders from the Harbor Point list and deliver to three homebound neighbors. Handle any special dietary requests and check if they need anything else.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['bridge']::skill_domain[], 15, 1,
  true, 1, 1, false, false,
  NULL, now() - interval '42 days', now() - interval '45 days'
),

-- Q64: flame, hearth, completed 35d ago
(
  '00000000-0000-0000-0010-000000000064', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000080',
  'Neighborhood Fish Fry Fundraiser',
  'Organize and host the Harbor Point fish fry fundraiser at the community center. Handle food prep, cooking, ticket sales, and donate proceeds to the youth scholarship fund.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['hearth']::skill_domain[], 35, 8,
  false, 2, 1, false, false,
  NULL, now() - interval '35 days', now() - interval '38 days'
),

-- Q65: ember, signal, completed 28d ago
(
  '00000000-0000-0000-0010-000000000065', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000075',
  'Install Security Cameras at Community Center',
  'Install four weatherproof security cameras at the Harbor Point community center entrances. Configure the recording system and set up remote access for the center manager.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['signal']::skill_domain[], 15, 2,
  false, 1, 1, false, false,
  NULL, now() - interval '28 days', now() - interval '31 days'
),

-- Q66: spark, weave, completed 21d ago
(
  '00000000-0000-0000-0010-000000000066', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000081',
  'Draft Youth Basketball League Charter',
  'Write a charter for the new Harbor Point youth basketball league including rules, code of conduct, scheduling guidelines, and volunteer coach requirements.',
  'spark', 'self_report', 'completed',
  ARRAY['weave']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, now() - interval '21 days', now() - interval '23 days'
),

-- Q67: blaze, craft, completed 14d ago
(
  '00000000-0000-0000-0010-000000000067', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000075',
  'Rebuild Community Center Stage',
  'Demolish the old warped stage at the Harbor Point community center and build a new one with proper structural support, ADA-compliant ramp access, and a fresh finish.',
  'blaze', 'community_vote', 'completed',
  ARRAY['craft']::skill_domain[], 75, 6,
  false, 3, 3, false, false,
  NULL, now() - interval '14 days', now() - interval '17 days'
),

-- Q68: flame, care, completed 7d ago
(
  '00000000-0000-0000-0010-000000000068', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000076',
  'Organize Holiday Toy Drive for Harbor Kids',
  'Coordinate the annual Harbor Point toy drive: set up collection boxes, sort donations by age group, wrap gifts, and organize the distribution event at the community center.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['care']::skill_domain[], 35, 5,
  false, 2, 1, false, true,
  NULL, now() - interval '7 days', now() - interval '10 days'
),

-- Q69: ember, green, open
(
  '00000000-0000-0000-0010-000000000069', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000077',
  'Plant Street Trees Along Harbor Avenue',
  'Work with the city to plant ten new street trees along Harbor Avenue. Dig holes, plant trees, install stakes and mulch rings, and set up a watering schedule.',
  'ember', 'peer_confirm', 'open',
  ARRAY['green']::skill_domain[], 15, 4,
  false, 0, 1, false, false,
  NULL, NULL, now() - interval '5 days'
),

-- Q70: inferno, weave, in_progress
(
  '00000000-0000-0000-0010-000000000070', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000024',
  'Harbor Point Mutual Aid Network Plan',
  'Design a comprehensive mutual aid network for Harbor Point: map community assets, create resource-sharing protocols, establish emergency response procedures, and draft governance documents for community ratification.',
  'inferno', 'community_vote_and_evidence', 'in_progress',
  ARRAY['weave']::skill_domain[], 150, 10,
  false, 0, 5, false, false,
  now() + interval '90 days', NULL, now() - interval '18 days'
),

-- Q71: spark, bridge, open
(
  '00000000-0000-0000-0010-000000000071', NULL,
  '00000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0002-000000000079',
  'Volunteer Driver Signup for Medical Appointments',
  'Recruit and organize volunteer drivers to take neighbors to medical appointments. Create a signup sheet, match drivers with riders, and handle the first week of scheduling.',
  'spark', 'self_report', 'open',
  ARRAY['bridge']::skill_domain[], 5, 1,
  true, 0, 0, false, false,
  NULL, NULL, now() - interval '2 days'
),

-- --------------------------------------------------------------------------
-- Sunrise on the Monon (Carmel, IN) — Quest IDs 72-83
-- --------------------------------------------------------------------------

-- Q72: ember, green, completed 77d ago
(
  '00000000-0000-0000-0010-000000000072', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000091',
  'Monon Trail Wildflower Planting',
  'Plant native Indiana wildflowers along the Monon Trail buffer zone near the Sunrise entrance. Prepare soil, plant plugs, and set up temporary fencing to protect new growth.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['green']::skill_domain[], 15, 4,
  false, 1, 1, false, true,
  NULL, now() - interval '77 days', now() - interval '80 days'
),

-- Q73: flame, craft, completed 70d ago
(
  '00000000-0000-0000-0010-000000000073', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000088',
  'Build New Trailside Bench from Reclaimed Wood',
  'Design and build a sturdy trailside bench from reclaimed wood for the rest stop near the Sunrise community entrance. Must be weather-resistant and ADA-accessible height.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['craft']::skill_domain[], 35, 2,
  false, 2, 1, false, false,
  NULL, now() - interval '70 days', now() - interval '73 days'
),

-- Q74: spark, care, completed 63d ago
(
  '00000000-0000-0000-0010-000000000074', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000093',
  'Welcome Basket Assembly for New Neighbors',
  'Assemble welcome baskets with local goodies, a neighborhood guide, and community contact info for the three new families who just moved to Sunrise.',
  'spark', 'self_report', 'completed',
  ARRAY['care']::skill_domain[], 5, 2,
  false, 0, 0, false, false,
  NULL, now() - interval '63 days', now() - interval '65 days'
),

-- Q75: ember, hearth, completed 56d ago
(
  '00000000-0000-0000-0010-000000000075', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000089',
  'Porch Potluck Dinner Series Kickoff',
  'Launch the Sunrise porch potluck dinner series. Organize the first event, create a rotating host schedule, and handle the initial outreach to get ten families signed up.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['hearth']::skill_domain[], 15, 4,
  false, 1, 1, false, false,
  NULL, now() - interval '56 days', now() - interval '58 days'
),

-- Q76: flame, signal, completed 42d ago
(
  '00000000-0000-0000-0010-000000000076', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000090',
  'Monon Trail Safety App Development',
  'Build a simple web app for Sunrise residents to report trail hazards, request escort walks after dark, and share real-time trail conditions.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['signal']::skill_domain[], 35, 2,
  false, 2, 1, false, false,
  NULL, now() - interval '42 days', now() - interval '45 days'
),

-- Q77: ember, weave, completed 35d ago
(
  '00000000-0000-0000-0010-000000000077', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000087',
  'Neighborhood Watch Committee Formation',
  'Establish a formal neighborhood watch committee for Sunrise. Draft the charter, recruit block captains, coordinate with Carmel PD community liaison, and plan the first meeting.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['weave']::skill_domain[], 15, 3,
  false, 1, 1, false, false,
  NULL, now() - interval '35 days', now() - interval '38 days'
),

-- Q78: spark, bridge, completed 28d ago
(
  '00000000-0000-0000-0010-000000000078', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000096',
  'Bike Shuttle Service for Trail Visitors',
  'Offer a free bike shuttle service for Monon Trail visitors who need a ride from the trailhead to local shops. Provide a bike and trailer for a Saturday afternoon.',
  'spark', 'self_report', 'completed',
  ARRAY['bridge']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, now() - interval '28 days', now() - interval '30 days'
),

-- Q79: blaze, green, completed 21d ago
(
  '00000000-0000-0000-0010-000000000079', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000094',
  'Community Rain Garden Installation',
  'Design and install a rain garden at the Sunrise community entrance to manage stormwater runoff. Excavate the basin, install native plantings, and create an educational sign about bioretention.',
  'blaze', 'community_vote', 'completed',
  ARRAY['green']::skill_domain[], 75, 8,
  false, 3, 3, false, false,
  NULL, now() - interval '21 days', now() - interval '24 days'
),

-- Q80: flame, hearth, completed 5d ago
(
  '00000000-0000-0000-0010-000000000080', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000089',
  'Monon Trail Hot Cocoa Stand for Runners',
  'Set up and run a free hot cocoa stand near the Monon Trail for cold-weather runners and walkers. Coordinate supplies, volunteers, and cleanup for a Saturday morning event.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['hearth']::skill_domain[], 35, 3,
  false, 2, 1, false, true,
  NULL, now() - interval '5 days', now() - interval '8 days'
),

-- Q81: ember, craft, open
(
  '00000000-0000-0000-0010-000000000081', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000092',
  'Repair Monon Trailhead Signage',
  'The trailhead sign at the Sunrise entrance is faded and the post is leaning. Sand, repaint, and reset the post in concrete.',
  'ember', 'peer_confirm', 'open',
  ARRAY['craft']::skill_domain[], 15, 1,
  false, 0, 1, false, false,
  NULL, NULL, now() - interval '4 days'
),

-- Q82: inferno, weave, in_progress
(
  '00000000-0000-0000-0010-000000000082', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000087',
  'Monon Trail Master Plan — Community Vision',
  'Lead a comprehensive community visioning process for the Monon Trail corridor through Sunrise. Gather input through surveys and workshops, synthesize into a master plan document, and present for community ratification.',
  'inferno', 'community_vote_and_evidence', 'in_progress',
  ARRAY['weave']::skill_domain[], 150, 10,
  false, 0, 5, false, false,
  now() + interval '90 days', NULL, now() - interval '22 days'
),

-- Q83: spark, care, open
(
  '00000000-0000-0000-0010-000000000083', NULL,
  '00000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0002-000000000093',
  'Collect Winter Coats for Donation Drive',
  'Set up collection bins at three Sunrise locations for gently used winter coats. Sort by size, clean, and deliver to the local shelter before the cold snap.',
  'spark', 'self_report', 'open',
  ARRAY['care']::skill_domain[], 5, 1,
  false, 0, 0, false, true,
  NULL, NULL, now() - interval '3 days'
),

-- --------------------------------------------------------------------------
-- Sunset Ridge (Tucson, AZ) — Quest IDs 84-95
-- --------------------------------------------------------------------------

-- Q84: ember, care, completed 70d ago
(
  '00000000-0000-0000-0010-000000000084', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000099',
  'Weekly Check-Ins for Homebound Elders',
  'Establish a weekly check-in rotation for five homebound elders in Sunset Ridge. Visit each person, assess needs, and coordinate any follow-up support.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['care']::skill_domain[], 15, 2,
  false, 1, 1, false, false,
  NULL, now() - interval '70 days', now() - interval '73 days'
),

-- Q85: flame, craft, completed 63d ago
(
  '00000000-0000-0000-0010-000000000085', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000100',
  'Build Wheelchair-Accessible Raised Garden Beds',
  'Design and construct three wheelchair-accessible raised garden beds at the Sunset Ridge community garden. Use heat-resistant materials suitable for Tucson summers.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['craft']::skill_domain[], 35, 3,
  false, 2, 1, false, false,
  NULL, now() - interval '63 days', now() - interval '66 days'
),

-- Q86: spark, green, completed 56d ago
(
  '00000000-0000-0000-0010-000000000086', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000108',
  'Desert Garden Watering Schedule Setup',
  'Create and post a detailed watering schedule for the Sunset Ridge desert community garden. Account for seasonal changes, plant types, and water conservation guidelines.',
  'spark', 'self_report', 'completed',
  ARRAY['green']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, now() - interval '56 days', now() - interval '58 days'
),

-- Q87: ember, signal, completed 49d ago
(
  '00000000-0000-0000-0010-000000000087', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000103',
  'Teach Elders to Video Call Grandkids',
  'Host a hands-on workshop at the Sunset Ridge community room teaching ten seniors how to set up and use video calling on their tablets and phones.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['signal']::skill_domain[], 15, 2,
  false, 1, 1, false, false,
  NULL, now() - interval '49 days', now() - interval '52 days'
),

-- Q88: flame, bridge, completed 42d ago
(
  '00000000-0000-0000-0010-000000000088', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000102',
  'Set Up Weekly Shuttle to Grocery Store',
  'Organize a weekly volunteer shuttle service taking Sunset Ridge residents to the nearest grocery store. Create the route, recruit drivers, and establish a regular Thursday schedule.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['bridge']::skill_domain[], 35, 2,
  false, 2, 1, false, false,
  NULL, now() - interval '42 days', now() - interval '45 days'
),

-- Q89: ember, hearth, completed 35d ago
(
  '00000000-0000-0000-0010-000000000089', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000101',
  'Intergenerational Cooking Night — Sonoran Recipes',
  'Host a cooking night where Sunset Ridge elders teach younger residents traditional Sonoran recipes. Handle ingredient sourcing, kitchen setup, and recipe card printing.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['hearth']::skill_domain[], 15, 6,
  false, 1, 1, false, false,
  NULL, now() - interval '35 days', now() - interval '38 days'
),

-- Q90: spark, weave, completed 28d ago
(
  '00000000-0000-0000-0010-000000000090', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000099',
  'Collect Neighborhood Survey Responses',
  'Go door-to-door to collect responses for the annual Sunset Ridge neighborhood priorities survey. Compile results into a summary document.',
  'spark', 'self_report', 'completed',
  ARRAY['weave']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, now() - interval '28 days', now() - interval '30 days'
),

-- Q91: blaze, care, completed 21d ago
(
  '00000000-0000-0000-0010-000000000091', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000099',
  'Organize Free Health Screening Day',
  'Partner with the local clinic to host a free health screening day at the Sunset Ridge community center. Coordinate volunteers, set up stations for blood pressure, glucose, and vision checks, and handle outreach.',
  'blaze', 'community_vote', 'completed',
  ARRAY['care']::skill_domain[], 75, 8,
  false, 3, 3, false, false,
  NULL, now() - interval '21 days', now() - interval '24 days'
),

-- Q92: flame, signal, completed 14d ago
(
  '00000000-0000-0000-0010-000000000092', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000105',
  'Install Community Alert System for Heat Waves',
  'Set up an automated phone and text alert system to notify Sunset Ridge residents of extreme heat warnings, cooling center locations, and wellness check schedules.',
  'flame', 'photo_and_peer', 'completed',
  ARRAY['signal']::skill_domain[], 35, 2,
  false, 2, 1, false, false,
  NULL, now() - interval '14 days', now() - interval '17 days'
),

-- Q93: ember, green, completed 7d ago
(
  '00000000-0000-0000-0010-000000000093', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000108',
  'Xeriscaping Workshop with Native Desert Plants',
  'Lead a hands-on xeriscaping workshop at the community center teaching residents how to create beautiful, water-efficient landscapes using native desert plants.',
  'ember', 'peer_confirm', 'completed',
  ARRAY['green']::skill_domain[], 15, 4,
  false, 1, 1, false, false,
  NULL, now() - interval '7 days', now() - interval '10 days'
),

-- Q94: inferno, weave, in_progress
(
  '00000000-0000-0000-0010-000000000094', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000043',
  'Sunset Ridge Intergenerational Charter Renewal',
  'Facilitate the biennial charter renewal process for Sunset Ridge. Gather input from all generations, update the community charter to reflect evolving needs, and organize the ratification vote.',
  'inferno', 'community_vote_and_evidence', 'in_progress',
  ARRAY['weave']::skill_domain[], 150, 10,
  false, 0, 5, false, false,
  now() + interval '90 days', NULL, now() - interval '20 days'
),

-- Q95: spark, bridge, open
(
  '00000000-0000-0000-0010-000000000095', NULL,
  '00000000-0000-0000-0001-000000000005',
  '00000000-0000-0000-0002-000000000106',
  'Organize Carpool to Sunday Farmers Market',
  'Set up a recurring carpool for Sunset Ridge residents to attend the Sunday farmers market downtown. Create a signup sheet and coordinate drivers.',
  'spark', 'self_report', 'open',
  ARRAY['bridge']::skill_domain[], 5, 1,
  false, 0, 0, false, false,
  NULL, NULL, now() - interval '3 days'
)

ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- QUEST VALIDATIONS (75 rows)
-- ============================================================================

INSERT INTO quest_validations (id, quest_id, validator_id, approved, message, photo_url, created_at) VALUES

-- --------------------------------------------------------------------------
-- Maplewood Heights Validations
-- --------------------------------------------------------------------------

-- Q36 (spark): no validations needed
-- Q37 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000046',
  '00000000-0000-0000-0010-000000000037',
  '00000000-0000-0000-0002-000000000052',
  true,
  'Gate swings and latches perfectly now. Mrs. Henderson is thrilled.',
  NULL,
  now() - interval '49 days'
),

-- Q38 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000047',
  '00000000-0000-0000-0010-000000000038',
  '00000000-0000-0000-0002-000000000055',
  true,
  'WiFi hotspot is up and running. Got a strong signal all the way from the pavilion to the playground.',
  'https://placeholder.civicforge.org/validations/maplewood-park-wifi-hotspot.jpg',
  now() - interval '42 days'
),
(
  '00000000-0000-0000-0011-000000000048',
  '00000000-0000-0000-0010-000000000038',
  '00000000-0000-0000-0002-000000000057',
  true,
  'Confirmed the hotspot works great. Connected five devices at once during the book club meetup.',
  NULL,
  now() - interval '41 days'
),

-- Q39 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000049',
  '00000000-0000-0000-0010-000000000039',
  '00000000-0000-0000-0002-000000000054',
  true,
  'Flu shot clinic ran smoothly. About 40 people came through in two hours. Great organization.',
  NULL,
  now() - interval '35 days'
),

-- Q40 (spark): no validations needed

-- Q41 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000050',
  '00000000-0000-0000-0010-000000000041',
  '00000000-0000-0000-0002-000000000056',
  true,
  'Cookie exchange was a huge hit! Over 30 families participated and we donated four boxes to the food bank.',
  'https://placeholder.civicforge.org/validations/maplewood-cookie-exchange.jpg',
  now() - interval '21 days'
),
(
  '00000000-0000-0000-0011-000000000051',
  '00000000-0000-0000-0010-000000000041',
  '00000000-0000-0000-0002-000000000001',
  true,
  'Everything was beautifully organized. The bake sale raised over $200 for the food bank.',
  NULL,
  now() - interval '20 days'
),

-- Q42 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000052',
  '00000000-0000-0000-0010-000000000042',
  '00000000-0000-0000-0002-000000000054',
  true,
  'Draft looks solid. Addresses all the concerns from the last gardener meeting.',
  NULL,
  now() - interval '14 days'
),

-- Q43 (blaze): 3 validations
(
  '00000000-0000-0000-0011-000000000053',
  '00000000-0000-0000-0010-000000000043',
  '00000000-0000-0000-0002-000000000051',
  true,
  'The east section of the park looks incredible. All invasive species removed and native plants are already taking root.',
  NULL,
  now() - interval '7 days'
),
(
  '00000000-0000-0000-0011-000000000054',
  '00000000-0000-0000-0010-000000000043',
  '00000000-0000-0000-0002-000000000057',
  true,
  'Walked through the restored area today. Beautiful work — the Oregon grape and sword ferns look perfect.',
  NULL,
  now() - interval '6 days'
),
(
  '00000000-0000-0000-0011-000000000055',
  '00000000-0000-0000-0010-000000000043',
  '00000000-0000-0000-0002-000000000052',
  true,
  'The native plant restoration exceeded expectations. Volunteer coordination was top-notch.',
  NULL,
  now() - interval '6 days'
),

-- --------------------------------------------------------------------------
-- Riverside Commons Validations
-- --------------------------------------------------------------------------

-- Q48 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000056',
  '00000000-0000-0000-0010-000000000048',
  '00000000-0000-0000-0002-000000000065',
  true,
  'All six bins turned and temperatures logged. Contamination sorted out of bin 3.',
  NULL,
  now() - interval '63 days'
),

-- Q49 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000057',
  '00000000-0000-0000-0010-000000000049',
  '00000000-0000-0000-0002-000000000070',
  true,
  'Shade structure is solid and provides great relief from the Austin heat. Well built.',
  'https://placeholder.civicforge.org/validations/riverside-garden-shade.jpg',
  now() - interval '56 days'
),
(
  '00000000-0000-0000-0011-000000000058',
  '00000000-0000-0000-0010-000000000049',
  '00000000-0000-0000-0002-000000000072',
  true,
  'Tested the structure in wind and it held up perfectly. Great reclaimed wood joinery.',
  NULL,
  now() - interval '55 days'
),

-- Q50 (spark): no validations needed

-- Q51 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000059',
  '00000000-0000-0000-0010-000000000051',
  '00000000-0000-0000-0002-000000000067',
  true,
  'All four deliveries completed. Mrs. Chen was especially grateful for the fresh produce.',
  NULL,
  now() - interval '35 days'
),

-- Q52 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000060',
  '00000000-0000-0000-0010-000000000052',
  '00000000-0000-0000-0002-000000000063',
  true,
  'App is live and working great. Already 25 residents signed up in the first week.',
  'https://placeholder.civicforge.org/validations/riverside-bulletin-board-app.jpg',
  now() - interval '28 days'
),
(
  '00000000-0000-0000-0011-000000000061',
  '00000000-0000-0000-0010-000000000052',
  '00000000-0000-0000-0002-000000000014',
  true,
  'Checked the app on both Android and iPhone. Works smoothly on both. Nice onboarding flow.',
  NULL,
  now() - interval '27 days'
),

-- Q53 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000062',
  '00000000-0000-0000-0010-000000000053',
  '00000000-0000-0000-0002-000000000064',
  true,
  'Potluck was fantastic. Over 20 families brought dishes and cleanup was done by 8pm.',
  NULL,
  now() - interval '21 days'
),

-- Q54 (spark): no validations needed

-- Q55 (blaze): 3 validations
(
  '00000000-0000-0000-0011-000000000063',
  '00000000-0000-0000-0010-000000000055',
  '00000000-0000-0000-0002-000000000063',
  true,
  'Phase 2 is complete. Eight new raised beds built and drip irrigation installed. Soil looks great.',
  NULL,
  now() - interval '7 days'
),
(
  '00000000-0000-0000-0011-000000000064',
  '00000000-0000-0000-0010-000000000055',
  '00000000-0000-0000-0002-000000000066',
  true,
  'Walked the new plots today. Excellent construction quality and the irrigation is already working.',
  NULL,
  now() - interval '6 days'
),
(
  '00000000-0000-0000-0011-000000000065',
  '00000000-0000-0000-0010-000000000055',
  '00000000-0000-0000-0002-000000000072',
  true,
  'Amazing expansion. The garden has basically doubled in capacity. Great leadership on this project.',
  NULL,
  now() - interval '6 days'
),

-- --------------------------------------------------------------------------
-- Harbor Point Validations
-- --------------------------------------------------------------------------

-- Q60 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000066',
  '00000000-0000-0000-0010-000000000060',
  '00000000-0000-0000-0002-000000000079',
  true,
  'Both window frames replaced and sealed tight. No more drafts coming through.',
  NULL,
  now() - interval '70 days'
),

-- Q61 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000067',
  '00000000-0000-0000-0010-000000000061',
  '00000000-0000-0000-0002-000000000076',
  true,
  'Garden is ready for spring. All beds cleared, soil turned, and the tool station is stocked.',
  'https://placeholder.civicforge.org/validations/harbor-garden-spring-prep.jpg',
  now() - interval '63 days'
),
(
  '00000000-0000-0000-0011-000000000068',
  '00000000-0000-0000-0010-000000000061',
  '00000000-0000-0000-0002-000000000081',
  true,
  'Everything looks great. Raised bed frames are repaired and the soil is perfectly turned.',
  NULL,
  now() - interval '62 days'
),

-- Q62 (spark): no validations needed

-- Q63 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000069',
  '00000000-0000-0000-0010-000000000063',
  '00000000-0000-0000-0002-000000000080',
  true,
  'All three grocery deliveries completed on time. Neighbors were very appreciative.',
  NULL,
  now() - interval '42 days'
),

-- Q64 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000070',
  '00000000-0000-0000-0010-000000000064',
  '00000000-0000-0000-0002-000000000078',
  true,
  'Fish fry was packed! Over 100 people came and we raised $850 for the youth scholarship fund.',
  'https://placeholder.civicforge.org/validations/harbor-fish-fry-fundraiser.jpg',
  now() - interval '35 days'
),
(
  '00000000-0000-0000-0011-000000000071',
  '00000000-0000-0000-0010-000000000064',
  '00000000-0000-0000-0002-000000000084',
  true,
  'Great event. Food was delicious and the fundraising goal was exceeded. Well organized.',
  NULL,
  now() - interval '34 days'
),

-- Q65 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000072',
  '00000000-0000-0000-0010-000000000065',
  '00000000-0000-0000-0002-000000000081',
  true,
  'All four cameras installed and recording. Remote access working perfectly for the center manager.',
  NULL,
  now() - interval '28 days'
),

-- Q66 (spark): no validations needed

-- Q67 (blaze): 3 validations
(
  '00000000-0000-0000-0011-000000000073',
  '00000000-0000-0000-0010-000000000067',
  '00000000-0000-0000-0002-000000000076',
  true,
  'New stage is solid and level. The ADA ramp is well integrated. Huge improvement over the old one.',
  NULL,
  now() - interval '14 days'
),
(
  '00000000-0000-0000-0011-000000000074',
  '00000000-0000-0000-0010-000000000067',
  '00000000-0000-0000-0002-000000000084',
  true,
  'Tested the stage with a full band setup. Sturdy construction and great finish work.',
  NULL,
  now() - interval '13 days'
),
(
  '00000000-0000-0000-0011-000000000075',
  '00000000-0000-0000-0010-000000000067',
  '00000000-0000-0000-0002-000000000079',
  true,
  'The ramp access is perfect. My grandmother in her wheelchair can now easily get on stage for choir performances.',
  NULL,
  now() - interval '13 days'
),

-- Q68 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000076',
  '00000000-0000-0000-0010-000000000068',
  '00000000-0000-0000-0002-000000000078',
  true,
  'Toy drive was a success. Over 200 toys collected, sorted, wrapped, and distributed to Harbor kids.',
  'https://placeholder.civicforge.org/validations/harbor-toy-drive.jpg',
  now() - interval '7 days'
),
(
  '00000000-0000-0000-0011-000000000077',
  '00000000-0000-0000-0010-000000000068',
  '00000000-0000-0000-0002-000000000081',
  true,
  'The distribution event was heartwarming. Every kid left with a smile and a toy.',
  NULL,
  now() - interval '6 days'
),

-- --------------------------------------------------------------------------
-- Sunrise on the Monon Validations
-- --------------------------------------------------------------------------

-- Q72 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000078',
  '00000000-0000-0000-0010-000000000072',
  '00000000-0000-0000-0002-000000000094',
  true,
  'Wildflowers are planted and the temporary fencing is secure. Should be blooming by late spring.',
  NULL,
  now() - interval '77 days'
),

-- Q73 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000079',
  '00000000-0000-0000-0010-000000000073',
  '00000000-0000-0000-0002-000000000091',
  true,
  'Bench is beautiful and sturdy. Perfect height and the reclaimed wood gives it real character.',
  'https://placeholder.civicforge.org/validations/sunrise-trailside-bench.jpg',
  now() - interval '70 days'
),
(
  '00000000-0000-0000-0011-000000000080',
  '00000000-0000-0000-0010-000000000073',
  '00000000-0000-0000-0002-000000000087',
  true,
  'Sat on the bench this morning during my trail walk. Great craftsmanship and very comfortable.',
  NULL,
  now() - interval '69 days'
),

-- Q74 (spark): no validations needed

-- Q75 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000081',
  '00000000-0000-0000-0010-000000000075',
  '00000000-0000-0000-0002-000000000093',
  true,
  'Potluck series is off to a great start. Ten families signed up and the first dinner was wonderful.',
  NULL,
  now() - interval '56 days'
),

-- Q76 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000082',
  '00000000-0000-0000-0010-000000000076',
  '00000000-0000-0000-0002-000000000087',
  true,
  'Trail safety app is live and already has 15 hazard reports. Clean interface and easy to use.',
  'https://placeholder.civicforge.org/validations/monon-trail-safety-app.jpg',
  now() - interval '42 days'
),
(
  '00000000-0000-0000-0011-000000000083',
  '00000000-0000-0000-0010-000000000076',
  '00000000-0000-0000-0002-000000000096',
  true,
  'Tested the escort walk request feature last night. Got matched with a walking buddy in under an hour.',
  NULL,
  now() - interval '41 days'
),

-- Q77 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000084',
  '00000000-0000-0000-0010-000000000077',
  '00000000-0000-0000-0002-000000000089',
  true,
  'Committee is formed with six block captains. Charter looks thorough and the PD liaison meeting went well.',
  NULL,
  now() - interval '35 days'
),

-- Q78 (spark): no validations needed

-- Q79 (blaze): 3 validations
(
  '00000000-0000-0000-0011-000000000085',
  '00000000-0000-0000-0010-000000000079',
  '00000000-0000-0000-0002-000000000088',
  true,
  'Rain garden is installed and functioning. The native plantings look great and stormwater is being captured effectively.',
  NULL,
  now() - interval '21 days'
),
(
  '00000000-0000-0000-0011-000000000086',
  '00000000-0000-0000-0010-000000000079',
  '00000000-0000-0000-0002-000000000091',
  true,
  'Educational sign is well designed and informative. The rain garden itself is a beautiful addition to the entrance.',
  NULL,
  now() - interval '20 days'
),
(
  '00000000-0000-0000-0011-000000000087',
  '00000000-0000-0000-0010-000000000079',
  '00000000-0000-0000-0002-000000000093',
  true,
  'Excellent bioretention design. Already handling runoff from the last rain event.',
  NULL,
  now() - interval '20 days'
),

-- Q80 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000088',
  '00000000-0000-0000-0010-000000000080',
  '00000000-0000-0000-0002-000000000094',
  true,
  'Hot cocoa stand was a hit with the Saturday morning runners! Long line of happy faces.',
  'https://placeholder.civicforge.org/validations/monon-hot-cocoa-stand.jpg',
  now() - interval '5 days'
),
(
  '00000000-0000-0000-0011-000000000089',
  '00000000-0000-0000-0010-000000000080',
  '00000000-0000-0000-0002-000000000087',
  true,
  'Great community event. Volunteers were organized and cleanup was done by noon.',
  NULL,
  now() - interval '4 days'
),

-- --------------------------------------------------------------------------
-- Sunset Ridge Validations
-- --------------------------------------------------------------------------

-- Q84 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000090',
  '00000000-0000-0000-0010-000000000084',
  '00000000-0000-0000-0002-000000000101',
  true,
  'All five check-ins completed this week. Mrs. Ramirez needs a grocery run but otherwise everyone is doing well.',
  NULL,
  now() - interval '70 days'
),

-- Q85 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000091',
  '00000000-0000-0000-0010-000000000085',
  '00000000-0000-0000-0002-000000000102',
  true,
  'Raised beds are beautiful and accessible. My neighbor in a wheelchair was able to garden for the first time.',
  'https://placeholder.civicforge.org/validations/sunset-accessible-garden-beds.jpg',
  now() - interval '63 days'
),
(
  '00000000-0000-0000-0011-000000000092',
  '00000000-0000-0000-0010-000000000085',
  '00000000-0000-0000-0002-000000000108',
  true,
  'Heat-resistant materials were a smart choice. Beds are holding up perfectly in this Tucson heat.',
  NULL,
  now() - interval '62 days'
),

-- Q86 (spark): no validations needed

-- Q87 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000093',
  '00000000-0000-0000-0010-000000000087',
  '00000000-0000-0000-0002-000000000099',
  true,
  'Ten seniors attended and all left able to make video calls. Several were in tears connecting with grandkids.',
  NULL,
  now() - interval '49 days'
),

-- Q88 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000094',
  '00000000-0000-0000-0010-000000000088',
  '00000000-0000-0000-0002-000000000105',
  true,
  'Shuttle service is running smoothly. Eight riders on the first Thursday trip.',
  'https://placeholder.civicforge.org/validations/sunset-grocery-shuttle.jpg',
  now() - interval '42 days'
),
(
  '00000000-0000-0000-0011-000000000095',
  '00000000-0000-0000-0010-000000000088',
  '00000000-0000-0000-0002-000000000099',
  true,
  'Route is efficient and drivers are reliable. Residents are already asking about adding a second day.',
  NULL,
  now() - interval '41 days'
),

-- Q89 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000096',
  '00000000-0000-0000-0010-000000000089',
  '00000000-0000-0000-0002-000000000103',
  true,
  'Cooking night was magical. Three generations sharing Sonoran recipes. Everyone left with full bellies and recipe cards.',
  NULL,
  now() - interval '35 days'
),

-- Q90 (spark): no validations needed

-- Q91 (blaze): 3 validations
(
  '00000000-0000-0000-0011-000000000097',
  '00000000-0000-0000-0010-000000000091',
  '00000000-0000-0000-0002-000000000100',
  true,
  'Health screening day was a success. Over 60 residents got blood pressure, glucose, and vision checks.',
  NULL,
  now() - interval '21 days'
),
(
  '00000000-0000-0000-0011-000000000098',
  '00000000-0000-0000-0010-000000000091',
  '00000000-0000-0000-0002-000000000103',
  true,
  'Volunteer coordination was excellent. Three clinic nurses praised how well organized everything was.',
  NULL,
  now() - interval '20 days'
),
(
  '00000000-0000-0000-0011-000000000099',
  '00000000-0000-0000-0010-000000000091',
  '00000000-0000-0000-0002-000000000108',
  true,
  'This was exactly what our community needed. Several residents discovered health issues they can now address early.',
  NULL,
  now() - interval '20 days'
),

-- Q92 (flame): 2 validations (1 with photo)
(
  '00000000-0000-0000-0011-000000000100',
  '00000000-0000-0000-0010-000000000092',
  '00000000-0000-0000-0002-000000000099',
  true,
  'Alert system is live and tested. Received a test heat warning on my phone within seconds.',
  'https://placeholder.civicforge.org/validations/sunset-heat-alert-system.jpg',
  now() - interval '14 days'
),
(
  '00000000-0000-0000-0011-000000000101',
  '00000000-0000-0000-0010-000000000092',
  '00000000-0000-0000-0002-000000000102',
  true,
  'Checked with five neighbors and all confirmed receiving the test alert. Great setup.',
  NULL,
  now() - interval '13 days'
),

-- Q93 (ember): 1 validation
(
  '00000000-0000-0000-0011-000000000102',
  '00000000-0000-0000-0010-000000000093',
  '00000000-0000-0000-0002-000000000100',
  true,
  'Workshop was informative and hands-on. Twelve residents attended and several are already planning xeriscaping projects.',
  NULL,
  now() - interval '7 days'
)

ON CONFLICT (quest_id, validator_id) DO NOTHING;

-- ============================================================================
-- CivicForge Seed Expansion 3: Guilds, Guild Members, Endorsements,
-- Governance Proposals, Governance Votes, Sunset Rules
-- ============================================================================

-- ============================================================================
-- SECTION 1: NEW GUILDS (8 guilds, IDs 11-18)
-- ============================================================================

INSERT INTO guilds (id, community_id, name, domain, description, charter, charter_sunset_at, created_by, member_count, active, created_at) VALUES
  ('00000000-0000-0000-0015-000000000011', '00000000-0000-0000-0001-000000000001', 'Maplewood Care Circle', 'care', 'Caregiving network for Maplewood Heights — childcare, eldercare, first aid.', 'We look after each other. Training, coordination, mutual support.', now() + interval '280 days', '00000000-0000-0000-0002-000000000052', 0, true, now() - interval '48 days'),
  ('00000000-0000-0000-0015-000000000012', '00000000-0000-0000-0001-000000000001', 'Maplewood Signal Hub', 'signal', 'Tech support and digital literacy for all ages in Maplewood.', 'Free tech help, workshops, community communications.', now() + interval '260 days', '00000000-0000-0000-0002-000000000053', 0, true, now() - interval '44 days'),
  ('00000000-0000-0000-0015-000000000013', '00000000-0000-0000-0001-000000000002', 'Riverside Hearth Kitchen', 'hearth', 'Community cooking and gathering space for Riverside Commons.', 'Potlucks, cooking classes, meal trains, food preservation.', now() + interval '270 days', '00000000-0000-0000-0002-000000000018', 0, true, now() - interval '42 days'),
  ('00000000-0000-0000-0015-000000000014', '00000000-0000-0000-0001-000000000002', 'Riverside Bridge Runners', 'bridge', 'Delivery and transportation network for Riverside Commons.', 'Bike deliveries, ride sharing, moving help, errand running.', now() + interval '240 days', '00000000-0000-0000-0002-000000000066', 0, true, now() - interval '38 days'),
  ('00000000-0000-0000-0015-000000000015', '00000000-0000-0000-0001-000000000003', 'Harbor Signals', 'signal', 'Tech support and communications for Harbor Point.', 'Security systems, phone help, internet setup, community alerts.', now() + interval '250 days', '00000000-0000-0000-0002-000000000075', 0, true, now() - interval '40 days'),
  ('00000000-0000-0000-0015-000000000016', '00000000-0000-0000-0001-000000000003', 'Harbor Weavers', 'weave', 'Community organizing and governance for Harbor Point.', 'Block parties, mutual aid coordination, neighborhood watch.', now() + interval '230 days', '00000000-0000-0000-0002-000000000081', 0, true, now() - interval '35 days'),
  ('00000000-0000-0000-0015-000000000017', '00000000-0000-0000-0001-000000000004', 'Monon Green Trails', 'green', 'Trail maintenance and environmental stewardship for the Monon.', 'Trail cleanup, native planting, rain gardens, composting.', now() + interval '300 days', '00000000-0000-0000-0002-000000000091', 0, true, now() - interval '45 days'),
  ('00000000-0000-0000-0015-000000000018', '00000000-0000-0000-0001-000000000004', 'Monon Hearth & Home', 'hearth', 'Food and fellowship along the Monon trail.', 'Porch potlucks, trail cookouts, baking exchanges, dinner parties.', now() + interval '260 days', '00000000-0000-0000-0002-000000000089', 0, true, now() - interval '40 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 2: NEW GUILD MEMBERS (53 members, IDs 36-88)
-- ============================================================================

INSERT INTO guild_members (id, guild_id, user_id, role, steward_term_start, consecutive_terms, joined_at) VALUES
  -- Guild 11: Maplewood Care Circle (5 members)
  ('00000000-0000-0000-0016-000000000036', '00000000-0000-0000-0015-000000000011', '00000000-0000-0000-0002-000000000052', 'steward', now() - interval '48 days', 1, now() - interval '48 days'),
  ('00000000-0000-0000-0016-000000000037', '00000000-0000-0000-0015-000000000011', '00000000-0000-0000-0002-000000000056', 'member', null, 0, now() - interval '46 days'),
  ('00000000-0000-0000-0016-000000000038', '00000000-0000-0000-0015-000000000011', '00000000-0000-0000-0002-000000000003', 'member', null, 0, now() - interval '44 days'),
  ('00000000-0000-0000-0016-000000000039', '00000000-0000-0000-0015-000000000011', '00000000-0000-0000-0002-000000000005', 'member', null, 0, now() - interval '40 days'),
  ('00000000-0000-0000-0016-000000000040', '00000000-0000-0000-0015-000000000011', '00000000-0000-0000-0002-000000000059', 'member', null, 0, now() - interval '36 days'),

  -- Guild 12: Maplewood Signal Hub (5 members)
  ('00000000-0000-0000-0016-000000000041', '00000000-0000-0000-0015-000000000012', '00000000-0000-0000-0002-000000000053', 'steward', now() - interval '44 days', 1, now() - interval '44 days'),
  ('00000000-0000-0000-0016-000000000042', '00000000-0000-0000-0015-000000000012', '00000000-0000-0000-0002-000000000002', 'member', null, 0, now() - interval '42 days'),
  ('00000000-0000-0000-0016-000000000043', '00000000-0000-0000-0015-000000000012', '00000000-0000-0000-0002-000000000009', 'member', null, 0, now() - interval '38 days'),
  ('00000000-0000-0000-0016-000000000044', '00000000-0000-0000-0015-000000000012', '00000000-0000-0000-0002-000000000060', 'member', null, 0, now() - interval '35 days'),
  ('00000000-0000-0000-0016-000000000045', '00000000-0000-0000-0015-000000000012', '00000000-0000-0000-0002-000000000054', 'member', null, 0, now() - interval '30 days'),

  -- Guild 13: Riverside Hearth Kitchen (5 members)
  ('00000000-0000-0000-0016-000000000046', '00000000-0000-0000-0015-000000000013', '00000000-0000-0000-0002-000000000018', 'steward', now() - interval '42 days', 1, now() - interval '42 days'),
  ('00000000-0000-0000-0016-000000000047', '00000000-0000-0000-0015-000000000013', '00000000-0000-0000-0002-000000000022', 'member', null, 0, now() - interval '40 days'),
  ('00000000-0000-0000-0016-000000000048', '00000000-0000-0000-0015-000000000013', '00000000-0000-0000-0002-000000000072', 'member', null, 0, now() - interval '38 days'),
  ('00000000-0000-0000-0016-000000000049', '00000000-0000-0000-0015-000000000013', '00000000-0000-0000-0002-000000000067', 'member', null, 0, now() - interval '35 days'),
  ('00000000-0000-0000-0016-000000000050', '00000000-0000-0000-0015-000000000013', '00000000-0000-0000-0002-000000000064', 'member', null, 0, now() - interval '30 days'),

  -- Guild 14: Riverside Bridge Runners (4 members)
  ('00000000-0000-0000-0016-000000000051', '00000000-0000-0000-0015-000000000014', '00000000-0000-0000-0002-000000000066', 'steward', now() - interval '38 days', 1, now() - interval '38 days'),
  ('00000000-0000-0000-0016-000000000052', '00000000-0000-0000-0015-000000000014', '00000000-0000-0000-0002-000000000070', 'member', null, 0, now() - interval '36 days'),
  ('00000000-0000-0000-0016-000000000053', '00000000-0000-0000-0015-000000000014', '00000000-0000-0000-0002-000000000019', 'member', null, 0, now() - interval '33 days'),
  ('00000000-0000-0000-0016-000000000054', '00000000-0000-0000-0015-000000000014', '00000000-0000-0000-0002-000000000064', 'member', null, 0, now() - interval '28 days'),

  -- Guild 15: Harbor Signals (5 members)
  ('00000000-0000-0000-0016-000000000055', '00000000-0000-0000-0015-000000000015', '00000000-0000-0000-0002-000000000075', 'steward', now() - interval '40 days', 1, now() - interval '40 days'),
  ('00000000-0000-0000-0016-000000000056', '00000000-0000-0000-0015-000000000015', '00000000-0000-0000-0002-000000000078', 'member', null, 0, now() - interval '38 days'),
  ('00000000-0000-0000-0016-000000000057', '00000000-0000-0000-0015-000000000015', '00000000-0000-0000-0002-000000000081', 'member', null, 0, now() - interval '35 days'),
  ('00000000-0000-0000-0016-000000000058', '00000000-0000-0000-0015-000000000015', '00000000-0000-0000-0002-000000000032', 'member', null, 0, now() - interval '30 days'),
  ('00000000-0000-0000-0016-000000000059', '00000000-0000-0000-0015-000000000015', '00000000-0000-0000-0002-000000000083', 'member', null, 0, now() - interval '25 days'),

  -- Guild 16: Harbor Weavers (4 members)
  ('00000000-0000-0000-0016-000000000060', '00000000-0000-0000-0015-000000000016', '00000000-0000-0000-0002-000000000081', 'steward', now() - interval '35 days', 1, now() - interval '35 days'),
  ('00000000-0000-0000-0016-000000000061', '00000000-0000-0000-0015-000000000016', '00000000-0000-0000-0002-000000000024', 'member', null, 0, now() - interval '33 days'),
  ('00000000-0000-0000-0016-000000000062', '00000000-0000-0000-0015-000000000016', '00000000-0000-0000-0002-000000000075', 'member', null, 0, now() - interval '30 days'),
  ('00000000-0000-0000-0016-000000000063', '00000000-0000-0000-0015-000000000016', '00000000-0000-0000-0002-000000000076', 'member', null, 0, now() - interval '28 days'),

  -- Guild 17: Monon Green Trails (5 members)
  ('00000000-0000-0000-0016-000000000064', '00000000-0000-0000-0015-000000000017', '00000000-0000-0000-0002-000000000091', 'steward', now() - interval '45 days', 1, now() - interval '45 days'),
  ('00000000-0000-0000-0016-000000000065', '00000000-0000-0000-0015-000000000017', '00000000-0000-0000-0002-000000000094', 'member', null, 0, now() - interval '42 days'),
  ('00000000-0000-0000-0016-000000000066', '00000000-0000-0000-0015-000000000017', '00000000-0000-0000-0002-000000000088', 'member', null, 0, now() - interval '40 days'),
  ('00000000-0000-0000-0016-000000000067', '00000000-0000-0000-0015-000000000017', '00000000-0000-0000-0002-000000000035', 'member', null, 0, now() - interval '36 days'),
  ('00000000-0000-0000-0016-000000000068', '00000000-0000-0000-0015-000000000017', '00000000-0000-0000-0002-000000000042', 'member', null, 0, now() - interval '30 days'),

  -- Guild 18: Monon Hearth & Home (5 members)
  ('00000000-0000-0000-0016-000000000069', '00000000-0000-0000-0015-000000000018', '00000000-0000-0000-0002-000000000089', 'steward', now() - interval '40 days', 1, now() - interval '40 days'),
  ('00000000-0000-0000-0016-000000000070', '00000000-0000-0000-0015-000000000018', '00000000-0000-0000-0002-000000000093', 'member', null, 0, now() - interval '38 days'),
  ('00000000-0000-0000-0016-000000000071', '00000000-0000-0000-0015-000000000018', '00000000-0000-0000-0002-000000000037', 'member', null, 0, now() - interval '35 days'),
  ('00000000-0000-0000-0016-000000000072', '00000000-0000-0000-0015-000000000018', '00000000-0000-0000-0002-000000000035', 'member', null, 0, now() - interval '30 days'),
  ('00000000-0000-0000-0016-000000000073', '00000000-0000-0000-0015-000000000018', '00000000-0000-0000-0002-000000000087', 'member', null, 0, now() - interval '25 days'),

  -- Guild 8 (Sunset Bridge): add 3 more members
  ('00000000-0000-0000-0016-000000000074', '00000000-0000-0000-0015-000000000008', '00000000-0000-0000-0002-000000000102', 'member', null, 0, now() - interval '30 days'),
  ('00000000-0000-0000-0016-000000000075', '00000000-0000-0000-0015-000000000008', '00000000-0000-0000-0002-000000000106', 'member', null, 0, now() - interval '25 days'),
  ('00000000-0000-0000-0016-000000000076', '00000000-0000-0000-0015-000000000008', '00000000-0000-0000-0002-000000000043', 'member', null, 0, now() - interval '20 days'),

  -- Guild 6 (Harbor Hearts): add 2 more members
  ('00000000-0000-0000-0016-000000000077', '00000000-0000-0000-0015-000000000006', '00000000-0000-0000-0002-000000000078', 'member', null, 0, now() - interval '35 days'),
  ('00000000-0000-0000-0016-000000000078', '00000000-0000-0000-0015-000000000006', '00000000-0000-0000-0002-000000000082', 'member', null, 0, now() - interval '30 days'),

  -- Guild 1 (Maplewood Green Thumbs): add 1 member
  ('00000000-0000-0000-0016-000000000079', '00000000-0000-0000-0015-000000000001', '00000000-0000-0000-0002-000000000054', 'member', null, 0, now() - interval '40 days'),

  -- Guild 9 (Sunset Hearth): add 2 more members
  ('00000000-0000-0000-0016-000000000080', '00000000-0000-0000-0015-000000000009', '00000000-0000-0000-0002-000000000101', 'member', null, 0, now() - interval '22 days'),
  ('00000000-0000-0000-0016-000000000081', '00000000-0000-0000-0015-000000000009', '00000000-0000-0000-0002-000000000109', 'member', null, 0, now() - interval '18 days')
ON CONFLICT (guild_id, user_id) DO NOTHING;

-- ============================================================================
-- SECTION 3: ENDORSEMENTS (80 rows, IDs 26-105)
-- ============================================================================

INSERT INTO endorsements (id, from_user, to_user, domain, skill, message, quest_id, created_at) VALUES
  -- ========================================
  -- craft → green flow (5 endorsements)
  -- ========================================
  ('00000000-0000-0000-0017-000000000026', '00000000-0000-0000-0002-000000000051', '00000000-0000-0000-0002-000000000054', 'green', 'composting', 'Anna turned our backyard waste into the richest compost I have ever seen.', null, now() - interval '30 days'),
  ('00000000-0000-0000-0017-000000000027', '00000000-0000-0000-0002-000000000088', '00000000-0000-0000-0002-000000000091', 'green', 'gardening', 'Stephanie organized the rain garden install and it looks incredible.', '00000000-0000-0000-0010-000000000072', now() - interval '28 days'),
  ('00000000-0000-0000-0017-000000000028', '00000000-0000-0000-0002-000000000075', '00000000-0000-0000-0002-000000000084', 'green', 'gardening', 'Dependable and knowledgeable about native harbor plants.', null, now() - interval '26 days'),
  ('00000000-0000-0000-0017-000000000029', '00000000-0000-0000-0002-000000000100', '00000000-0000-0000-0002-000000000108', 'green', 'xeriscaping', 'Led the drought-resistant garden redesign for the community center.', null, now() - interval '24 days'),
  ('00000000-0000-0000-0017-000000000030', '00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0002-000000000006', 'green', 'landscaping', 'Marcus redesigned the whole front bed and it looks amazing.', '00000000-0000-0000-0010-000000000038', now() - interval '22 days'),

  -- ========================================
  -- green → craft flow (5 endorsements)
  -- ========================================
  ('00000000-0000-0000-0017-000000000031', '00000000-0000-0000-0002-000000000013', '00000000-0000-0000-0002-000000000015', 'craft', 'bike repair', 'Mike fixed three bikes at the community repair day like it was nothing.', null, now() - interval '29 days'),
  ('00000000-0000-0000-0017-000000000032', '00000000-0000-0000-0002-000000000054', '00000000-0000-0000-0002-000000000051', 'craft', 'carpentry', 'Built new raised bed frames that will last for years.', null, now() - interval '27 days'),
  ('00000000-0000-0000-0017-000000000033', '00000000-0000-0000-0002-000000000064', '00000000-0000-0000-0002-000000000066', 'craft', 'bike repair', 'Liam keeps the community bike fleet in perfect shape.', null, now() - interval '25 days'),
  ('00000000-0000-0000-0017-000000000034', '00000000-0000-0000-0002-000000000091', '00000000-0000-0000-0002-000000000088', 'craft', 'carpentry', 'Marcus built the trail kiosk almost single-handedly.', '00000000-0000-0000-0010-000000000074', now() - interval '23 days'),
  ('00000000-0000-0000-0017-000000000035', '00000000-0000-0000-0002-000000000108', '00000000-0000-0000-0002-000000000100', 'craft', 'woodworking', 'Crafted beautiful benches for the community garden entrance.', null, now() - interval '21 days'),

  -- ========================================
  -- care → hearth flow (5 endorsements)
  -- ========================================
  ('00000000-0000-0000-0017-000000000036', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0002-000000000058', 'hearth', 'baking', 'Her sourdough for the block party was the first thing to disappear.', null, now() - interval '32 days'),
  ('00000000-0000-0000-0017-000000000037', '00000000-0000-0000-0002-000000000052', '00000000-0000-0000-0002-000000000001', 'hearth', 'cooking', 'Tom organized meals for three families during the ice storm.', null, now() - interval '30 days'),
  ('00000000-0000-0000-0017-000000000038', '00000000-0000-0000-0002-000000000076', '00000000-0000-0000-0002-000000000080', 'hearth', 'baking', 'Her pies at the harbor festival were legendary.', null, now() - interval '28 days'),
  ('00000000-0000-0000-0017-000000000039', '00000000-0000-0000-0002-000000000099', '00000000-0000-0000-0002-000000000101', 'hearth', 'cooking', 'Margaret hosted the welcome dinner and made everyone feel at home.', null, now() - interval '26 days'),
  ('00000000-0000-0000-0017-000000000040', '00000000-0000-0000-0002-000000000067', '00000000-0000-0000-0002-000000000072', 'hearth', 'baking', 'Ruby taught the kids bread-making at the community kitchen.', '00000000-0000-0000-0010-000000000062', now() - interval '24 days'),

  -- ========================================
  -- hearth → care flow (4 endorsements)
  -- ========================================
  ('00000000-0000-0000-0017-000000000041', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0002-000000000052', 'care', 'eldercare', 'Dorothy checks on every senior on our block without being asked.', null, now() - interval '31 days'),
  ('00000000-0000-0000-0017-000000000042', '00000000-0000-0000-0002-000000000089', '00000000-0000-0000-0002-000000000093', 'care', 'childcare', 'Anita ran the summer kids program with so much patience and energy.', null, now() - interval '29 days'),
  ('00000000-0000-0000-0017-000000000043', '00000000-0000-0000-0002-000000000080', '00000000-0000-0000-0002-000000000076', 'care', 'eldercare', 'Mary coordinated the medication reminder network for the whole block.', null, now() - interval '27 days'),
  ('00000000-0000-0000-0017-000000000044', '00000000-0000-0000-0002-000000000101', '00000000-0000-0000-0002-000000000099', 'care', 'counseling', 'Always the first to notice when a neighbor is struggling.', null, now() - interval '25 days'),

  -- ========================================
  -- signal → weave flow (4 endorsements)
  -- ========================================
  ('00000000-0000-0000-0017-000000000045', '00000000-0000-0000-0002-000000000053', '00000000-0000-0000-0002-000000000057', 'weave', 'organizing', 'Coordinated the tech drive with impressive logistics.', null, now() - interval '28 days'),
  ('00000000-0000-0000-0017-000000000046', '00000000-0000-0000-0002-000000000065', '00000000-0000-0000-0002-000000000063', 'weave', 'governance', 'Drafted the neighborhood charter revision that everyone agreed on.', null, now() - interval '26 days'),
  ('00000000-0000-0000-0017-000000000047', '00000000-0000-0000-0002-000000000090', '00000000-0000-0000-0002-000000000087', 'weave', 'governance', 'Eleanor facilitated our most productive community meeting ever.', null, now() - interval '24 days'),
  ('00000000-0000-0000-0017-000000000048', '00000000-0000-0000-0002-000000000103', '00000000-0000-0000-0002-000000000099', 'weave', 'organizing', 'Pulled together the emergency preparedness plan in record time.', null, now() - interval '22 days'),

  -- ========================================
  -- weave → signal flow (5 endorsements)
  -- ========================================
  ('00000000-0000-0000-0017-000000000049', '00000000-0000-0000-0002-000000000034', '00000000-0000-0000-0002-000000000090', 'signal', 'tech help', 'Set up the whole community alert system by himself.', null, now() - interval '27 days'),
  ('00000000-0000-0000-0017-000000000050', '00000000-0000-0000-0002-000000000043', '00000000-0000-0000-0002-000000000103', 'signal', 'teaching', 'Taught our seniors group how to use video calls with endless patience.', null, now() - interval '25 days'),
  ('00000000-0000-0000-0017-000000000051', '00000000-0000-0000-0002-000000000063', '00000000-0000-0000-0002-000000000065', 'signal', 'coding', 'Built the neighborhood resource tracker website from scratch.', null, now() - interval '23 days'),
  ('00000000-0000-0000-0017-000000000052', '00000000-0000-0000-0002-000000000087', '00000000-0000-0000-0002-000000000095', 'signal', 'tech help', 'Fixed the community center WiFi when nobody else could figure it out.', null, now() - interval '21 days'),
  ('00000000-0000-0000-0017-000000000053', '00000000-0000-0000-0002-000000000081', '00000000-0000-0000-0002-000000000078', 'signal', 'teaching', 'Kim ran a fantastic phone skills workshop for the harbor seniors.', null, now() - interval '19 days'),

  -- ========================================
  -- craft → care flow (4 endorsements)
  -- ========================================
  ('00000000-0000-0000-0017-000000000054', '00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0002-000000000056', 'care', 'first aid', 'Grace handled the playground injury calmly and got everyone bandaged up.', null, now() - interval '26 days'),
  ('00000000-0000-0000-0017-000000000055', '00000000-0000-0000-0002-000000000077', '00000000-0000-0000-0002-000000000078', 'care', 'eldercare', 'Kim visits the homebound residents every week without fail.', null, now() - interval '24 days'),
  ('00000000-0000-0000-0017-000000000056', '00000000-0000-0000-0002-000000000092', '00000000-0000-0000-0002-000000000093', 'care', 'childcare', 'Anita keeps the after-school program running smoothly.', null, now() - interval '22 days'),
  ('00000000-0000-0000-0017-000000000057', '00000000-0000-0000-0002-000000000104', '00000000-0000-0000-0002-000000000107', 'care', 'eldercare', 'Organized the neighborhood wellness check rotation for winter.', null, now() - interval '20 days'),

  -- ========================================
  -- bridge → hearth flow (4 endorsements)
  -- ========================================
  ('00000000-0000-0000-0017-000000000058', '00000000-0000-0000-0002-000000000055', '00000000-0000-0000-0002-000000000058', 'hearth', 'baking', 'Her cinnamon rolls at the fundraiser raised more than the silent auction.', null, now() - interval '25 days'),
  ('00000000-0000-0000-0017-000000000059', '00000000-0000-0000-0002-000000000079', '00000000-0000-0000-0002-000000000027', 'hearth', 'baking', 'Those harbor clam chowder nights are the highlight of my month.', null, now() - interval '23 days'),
  ('00000000-0000-0000-0017-000000000060', '00000000-0000-0000-0002-000000000102', '00000000-0000-0000-0002-000000000101', 'hearth', 'cooking', 'Margaret put together the whole holiday feast for thirty people.', null, now() - interval '21 days'),
  ('00000000-0000-0000-0017-000000000061', '00000000-0000-0000-0002-000000000096', '00000000-0000-0000-0002-000000000089', 'hearth', 'cooking', 'Patricia turned the trail cookout into a real neighborhood tradition.', null, now() - interval '19 days'),

  -- ========================================
  -- Additional Maplewood endorsements (9)
  -- ========================================
  ('00000000-0000-0000-0017-000000000062', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0002-000000000057', 'green', 'native plants', 'Identified every invasive species on the block and showed us replacements.', null, now() - interval '33 days'),
  ('00000000-0000-0000-0017-000000000063', '00000000-0000-0000-0002-000000000051', '00000000-0000-0000-0002-000000000002', 'craft', 'woodworking', 'James built the community tool shed over a single weekend.', null, now() - interval '31 days'),
  ('00000000-0000-0000-0017-000000000064', '00000000-0000-0000-0002-000000000052', '00000000-0000-0000-0002-000000000003', 'care', 'childcare', 'Priya organized the emergency childcare network for snow days.', null, now() - interval '29 days'),
  ('00000000-0000-0000-0017-000000000065', '00000000-0000-0000-0002-000000000054', '00000000-0000-0000-0002-000000000006', 'green', 'gardening', 'Marcus keeps the community garden thriving through every season.', null, now() - interval '27 days'),
  ('00000000-0000-0000-0017-000000000066', '00000000-0000-0000-0002-000000000053', '00000000-0000-0000-0002-000000000009', 'signal', 'design', 'Emily designed our new community newsletter template beautifully.', null, now() - interval '25 days'),
  ('00000000-0000-0000-0017-000000000067', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0002-000000000051', 'craft', 'carpentry', 'Replaced the rotting porch steps for Mrs. Henderson in one afternoon.', '00000000-0000-0000-0010-000000000039', now() - interval '23 days'),
  ('00000000-0000-0000-0017-000000000068', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0002-000000000052', 'care', 'eldercare', 'Dorothy drives seniors to appointments every single Tuesday.', null, now() - interval '21 days'),
  ('00000000-0000-0000-0017-000000000069', '00000000-0000-0000-0002-000000000057', '00000000-0000-0000-0002-000000000054', 'green', 'composting', 'Anna taught the whole block how to maintain a worm bin.', null, now() - interval '19 days'),
  ('00000000-0000-0000-0017-000000000070', '00000000-0000-0000-0002-000000000056', '00000000-0000-0000-0002-000000000052', 'care', 'eldercare', 'Dorothy is the reason our eldercare network actually works.', null, now() - interval '17 days'),

  -- ========================================
  -- Additional Riverside endorsements (9)
  -- ========================================
  ('00000000-0000-0000-0017-000000000071', '00000000-0000-0000-0002-000000000014', '00000000-0000-0000-0002-000000000064', 'green', 'urban farming', 'Carlos turned the vacant lot into a productive urban farm.', null, now() - interval '32 days'),
  ('00000000-0000-0000-0017-000000000072', '00000000-0000-0000-0002-000000000063', '00000000-0000-0000-0002-000000000013', 'weave', 'organizing', 'Rosa rallied the whole block for the flood cleanup in hours.', null, now() - interval '30 days'),
  ('00000000-0000-0000-0017-000000000073', '00000000-0000-0000-0002-000000000066', '00000000-0000-0000-0002-000000000019', 'craft', 'mechanical', 'Alex repaired the community lawnmower that everyone had given up on.', null, now() - interval '28 days'),
  ('00000000-0000-0000-0017-000000000074', '00000000-0000-0000-0002-000000000065', '00000000-0000-0000-0002-000000000069', 'signal', 'tech help', 'Set up the mesh network that gives the whole park WiFi.', null, now() - interval '26 days'),
  ('00000000-0000-0000-0017-000000000075', '00000000-0000-0000-0002-000000000068', '00000000-0000-0000-0002-000000000014', 'green', 'composting', 'Taught composting at the farmers market and converted dozens of skeptics.', null, now() - interval '24 days'),
  ('00000000-0000-0000-0017-000000000076', '00000000-0000-0000-0002-000000000069', '00000000-0000-0000-0002-000000000063', 'weave', 'mediation', 'Mediated the parking dispute so well both sides left smiling.', null, now() - interval '22 days'),
  ('00000000-0000-0000-0017-000000000077', '00000000-0000-0000-0002-000000000072', '00000000-0000-0000-0002-000000000018', 'hearth', 'cooking', 'Sofia''s tamale night brought out neighbors who never come to anything.', null, now() - interval '20 days'),
  ('00000000-0000-0000-0017-000000000078', '00000000-0000-0000-0002-000000000064', '00000000-0000-0000-0002-000000000068', 'green', 'restoration', 'Restored the creek bank with willows and it actually held through spring.', null, now() - interval '18 days'),
  ('00000000-0000-0000-0017-000000000079', '00000000-0000-0000-0002-000000000067', '00000000-0000-0000-0002-000000000020', 'care', 'childcare', 'Watched four kids during the emergency meeting and they all had fun.', null, now() - interval '16 days'),

  -- ========================================
  -- Additional Harbor endorsements (9)
  -- ========================================
  ('00000000-0000-0000-0017-000000000080', '00000000-0000-0000-0002-000000000024', '00000000-0000-0000-0002-000000000075', 'craft', 'electrical', 'Reggie rewired the community center stage lighting in a single day.', null, now() - interval '31 days'),
  ('00000000-0000-0000-0017-000000000081', '00000000-0000-0000-0002-000000000075', '00000000-0000-0000-0002-000000000024', 'craft', 'carpentry', 'Frank rebuilt the harbor boardwalk railing better than the original.', null, now() - interval '29 days'),
  ('00000000-0000-0000-0017-000000000082', '00000000-0000-0000-0002-000000000076', '00000000-0000-0000-0002-000000000025', 'care', 'childcare', 'Ran the harbor kids summer camp with incredible creativity.', null, now() - interval '27 days'),
  ('00000000-0000-0000-0017-000000000083', '00000000-0000-0000-0002-000000000078', '00000000-0000-0000-0002-000000000029', 'care', 'nursing', 'Organized the flu shot clinic and made it actually run on time.', null, now() - interval '25 days'),
  ('00000000-0000-0000-0017-000000000084', '00000000-0000-0000-0002-000000000077', '00000000-0000-0000-0002-000000000028', 'craft', 'construction', 'Led the gazebo rebuild after the storm with zero waste.', '00000000-0000-0000-0010-000000000068', now() - interval '23 days'),
  ('00000000-0000-0000-0017-000000000085', '00000000-0000-0000-0002-000000000079', '00000000-0000-0000-0002-000000000080', 'hearth', 'baking', 'Her bread at the harbor market sells out in fifteen minutes.', null, now() - interval '21 days'),
  ('00000000-0000-0000-0017-000000000086', '00000000-0000-0000-0002-000000000080', '00000000-0000-0000-0002-000000000027', 'hearth', 'baking', 'The clam bake he organized was the best harbor event this year.', null, now() - interval '19 days'),
  ('00000000-0000-0000-0017-000000000087', '00000000-0000-0000-0002-000000000081', '00000000-0000-0000-0002-000000000024', 'weave', 'mentoring', 'Frank mentors new volunteers and everyone he trains stays involved.', null, now() - interval '17 days'),
  ('00000000-0000-0000-0017-000000000088', '00000000-0000-0000-0002-000000000084', '00000000-0000-0000-0002-000000000077', 'green', 'gardening', 'Transformed the harborside planter boxes into a pollinator paradise.', null, now() - interval '15 days'),

  -- ========================================
  -- Additional Sunrise endorsements (10)
  -- ========================================
  ('00000000-0000-0000-0017-000000000089', '00000000-0000-0000-0002-000000000034', '00000000-0000-0000-0002-000000000088', 'craft', 'carpentry', 'Marcus framed the new trail shelter in a weekend with three volunteers.', null, now() - interval '30 days'),
  ('00000000-0000-0000-0017-000000000090', '00000000-0000-0000-0002-000000000088', '00000000-0000-0000-0002-000000000092', 'craft', 'carpentry', 'Built custom bike racks for every trailhead.', null, now() - interval '28 days'),
  ('00000000-0000-0000-0017-000000000091', '00000000-0000-0000-0002-000000000087', '00000000-0000-0000-0002-000000000034', 'weave', 'governance', 'Drafted the trail sharing agreement that all four neighborhoods signed.', null, now() - interval '26 days'),
  ('00000000-0000-0000-0017-000000000092', '00000000-0000-0000-0002-000000000091', '00000000-0000-0000-0002-000000000094', 'green', 'beekeeping', 'Will started the community apiary and it produced 40 pounds of honey.', null, now() - interval '24 days'),
  ('00000000-0000-0000-0017-000000000093', '00000000-0000-0000-0002-000000000089', '00000000-0000-0000-0002-000000000093', 'care', 'childcare', 'Anita organized trail storytime for toddlers every Thursday morning.', null, now() - interval '22 days'),
  ('00000000-0000-0000-0017-000000000094', '00000000-0000-0000-0002-000000000092', '00000000-0000-0000-0002-000000000088', 'craft', 'woodworking', 'The hand-carved trail markers Marcus made are works of art.', null, now() - interval '20 days'),
  ('00000000-0000-0000-0017-000000000095', '00000000-0000-0000-0002-000000000093', '00000000-0000-0000-0002-000000000089', 'hearth', 'cooking', 'Patricia''s trail cookouts bring the whole neighborhood together.', null, now() - interval '18 days'),
  ('00000000-0000-0000-0017-000000000096', '00000000-0000-0000-0002-000000000094', '00000000-0000-0000-0002-000000000091', 'green', 'gardening', 'Stephanie turned a muddy slope into a gorgeous wildflower meadow.', null, now() - interval '16 days'),
  ('00000000-0000-0000-0017-000000000097', '00000000-0000-0000-0002-000000000090', '00000000-0000-0000-0002-000000000034', 'weave', 'governance', 'Led the trail usage survey and presented findings to the city council.', null, now() - interval '14 days'),
  ('00000000-0000-0000-0017-000000000098', '00000000-0000-0000-0002-000000000095', '00000000-0000-0000-0002-000000000090', 'signal', 'cybersecurity', 'Secured the community network and taught safe internet practices.', null, now() - interval '12 days'),

  -- ========================================
  -- Additional Sunset endorsements (9)
  -- ========================================
  ('00000000-0000-0000-0017-000000000099', '00000000-0000-0000-0002-000000000099', '00000000-0000-0000-0002-000000000043', 'weave', 'governance', 'Gloria mediated the zoning discussion and found common ground.', null, now() - interval '29 days'),
  ('00000000-0000-0000-0017-000000000100', '00000000-0000-0000-0002-000000000100', '00000000-0000-0000-0002-000000000104', 'craft', 'plumbing', 'Fixed three burst pipes on the coldest night of the year.', null, now() - interval '27 days'),
  ('00000000-0000-0000-0017-000000000101', '00000000-0000-0000-0002-000000000101', '00000000-0000-0000-0002-000000000109', 'hearth', 'cooking', 'Samantha made the best chili at the neighborhood cook-off.', null, now() - interval '25 days'),
  ('00000000-0000-0000-0017-000000000102', '00000000-0000-0000-0002-000000000103', '00000000-0000-0000-0002-000000000105', 'signal', 'tech help', 'Set up tablets for every senior who wanted one and taught them all.', null, now() - interval '23 days'),
  ('00000000-0000-0000-0017-000000000103', '00000000-0000-0000-0002-000000000102', '00000000-0000-0000-0002-000000000101', 'hearth', 'cooking', 'Margaret''s Sunday soup kitchen feeds twenty people every week.', null, now() - interval '21 days'),
  ('00000000-0000-0000-0017-000000000104', '00000000-0000-0000-0002-000000000104', '00000000-0000-0000-0002-000000000100', 'craft', 'woodworking', 'Built the little free library that the whole ridge uses.', null, now() - interval '19 days'),
  ('00000000-0000-0000-0017-000000000105', '00000000-0000-0000-0002-000000000105', '00000000-0000-0000-0002-000000000103', 'signal', 'tutoring', 'Tutors three high schoolers in math every week and they all passed.', null, now() - interval '17 days'),
  ('00000000-0000-0000-0017-000000000106', '00000000-0000-0000-0002-000000000106', '00000000-0000-0000-0002-000000000102', 'bridge', 'transportation', 'Drives the carpool route so reliably you could set a clock by him.', null, now() - interval '15 days'),
  ('00000000-0000-0000-0017-000000000107', '00000000-0000-0000-0002-000000000108', '00000000-0000-0000-0002-000000000100', 'craft', 'woodworking', 'Repaired every broken fence on the block after the windstorm.', null, now() - interval '13 days')
ON CONFLICT (from_user, to_user, domain) DO NOTHING;

-- ============================================================================
-- SECTION 4: GOVERNANCE PROPOSALS (12 proposals, IDs 9-20)
-- ============================================================================

INSERT INTO governance_proposals (id, community_id, guild_id, author_id, title, description, category, status, vote_type, votes_for, votes_against, quorum, deliberation_ends_at, voting_ends_at, created_at) VALUES
  ('00000000-0000-0000-0018-000000000009', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0015-000000000012', '00000000-0000-0000-0002-000000000053', 'Digital Inclusion Policy', 'Establish free WiFi zones and device lending library at community center.', 'rule_change', 'passed', 'quadratic', 6, 1, 3, now() - interval '12 days', now() - interval '5 days', now() - interval '18 days'),
  ('00000000-0000-0000-0018-000000000010', '00000000-0000-0000-0001-000000000001', null, '00000000-0000-0000-0002-000000000001', 'Spring Planting Quest Series', 'Template for recurring spring garden quests each year.', 'seasonal_quest', 'voting', 'approval', 3, 0, 3, now() - interval '3 days', now() + interval '7 days', now() - interval '10 days'),
  ('00000000-0000-0000-0018-000000000011', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0015-000000000014', '00000000-0000-0000-0002-000000000066', 'Riverside Delivery Co-op Charter', 'Establish a formal bike delivery cooperative with shared equipment.', 'guild_charter', 'passed', 'quadratic', 7, 1, 3, now() - interval '18 days', now() - interval '10 days', now() - interval '25 days'),
  ('00000000-0000-0000-0018-000000000012', '00000000-0000-0000-0001-000000000002', null, '00000000-0000-0000-0002-000000000063', 'Lower Pillar Threshold to 40 Renown', 'Make Pillar tier more accessible for active newcomers.', 'threshold_change', 'deliberation', 'quadratic', 0, 0, 3, now() + interval '10 days', now() + interval '24 days', now() - interval '8 days'),
  ('00000000-0000-0000-0018-000000000013', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0015-000000000016', '00000000-0000-0000-0002-000000000081', 'Harbor Youth Mentorship Program', 'Create structured mentorship pairing between veterans and young adults.', 'charter_amendment', 'passed', 'quadratic', 6, 0, 3, now() - interval '15 days', now() - interval '8 days', now() - interval '22 days'),
  ('00000000-0000-0000-0018-000000000014', '00000000-0000-0000-0001-000000000003', null, '00000000-0000-0000-0002-000000000075', 'Emergency Repair Response Protocol', 'Establish rapid-response protocol for storm and emergency home repairs.', 'rule_change', 'voting', 'approval', 3, 0, 3, now() - interval '5 days', now() + interval '5 days', now() - interval '12 days'),
  ('00000000-0000-0000-0018-000000000015', '00000000-0000-0000-0001-000000000003', null, '00000000-0000-0000-0002-000000000076', 'Harbor Point Seasonal Feast Quest', 'Create annual neighborhood feast as a recurring quest template.', 'seasonal_quest', 'draft', 'quadratic', 0, 0, 3, null, null, now() - interval '3 days'),
  ('00000000-0000-0000-0018-000000000016', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0015-000000000017', '00000000-0000-0000-0002-000000000091', 'Monon Trail Stewardship Accord', 'Formal agreement for trail maintenance responsibilities and seasonal schedules.', 'charter_amendment', 'passed', 'quadratic', 6, 1, 3, now() - interval '20 days', now() - interval '12 days', now() - interval '28 days'),
  ('00000000-0000-0000-0018-000000000017', '00000000-0000-0000-0001-000000000004', null, '00000000-0000-0000-0002-000000000087', 'Monon Newcomer Welcome Protocol', 'Structured welcome process for new trail neighborhood residents.', 'rule_change', 'voting', 'approval', 4, 0, 3, now() - interval '6 days', now() + interval '4 days', now() - interval '14 days'),
  ('00000000-0000-0000-0018-000000000018', '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0015-000000000009', '00000000-0000-0000-0002-000000000101', 'Intergenerational Dinner Charter', 'Formalize monthly cross-generational dinner program.', 'guild_charter', 'passed', 'quadratic', 3, 0, 3, now() - interval '22 days', now() - interval '14 days', now() - interval '30 days'),
  ('00000000-0000-0000-0018-000000000019', '00000000-0000-0000-0001-000000000005', null, '00000000-0000-0000-0002-000000000099', 'Heat Safety Quest Template', 'Create seasonal quests for summer heat wave preparedness and neighbor check-ins.', 'seasonal_quest', 'deliberation', 'quadratic', 0, 0, 3, now() + interval '8 days', now() + interval '22 days', now() - interval '6 days'),
  ('00000000-0000-0000-0018-000000000020', '00000000-0000-0000-0001-000000000005', null, '00000000-0000-0000-0002-000000000103', 'Sunset Ridge Digital Literacy Standards', 'Establish minimum tech support standards for elder assistance.', 'rule_change', 'rejected', 'quadratic', 1, 3, 3, now() - interval '16 days', now() - interval '8 days', now() - interval '24 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 5: GOVERNANCE VOTES (40 votes, IDs 26-65)
-- ============================================================================

INSERT INTO governance_votes (id, proposal_id, voter_id, vote_type, credits_spent, vote_weight, delegate_to_id, in_favor, created_at) VALUES
  -- Proposal 9: Digital Inclusion Policy (passed, quadratic, for=6, against=1)
  ('00000000-0000-0000-0019-000000000026', '00000000-0000-0000-0018-000000000009', '00000000-0000-0000-0002-000000000001', 'quadratic', 4, 2.0, null, true, now() - interval '8 days'),
  ('00000000-0000-0000-0019-000000000027', '00000000-0000-0000-0018-000000000009', '00000000-0000-0000-0002-000000000052', 'quadratic', 1, 1.0, null, true, now() - interval '7 days'),
  ('00000000-0000-0000-0019-000000000028', '00000000-0000-0000-0018-000000000009', '00000000-0000-0000-0002-000000000002', 'quadratic', 1, 1.0, null, true, now() - interval '7 days'),
  ('00000000-0000-0000-0019-000000000029', '00000000-0000-0000-0018-000000000009', '00000000-0000-0000-0002-000000000004', 'quadratic', 1, 1.0, null, false, now() - interval '6 days'),
  ('00000000-0000-0000-0019-000000000058', '00000000-0000-0000-0018-000000000009', '00000000-0000-0000-0002-000000000053', 'quadratic', 1, 1.0, null, true, now() - interval '6 days'),
  ('00000000-0000-0000-0019-000000000059', '00000000-0000-0000-0018-000000000009', '00000000-0000-0000-0002-000000000051', 'quadratic', 1, 1.0, null, true, now() - interval '6 days'),

  -- Proposal 10: Spring Planting Quest Series (voting, approval, for=3)
  ('00000000-0000-0000-0019-000000000030', '00000000-0000-0000-0018-000000000010', '00000000-0000-0000-0002-000000000052', 'approval', 1, 1.0, null, true, now() - interval '5 days'),
  ('00000000-0000-0000-0019-000000000031', '00000000-0000-0000-0018-000000000010', '00000000-0000-0000-0002-000000000003', 'approval', 1, 1.0, null, true, now() - interval '4 days'),
  ('00000000-0000-0000-0019-000000000032', '00000000-0000-0000-0018-000000000010', '00000000-0000-0000-0002-000000000054', 'approval', 1, 1.0, null, true, now() - interval '4 days'),

  -- Proposal 11: Riverside Delivery Co-op Charter (passed, quadratic, for=7, against=1)
  ('00000000-0000-0000-0019-000000000033', '00000000-0000-0000-0018-000000000011', '00000000-0000-0000-0002-000000000063', 'quadratic', 4, 2.0, null, true, now() - interval '12 days'),
  ('00000000-0000-0000-0019-000000000034', '00000000-0000-0000-0018-000000000011', '00000000-0000-0000-0002-000000000064', 'quadratic', 1, 1.0, null, true, now() - interval '12 days'),
  ('00000000-0000-0000-0019-000000000035', '00000000-0000-0000-0018-000000000011', '00000000-0000-0000-0002-000000000013', 'quadratic', 1, 1.0, null, true, now() - interval '11 days'),
  ('00000000-0000-0000-0019-000000000036', '00000000-0000-0000-0018-000000000011', '00000000-0000-0000-0002-000000000014', 'quadratic', 1, 1.0, null, true, now() - interval '11 days'),
  ('00000000-0000-0000-0019-000000000037', '00000000-0000-0000-0018-000000000011', '00000000-0000-0000-0002-000000000019', 'quadratic', 1, 1.0, null, false, now() - interval '11 days'),
  ('00000000-0000-0000-0019-000000000060', '00000000-0000-0000-0018-000000000011', '00000000-0000-0000-0002-000000000065', 'quadratic', 1, 1.0, null, true, now() - interval '11 days'),
  ('00000000-0000-0000-0019-000000000061', '00000000-0000-0000-0018-000000000011', '00000000-0000-0000-0002-000000000067', 'quadratic', 1, 1.0, null, true, now() - interval '10 days'),

  -- Proposal 13: Harbor Youth Mentorship Program (passed, quadratic, for=6, against=0)
  ('00000000-0000-0000-0019-000000000038', '00000000-0000-0000-0018-000000000013', '00000000-0000-0000-0002-000000000024', 'quadratic', 4, 2.0, null, true, now() - interval '10 days'),
  ('00000000-0000-0000-0019-000000000039', '00000000-0000-0000-0018-000000000013', '00000000-0000-0000-0002-000000000075', 'quadratic', 1, 1.0, null, true, now() - interval '10 days'),
  ('00000000-0000-0000-0019-000000000040', '00000000-0000-0000-0018-000000000013', '00000000-0000-0000-0002-000000000076', 'quadratic', 1, 1.0, null, true, now() - interval '9 days'),
  ('00000000-0000-0000-0019-000000000062', '00000000-0000-0000-0018-000000000013', '00000000-0000-0000-0002-000000000077', 'quadratic', 1, 1.0, null, true, now() - interval '9 days'),
  ('00000000-0000-0000-0019-000000000063', '00000000-0000-0000-0018-000000000013', '00000000-0000-0000-0002-000000000081', 'quadratic', 1, 1.0, null, true, now() - interval '9 days'),

  -- Proposal 14: Emergency Repair Response Protocol (voting, approval, for=3)
  ('00000000-0000-0000-0019-000000000041', '00000000-0000-0000-0018-000000000014', '00000000-0000-0000-0002-000000000024', 'approval', 1, 1.0, null, true, now() - interval '4 days'),
  ('00000000-0000-0000-0019-000000000042', '00000000-0000-0000-0018-000000000014', '00000000-0000-0000-0002-000000000075', 'approval', 1, 1.0, null, true, now() - interval '3 days'),
  ('00000000-0000-0000-0019-000000000043', '00000000-0000-0000-0018-000000000014', '00000000-0000-0000-0002-000000000077', 'approval', 1, 1.0, null, true, now() - interval '3 days'),

  -- Proposal 16: Monon Trail Stewardship Accord (passed, quadratic, for=6, against=1)
  ('00000000-0000-0000-0019-000000000044', '00000000-0000-0000-0018-000000000016', '00000000-0000-0000-0002-000000000034', 'quadratic', 4, 2.0, null, true, now() - interval '14 days'),
  ('00000000-0000-0000-0019-000000000045', '00000000-0000-0000-0018-000000000016', '00000000-0000-0000-0002-000000000087', 'quadratic', 1, 1.0, null, true, now() - interval '14 days'),
  ('00000000-0000-0000-0019-000000000046', '00000000-0000-0000-0018-000000000016', '00000000-0000-0000-0002-000000000088', 'quadratic', 1, 1.0, null, true, now() - interval '13 days'),
  ('00000000-0000-0000-0019-000000000047', '00000000-0000-0000-0018-000000000016', '00000000-0000-0000-0002-000000000039', 'quadratic', 1, 1.0, null, false, now() - interval '13 days'),
  ('00000000-0000-0000-0019-000000000064', '00000000-0000-0000-0018-000000000016', '00000000-0000-0000-0002-000000000091', 'quadratic', 1, 1.0, null, true, now() - interval '13 days'),
  ('00000000-0000-0000-0019-000000000065', '00000000-0000-0000-0018-000000000016', '00000000-0000-0000-0002-000000000089', 'quadratic', 1, 1.0, null, true, now() - interval '12 days'),

  -- Proposal 17: Monon Newcomer Welcome Protocol (voting, approval, for=4)
  ('00000000-0000-0000-0019-000000000048', '00000000-0000-0000-0018-000000000017', '00000000-0000-0000-0002-000000000034', 'approval', 1, 1.0, null, true, now() - interval '5 days'),
  ('00000000-0000-0000-0019-000000000049', '00000000-0000-0000-0018-000000000017', '00000000-0000-0000-0002-000000000087', 'approval', 1, 1.0, null, true, now() - interval '4 days'),
  ('00000000-0000-0000-0019-000000000050', '00000000-0000-0000-0018-000000000017', '00000000-0000-0000-0002-000000000088', 'approval', 1, 1.0, null, true, now() - interval '4 days'),
  ('00000000-0000-0000-0019-000000000051', '00000000-0000-0000-0018-000000000017', '00000000-0000-0000-0002-000000000035', 'approval', 1, 1.0, null, true, now() - interval '3 days'),

  -- Proposal 18: Intergenerational Dinner Charter (passed, quadratic, for=3)
  ('00000000-0000-0000-0019-000000000052', '00000000-0000-0000-0018-000000000018', '00000000-0000-0000-0002-000000000043', 'quadratic', 1, 1.0, null, true, now() - interval '16 days'),
  ('00000000-0000-0000-0019-000000000053', '00000000-0000-0000-0018-000000000018', '00000000-0000-0000-0002-000000000044', 'quadratic', 1, 1.0, null, true, now() - interval '16 days'),
  ('00000000-0000-0000-0019-000000000054', '00000000-0000-0000-0018-000000000018', '00000000-0000-0000-0002-000000000099', 'quadratic', 1, 1.0, null, true, now() - interval '15 days'),

  -- Proposal 20: Sunset Ridge Digital Literacy Standards (rejected, quadratic, for=1, against=3)
  ('00000000-0000-0000-0019-000000000055', '00000000-0000-0000-0018-000000000020', '00000000-0000-0000-0002-000000000103', 'quadratic', 1, 1.0, null, true, now() - interval '10 days'),
  ('00000000-0000-0000-0019-000000000056', '00000000-0000-0000-0018-000000000020', '00000000-0000-0000-0002-000000000043', 'quadratic', 4, 2.0, null, false, now() - interval '10 days'),
  ('00000000-0000-0000-0019-000000000057', '00000000-0000-0000-0018-000000000020', '00000000-0000-0000-0002-000000000044', 'quadratic', 1, 1.0, null, false, now() - interval '9 days')
ON CONFLICT (proposal_id, voter_id) DO NOTHING;

-- ============================================================================
-- SECTION 6: SUNSET RULES (6 rules, IDs 13-18)
-- ============================================================================

INSERT INTO sunset_rules (id, community_id, rule_type, resource_id, description, enacted_at, expires_at, renewal_count, last_renewed_at, renewal_proposal_id, active, created_at) VALUES
  ('00000000-0000-0000-001a-000000000013', '00000000-0000-0000-0001-000000000001', 'guild_charter', '00000000-0000-0000-0015-000000000011', 'Maplewood Care Circle guild charter.', now() - interval '48 days', now() + interval '280 days', 0, null, null, true, now() - interval '48 days'),
  ('00000000-0000-0000-001a-000000000014', '00000000-0000-0000-0001-000000000001', 'guild_charter', '00000000-0000-0000-0015-000000000012', 'Maplewood Signal Hub guild charter.', now() - interval '44 days', now() + interval '260 days', 0, null, null, true, now() - interval '44 days'),
  ('00000000-0000-0000-001a-000000000015', '00000000-0000-0000-0001-000000000002', 'guild_charter', '00000000-0000-0000-0015-000000000013', 'Riverside Hearth Kitchen guild charter.', now() - interval '42 days', now() + interval '270 days', 0, null, null, true, now() - interval '42 days'),
  ('00000000-0000-0000-001a-000000000016', '00000000-0000-0000-0001-000000000003', 'guild_charter', '00000000-0000-0000-0015-000000000016', 'Harbor Weavers guild charter.', now() - interval '35 days', now() + interval '230 days', 0, null, null, true, now() - interval '35 days'),
  ('00000000-0000-0000-001a-000000000017', '00000000-0000-0000-0001-000000000004', 'guild_charter', '00000000-0000-0000-0015-000000000017', 'Monon Green Trails guild charter.', now() - interval '45 days', now() + interval '300 days', 0, null, null, true, now() - interval '45 days'),
  ('00000000-0000-0000-001a-000000000018', '00000000-0000-0000-0001-000000000004', 'guild_charter', '00000000-0000-0000-0015-000000000018', 'Monon Hearth & Home guild charter.', now() - interval '40 days', now() + interval '260 days', 0, null, null, true, now() - interval '40 days')
ON CONFLICT (id) DO NOTHING;

-- Re-enable FK checks
SET session_replication_role = 'origin';

COMMIT;
