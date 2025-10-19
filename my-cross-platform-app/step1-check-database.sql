-- STEP 1: Check Your Database Structure
-- Run this in your Supabase SQL Editor to see what columns exist

-- Check incidents table columns
SELECT 
    'INCIDENTS TABLE COLUMNS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if images column exists
SELECT 
    'IMAGES COLUMN CHECK' as info,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'images'
    ) THEN 'EXISTS' ELSE 'NOT EXISTS' END as images_column;

-- Check recent incidents to see what data exists
SELECT 
    'RECENT INCIDENTS DATA' as info,
    id,
    title,
    category,
    severity,
    images,
    views_count,
    likes_count,
    comments_count,
    created_at
FROM incidents 
ORDER BY created_at DESC 
LIMIT 3;












