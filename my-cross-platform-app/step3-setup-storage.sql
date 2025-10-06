-- STEP 3: Set Up Storage Bucket for Images
-- Run this in your Supabase SQL Editor

-- Create the incident-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'incident-media',
    'incident-media', 
    true,
    10485760,  -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
-- Policy for public read access
CREATE POLICY "Public read access for incident media" ON storage.objects
FOR SELECT USING (bucket_id = 'incident-media');

-- Policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload incident media" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'incident-media' 
    AND auth.role() = 'authenticated'
);

-- Policy for users to update their own uploads
CREATE POLICY "Users can update their own incident media" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'incident-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to delete their own uploads
CREATE POLICY "Users can delete their own incident media" ON storage.objects
FOR DELETE USING (
    bucket_id = 'incident-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Test the storage bucket
SELECT 
    'STORAGE BUCKET TEST' as info,
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets 
WHERE id = 'incident-media';

