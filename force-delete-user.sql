-- Force Delete User - Handles all foreign key constraints
-- Replace 'user_email@example.com' with the actual email of the user you want to delete

-- First, let's see what users exist and find the one you want to delete
SELECT 'Current users:' as info;
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Find the specific user by email (replace with actual email)
-- SELECT id, email FROM auth.users WHERE email = 'user_email@example.com';

-- Once you have the user's UUID, replace 'USER_UUID_HERE' below with the actual UUID
-- Then run these commands in order:

-- 1. Disable RLS temporarily for this operation
SET session_replication_role = replica;

-- 2. Delete user's ratings (reviews)
DELETE FROM ratings WHERE tester_id = 'USER_UUID_HERE';

-- 3. Delete user's AI analysis records
DELETE FROM ai_analysis WHERE user_id = 'USER_UUID_HERE';

-- 4. Delete user's individual designs
DELETE FROM designs WHERE user_id = 'USER_UUID_HERE';

-- 5. Delete user's design pairs (if they own any)
DELETE FROM design_pairs WHERE designer_id = 'USER_UUID_HERE';

-- 6. Delete user's profile
DELETE FROM user_profiles WHERE user_id = 'USER_UUID_HERE';

-- 7. Re-enable RLS
SET session_replication_role = DEFAULT;

-- 8. Finally, delete the user from auth.users
DELETE FROM auth.users WHERE id = 'USER_UUID_HERE';

-- Verify the user was deleted
SELECT 'Users after deletion:' as info;
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Check for any remaining orphaned data
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

SELECT 'Orphaned ai_analysis:' as check_type, COUNT(*) as count 
FROM ai_analysis aa 
LEFT JOIN auth.users u ON aa.user_id = u.id 
WHERE u.id IS NULL; 