-- STEP 4: Test the Database
-- Run this in your Supabase SQL Editor to verify everything works

-- Test 1: Check if function works
SELECT 
    'FUNCTION TEST' as info,
    COUNT(*) as total_incidents,
    COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as incidents_with_images
FROM get_incidents_with_user_info();

-- Test 2: Check recent incidents with images
SELECT 
    'RECENT INCIDENTS WITH IMAGES' as info,
    id,
    title,
    images,
    array_length(images, 1) as image_count,
    views,
    likes,
    created_at
FROM get_incidents_with_user_info()
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
ORDER BY created_at DESC 
LIMIT 3;

-- Test 3: Check all recent incidents
SELECT 
    'ALL RECENT INCIDENTS' as info,
    id,
    title,
    category,
    severity,
    images,
    array_length(images, 1) as image_count,
    views,
    likes,
    created_at
FROM get_incidents_with_user_info()
ORDER BY created_at DESC 
LIMIT 5;

-- Test 4: Check storage bucket
SELECT 
    'STORAGE BUCKET CHECK' as info,
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets 
WHERE id = 'incident-media';

-- Test 5: Check if there are any files in storage
SELECT 
    'STORAGE FILES CHECK' as info,
    COUNT(*) as file_count,
    COUNT(CASE WHEN name LIKE 'incident_media_%' THEN 1 END) as incident_media_files
FROM storage.objects 
WHERE bucket_id = 'incident-media';








