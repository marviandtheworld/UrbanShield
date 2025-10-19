-- Fix Missing Columns Issue
-- This updates the function to only use columns that exist in your database

-- 1. First, let's check what columns actually exist in the incidents table
SELECT 
    'EXISTING COLUMNS' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add missing columns if they don't exist
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS is_rescue BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS external_documents TEXT[],
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flags INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_moderated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- 3. Update the function to only use existing columns
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
        COALESCE(i.is_rescue, false) as is_rescue,  -- Handle missing column
        i.images,
        COALESCE(i.external_documents, ARRAY[]::TEXT[]) as external_documents,  -- Handle missing column
        i.views,
        i.likes,
        i.comments_count,
        i.votes,
        COALESCE(i.shares_count, 0) as shares_count,  -- Handle missing column
        COALESCE(i.flags, 0) as flags,  -- Handle missing column
        COALESCE(i.is_moderated, false) as is_moderated,  -- Handle missing column
        i.is_approved,
        COALESCE(i.is_verified, false) as is_verified,  -- Handle missing column
        COALESCE(i.priority, 0) as priority,  -- Handle missing column
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
        COALESCE(i.is_verified, false) DESC,  -- Verified incidents first
        COALESCE(i.priority, 0) DESC, 
        i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

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
            is_approved,
            is_verified,
            votes,
            shares_count,
            priority
        ) VALUES (
            test_user_id,
            'TEST INCIDENT - Column Fix Test',
            'This incident should appear in the news feed after fixing the column issue.',
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

-- 7. Final verification
SELECT 
    'FINAL VERIFICATION' as status,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents) = (SELECT COUNT(*) FROM get_incidents_with_user_info()) 
        THEN 'SUCCESS: All incidents visible'
        ELSE 'ISSUE: Some incidents not visible'
    END as result;














