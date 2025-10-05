-- Fix Incident Category Enum
-- This will fix the "invalid input value for enum" error

-- 1. First, let's see what values currently exist in the enum
SELECT 'CURRENT ENUM VALUES' as test;
SELECT enumlabel as current_value 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'incident_category'
)
ORDER BY enumsortorder;

-- 2. Check if the enum exists at all
SELECT 'ENUM EXISTS?' as test;
SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'incident_category'
) as enum_exists;

-- 3. Check what values exist and add missing ones
DO $$
DECLARE
    enum_oid OID;
    value_exists BOOLEAN;
BEGIN
    -- Get the enum type OID
    SELECT oid INTO enum_oid FROM pg_type WHERE typname = 'incident_category';
    
    IF enum_oid IS NOT NULL THEN
        RAISE NOTICE 'Found incident_category enum with OID: %', enum_oid;
        
        -- Check and add each value individually
        -- Check for 'crime'
        SELECT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = enum_oid AND enumlabel = 'crime') INTO value_exists;
        IF NOT value_exists THEN
            ALTER TYPE incident_category ADD VALUE 'crime';
            RAISE NOTICE 'Added missing enum value: crime';
        ELSE
            RAISE NOTICE 'Enum value crime already exists';
        END IF;
        
        -- Check for 'fire'
        SELECT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = enum_oid AND enumlabel = 'fire') INTO value_exists;
        IF NOT value_exists THEN
            ALTER TYPE incident_category ADD VALUE 'fire';
            RAISE NOTICE 'Added missing enum value: fire';
        ELSE
            RAISE NOTICE 'Enum value fire already exists';
        END IF;
        
        -- Check for 'accident'
        SELECT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = enum_oid AND enumlabel = 'accident') INTO value_exists;
        IF NOT value_exists THEN
            ALTER TYPE incident_category ADD VALUE 'accident';
            RAISE NOTICE 'Added missing enum value: accident';
        ELSE
            RAISE NOTICE 'Enum value accident already exists';
        END IF;
        
        -- Check for 'flood'
        SELECT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = enum_oid AND enumlabel = 'flood') INTO value_exists;
        IF NOT value_exists THEN
            ALTER TYPE incident_category ADD VALUE 'flood';
            RAISE NOTICE 'Added missing enum value: flood';
        ELSE
            RAISE NOTICE 'Enum value flood already exists';
        END IF;
        
        -- Check for 'landslide'
        SELECT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = enum_oid AND enumlabel = 'landslide') INTO value_exists;
        IF NOT value_exists THEN
            ALTER TYPE incident_category ADD VALUE 'landslide';
            RAISE NOTICE 'Added missing enum value: landslide';
        ELSE
            RAISE NOTICE 'Enum value landslide already exists';
        END IF;
        
        -- Check for 'earthquake'
        SELECT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = enum_oid AND enumlabel = 'earthquake') INTO value_exists;
        IF NOT value_exists THEN
            ALTER TYPE incident_category ADD VALUE 'earthquake';
            RAISE NOTICE 'Added missing enum value: earthquake';
        ELSE
            RAISE NOTICE 'Enum value earthquake already exists';
        END IF;
        
        -- Check for 'other'
        SELECT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = enum_oid AND enumlabel = 'other') INTO value_exists;
        IF NOT value_exists THEN
            ALTER TYPE incident_category ADD VALUE 'other';
            RAISE NOTICE 'Added missing enum value: other';
        ELSE
            RAISE NOTICE 'Enum value other already exists';
        END IF;
    ELSE
        RAISE NOTICE 'incident_category enum does not exist, creating it...';
        
        -- Create the enum with all values
        CREATE TYPE incident_category AS ENUM (
            'crime',
            'fire', 
            'accident',
            'flood',
            'landslide',
            'earthquake',
            'other'
        );
        
        RAISE NOTICE 'Created incident_category enum with all values';
    END IF;
END $$;

-- 4. Verify all values now exist
SELECT 'VERIFIED ENUM VALUES' as test;
SELECT enumlabel as value 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'incident_category'
)
ORDER BY enumsortorder;

-- 5. Test inserting each category to make sure they work
DO $$
DECLARE
    test_user_id UUID;
    incident_id UUID;
    categories TEXT[] := ARRAY['crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other'];
    cat TEXT;
    success_count INTEGER := 0;
BEGIN
    -- Get the first user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing all categories after enum fix...';
        
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
                    'ENUM FIX TEST - ' || UPPER(cat),
                    'Testing ' || cat || ' category after enum fix',
                    cat::incident_category,
                    'medium'::incident_severity,
                    cat || ' Test Location',
                    'POINT(123.8854 10.3157)',
                    false,
                    false,
                    false,
                    0, 0, 0, 0,
                    'open'::incident_status
                ) RETURNING id INTO incident_id;
                
                RAISE NOTICE 'SUCCESS: % category works (ID: %)', cat, incident_id;
                success_count := success_count + 1;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'ERROR: % category still fails - %', cat, SQLERRM;
            END;
        END LOOP;
        
        RAISE NOTICE 'SUMMARY: % out of % categories work', success_count, array_length(categories, 1);
    ELSE
        RAISE NOTICE 'No users found for testing';
    END IF;
END $$;

-- 6. Final verification
SELECT 'FINAL VERIFICATION' as test;
SELECT category, COUNT(*) as count 
FROM incidents 
WHERE title LIKE 'ENUM FIX TEST%'
GROUP BY category 
ORDER BY category;

-- 7. Test the function to make sure it can see all categories
SELECT 'FUNCTION TEST' as test;
SELECT category, COUNT(*) as count 
FROM get_incidents_with_user_info() 
WHERE title LIKE 'ENUM FIX TEST%'
GROUP BY category 
ORDER BY category;
