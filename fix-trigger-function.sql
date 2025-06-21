-- Fix the trigger function with proper error handling
-- Run this in your Supabase SQL Editor

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert the user profile, but don't fail if it doesn't work
  BEGIN
    INSERT INTO user_profiles (user_id, user_type, full_name)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'user_type', 'designer'), 
      COALESCE(NEW.raw_user_meta_data->>'name', 'Designer')
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE LOG 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verify the trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  'ENABLED' as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 