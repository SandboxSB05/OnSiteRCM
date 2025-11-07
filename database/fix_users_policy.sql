-- Fix for login error: Remove infinite recursion in users table policies
-- This resolves the circular dependency issue caused by multiple conflicting policies

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS users_view_own ON users;
DROP POLICY IF EXISTS users_admin_all ON users;
DROP POLICY IF EXISTS users_contractor_view ON users;
DROP POLICY IF EXISTS users_crew_lead_view ON users;
DROP POLICY IF EXISTS users_update_own ON users;

-- Create simple, non-recursive policies

-- Any authenticated user can view their own record (PRIMARY POLICY)
CREATE POLICY users_view_own ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own record
CREATE POLICY users_update_own ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
