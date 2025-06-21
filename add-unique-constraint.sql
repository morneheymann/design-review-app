-- Add unique constraint to prevent multiple reviews from the same user on the same design pair
-- This ensures each user can only review each design pair once

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

-- Add an index for better performance when checking for existing reviews
CREATE INDEX IF NOT EXISTS idx_ratings_tester_design_pair 
ON ratings(tester_id, design_pair_id);

-- Create a function to check if a user has already reviewed a design pair
CREATE OR REPLACE FUNCTION has_user_reviewed_design_pair(
  user_uuid UUID,
  design_pair_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM ratings 
    WHERE tester_id = user_uuid 
    AND design_pair_id = design_pair_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user's existing review for a design pair
CREATE OR REPLACE FUNCTION get_user_design_pair_review(
  user_uuid UUID,
  design_pair_uuid UUID
)
RETURNS TABLE (
  id UUID,
  chosen_design_id UUID,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.chosen_design_id,
    r.feedback,
    r.created_at
  FROM ratings r
  WHERE r.tester_id = user_uuid 
  AND r.design_pair_id = design_pair_uuid
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 