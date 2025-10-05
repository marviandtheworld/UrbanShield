-- Complete Fix for Incidents Not Showing Issue
-- Run this in your Supabase SQL editor

-- 1. Create all required enum types
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('parent', 'resident', 'business', 'government', 'tourist', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE posting_privilege AS ENUM ('moderated', 'immediate', 'restricted', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_category AS ENUM ('crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create incidents table if it doesn't exist
CREATE TABLE IF NOT EXISTS incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category incident_category NOT NULL,
    severity incident_severity NOT NULL DEFAULT 'medium',
    status incident_status NOT NULL DEFAULT 'open',
    address TEXT NOT NULL,
    landmark TEXT,
    location GEOGRAPHY(POINT) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    is_rescue BOOLEAN DEFAULT FALSE,
    images TEXT[],
    external_documents TEXT[],
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    votes INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    flags INTEGER DEFAULT 0,
    is_moderated BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    username TEXT UNIQUE,
    email TEXT,
    user_type user_type NOT NULL DEFAULT 'guest',
    verification_status verification_status NOT NULL DEFAULT 'pending',
    posting_privilege posting_privilege NOT NULL DEFAULT 'moderated',
    avatar_url TEXT,
    location GEOGRAPHY(POINT),
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Philippines',
    phone_number TEXT,
    organization_name TEXT,
    organization_type TEXT,
    business_license TEXT,
    dti_permit TEXT,
    bir_permit TEXT,
    business_address TEXT,
    business_zone GEOGRAPHY(POLYGON),
    government_position TEXT,
    government_id TEXT,
    official_email TEXT,
    department TEXT,
    barangay TEXT,
    neighbors_verified BOOLEAN DEFAULT FALSE,
    local_verified BOOLEAN DEFAULT FALSE,
    reports_filed INTEGER DEFAULT 0,
    reports_resolved INTEGER DEFAULT 0,
    reports_approved INTEGER DEFAULT 0,
    reports_rejected INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    total_views INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    location_sharing_enabled BOOLEAN DEFAULT TRUE,
    verification_documents JSONB,
    verification_notes TEXT,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add missing columns to existing tables
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS posting_privilege posting_privilege DEFAULT 'moderated',
ADD COLUMN IF NOT EXISTS email TEXT;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_incidents_reporter_id ON incidents(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_is_urgent ON incidents(is_urgent);
CREATE INDEX IF NOT EXISTS idx_incidents_is_approved ON incidents(is_approved);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_posting_privilege ON profiles(posting_privilege);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 6. Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies and create new ones
DROP POLICY IF EXISTS "Users can view approved incidents or own incidents" ON incidents;
DROP POLICY IF EXISTS "Users can insert incidents based on privileges" ON incidents;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create RLS policies for incidents
CREATE POLICY "Users can view approved incidents or own incidents" ON incidents
    FOR SELECT USING (
        is_approved = true OR 
        auth.uid() = reporter_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type IN ('government', 'business')
        )
    );

CREATE POLICY "Users can insert incidents based on privileges" ON incidents
    FOR INSERT WITH CHECK (
        auth.uid() = reporter_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
        )
    );

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 8. Create helper functions
CREATE OR REPLACE FUNCTION get_posting_privilege(user_type_param user_type)
RETURNS posting_privilege AS $$
BEGIN
    CASE user_type_param
        WHEN 'resident' THEN RETURN 'immediate';
        WHEN 'government' THEN RETURN 'immediate';
        WHEN 'business' THEN RETURN 'restricted';
        WHEN 'parent' THEN RETURN 'moderated';
        WHEN 'tourist' THEN RETURN 'moderated';
        WHEN 'guest' THEN RETURN 'moderated';
        ELSE RETURN 'moderated';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 9. Create the main function to get incidents
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
    WHERE i.is_approved = true OR i.reporter_id = auth.uid()
    ORDER BY i.priority DESC, i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON incidents TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_posting_privilege(user_type) TO anon, authenticated;

-- 11. Create a test incident to verify everything works
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
    'Test Incident',
    'This is a test incident to verify the system works',
    'other',
    'medium',
    'Test Address',
    'POINT(123.8854 10.3157)',
    true,
    false,
    0,
    0
) ON CONFLICT DO NOTHING;

-- 12. Final verification query
SELECT 
    'Setup Complete' as status,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM get_incidents_with_user_info()) as visible_incidents;

