-- Fix the user trigger function to use correct metadata fields
-- Run this in your Supabase SQL Editor

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to use correct metadata fields
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, user_type, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'user_type', 'designer'), COALESCE(NEW.raw_user_meta_data->>'name', 'Designer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the trigger by checking if it exists
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 