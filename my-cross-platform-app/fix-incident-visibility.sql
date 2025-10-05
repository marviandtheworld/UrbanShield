-- Fix Incident Visibility - Allow All Users to See All Incidents
-- Run this in your Supabase SQL editor

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view approved incidents or own incidents" ON incidents;
DROP POLICY IF EXISTS "Users can insert incidents based on privileges" ON incidents;

-- 2. Create new permissive policies
-- Allow everyone to view all incidents (approved or not)
CREATE POLICY "Everyone can view all incidents" ON incidents
    FOR SELECT USING (true);

-- Allow authenticated users to insert incidents
CREATE POLICY "Authenticated users can insert incidents" ON incidents
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own incidents
CREATE POLICY "Users can update own incidents" ON incidents
    FOR UPDATE USING (auth.uid() = reporter_id);

-- 3. Update the get_incidents_with_user_info function to show ALL incidents
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
    -- Remove the WHERE clause to show ALL incidents
    ORDER BY 
        i.is_verified DESC,  -- Verified incidents first
        i.priority DESC, 
        i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function for admins to mark incidents as verified
CREATE OR REPLACE FUNCTION mark_incident_verified(incident_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile profiles%ROWTYPE;
BEGIN
    -- Check if the current user is an admin
    SELECT * INTO user_profile 
    FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Only admin users can verify incidents';
    END IF;
    
    -- Update the incident as verified
    UPDATE incidents 
    SET 
        is_verified = true,
        updated_at = NOW()
    WHERE id = incident_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function for admins to unverify incidents
CREATE OR REPLACE FUNCTION mark_incident_unverified(incident_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile profiles%ROWTYPE;
BEGIN
    -- Check if the current user is an admin
    SELECT * INTO user_profile 
    FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Only admin users can unverify incidents';
    END IF;
    
    -- Update the incident as unverified
    UPDATE incidents 
    SET 
        is_verified = false,
        updated_at = NOW()
    WHERE id = incident_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION mark_incident_verified(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_incident_unverified(UUID) TO authenticated;

-- 7. Test by creating a sample incident
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
    shares_count
) VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'Test Incident - Unverified',
    'This incident should be visible even if unverified',
    'other',
    'medium',
    'Test Address',
    'POINT(123.8854 10.3157)',
    true,
    false,
    0,
    0
) ON CONFLICT DO NOTHING;

-- 8. Verify the fix worked
SELECT 
    'Fix Applied Successfully' as status,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents;
