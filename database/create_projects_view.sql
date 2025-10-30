-- Create View with JOIN to get Client Information from Users Table
-- Run this in your Supabase SQL Editor
-- Date: October 17, 2025

-- =========================================================================
-- CREATE VIEW: projects_with_clients
-- Joins projects table with users table to include client information
-- =========================================================================

CREATE OR REPLACE VIEW projects_with_clients AS
SELECT 
  p.*,
  -- Client information from users table
  u.name AS client_name,
  u.email AS client_email,
  u.phone AS client_phone
FROM projects p
LEFT JOIN users u ON p.client_id = u.id;

-- =========================================================================
-- GRANT SELECT PERMISSION
-- =========================================================================

-- Allow authenticated users to query the view
GRANT SELECT ON projects_with_clients TO authenticated;

-- =========================================================================
-- RLS POLICIES FOR THE VIEW
-- =========================================================================

-- Enable RLS on the view
ALTER VIEW projects_with_clients SET (security_invoker = true);

-- Note: The view will use the RLS policies from the underlying tables (projects and users)
-- This means users will only see projects they have permission to see

-- =========================================================================
-- VERIFICATION
-- =========================================================================

-- Test the view with a sample query:
-- SELECT id, project_name, client_name, client_email FROM projects_with_clients LIMIT 5;
