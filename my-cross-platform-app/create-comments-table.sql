-- Create Comments Table for UrbanShield
-- This will add a proper comments system to store and display individual comments

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

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_incident_id ON comments(incident_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 3. Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for comments
-- Policy for users to view all comments
CREATE POLICY "Anyone can view comments" ON comments
    FOR SELECT USING (true);

-- Policy for users to insert their own comments
CREATE POLICY "Users can insert own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own comments
CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Create function to update updated_at timestamp for comments
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger for updated_at on comments
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comments_updated_at();

-- 7. Create function to get comments with user info
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

-- 8. Create function to automatically update comments_count in incidents
CREATE OR REPLACE FUNCTION update_incident_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE incidents 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.incident_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE incidents 
        SET comments_count = GREATEST(comments_count - 1, 0) 
        WHERE id = OLD.incident_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 9. Create triggers to automatically update comments_count
DROP TRIGGER IF EXISTS update_incident_comments_count_insert ON comments;
CREATE TRIGGER update_incident_comments_count_insert
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_incident_comments_count();

DROP TRIGGER IF EXISTS update_incident_comments_count_delete ON comments;
CREATE TRIGGER update_incident_comments_count_delete
    AFTER DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_incident_comments_count();

-- 10. Grant necessary permissions
GRANT ALL ON comments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_comments_with_user_info(UUID) TO anon, authenticated;













