-- Delete User from Supabase
-- Replace 'user_email@example.com' with the actual email of the user you want to delete
-- Replace 'user_uuid_here' with the actual UUID of the user you want to delete

-- First, let's see what users exist
SELECT 'Current users:' as info;
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- To delete a specific user by email, first find their UUID:
-- SELECT id FROM auth.users WHERE email = 'user_email@example.com';

-- To delete a specific user by UUID, run these commands in order:

-- 1. Delete user's ratings
DELETE FROM ratings WHERE tester_id = 'user_uuid_here';

-- 2. Delete user's design pairs (if they own any)
DELETE FROM design_pairs WHERE designer_id = 'user_uuid_here';

-- 3. Delete user's individual designs
DELETE FROM designs WHERE user_id = 'user_uuid_here';

-- 4. Delete user's AI analysis records
DELETE FROM ai_analysis WHERE user_id = 'user_uuid_here';

-- 5. Delete user's profile
DELETE FROM user_profiles WHERE user_id = 'user_uuid_here';

-- 6. Finally, delete the user from auth.users
DELETE FROM auth.users WHERE id = 'user_uuid_here';

-- Verify the user was deleted
SELECT 'Users after deletion:' as info;
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Check for any orphaned data
SELECT 'Checking for orphaned data:' as info;
SELECT 'Orphaned ratings:' as check_type, COUNT(*) as count 
FROM ratings r 
LEFT JOIN auth.users u ON r.tester_id = u.id 
WHERE u.id IS NULL;

SELECT 'Orphaned designs:' as check_type, COUNT(*) as count 
FROM designs d 
LEFT JOIN auth.users u ON d.user_id = u.id 
WHERE u.id IS NULL;

SELECT 'Orphaned design_pairs:' as check_type, COUNT(*) as count 
FROM design_pairs dp 
LEFT JOIN auth.users u ON dp.designer_id = u.id 
WHERE u.id IS NULL;

SELECT 'Orphaned user_profiles:' as check_type, COUNT(*) as count 
FROM user_profiles up 
LEFT JOIN auth.users u ON up.user_id = u.id 
WHERE u.id IS NULL; 