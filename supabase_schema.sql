-- ============================================================================
-- SUPABASE DATABASE INITIALIZATION SCHEMA
-- ============================================================================
-- This script sets up the database schema, security policies, triggers, 
-- and functions required for the Grind App.
-- 
-- Apply this script in your Supabase Console -> SQL Editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tables Creation
-- ----------------------------------------------------------------------------

-- Public User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    subscription_plan TEXT NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Application States (Synchronized JSON payload)
CREATE TABLE IF NOT EXISTS public.user_states (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    state_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. Row Level Security (RLS) Configuration
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_states ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Security Helper Functions
-- ----------------------------------------------------------------------------

-- Check if the requesting user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 4. RLS Policies for `profiles` Table
-- ----------------------------------------------------------------------------

-- Allow authenticated users to view profiles (needed for the leaderboard)
CREATE POLICY "Allow authenticated users to read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile username
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Full access for admins
CREATE POLICY "Allow admins all access to profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. RLS Policies for `user_states` Table
-- ----------------------------------------------------------------------------

-- Allow authenticated users to read states (needed to pull state data for the leaderboard)
CREATE POLICY "Allow authenticated users to read user states"
ON public.user_states
FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert their own state
CREATE POLICY "Allow users to insert their own state"
ON public.user_states
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own state
CREATE POLICY "Allow users to update their own state"
ON public.user_states
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Full access for admins
CREATE POLICY "Allow admins all access to user_states"
ON public.user_states
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. Trigger: Auto-Create Profile on Signup
-- ----------------------------------------------------------------------------

-- Function to handle creating a new user profile record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, role, subscription_plan)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username', 
            SPLIT_PART(NEW.email, '@', 1), 
            'Athlete'
        ),
        'user',
        'free'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire after auth.users inserts a new account
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
