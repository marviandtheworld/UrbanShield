-- Add Sample Verification Data
-- This will add some verified incidents to test the verification badge

-- 1. Check current verification status
SELECT 'CURRENT VERIFICATION STATUS' as test;
SELECT is_verified, COUNT(*) as count 
FROM incidents 
GROUP BY is_verified;

-- 2. Add some verified incidents
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    categories TEXT[] := ARRAY['crime', 'fire', 'earthquake'];
    cat TEXT;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        FOREACH cat IN ARRAY categories LOOP
            BEGIN
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
                    shares_count,
                    status
                ) VALUES (
                    test_user_id,
                    'VERIFIED ' || UPPER(cat) || ' INCIDENT',
                    'This is a verified ' || cat || ' incident for testing verification badges',
                    cat::incident_category,
                    'high'::incident_severity,
                    'Verified ' || cat || ' Location',
                    'POINT(123.8854 10.3157)',
                    false,
                    true, -- Mark as urgent
                    true, -- Mark as verified
                    0, 0, 0, 0,
                    'open'::incident_status
                ) RETURNING id INTO incident_id;
                
                RAISE NOTICE 'Created verified incident for % category (ID: %)', cat, incident_id;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Failed to create verified incident for %: %', cat, SQLERRM;
            END;
        END LOOP;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 3. Update some existing incidents to be verified
UPDATE incidents 
SET is_verified = true 
WHERE id IN (
    SELECT id FROM incidents 
    WHERE is_verified = false 
    LIMIT 3
);

-- 4. Check verification status after updates
SELECT 'VERIFICATION STATUS AFTER UPDATES' as test;
SELECT is_verified, COUNT(*) as count 
FROM incidents 
GROUP BY is_verified;

-- 5. Show sample verified incidents
SELECT 'SAMPLE VERIFIED INCIDENTS' as test;
SELECT id, title, category, severity, is_verified, is_urgent, created_at 
FROM get_incidents_with_user_info() 
WHERE is_verified = true
ORDER BY created_at DESC 
LIMIT 5;


