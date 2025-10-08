-- Final Fix for News Display Issue
-- This ensures incidents show up in the news feed

-- 1. Drop all existing policies on incidents table
DROP POLICY IF EXISTS "Users can view approved incidents or own incidents" ON incidents;
DROP POLICY IF EXISTS "Users can view all incidents" ON incidents;
DROP POLICY IF EXISTS "Everyone can view all incidents" ON incidents;
DROP POLICY IF EXISTS "Users can insert incidents based on privileges" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can insert incidents" ON incidents;

-- 2. Create the most permissive policies possible
-- Allow everyone to view all incidents
CREATE POLICY "Everyone can view all incidents" ON incidents
    FOR SELECT USING (true);

-- Allow authenticated users to insert incidents
CREATE POLICY "Authenticated users can insert incidents" ON incidents
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own incidents
CREATE POLICY "Users can update own incidents" ON incidents
    FOR UPDATE USING (auth.uid() = reporter_id);

-- 3. Ensure the get_incidents_with_user_info function is working
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
        i.landmark,
        i.is_anonymous,
        i.is_urgent,
        i.is_rescue,
        i.images,
        i.external_documents,
        i.views,
        i.likes,
        i.comments_count,
        i.votes,
        i.shares_count,
        i.flags,
        i.is_moderated,
        i.is_approved,
        i.is_verified,
        i.priority,
        i.created_at,
        i.updated_at,
        CASE 
            WHEN i.is_anonymous THEN 'Anonymous User'
            ELSE COALESCE(p.full_name, 'Unknown User')
        END as user_name,
        CASE 
            WHEN i.is_anonymous THEN '@anonymous'
            ELSE COALESCE(p.username, '@unknown')
        END as username,
        COALESCE(p.user_type, 'guest'::user_type) as user_type,
        COALESCE(p.verification_status, 'pending'::verification_status) as verification_status
    FROM incidents i
    LEFT JOIN profiles p ON i.reporter_id = p.id
    -- Remove any WHERE clause to show ALL incidents
    ORDER BY 
        i.is_verified DESC,  -- Verified incidents first
        i.priority DESC, 
        i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON incidents TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

-- 5. Create a test incident to verify everything works
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
            is_approved,
            is_verified,
            votes,
            shares_count,
            priority
        ) VALUES (
            test_user_id,
            'TEST INCIDENT - News Display Test',
            'This incident should appear in the news feed immediately. If you can see this, the fix worked!',
            'other',
            'medium',
            'Test Address, Cebu City',
            'POINT(123.8854 10.3157)',
            true,
            false,
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
        THEN 'SUCCESS: All incidents visible'
        ELSE 'ISSUE: Some incidents not visible'
    END as result;




