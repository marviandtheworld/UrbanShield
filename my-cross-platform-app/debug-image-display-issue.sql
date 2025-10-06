-- Debug Image Display Issue
-- This script will help identify why images are not showing up in the news feed

-- 1. Check if the incidents table has the images column
SELECT 
    'INCIDENTS TABLE COLUMNS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
AND column_name IN ('images', 'views_count', 'likes_count', 'comments_count')
ORDER BY ordinal_position;

-- 2. Check recent incidents and their images
SELECT 
    'RECENT INCIDENTS WITH IMAGES' as info,
    id,
    title,
    images,
    array_length(images, 1) as image_count,
    created_at
FROM incidents 
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if the function is returning images correctly
SELECT 
    'FUNCTION IMAGES TEST' as info,
    id,
    title,
    images,
    array_length(images, 1) as image_count
FROM get_incidents_with_user_info()
WHERE images IS NOT NULL 
AND array_length(images, 1) > 0
LIMIT 5;

-- 4. Check for any incidents without images
SELECT 
    'INCIDENTS WITHOUT IMAGES' as info,
    COUNT(*) as total_incidents,
    COUNT(CASE WHEN images IS NULL THEN 1 END) as null_images,
    COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) = 0 THEN 1 END) as empty_images,
    COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as with_images
FROM incidents;

-- 5. Test the function return structure
SELECT 
    'FUNCTION STRUCTURE TEST' as info,
    COUNT(*) as total_returned,
    COUNT(CASE WHEN images IS NULL THEN 1 END) as null_images_in_function,
    COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as with_images_in_function
FROM get_incidents_with_user_info();

-- 6. Check if there are any recent incidents with media
SELECT 
    'RECENT INCIDENTS OVERVIEW' as info,
    id,
    title,
    category,
    severity,
    images,
    created_at
FROM incidents 
ORDER BY created_at DESC 
LIMIT 3;

