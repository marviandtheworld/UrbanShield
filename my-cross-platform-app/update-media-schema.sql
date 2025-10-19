-- Updated Media Schema for Photo and Video Attachments
-- Run this in your Supabase SQL editor

-- 1. Add media type enum
DO $$ BEGIN
    CREATE TYPE media_type AS ENUM ('image', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create media attachments table
CREATE TABLE IF NOT EXISTS media_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT, -- For videos, this will be the thumbnail
    media_type media_type NOT NULL,
    file_size INTEGER, -- in bytes
    duration INTEGER, -- for videos, in seconds
    width INTEGER,
    height INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_attachments_incident_id ON media_attachments(incident_id);
CREATE INDEX IF NOT EXISTS idx_media_attachments_media_type ON media_attachments(media_type);
CREATE INDEX IF NOT EXISTS idx_media_attachments_created_at ON media_attachments(created_at DESC);

-- 4. Enable RLS
ALTER TABLE media_attachments ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing media_attachments policies if they exist, then create new ones
DROP POLICY IF EXISTS "Public read access for media attachments" ON media_attachments;
DROP POLICY IF EXISTS "Users can insert their own media attachments" ON media_attachments;
DROP POLICY IF EXISTS "Users can update their own media attachments" ON media_attachments;
DROP POLICY IF EXISTS "Users can delete their own media attachments" ON media_attachments;

-- 6. Create RLS policies for media attachments
CREATE POLICY "Public read access for media attachments" ON media_attachments
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own media attachments" ON media_attachments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM incidents 
        WHERE incidents.id = media_attachments.incident_id 
        AND incidents.reporter_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own media attachments" ON media_attachments
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM incidents 
        WHERE incidents.id = media_attachments.incident_id 
        AND incidents.reporter_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own media attachments" ON media_attachments
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM incidents 
        WHERE incidents.id = media_attachments.incident_id 
        AND incidents.reporter_id = auth.uid()
    )
);

-- 7. Update incidents table to include media count and views
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS media_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 8. Create function to update media count
CREATE OR REPLACE FUNCTION update_incident_media_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE incidents 
        SET media_count = (
            SELECT COUNT(*) 
            FROM media_attachments 
            WHERE incident_id = NEW.incident_id
        )
        WHERE id = NEW.incident_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE incidents 
        SET media_count = (
            SELECT COUNT(*) 
            FROM media_attachments 
            WHERE incident_id = OLD.incident_id
        )
        WHERE id = OLD.incident_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers to automatically update media count
DROP TRIGGER IF EXISTS update_media_count_on_insert ON media_attachments;
CREATE TRIGGER update_media_count_on_insert
    AFTER INSERT ON media_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_incident_media_count();

DROP TRIGGER IF EXISTS update_media_count_on_delete ON media_attachments;
CREATE TRIGGER update_media_count_on_delete
    AFTER DELETE ON media_attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_incident_media_count();

-- 10. Drop the existing function first, then create the updated version
DROP FUNCTION IF EXISTS get_incidents_with_user_info();

-- 11. Create the updated get_incidents_with_user_info function to include media data
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
    media_attachments JSONB, -- New field for structured media data
    media_count INTEGER,
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
        COALESCE(i.landmark, '') as landmark,
        COALESCE(i.is_anonymous, false) as is_anonymous,
        COALESCE(i.is_urgent, false) as is_urgent,
        false as is_rescue,
        COALESCE(i.images, ARRAY[]::TEXT[]) as images,
        ARRAY[]::TEXT[] as external_documents,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', ma.id,
                        'file_url', ma.file_url,
                        'thumbnail_url', ma.thumbnail_url,
                        'media_type', ma.media_type,
                        'file_size', ma.file_size,
                        'duration', ma.duration,
                        'width', ma.width,
                        'height', ma.height,
                        'mime_type', ma.mime_type
                    ) ORDER BY ma.created_at ASC
                )
                FROM media_attachments ma
                WHERE ma.incident_id = i.id
            ),
            '[]'::jsonb
        ) as media_attachments,
        COALESCE(i.media_count, 0) as media_count,
        COALESCE(i.views_count, 0) as views,
        COALESCE(i.likes_count, 0) as likes,
        COALESCE(i.comments_count, 0) as comments_count,
        0 as votes,
        COALESCE(i.shares_count, 0) as shares_count,
        0 as flags,
        false as is_moderated,
        true as is_approved,
        COALESCE(i.is_verified, false) as is_verified,
        0 as priority,
        i.created_at,
        i.updated_at,
        CASE 
            WHEN COALESCE(i.is_anonymous, false) THEN 'Anonymous User'
            ELSE COALESCE(p.full_name, 'Unknown User')
        END as user_name,
        CASE 
            WHEN COALESCE(i.is_anonymous, false) THEN '@anonymous'
            ELSE COALESCE(p.username, '@unknown')
        END as username,
        p.user_type,
        COALESCE(p.verification_status, 'pending'::verification_status) as verification_status
    FROM incidents i
    LEFT JOIN profiles p ON i.reporter_id = p.id
    WHERE COALESCE(i.is_approved, true) = true
    ORDER BY 
        COALESCE(i.is_verified, false) DESC,
        COALESCE(i.is_urgent, false) DESC,
        i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Grant permissions
GRANT EXECUTE ON FUNCTION get_incidents_with_user_info() TO anon, authenticated;

-- 13. Create storage bucket for media if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'incident-media',
    'incident-media', 
    true,
    52428800,  -- 50MB limit
    ARRAY[
        'image/jpeg', 
        'image/png', 
        'image/webp', 
        'image/gif',
        'video/mp4', 
        'video/webm',
        'video/quicktime',
        'video/x-msvideo'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 14. Drop existing storage policies if they exist, then create new ones
DROP POLICY IF EXISTS "Public read access for incident media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload incident media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own incident media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own incident media" ON storage.objects;

-- 15. Create RLS policies for storage bucket
CREATE POLICY "Public read access for incident media" ON storage.objects
FOR SELECT USING (bucket_id = 'incident-media');

CREATE POLICY "Users can upload incident media" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'incident-media' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own incident media" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'incident-media' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own incident media" ON storage.objects
FOR DELETE USING (
    bucket_id = 'incident-media' 
    AND auth.role() = 'authenticated'
);

-- 16. Test the updated function
SELECT 
    'FUNCTION TEST' as info,
    COUNT(*) as total_incidents,
    COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as incidents_with_images
FROM get_incidents_with_user_info();

SELECT 
    'MEDIA SCHEMA UPDATE COMPLETE' as status,
    (SELECT COUNT(*) FROM incidents) as total_incidents,
    (SELECT COUNT(*) FROM media_attachments) as total_media_attachments;
