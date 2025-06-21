-- Fix Design Table RLS Policy
-- Copy this into your Supabase SQL Editor

-- Drop existing design policies
DROP POLICY IF EXISTS "Designers can create designs" ON designs;
DROP POLICY IF EXISTS "Anyone can view designs" ON designs;
DROP POLICY IF EXISTS "Designers can update their own designs" ON designs;
DROP POLICY IF EXISTS "Designers can delete their own designs" ON designs;

-- Create more permissive policies for testing
CREATE POLICY "Anyone can view designs" ON designs
  FOR SELECT USING (true);

-- Allow any authenticated user to create designs (for testing)
CREATE POLICY "Authenticated users can create designs" ON designs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own designs
CREATE POLICY "Users can update their own designs" ON designs
  FOR UPDATE USING (designer_id = auth.uid());

-- Allow users to delete their own designs
CREATE POLICY "Users can delete their own designs" ON designs
  FOR DELETE USING (designer_id = auth.uid()); 