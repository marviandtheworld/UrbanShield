-- Simple Fix: Remove problematic columns from function
-- This creates a minimal function that only uses existing columns

-- 1. First, let's see what columns actually exist
SELECT 
    'EXISTING COLUMNS' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Create a simple function that only uses existing columns
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
        false as is_rescue,  -- Default value since column doesn't exist
        ARRAY[]::TEXT[] as external_documents,  -- Default empty array
        i.views,
        i.likes,
        i.comments_count,
        i.votes,
        0 as shares_count,  -- Default value since column doesn't exist
        0 as flags,  -- Default value since column doesn't exist
        false as is_moderated,  -- Default value since column doesn't exist
        i.is_approved,
        false as is_verified,  -- Default value since column doesn't exist
        0 as priority,  -- Default value since column doesn't exist
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
    -- Remove WHERE clause to show all incidents
    ORDER BY 
        i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

-- 4. Test the function
SELECT 
    'FUNCTION TEST' as test,
    COUNT(*) as incident_count
FROM get_incidents_with_user_info();

-- 5. Show sample data
SELECT 
    'SAMPLE DATA' as test,
    id,
    title,
    is_approved,
    is_verified,
    is_rescue,
    shares_count,
    created_at
FROM get_incidents_with_user_info()
ORDER BY created_at DESC
LIMIT 3;






