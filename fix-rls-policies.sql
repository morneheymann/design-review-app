-- Check and fix RLS policies for user_profiles table
-- Run this in your Supabase SQL Editor

-- First, let's see what policies exist
SELECT 'Current RLS policies for user_profiles:' as info;
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

-- Drop existing policies that might be blocking inserts
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Create a policy that allows the trigger function to insert profiles
CREATE POLICY "Enable insert for authenticated users" ON user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create a policy that allows users to view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create a policy that allows users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Verify the new policies
SELECT 'New RLS policies for user_profiles:' as info;
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