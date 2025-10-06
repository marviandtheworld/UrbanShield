-- Test Incident Creation
-- Run this after applying the fixes to test if incidents can be created

-- 1. First, let's see what users exist
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.user_type,
    p.verification_status,
    p.posting_privilege
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. Create a test incident (replace the reporter_id with an actual user ID from step 1)
-- First, get a user ID
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Insert a test incident
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
            'Test Incident - ' || NOW()::text,
            'This is a test incident created at ' || NOW()::text,
            'other',
            'medium',
            'Test Address, Cebu City',
            'POINT(123.8854 10.3157)',
            true,
            false,
            0,
            0,
            0
        );
        
        RAISE NOTICE 'Test incident created successfully with ID: %', test_user_id;
    ELSE
        RAISE NOTICE 'No users found in the database';
    END IF;
END $$;

-- 3. Check if the incident was created
SELECT 
    i.id,
    i.title,
    i.is_approved,
    i.created_at,
    p.user_type,
    p.username
FROM incidents i
LEFT JOIN profiles p ON i.reporter_id = p.id
ORDER BY i.created_at DESC
LIMIT 5;

-- 4. Test the get_incidents_with_user_info function
SELECT 
    id,
    title,
    is_approved,
    user_name,
    user_type
FROM get_incidents_with_user_info()
ORDER BY created_at DESC
LIMIT 5;



