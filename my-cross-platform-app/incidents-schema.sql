-- UrbanShield Incidents Table Schema
-- Run this in your Supabase SQL editor

-- 1. Create user type enum (updated with new types) - only if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('parent', 'resident', 'business', 'government', 'tourist', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create verification status enum - only if it doesn't exist
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create incident category enum - only if it doesn't exist
DO $$ BEGIN
    CREATE TYPE incident_category AS ENUM ('crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create incident severity enum - only if it doesn't exist
DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create incident status enum - only if it doesn't exist
DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Create posting privilege enum - only if it doesn't exist
DO $$ BEGIN
    CREATE TYPE posting_privilege AS ENUM ('moderated', 'immediate', 'restricted', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Update existing user_type enum to include new values (if it exists)
DO $$ BEGIN
    -- Add new values to existing user_type enum
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'parent';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'resident';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'business';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'government';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'tourist';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'guest';
EXCEPTION
    WHEN undefined_object THEN null; -- user_type doesn't exist yet, will be created above
END $$;

-- 8. Create incidents table
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
    external_documents TEXT[], -- For government users
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    votes INTEGER DEFAULT 0,
    flags INTEGER DEFAULT 0,
    is_moderated BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE, -- FALSE for moderated posts
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 9. Create profiles table with verification system
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
    
    -- Verification documents
    verification_documents JSONB, -- Store verification documents
    verification_notes TEXT, -- Admin notes for verification
    verified_by UUID REFERENCES auth.users(id), -- Admin who verified
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Business specific fields
    business_name TEXT,
    business_license TEXT,
    dti_permit TEXT,
    bir_permit TEXT,
    business_address TEXT,
    business_zone GEOGRAPHY(POLYGON), -- Business operating zone
    
    -- Government specific fields
    government_position TEXT,
    government_id TEXT,
    official_email TEXT,
    department TEXT,
    
    -- Resident specific fields
    barangay TEXT,
    neighbors_verified BOOLEAN DEFAULT FALSE,
    local_verified BOOLEAN DEFAULT FALSE,
    
    -- Statistics
    reports_filed INTEGER DEFAULT 0,
    reports_resolved INTEGER DEFAULT 0,
    reports_approved INTEGER DEFAULT 0,
    reports_rejected INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    total_views INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    
    -- Settings
    is_verified BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    location_sharing_enabled BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_incidents_reporter_id ON incidents(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_is_urgent ON incidents(is_urgent);
CREATE INDEX IF NOT EXISTS idx_incidents_is_approved ON incidents(is_approved);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority DESC);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_posting_privilege ON profiles(posting_privilege);

-- 11. Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for incidents
-- Policy for users to view approved incidents or their own incidents
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

-- Policy for users to insert incidents based on posting privileges
CREATE POLICY "Users can insert incidents based on privileges" ON incidents
    FOR INSERT WITH CHECK (
        auth.uid() = reporter_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.verification_status = 'verified'
            AND profiles.posting_privilege IN ('immediate', 'moderated', 'restricted')
        )
    );

-- Policy for users to update their own incidents (with restrictions)
CREATE POLICY "Users can update own incidents with restrictions" ON incidents
    FOR UPDATE USING (
        auth.uid() = reporter_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.verification_status = 'verified'
        )
    );

-- Policy for users to delete their own incidents
CREATE POLICY "Users can delete own incidents" ON incidents
    FOR DELETE USING (
        auth.uid() = reporter_id AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.verification_status = 'verified'
        )
    );

-- 13. Create RLS policies for profiles
-- Policy for users to view their own profile and public info of others
CREATE POLICY "Users can view own profile and public info" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR
        verification_status = 'verified'
    );

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 14. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 15. Create function to update profiles updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;
CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_incidents_updated_at();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- 17. Create function to determine posting privileges based on user type
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

-- 18. Create function to handle user registration with verification
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_type_param user_type;
    posting_privilege_param posting_privilege;
BEGIN
    -- Extract user type from metadata
    user_type_param := COALESCE(NEW.raw_user_meta_data->>'user_type', 'guest')::user_type;
    
    -- Determine posting privileges
    posting_privilege_param := get_posting_privilege(user_type_param);
    
    -- Insert profile with verification status
    INSERT INTO public.profiles (
        id, 
        full_name, 
        username, 
        email,
        user_type,
        verification_status,
        posting_privilege,
        verification_documents
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'username', ''),
        NEW.email,
        user_type_param,
        CASE 
            WHEN user_type_param = 'tourist' THEN 'verified'
            ELSE 'pending'
        END,
        posting_privilege_param,
        COALESCE(NEW.raw_user_meta_data->'verification_documents', '{}'::jsonb)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Create function to get incidents with user info (updated)
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
    flags INTEGER,
    is_moderated BOOLEAN,
    is_approved BOOLEAN,
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
        i.flags,
        i.is_moderated,
        i.is_approved,
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

-- 20. Create function to check if user can post in specific area (for business users)
CREATE OR REPLACE FUNCTION can_post_in_area(user_id UUID, location GEOGRAPHY(POINT))
RETURNS BOOLEAN AS $$
DECLARE
    user_type_param user_type;
    business_zone GEOGRAPHY(POLYGON);
BEGIN
    -- Get user type
    SELECT user_type INTO user_type_param
    FROM profiles 
    WHERE id = user_id;
    
    -- Business users can only post in their verified zone
    IF user_type_param = 'business' THEN
        SELECT business_zone INTO business_zone
        FROM profiles 
        WHERE id = user_id;
        
        -- If no zone defined, allow posting anywhere (for now)
        IF business_zone IS NULL THEN
            RETURN TRUE;
        END IF;
        
        -- Check if location is within business zone
        RETURN ST_Within(location, business_zone);
    END IF;
    
    -- Other user types can post anywhere
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 21. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON incidents TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION can_post_in_area(UUID, GEOGRAPHY) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_posting_privilege(user_type) TO anon, authenticated;

-- 22. Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

