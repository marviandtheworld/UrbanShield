-- STEP 2: Fix the Database Function
-- Run this in your Supabase SQL Editor

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_incidents_with_user_info();

-- Create the corrected function
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
        false as is_rescue,  -- Always false - handled locally
        COALESCE(i.images, ARRAY[]::TEXT[]) as images,  -- Ensure images array is returned
        ARRAY[]::TEXT[] as external_documents,  -- Default empty array
        COALESCE(i.views_count, 0) as views,  -- Use views_count column
        COALESCE(i.likes_count, 0) as likes,  -- Use likes_count column
        COALESCE(i.comments_count, 0) as comments_count,
        0 as votes,  -- Default value
        COALESCE(i.shares_count, 0) as shares_count,
        0 as flags,  -- Default value
        false as is_moderated,  -- Default value
        true as is_approved,  -- All incidents are approved
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
        COALESCE(p.user_type, 'guest'::user_type) as user_type,
        COALESCE(p.verification_status, 'pending'::verification_status) as verification_status
    FROM incidents i
    LEFT JOIN profiles p ON i.reporter_id = p.id
    WHERE COALESCE(i.is_approved, true) = true  -- Only show approved incidents
    ORDER BY 
        COALESCE(i.is_verified, false) DESC,  -- Verified first
        COALESCE(i.is_urgent, false) DESC,    -- Urgent next
        i.created_at DESC;                    -- Then by date
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

-- Test the function
SELECT 
    'FUNCTION TEST' as info,
    COUNT(*) as total_incidents,
    COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as incidents_with_images
FROM get_incidents_with_user_info();

