-- Check database setup and troubleshoot user registration issues
-- Run this in your Supabase SQL Editor

-- Check if tables exist
SELECT 'Checking tables...' as info;

SELECT 
  table_name,
  CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'designs', 'design_pairs', 'ratings', 'reviews', 'comments', 'review_sessions');

-- Check user_profiles table structure
SELECT 'user_profiles table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if trigger exists
SELECT 'Checking trigger...' as info;
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  CASE WHEN trigger_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 'Checking function...' as info;
SELECT 
  routine_name,
  routine_type,
  CASE WHEN routine_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- Check RLS policies
SELECT 'Checking RLS policies...' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Show current user_profiles count
SELECT 'Recent activity check...' as info;
SELECT 
  'user_profiles count:' as metric,
  COUNT(*) as value
FROM user_profiles; 