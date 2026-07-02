# Supabase Setup Guide

This guide will walk you through setting up your Supabase database schema and configuring your React Native / Expo application to connect to your Supabase instance.

---

## Step 1: Initialize Database Schema in Supabase

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and log in.
2. Select your project. If you don't have one, click **New Project** and configure the database details.
3. In the left-hand navigation sidebar, click on **SQL Editor** (represented by a `sql` terminal icon).
4. Click **New Query** (or select **Blank Query**).
5. Copy the entire contents of [supabase_schema.sql](file:///c:/Users/User/grind/supabase_schema.sql) from your workspace and paste them into the SQL Editor.
6. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`) at the bottom right.
7. You should see a success message: `Success. No rows returned`.

---

## Step 2: Verify Table Creation

1. In the left navigation sidebar, click on **Table Editor** (represented by a grid/table icon).
2. Ensure you see the following tables under the `public` schema:
   * `profiles`: Should contain columns `id`, `username`, `role`, `subscription_plan`, and `created_at`.
   * `user_states`: Should contain columns `user_id`, `state_json`, and `updated_at`.
3. In the left sidebar, click on **Database** -> **Triggers**.
4. Confirm that the `on_auth_user_created` trigger is listed under the `public` schema, pointing to table `auth.users` and function `public.handle_new_user`.

---

## Step 3: Configure Environment Variables

For the Expo development server to correctly parse your Supabase credentials, the environment variables must be prefixed with `EXPO_PUBLIC_`.

1. Open the [.env](file:///c:/Users/User/grind/.env) file in the root of your project.
2. Add or update the following credentials:
   ```env
   # Supabase Project Connection Details
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-public-key
   
   # External Backend API URL (for Admin controls if hosted)
   EXPO_PUBLIC_BACKEND_URL=https://grind-production-a2ac.up.railway.app
   ```
3. Restart your Expo development server if it was already running so it picks up the new environment variables:
   ```bash
   npx expo start -c
   ```

---

## Step 4: Verification of Database Sync

1. Run the application and navigate to the Auth flow (Sign Up / Sign In).
2. Create a new user account with a test email and password.
3. Log into your Supabase Dashboard, go to **Authentication** -> **Users**, and verify the user is successfully created.
4. Go to **Table Editor** -> **profiles** and confirm that a matching profile record was automatically seeded by the trigger with `subscription_plan: 'free'` and `role: 'user'`.
5. Perform some actions in the app (e.g. increase your water intake, log workout reps, complete tasks).
6. Go to **Table Editor** -> **user_states** and confirm that the `state_json` column has been populated and is periodically updating with your local state progress.
