-- Migration: Allow contractors to view client users
-- This policy allows contractors and admins to view users with role='client'
-- so they can select clients when creating projects

-- Note: We use the existing get_user_role() SECURITY DEFINER function
-- to avoid infinite recursion in the RLS policy

-- Add policy for contractors/admins to view clients
CREATE POLICY "Contractors can view client users"
  ON users FOR SELECT
  USING (
    -- Allow viewing clients if the current user is a contractor or admin
    role = 'client' AND get_user_role(auth.uid()) IN ('contractor', 'admin')
  );
