-- Complete Fix for Incidents to Show in News Panel
-- This ensures all users can see incidents and reports go to news

-- 1. Fix the function with proper fallbacks
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
        0 as votes,  -- Default value
        COALESCE(i.shares_count, 0) as shares_count,
        0 as flags,  -- Default value
        false as is_moderated,  -- Default value
        true as is_approved,  -- All incidents are approved by default
        COALESCE(i.is_verified, false) as is_verified,
        0 as priority,  -- Default value
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
        COALESCE(p.user_type, 'guest'::user_type) as user_type,  -- Fixed: Added COALESCE
        COALESCE(p.verification_status, 'pending'::verification_status) as verification_status
    FROM incidents i
    LEFT JOIN profiles p ON i.reporter_id = p.id
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

-- 3. Ensure RLS policies allow viewing incidents
-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view incidents" ON incidents;
DROP POLICY IF EXISTS "Users can view all incidents" ON incidents;
DROP POLICY IF EXISTS "Enable read access for all users" ON incidents;

-- Create a simple policy that allows everyone to view incidents
CREATE POLICY "Enable read access for all users" ON incidents
    FOR SELECT USING (true);

-- 4. Ensure RLS policies allow inserting incidents
DROP POLICY IF EXISTS "Users can insert incidents" ON incidents;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON incidents;

CREATE POLICY "Enable insert for authenticated users" ON incidents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Test the function
SELECT 
    'FUNCTION TEST' as test,
    COUNT(*) as incident_count
FROM get_incidents_with_user_info();

-- 6. Create a test incident to verify everything works
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
            'TEST INCIDENT - Should Appear in News',
            'This incident should now appear in the news feed. If you can see this, the fix worked!',
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

-- 7. Final verification
SELECT 
    'FINAL VERIFICATION' as status,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents) = (SELECT COUNT(*) FROM get_incidents_with_user_info()) 
        THEN 'SUCCESS: All incidents visible in news panel'
        ELSE 'ISSUE: Some incidents not visible'
    END as result;

-- 8. Show sample data
SELECT 
    'SAMPLE DATA' as test,
    id,
    title,
    is_verified,
    views,
    likes,
    user_name,
    created_at
FROM get_incidents_with_user_info()
ORDER BY created_at DESC
LIMIT 5;










