-- Simple Database Setup for Design Review App
-- Copy this into your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  user_type TEXT CHECK (user_type IN ('designer', 'tester')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create designs table
CREATE TABLE IF NOT EXISTS designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  designer_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view designs" ON designs;
DROP POLICY IF EXISTS "Designers can create designs" ON designs;
DROP POLICY IF EXISTS "Designers can update their own designs" ON designs;
DROP POLICY IF EXISTS "Designers can delete their own designs" ON designs;

-- Create a more permissive RLS policy for registration
CREATE POLICY "Users can manage their own profile" ON users
  FOR ALL USING (auth.uid() = id);

-- Allow the trigger function to insert during registration
CREATE POLICY "Allow trigger function to insert" ON users
  FOR INSERT WITH CHECK (true);

-- Design table policies
CREATE POLICY "Anyone can view designs" ON designs
  FOR SELECT USING (true);

CREATE POLICY "Designers can create designs" ON designs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'designer'
    )
  );

CREATE POLICY "Designers can update their own designs" ON designs
  FOR UPDATE USING (designer_id = auth.uid());

CREATE POLICY "Designers can delete their own designs" ON designs
  FOR DELETE USING (designer_id = auth.uid());

-- Function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, user_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'user_type', 'tester')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 