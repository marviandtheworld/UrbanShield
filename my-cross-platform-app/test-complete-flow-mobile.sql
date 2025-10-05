-- Complete Test Flow for Mobile App
-- Run this to test the entire incident creation and display flow

-- Step 1: Check current state
SELECT 
    'CURRENT STATE' as step,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents;

-- Step 2: Create a test user if none exists
DO $$
DECLARE
    user_count INTEGER;
    test_user_id UUID;
BEGIN
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    IF user_count = 0 THEN
        -- Create a test user
        INSERT INTO profiles (
            id,
            full_name,
            username,
            email,
            user_type,
            verification_status,
            posting_privilege
        ) VALUES (
            gen_random_uuid(),
            'Test User',
            'testuser',
            'test@example.com',
            'resident',
            'verified',
            'immediate'
        ) RETURNING id INTO test_user_id;
        
        RAISE NOTICE 'Test user created with ID: %', test_user_id;
    ELSE
        SELECT id INTO test_user_id FROM profiles LIMIT 1;
        RAISE NOTICE 'Using existing user with ID: %', test_user_id;
    END IF;
END $$;

-- Step 3: Create multiple test incidents
DO $$
DECLARE
    test_user_id UUID;
    i INTEGER;
BEGIN
    -- Get the first user
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    -- Create 3 test incidents
    FOR i IN 1..3 LOOP
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
            'Test Incident ' || i || ' - ' || NOW()::text,
            'This is test incident number ' || i || ' created at ' || NOW()::text || '. It should appear in the mobile app news feed.',
            CASE (i % 4)
                WHEN 0 THEN 'crime'
                WHEN 1 THEN 'fire'
                WHEN 2 THEN 'accident'
                ELSE 'other'
            END,
            CASE (i % 3)
                WHEN 0 THEN 'low'
                WHEN 1 THEN 'medium'
                ELSE 'high'
            END,
            'Test Address ' || i || ', Cebu City',
            'POINT(123.8854 10.3157)',
            true,
            (i % 2 = 0), -- Alternate verified status
            0,
            0,
            0
        );
    END LOOP;
    
    RAISE NOTICE 'Created 3 test incidents';
END $$;

-- Step 4: Verify incidents were created
SELECT 
    'INCIDENTS CREATED' as step,
    id,
    title,
    is_approved,
    is_verified,
    created_at
FROM incidents 
ORDER BY created_at DESC;

-- Step 5: Test the function that mobile app uses
SELECT 
    'FUNCTION TEST' as step,
    id,
    title,
    is_approved,
    is_verified,
    user_name,
    user_type,
    created_at
FROM get_incidents_with_user_info()
ORDER BY created_at DESC;

-- Step 6: Final verification
SELECT 
    'FINAL VERIFICATION' as step,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents) = (SELECT COUNT(*) FROM get_incidents_with_user_info()) 
        THEN 'SUCCESS: All incidents visible'
        ELSE 'ISSUE: Some incidents not visible'
    END as result;

