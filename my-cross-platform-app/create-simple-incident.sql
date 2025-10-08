-- Create a Simple Incident - No Function, Just Direct Insert
-- This will help us see if the basic database insert works

-- 1. First, let's see what we have
SELECT 'BEFORE: INCIDENTS COUNT' as step;
SELECT COUNT(*) as count FROM incidents;

-- 2. Create a simple incident directly
INSERT INTO incidents (
    reporter_id,
    title,
    description,
    category,
    severity,
    address,
    location,
    is_anonymous,
    is_urgent,
    is_verified,
    views_count,
    likes_count,
    comments_count,
    shares_count
) VALUES (
    (SELECT id FROM profiles LIMIT 1),  -- Get first user
    'SIMPLE TEST INCIDENT',
    'This is a simple test to see if incidents can be created.',
    'other',
    'medium',
    'Test Address',
    'POINT(123.8854 10.3157)',
    false,
    false,
    false,
    0,
    0,
    0,
    0
);

-- 3. Check if it was created
SELECT 'AFTER: INCIDENTS COUNT' as step;
SELECT COUNT(*) as count FROM incidents;

-- 4. Show the incident
SELECT 'CREATED INCIDENT' as step;
SELECT id, title, created_at FROM incidents ORDER BY created_at DESC LIMIT 1;






