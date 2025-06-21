-- Review System Setup
-- This file sets up the review functionality for the design review app

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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_design_id ON reviews(design_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_sessions_design_id ON review_sessions(design_id);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

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

-- Triggers for updated_at
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