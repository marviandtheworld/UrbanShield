-- Fix User Report Insertion Issue
-- Ensure users can insert their own reports

-- 1. Check current RLS policies
SELECT 'CURRENT RLS POLICIES' as test;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'incidents';

-- 2. Drop all existing policies on incidents
DROP POLICY IF EXISTS "Enable read access for all users" ON incidents;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON incidents;
DROP POLICY IF EXISTS "Users can insert incidents" ON incidents;
DROP POLICY IF EXISTS "Anyone can view incidents" ON incidents;
DROP POLICY IF EXISTS "Users can view all incidents" ON incidents;

-- 3. Create new, simple RLS policies
-- Allow everyone to read incidents
CREATE POLICY "Enable read access for all users" ON incidents
    FOR SELECT USING (true);

-- Allow authenticated users to insert incidents
CREATE POLICY "Enable insert for authenticated users" ON incidents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own incidents
CREATE POLICY "Enable update for incident owners" ON incidents
    FOR UPDATE USING (auth.uid() = reporter_id);

-- 4. Test the policies
SELECT 'TESTING POLICIES' as test;

-- 5. Create a test incident to verify insertion works
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
            'USER REPORT TEST - Should Appear',
            'This test incident should appear in the news feed when submitted by a user.',
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
        
        RAISE NOTICE 'User report test incident created successfully with ID: %', incident_id;
    ELSE
        RAISE NOTICE 'No users found - please create a user first';
    END IF;
END $$;

-- 6. Verify the incident was created and is visible
SELECT 'VERIFICATION' as test;
SELECT 
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents,
    CASE 
        WHEN (SELECT COUNT(*) FROM incidents) = (SELECT COUNT(*) FROM get_incidents_with_user_info()) 
        THEN 'SUCCESS: User reports should now work'
        ELSE 'ISSUE: Still having problems'
    END as result;

-- 7. Show the new incident
SELECT 'NEW INCIDENT' as test;
SELECT id, title, reporter_id, created_at 
FROM incidents 
ORDER BY created_at DESC 
LIMIT 1;



