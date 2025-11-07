-- Create View for Projects (Updated for New Schema)
-- Run this in your Supabase SQL Editor
-- Date: November 6, 2025

-- =========================================================================
-- CREATE VIEW: projects_with_clients
-- Note: In the current schema, client info is stored directly in projects table
-- This view is created for compatibility with existing code
-- =========================================================================

CREATE OR REPLACE VIEW projects_with_clients AS
SELECT * FROM projects;

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
