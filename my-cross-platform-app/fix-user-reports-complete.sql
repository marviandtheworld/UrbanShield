-- Complete Fix for User Report Submission
-- Ensures user reports appear in news feed

-- 1. Check current state
SELECT 'BEFORE FIX: INCIDENTS COUNT' as test;
SELECT COUNT(*) as count FROM incidents;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON incidents;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON incidents;
DROP POLICY IF EXISTS "Users can insert incidents" ON incidents;
DROP POLICY IF EXISTS "Anyone can view incidents" ON incidents;
DROP POLICY IF EXISTS "Users can view all incidents" ON incidents;
DROP POLICY IF EXISTS "Enable update for incident owners" ON incidents;

-- 3. Create comprehensive RLS policies
-- Allow everyone to read incidents
CREATE POLICY "Enable read access for all users" ON incidents
    FOR SELECT USING (true);

-- Allow authenticated users to insert incidents
CREATE POLICY "Enable insert for authenticated users" ON incidents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own incidents
CREATE POLICY "Enable update for incident owners" ON incidents
    FOR UPDATE USING (auth.uid() = reporter_id);

-- 4. Ensure the function is working
DROP FUNCTION IF EXISTS get_incidents_with_user_info();

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
        false as is_rescue,
        COALESCE(i.images, ARRAY[]::TEXT[]) as images,
        ARRAY[]::TEXT[] as external_documents,
        COALESCE(i.views_count, 0) as views,
        COALESCE(i.likes_count, 0) as likes,
        COALESCE(i.comments_count, 0) as comments_count,
        0 as votes,
        COALESCE(i.shares_count, 0) as shares_count,
        0 as flags,
        false as is_moderated,
        true as is_approved,
        COALESCE(i.is_verified, false) as is_verified,
        0 as priority,
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
        COALESCE(p.user_type, 'parent'::user_type) as user_type,
        COALESCE(p.verification_status, 'pending'::verification_status) as verification_status
    FROM incidents i
    LEFT JOIN profiles p ON i.reporter_id = p.id
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

-- 6. Test the function
SELECT 'FUNCTION TEST' as test;
SELECT COUNT(*) as incident_count FROM get_incidents_with_user_info();

-- 7. Create a test incident to verify everything works
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
            'USER REPORT TEST - Should Work Now',
            'This test incident should appear in the news feed. If you can see this, user reports should work!',
            'other',
            'medium',
            'User Test Address, Cebu City',
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

-- 8. Final verification
SELECT 'FINAL VERIFICATION' as test;
SELECT 
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents) = (SELECT COUNT(*) FROM get_incidents_with_user_info()) 
        THEN 'SUCCESS: User reports should now work'
        ELSE 'ISSUE: Still having problems'
    END as result;

-- 9. Show all incidents
SELECT 'ALL INCIDENTS' as test;
SELECT id, title, reporter_id, created_at 
FROM incidents 
ORDER BY created_at DESC;














