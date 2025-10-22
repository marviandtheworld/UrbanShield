-- Fix Category Enums
-- This will ensure all incident categories are properly defined

-- 1. Drop existing enums if they exist (to recreate them properly)
DROP TYPE IF EXISTS incident_category CASCADE;
DROP TYPE IF EXISTS incident_severity CASCADE;
DROP TYPE IF EXISTS incident_status CASCADE;

-- 2. Recreate incident_category enum with all values
CREATE TYPE incident_category AS ENUM (
    'crime',
    'fire', 
    'accident',
    'flood',
    'landslide',
    'earthquake',
    'other'
);

-- 3. Recreate incident_severity enum
CREATE TYPE incident_severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- 4. Recreate incident_status enum
CREATE TYPE incident_status AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed'
);

-- 5. Update incidents table to use the new enums
ALTER TABLE incidents 
ALTER COLUMN category TYPE incident_category USING category::text::incident_category;

ALTER TABLE incidents 
ALTER COLUMN severity TYPE incident_severity USING severity::text::incident_severity;

ALTER TABLE incidents 
ALTER COLUMN status TYPE incident_status USING status::text::incident_status;

-- 6. Test the enums by inserting each category
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    categories TEXT[] := ARRAY['crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other'];
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
                    'FIXED ENUM TEST - ' || UPPER(cat),
                    'Testing ' || cat || ' category after enum fix',
                    cat::incident_category,
                    'medium'::incident_severity,
                    'Test Location',
                    'POINT(123.8854 10.3157)',
                    false,
                    false,
                    false,
                    0, 0, 0, 0,
                    'open'::incident_status
                ) RETURNING id INTO incident_id;
                
                RAISE NOTICE 'SUCCESS: % category works after enum fix (ID: %)', cat, incident_id;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'ERROR: % category still fails - %', cat, SQLERRM;
            END;
        END LOOP;
    ELSE
        RAISE NOTICE 'No users found';
    END IF;
END $$;

-- 7. Verify all categories work
SELECT 'VERIFICATION: CATEGORIES THAT WORK' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
WHERE title LIKE 'FIXED ENUM TEST%'
GROUP BY category 
ORDER BY category;

-- 8. Show all enum values
SELECT 'ENUM VALUES VERIFICATION' as test;
SELECT 'incident_category' as enum_name, enumlabel as value 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'incident_category')
UNION ALL
SELECT 'incident_severity' as enum_name, enumlabel as value 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'incident_severity')
UNION ALL
SELECT 'incident_status' as enum_name, enumlabel as value 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'incident_status')
ORDER BY enum_name, value;









