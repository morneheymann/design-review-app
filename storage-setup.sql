-- Supabase Storage Setup for Design Review App
-- Copy this into your Supabase SQL Editor

-- Create storage bucket for design images
INSERT INTO storage.buckets (id, name, public)
VALUES ('designs', 'designs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload designs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'designs' AND 
  auth.role() = 'authenticated'
);

-- Create storage policy to allow public read access
CREATE POLICY "Allow public read access to designs" ON storage.objects
FOR SELECT USING (bucket_id = 'designs');

-- Create storage policy to allow users to update their own designs
CREATE POLICY "Allow users to update their own designs" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'designs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow users to delete their own designs
CREATE POLICY "Allow users to delete their own designs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'designs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
); 