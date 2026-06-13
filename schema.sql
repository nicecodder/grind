-- SQL SCHEMA FOR GRIND SUPABASE INTEGRATION
-- Copy and paste this script directly into your Supabase project's SQL Editor (https://supabase.com)

-- 1. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user states table (stores habit progress, XP, tasks)
CREATE TABLE IF NOT EXISTS public.user_states (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  state_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (optional, for direct frontend access, but since we use server.js as a proxy, 
-- we will use the Service Role Key which bypasses RLS).
-- If you want to enable direct access:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_states ENABLE ROW LEVEL SECURITY;

-- 3. Security Hardening (Fixes Supabase Security Advisor warnings)
-- Revoke execution from PUBLIC, anon, and authenticated roles for security definer functions
-- to prevent unauthorized users from executing them via the REST API.
-- Run this in your Supabase SQL Editor:
-- REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

