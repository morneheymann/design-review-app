-- Check Analytics Database Schema
-- Run this in Supabase SQL Editor to see the actual table structure

-- Check designs table structure
SELECT 'designs table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'designs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check design_pairs table structure
SELECT 'design_pairs table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'design_pairs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check ratings table structure
SELECT 'ratings table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'ratings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data to see what fields are actually used
SELECT 'Sample designs data:' as info;
SELECT id, title, user_id, designer_id, created_at 
FROM designs 
LIMIT 3;

SELECT 'Sample design_pairs data:' as info;
SELECT id, title, designer_id, created_at 
FROM design_pairs 
LIMIT 3;

SELECT 'Sample ratings data:' as info;
SELECT id, design_pair_id, tester_id, chosen_design_id, created_at 
FROM ratings 
LIMIT 3;

-- Count total records
SELECT 'Total counts:' as info;
SELECT 'designs:' as table_name, COUNT(*) as count FROM designs
UNION ALL
SELECT 'design_pairs:' as table_name, COUNT(*) as count FROM design_pairs
UNION ALL
SELECT 'ratings:' as table_name, COUNT(*) as count FROM ratings; 