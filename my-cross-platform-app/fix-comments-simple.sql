-- Simple Fix for Comments Issue
-- Run this in Supabase SQL editor to fix the comments system

-- 1. Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_incident_id ON comments(incident_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- 3. Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
CREATE POLICY "Users can insert own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create function to get comments
CREATE OR REPLACE FUNCTION get_comments_with_user_info(incident_uuid UUID)
RETURNS TABLE (
    id UUID,
    content TEXT,
    is_anonymous BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    user_name TEXT,
    username TEXT,
    user_type user_type
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.content,
        c.is_anonymous,
        c.created_at,
        CASE 
            WHEN c.is_anonymous THEN 'Anonymous User'
            ELSE COALESCE(p.full_name, 'Unknown User')
        END as user_name,
        CASE 
            WHEN c.is_anonymous THEN '@anonymous'
            ELSE COALESCE(p.username, '@unknown')
        END as username,
        COALESCE(p.user_type, 'community_member'::user_type) as user_type
    FROM comments c
    LEFT JOIN profiles p ON c.user_id = p.id
    WHERE c.incident_id = incident_uuid
    ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT ALL ON comments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_comments_with_user_info(UUID) TO anon, authenticated;

-- 7. Test the setup
SELECT 'SETUP COMPLETE' as status;
SELECT 'Comments table created and configured' as message;









