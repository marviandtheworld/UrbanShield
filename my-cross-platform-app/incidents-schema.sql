-- UrbanShield Incidents Table Schema
-- Run this in your Supabase SQL editor

-- 1. Create incident category enum
CREATE TYPE incident_category AS ENUM ('crime', 'fire', 'accident', 'flood', 'landslide', 'earthquake', 'other');

-- 2. Create incident severity enum
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- 3. Create incident status enum
CREATE TYPE incident_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- 4. Create incidents table
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
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_incidents_reporter_id ON incidents(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_is_urgent ON incidents(is_urgent);

-- 6. Enable RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
-- Policy for users to view all incidents
CREATE POLICY "Anyone can view incidents" ON incidents
    FOR SELECT USING (true);

-- Policy for users to insert their own incidents
CREATE POLICY "Users can insert own incidents" ON incidents
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Policy for users to update their own incidents
CREATE POLICY "Users can update own incidents" ON incidents
    FOR UPDATE USING (auth.uid() = reporter_id);

-- Policy for users to delete their own incidents
CREATE POLICY "Users can delete own incidents" ON incidents
    FOR DELETE USING (auth.uid() = reporter_id);

-- 8. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;
CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_incidents_updated_at();

-- 10. Create function to get incidents with user info
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
    views INTEGER,
    likes INTEGER,
    comments_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_name TEXT,
    username TEXT,
    user_type user_type
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
        i.views,
        i.likes,
        i.comments_count,
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
        COALESCE(p.user_type, 'community_member'::user_type) as user_type
    FROM incidents i
    LEFT JOIN profiles p ON i.reporter_id = p.id
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON incidents TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

