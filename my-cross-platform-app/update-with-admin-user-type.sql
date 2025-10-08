-- Update Database with Admin User Type
-- Run this in your Supabase SQL editor to add admin user type

-- 1. Add admin to user_type enum
DO $$ BEGIN
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'admin';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update the posting privilege function to handle admin
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
        WHEN 'admin' THEN RETURN 'admin';
        ELSE RETURN 'moderated';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 3. Update verification functions to only allow admin users
CREATE OR REPLACE FUNCTION mark_incident_verified(incident_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile profiles%ROWTYPE;
BEGIN
    -- Check if the current user is an admin
    SELECT * INTO user_profile 
    FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Only admin users can verify incidents';
    END IF;
    
    -- Update the incident as verified
    UPDATE incidents 
    SET 
        is_verified = true,
        updated_at = NOW()
    WHERE id = incident_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_incident_unverified(incident_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile profiles%ROWTYPE;
BEGIN
    -- Check if the current user is an admin
    SELECT * INTO user_profile 
    FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Only admin users can unverify incidents';
    END IF;
    
    -- Update the incident as unverified
    UPDATE incidents 
    SET 
        is_verified = false,
        updated_at = NOW()
    WHERE id = incident_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions for admin functions
GRANT EXECUTE ON FUNCTION mark_incident_verified(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_incident_unverified(UUID) TO authenticated;

-- 5. Create a sample admin user (replace with actual admin details)
-- Note: This should be done manually through Supabase Auth
-- INSERT INTO profiles (
--     id,
--     full_name,
--     username,
--     email,
--     user_type,
--     verification_status,
--     posting_privilege
-- ) VALUES (
--     'admin-user-uuid-here',
--     'System Administrator',
--     'admin',
--     'admin@urbanshield.com',
--     'admin',
--     'verified',
--     'admin'
-- );

-- 6. Verify the update worked
SELECT 
    'Admin User Type Added Successfully' as status,
    (SELECT COUNT(*) FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_type')) as admin_enum_exists;




