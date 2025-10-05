-- Simple Fix for News Feed Issue
-- Incidents exist but not showing in news feed

-- 1. Drop and recreate the function with minimal complexity
DROP FUNCTION IF EXISTS get_incidents_with_user_info();

-- 2. Create a super simple function that should work
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

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

-- 4. Fix RLS policies to ensure incidents are visible
DROP POLICY IF EXISTS "Enable read access for all users" ON incidents;
DROP POLICY IF EXISTS "Anyone can view incidents" ON incidents;
DROP POLICY IF EXISTS "Users can view all incidents" ON incidents;

CREATE POLICY "Enable read access for all users" ON incidents
    FOR SELECT USING (true);

-- 5. Test the function
SELECT 'FUNCTION TEST' as test;
SELECT COUNT(*) as incident_count FROM get_incidents_with_user_info();

-- 6. Show sample data
SELECT 'SAMPLE DATA' as test;
SELECT id, title, user_name, created_at 
FROM get_incidents_with_user_info() 
ORDER BY created_at DESC 
LIMIT 5;

