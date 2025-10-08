-- Simple update to add new user types to existing enum
-- Run this if you get the "type already exists" error

-- Add new values to existing user_type enum
DO $$ BEGIN
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'parent';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'resident';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'business';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'government';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'tourist';
    ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'guest';
EXCEPTION
    WHEN undefined_object THEN 
        -- If user_type doesn't exist, create it
        CREATE TYPE user_type AS ENUM ('parent', 'resident', 'business', 'government', 'tourist', 'guest');
END $$;

-- Create other required types if they don't exist
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







