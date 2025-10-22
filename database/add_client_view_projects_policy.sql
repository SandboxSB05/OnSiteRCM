-- Migration: Allow clients to view projects they are assigned to
-- This policy allows users with role='client' to view projects where they are the client
-- Also allows clients to view daily updates and costs for their assigned projects

-- Add policy for clients to view their assigned projects
CREATE POLICY "Clients can view assigned projects"
  ON projects FOR SELECT
  USING (auth.uid() = client_id);

-- Add policy for clients to view daily updates for their assigned projects
CREATE POLICY "Clients can view updates for assigned projects"
  ON daily_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = daily_updates.project_id
      AND projects.client_id = auth.uid()
    )
  );

-- Add policy for clients to view costs for their assigned projects
CREATE POLICY "Clients can view costs for assigned projects"
  ON costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = costs.project_id
      AND projects.client_id = auth.uid()
    )
  );
