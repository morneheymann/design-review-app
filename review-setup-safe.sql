-- Review System Setup (Safe Version)
-- This file sets up the review functionality without conflicts

-- Drop existing policies on designs table if they exist
DROP POLICY IF EXISTS "Authenticated users can create designs" ON designs;
DROP POLICY IF EXISTS "Users can view designs" ON designs;
DROP POLICY IF EXISTS "Designers can update their own designs" ON designs;
DROP POLICY IF EXISTS "Designers can delete their own designs" ON designs;

-- Create user_profiles table if it doesn't exist
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

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing user_profiles policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;

-- Create user_profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, user_type, full_name)
  VALUES (NEW.id, 'designer', COALESCE(NEW.raw_user_meta_data->>'full_name', 'Designer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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

-- Add indexes for better performance (only if they don't exist)
DO $$ 
BEGIN
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

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view reviews for designs they have access to" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews for designs they can access" ON reviews;
DROP POLICY IF EXISTS "Reviewers can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Designers can update reviews for their designs" ON reviews;

DROP POLICY IF EXISTS "Users can view comments for reviews they can access" ON comments;
DROP POLICY IF EXISTS "Reviewers can create comments on their reviews" ON comments;
DROP POLICY IF EXISTS "Reviewers can update their own comments" ON comments;
DROP POLICY IF EXISTS "Reviewers can delete their own comments" ON comments;

DROP POLICY IF EXISTS "Users can view their own review sessions" ON review_sessions;
DROP POLICY IF EXISTS "Users can create their own review sessions" ON review_sessions;
DROP POLICY IF EXISTS "Users can update their own review sessions" ON review_sessions;

-- RLS Policies for reviews table
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

-- RLS Policies for comments table
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

-- RLS Policies for review_sessions table
CREATE POLICY "Users can view their own review sessions" ON review_sessions
  FOR SELECT USING (reviewer_id = auth.uid());

CREATE POLICY "Users can create their own review sessions" ON review_sessions
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own review sessions" ON review_sessions
  FOR UPDATE USING (reviewer_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;

-- Create triggers for updated_at
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Recreate designs table policies (in case they were dropped)
CREATE POLICY "Authenticated users can create designs" ON designs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view designs" ON designs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Designers can update their own designs" ON designs
  FOR UPDATE USING (designer_id = auth.uid());

CREATE POLICY "Designers can delete their own designs" ON designs
  FOR DELETE USING (designer_id = auth.uid());

-- Enable RLS on design_pairs
ALTER TABLE design_pairs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ratings
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing design_pairs policies if they exist
DROP POLICY IF EXISTS "Users can view design pairs" ON design_pairs;
DROP POLICY IF EXISTS "Designers can create design pairs" ON design_pairs;
DROP POLICY IF EXISTS "Designers can update their own design pairs" ON design_pairs;
DROP POLICY IF EXISTS "Designers can delete their own design pairs" ON design_pairs;

-- Drop existing ratings policies if they exist
DROP POLICY IF EXISTS "Users can view ratings" ON ratings;
DROP POLICY IF EXISTS "Testers can create ratings" ON ratings;
DROP POLICY IF EXISTS "Testers can update their own ratings" ON ratings;
DROP POLICY IF EXISTS "Testers can delete their own ratings" ON ratings;

-- Policies for design_pairs
CREATE POLICY "Users can view design pairs" ON design_pairs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Designers can create design pairs" ON design_pairs
  FOR INSERT WITH CHECK (designer_id = auth.uid());

CREATE POLICY "Designers can update their own design pairs" ON design_pairs
  FOR UPDATE USING (designer_id = auth.uid());

CREATE POLICY "Designers can delete their own design pairs" ON design_pairs
  FOR DELETE USING (designer_id = auth.uid());

-- Policies for ratings
CREATE POLICY "Users can view ratings" ON ratings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Testers can create ratings" ON ratings
  FOR INSERT WITH CHECK (tester_id = auth.uid());

CREATE POLICY "Testers can update their own ratings" ON ratings
  FOR UPDATE USING (tester_id = auth.uid());

CREATE POLICY "Testers can delete their own ratings" ON ratings
  FOR DELETE USING (tester_id = auth.uid()); 