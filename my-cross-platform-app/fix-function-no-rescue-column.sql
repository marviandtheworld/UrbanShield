-- Fix Function to Handle Rescue as Local Data Only
-- This ensures the function doesn't try to access is_rescue column

-- 1. Update the function to handle rescue as local data only
CREATE OR REPLACE FUNCTION get_incidents_with_user_info()
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    category incident_category,
    severity incident_severity,
    status incident_status,
    address TEXT,
    landmark TEXT,
    is_anonymous BOOLEAN,
    is_urgent BOOLEAN,
    is_rescue BOOLEAN,
    images TEXT[],
    external_documents TEXT[],
    views INTEGER,
    likes INTEGER,
    comments_count INTEGER,
    votes INTEGER,
    shares_count INTEGER,
    flags INTEGER,
    is_moderated BOOLEAN,
    is_approved BOOLEAN,
    is_verified BOOLEAN,
    priority INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_name TEXT,
    username TEXT,
    user_type user_type,
    verification_status verification_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.description,
        i.category,
        i.severity,
        i.status,
        i.address,
        COALESCE(i.landmark, '') as landmark,
        COALESCE(i.is_anonymous, false) as is_anonymous,
        COALESCE(i.is_urgent, false) as is_urgent,
        false as is_rescue,  -- Always false - handled locally in mobile app
        COALESCE(i.images, ARRAY[]::TEXT[]) as images,
        ARRAY[]::TEXT[] as external_documents,  -- Not in schema, use default
        COALESCE(i.views_count, 0) as views,  -- Your schema uses views_count
        COALESCE(i.likes_count, 0) as likes,  -- Your schema uses likes_count
        COALESCE(i.comments_count, 0) as comments_count,
        0 as votes,  -- Not in schema, use default
        COALESCE(i.shares_count, 0) as shares_count,
        0 as flags,  -- Not in schema, use default
        false as is_moderated,  -- Not in schema, use default
        true as is_approved,  -- Not in schema, assume all are approved
        COALESCE(i.is_verified, false) as is_verified,
        0 as priority,  -- Not in schema, use default
        i.created_at,
        i.updated_at,
        CASE 
            WHEN COALESCE(i.is_anonymous, false) THEN 'Anonymous User'
            ELSE COALESCE(p.full_name, 'Unknown User')
        END as user_name,
        CASE 
            WHEN COALESCE(i.is_anonymous, false) THEN '@anonymous'
            ELSE COALESCE(p.username, '@unknown')
        END as username,
        COALESCE(p.user_type, 'guest'::user_type) as user_type,
        COALESCE(p.verification_status, 'pending'::verification_status) as verification_status
    FROM incidents i
    LEFT JOIN profiles p ON i.reporter_id = p.id
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

-- 3. Test the function
SELECT 
    'RESCUE LOCAL FUNCTION TEST' as test,
    COUNT(*) as incident_count
FROM get_incidents_with_user_info();

-- 4. Show sample data
SELECT 
    'SAMPLE DATA' as test,
    id,
    title,
    is_rescue,  -- Will always be false from database
    is_verified,
    views,
    likes,
    user_name,
    created_at
FROM get_incidents_with_user_info()
ORDER BY created_at DESC
LIMIT 5;

-- 5. Create a test incident
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
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
            is_anonymous,
            is_urgent,
            is_verified,
            views_count,
            likes_count,
            comments_count,
            shares_count
        ) VALUES (
            test_user_id,
            'TEST INCIDENT - Rescue Local Only',
            'This incident should appear in the news feed. Rescue status is handled locally in the mobile app, not stored in database.',
            'other',
            'medium',
            'Test Address, Cebu City',
            'POINT(123.8854 10.3157)',
            false,
            false,
            false,
            0,
            0,
            0,
            0
        ) RETURNING id INTO incident_id;
        
        RAISE NOTICE 'Test incident created successfully with ID: %', incident_id;
    ELSE
        RAISE NOTICE 'No users found - please create a user first';
    END IF;
END $$;

-- 6. Final verification
SELECT 
    'FINAL VERIFICATION' as status,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents) = (SELECT COUNT(*) FROM get_incidents_with_user_info()) 
        THEN 'SUCCESS: All incidents visible, rescue handled locally'
        ELSE 'ISSUE: Some incidents not visible'
    END as result;














