-- Dynamic Fix: Check what columns exist and create function accordingly
-- This creates a function that adapts to your actual database schema

-- 1. Check what columns exist in incidents table
DO $$
DECLARE
    column_exists BOOLEAN;
    sql_text TEXT;
BEGIN
    -- Check if is_rescue exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'incidents' 
        AND column_name = 'is_rescue'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'is_rescue column exists';
    ELSE
        RAISE NOTICE 'is_rescue column does NOT exist';
    END IF;
END $$;

-- 2. Create function based on what columns actually exist
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
    EXECUTE '
    SELECT 
        i.id,
        i.title,
        i.description,
        i.category,
        i.severity,
        i.status,
        i.address,
        COALESCE(i.landmark, '''') as landmark,
        COALESCE(i.is_anonymous, false) as is_anonymous,
        COALESCE(i.is_urgent, false) as is_urgent,
        false as is_rescue,
        COALESCE(i.images, ARRAY[]::TEXT[]) as images,
        ARRAY[]::TEXT[] as external_documents,
        COALESCE(i.views, 0) as views,
        COALESCE(i.likes, 0) as likes,
        COALESCE(i.comments_count, 0) as comments_count,
        COALESCE(i.votes, 0) as votes,
        0 as shares_count,
        0 as flags,
        false as is_moderated,
        COALESCE(i.is_approved, true) as is_approved,
        false as is_verified,
        0 as priority,
        i.created_at,
        i.updated_at,
        CASE 
            WHEN COALESCE(i.is_anonymous, false) THEN ''Anonymous User''
            ELSE COALESCE(p.full_name, ''Unknown User'')
        END as user_name,
        CASE 
            WHEN COALESCE(i.is_anonymous, false) THEN ''@anonymous''
            ELSE COALESCE(p.username, ''@unknown'')
        END as username,
        COALESCE(p.user_type, ''guest''::user_type) as user_type,
        COALESCE(p.verification_status, ''pending''::verification_status) as verification_status
    FROM incidents i
    LEFT JOIN profiles p ON i.reporter_id = p.id
    ORDER BY i.created_at DESC';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

-- 4. Test the function
SELECT 
    'DYNAMIC FUNCTION TEST' as test,
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
    user_name,
    created_at
FROM get_incidents_with_user_info()
ORDER BY created_at DESC
LIMIT 5;












