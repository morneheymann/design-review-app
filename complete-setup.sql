-- Complete Design Review App Database Setup
-- Run this entire script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('designer', 'tester')),
  full_name TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create designs table
CREATE TABLE IF NOT EXISTS designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create design_pairs table
CREATE TABLE IF NOT EXISTS design_pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_a_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  design_b_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_pair_id UUID NOT NULL REFERENCES design_pairs(id) ON DELETE CASCADE,
  chosen_design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table for specific feedback on design elements
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  x_position DECIMAL(5,2), -- For positioning comments on design
  y_position DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review sessions table for tracking review activities
CREATE TABLE IF NOT EXISTS review_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER
);

-- ============================================================================
-- ADD INDEXES FOR PERFORMANCE
-- ============================================================================

-- Add indexes for better performance (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_designs_designer_id') THEN
    CREATE INDEX idx_designs_designer_id ON designs(designer_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_design_pairs_designer_id') THEN
    CREATE INDEX idx_design_pairs_designer_id ON design_pairs(designer_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ratings_tester_id') THEN
    CREATE INDEX idx_ratings_tester_id ON ratings(tester_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ratings_design_pair_id') THEN
    CREATE INDEX idx_ratings_design_pair_id ON ratings(design_pair_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reviews_design_id') THEN
    CREATE INDEX idx_reviews_design_id ON reviews(design_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reviews_reviewer_id') THEN
    CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reviews_status') THEN
    CREATE INDEX idx_reviews_status ON reviews(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_review_id') THEN
    CREATE INDEX idx_comments_review_id ON comments(review_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_review_sessions_design_id') THEN
    CREATE INDEX idx_review_sessions_design_id ON review_sessions(design_id);
  END IF;
END $$;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP EXISTING POLICIES (TO AVOID CONFLICTS)
-- ============================================================================

-- Drop existing user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;

-- Drop existing designs policies
DROP POLICY IF EXISTS "Authenticated users can create designs" ON designs;
DROP POLICY IF EXISTS "Users can view designs" ON designs;
DROP POLICY IF EXISTS "Designers can update their own designs" ON designs;
DROP POLICY IF EXISTS "Designers can delete their own designs" ON designs;

-- Drop existing design_pairs policies
DROP POLICY IF EXISTS "Users can view design pairs" ON design_pairs;
DROP POLICY IF EXISTS "Designers can create design pairs" ON design_pairs;
DROP POLICY IF EXISTS "Designers can update their own design pairs" ON design_pairs;
DROP POLICY IF EXISTS "Designers can delete their own design pairs" ON design_pairs;

-- Drop existing ratings policies
DROP POLICY IF EXISTS "Users can view ratings" ON ratings;
DROP POLICY IF EXISTS "Testers can create ratings" ON ratings;
DROP POLICY IF EXISTS "Testers can update their own ratings" ON ratings;
DROP POLICY IF EXISTS "Testers can delete their own ratings" ON ratings;

-- Drop existing reviews policies
DROP POLICY IF EXISTS "Users can view reviews for designs they have access to" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews for designs they can access" ON reviews;
DROP POLICY IF EXISTS "Reviewers can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Designers can update reviews for their designs" ON reviews;

-- Drop existing comments policies
DROP POLICY IF EXISTS "Users can view comments for reviews they can access" ON comments;
DROP POLICY IF EXISTS "Reviewers can create comments on their reviews" ON comments;
DROP POLICY IF EXISTS "Reviewers can update their own comments" ON comments;
DROP POLICY IF EXISTS "Reviewers can delete their own comments" ON comments;

-- Drop existing review_sessions policies
DROP POLICY IF EXISTS "Users can view their own review sessions" ON review_sessions;
DROP POLICY IF EXISTS "Users can create their own review sessions" ON review_sessions;
DROP POLICY IF EXISTS "Users can update their own review sessions" ON review_sessions;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Designs policies
CREATE POLICY "Authenticated users can create designs" ON designs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view designs" ON designs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Designers can update their own designs" ON designs
  FOR UPDATE USING (designer_id = auth.uid());

CREATE POLICY "Designers can delete their own designs" ON designs
  FOR DELETE USING (designer_id = auth.uid());

-- Design pairs policies
CREATE POLICY "Users can view design pairs" ON design_pairs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Designers can create design pairs" ON design_pairs
  FOR INSERT WITH CHECK (designer_id = auth.uid());

CREATE POLICY "Designers can update their own design pairs" ON design_pairs
  FOR UPDATE USING (designer_id = auth.uid());

CREATE POLICY "Designers can delete their own design pairs" ON design_pairs
  FOR DELETE USING (designer_id = auth.uid());

-- Ratings policies
CREATE POLICY "Users can view ratings" ON ratings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Testers can create ratings" ON ratings
  FOR INSERT WITH CHECK (tester_id = auth.uid());

CREATE POLICY "Testers can update their own ratings" ON ratings
  FOR UPDATE USING (tester_id = auth.uid());

CREATE POLICY "Testers can delete their own ratings" ON ratings
  FOR DELETE USING (tester_id = auth.uid());

-- Reviews policies
CREATE POLICY "Users can view reviews for designs they have access to" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = reviews.design_id 
      AND (designs.designer_id = auth.uid() OR auth.uid() IN (
        SELECT user_id FROM user_profiles WHERE user_type = 'tester'
      ))
    )
  );

CREATE POLICY "Users can create reviews for designs they can access" ON reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = reviews.design_id 
      AND (designs.designer_id = auth.uid() OR auth.uid() IN (
        SELECT user_id FROM user_profiles WHERE user_type = 'tester'
      ))
    )
  );

CREATE POLICY "Reviewers can update their own reviews" ON reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

CREATE POLICY "Designers can update reviews for their designs" ON reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE designs.id = reviews.design_id 
      AND designs.designer_id = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments for reviews they can access" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviews 
      WHERE reviews.id = comments.review_id 
      AND (reviews.reviewer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM designs 
        WHERE designs.id = reviews.design_id 
        AND designs.designer_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Reviewers can create comments on their reviews" ON comments
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Reviewers can update their own comments" ON comments
  FOR UPDATE USING (reviewer_id = auth.uid());

CREATE POLICY "Reviewers can delete their own comments" ON comments
  FOR DELETE USING (reviewer_id = auth.uid());

-- Review sessions policies
CREATE POLICY "Users can view their own review sessions" ON review_sessions
  FOR SELECT USING (reviewer_id = auth.uid());

CREATE POLICY "Users can create their own review sessions" ON review_sessions
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own review sessions" ON review_sessions
  FOR UPDATE USING (reviewer_id = auth.uid());

-- ============================================================================
-- CREATE FUNCTIONS
-- ============================================================================

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, user_type, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'user_type', 'designer'), COALESCE(NEW.raw_user_meta_data->>'name', 'Designer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate average rating for a design
CREATE OR REPLACE FUNCTION get_design_average_rating(design_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews 
    WHERE design_id = design_uuid 
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get review count for a design
CREATE OR REPLACE FUNCTION get_design_review_count(design_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM reviews 
    WHERE design_id = design_uuid 
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create triggers for updated_at
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ADD UNIQUE CONSTRAINT TO PREVENT DUPLICATE REVIEWS
-- ============================================================================

-- First, let's see what we're working with
SELECT 'Current ratings count:' as info, COUNT(*) as count FROM ratings;

-- Check for duplicate reviews (same user reviewing same design pair multiple times)
SELECT 'Duplicate reviews found:' as info, COUNT(*) as count 
FROM (
  SELECT tester_id, design_pair_id, COUNT(*) as review_count
  FROM ratings 
  GROUP BY tester_id, design_pair_id 
  HAVING COUNT(*) > 1
) duplicates;

-- Show the duplicate reviews
SELECT 'Duplicate review details:' as info;
SELECT 
  r.tester_id,
  r.design_pair_id,
  r.id as rating_id,
  r.created_at,
  r.chosen_design_id,
  ROW_NUMBER() OVER (PARTITION BY r.tester_id, r.design_pair_id ORDER BY r.created_at) as review_number
FROM ratings r
WHERE (r.tester_id, r.design_pair_id) IN (
  SELECT tester_id, design_pair_id
  FROM ratings 
  GROUP BY tester_id, design_pair_id 
  HAVING COUNT(*) > 1
)
ORDER BY r.tester_id, r.design_pair_id, r.created_at;

-- Clean up duplicates by keeping only the first review from each user for each design pair
-- Delete all but the first review for each user-design_pair combination
DELETE FROM ratings 
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY tester_id, design_pair_id ORDER BY created_at) as rn
    FROM ratings
  ) ranked
  WHERE rn > 1
);

-- Verify duplicates are cleaned up
SELECT 'After cleanup - ratings count:' as info, COUNT(*) as count FROM ratings;

SELECT 'After cleanup - duplicate reviews:' as info, COUNT(*) as count 
FROM (
  SELECT tester_id, design_pair_id, COUNT(*) as review_count
  FROM ratings 
  GROUP BY tester_id, design_pair_id 
  HAVING COUNT(*) > 1
) duplicates;

-- Now add the unique constraint
-- First, check if the constraint already exists
SELECT 'Checking for existing constraint...' as info;
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
  AND tc.table_name = 'ratings'
  AND kcu.column_name IN ('tester_id', 'design_pair_id');

-- Drop existing constraint if it exists (this will fail if it doesn't exist, which is fine)
DO $$ 
BEGIN
  ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_tester_design_pair_unique;
EXCEPTION
  WHEN undefined_object THEN
    -- Constraint doesn't exist, which is fine
    NULL;
END $$;

-- Add the unique constraint
ALTER TABLE ratings 
ADD CONSTRAINT ratings_tester_design_pair_unique 
UNIQUE (tester_id, design_pair_id);

-- Verify the constraint was added
SELECT 'Constraint added successfully!' as info;
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
  AND tc.table_name = 'ratings'
  AND kcu.column_name IN ('tester_id', 'design_pair_id');

-- Test the constraint by trying to insert a duplicate (this should fail)
SELECT 'Testing constraint with sample data...' as info;

-- Get a sample rating to test with
DO $$
DECLARE
  sample_rating RECORD;
BEGIN
  -- Get a sample rating
  SELECT * INTO sample_rating FROM ratings LIMIT 1;
  
  IF sample_rating.id IS NOT NULL THEN
    -- Try to insert a duplicate (this should fail due to unique constraint)
    BEGIN
      INSERT INTO ratings (tester_id, design_pair_id, chosen_design_id, created_at)
      VALUES (sample_rating.tester_id, sample_rating.design_pair_id, sample_rating.chosen_design_id, NOW());
      
      RAISE NOTICE 'ERROR: Duplicate insert succeeded - constraint may not be working!';
    EXCEPTION
      WHEN unique_violation THEN
        RAISE NOTICE 'SUCCESS: Unique constraint is working - duplicate insert was blocked';
      WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'No sample data found to test constraint';
  END IF;
END $$;

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

-- Show final summary
SELECT 'Final summary:' as info;
SELECT 'Total ratings:' as metric, COUNT(*) as value FROM ratings;
SELECT 'Unique user-design pairs:' as metric, COUNT(DISTINCT (tester_id, design_pair_id)) as value FROM ratings;
SELECT 'Constraint status:' as metric, 'Active' as value;

-- Show some sample data to verify everything looks good
SELECT 'Sample ratings data:' as info;
SELECT 
  r.id,
  r.tester_id,
  r.design_pair_id,
  r.chosen_design_id,
  r.created_at,
  dp.title as design_pair_title
FROM ratings r
LEFT JOIN design_pairs dp ON r.design_pair_id = dp.id
ORDER BY r.created_at DESC
LIMIT 5;

-- Show table counts
SELECT 'Database setup complete!' as info;
SELECT 'user_profiles:' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'designs:' as table_name, COUNT(*) as count FROM designs
UNION ALL
SELECT 'design_pairs:' as table_name, COUNT(*) as count FROM design_pairs
UNION ALL
SELECT 'ratings:' as table_name, COUNT(*) as count FROM ratings
UNION ALL
SELECT 'reviews:' as table_name, COUNT(*) as count FROM reviews
UNION ALL
SELECT 'comments:' as table_name, COUNT(*) as count FROM comments
UNION ALL
SELECT 'review_sessions:' as table_name, COUNT(*) as count FROM review_sessions; 