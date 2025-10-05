-- Simple Test: Create an Incident and Check if it Appears
-- Run this step by step

-- Step 1: Check if we have any users
SELECT 
    'Step 1: Users Check' as step,
    COUNT(*) as user_count,
    array_agg(DISTINCT user_type) as user_types
FROM profiles;

-- Step 2: Create a test incident (replace with actual user ID from step 1)
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Delete any existing test incidents
        DELETE FROM incidents WHERE title LIKE 'TEST INCIDENT%';
        
        -- Insert a new test incident
        INSERT INTO incidents (
            reporter_id,
            title,
            description,
            category,
            severity,
            address,
            location,
            is_approved,
            is_verified,
            votes,
            shares_count,
            priority
        ) VALUES (
            test_user_id,
            'TEST INCIDENT - ' || NOW()::text,
            'This is a test incident created at ' || NOW()::text || '. It should appear in the news feed immediately.',
            'other',
            'medium',
            'Test Address, Cebu City, Philippines',
            'POINT(123.8854 10.3157)',
            true,
            false,
            0,
            0,
            0
        ) RETURNING id INTO incident_id;
        
        RAISE NOTICE 'Test incident created with ID: %', incident_id;
    ELSE
        RAISE NOTICE 'No users found - cannot create test incident';
    END IF;
END $$;

-- Step 3: Check if the incident was created
SELECT 
    'Step 3: Incident Created' as step,
    id,
    title,
    is_approved,
    is_verified,
    created_at
FROM incidents 
WHERE title LIKE 'TEST INCIDENT%'
ORDER BY created_at DESC;

-- Step 4: Test the function that NewsView uses
SELECT 
    'Step 4: Function Test' as step,
    id,
    title,
    is_approved,
    is_verified,
    user_name,
    user_type,
    created_at
FROM get_incidents_with_user_info()
WHERE title LIKE 'TEST INCIDENT%'
ORDER BY created_at DESC;

-- Step 5: Check all incidents returned by the function
SELECT 
    'Step 5: All Incidents from Function' as step,
    COUNT(*) as total_returned,
    array_agg(title) as incident_titles
FROM get_incidents_with_user_info();

