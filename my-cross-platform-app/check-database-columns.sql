-- Check Database Columns
-- This script will show you exactly what columns exist in your database

-- 1. Check incidents table columns
SELECT 
    'INCIDENTS TABLE COLUMNS' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check profiles table columns
SELECT 
    'PROFILES TABLE COLUMNS' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if specific columns exist
SELECT 
    'COLUMN EXISTENCE CHECK' as info,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'views'
    ) THEN 'EXISTS' ELSE 'NOT EXISTS' END as views_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'views_count'
    ) THEN 'EXISTS' ELSE 'NOT EXISTS' END as views_count_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'likes'
    ) THEN 'EXISTS' ELSE 'NOT EXISTS' END as likes_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'likes_count'
    ) THEN 'EXISTS' ELSE 'NOT EXISTS' END as likes_count_column,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'images'
    ) THEN 'EXISTS' ELSE 'NOT EXISTS' END as images_column;

-- 4. Check recent incidents to see what data exists
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




