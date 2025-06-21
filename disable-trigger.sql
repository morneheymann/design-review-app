-- Temporarily disable the trigger to prevent conflicts
-- Run this in your Supabase SQL Editor

-- Disable the trigger
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Verify the trigger is disabled
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  'DISABLED' as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 