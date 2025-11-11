

-- =========================================================================
-- USERS TABLE
-- =========================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'contractor', 'crew_lead')),
  phone VARCHAR(50),
  last_login TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================================
-- Contractor TABLE
-- =========================================================================

  CREATE TABLE public.contractors(
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT,
    verified BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT DEFAULT 'basic',
    address TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
  )

  -- =========================================================================
-- CREW LEADS TABLE
-- =========================================================================

  CREATE TABLE crew_leads (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
  invite_token UUID UNIQUE, -- used in email invite link
  invited_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================================
-- PROJECTS TABLE
-- =========================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  project_name VARCHAR(255) NOT NULL,
  project_type VARCHAR(50) NOT NULL CHECK (project_type IN (
    'residential_replacement',
    'residential_repair',
    'commercial_replacement',
    'commercial_repair',
    'new_construction'
  )),
  project_status VARCHAR(50) NOT NULL DEFAULT 'planning' CHECK (project_status IN (
    'planning',
    'in_progress',
    'on_hold',
    'completed',
    'cancelled'
  )),
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text,
  square_footage numeric,
  estimated_start_date DATE,
  actual_start_date DATE,
  estimated_end_date DATE,
  actual_completion_date DATE,
  crew_lead_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- DAILY UPDATES TABLE
-- =========================================================================
CREATE TABLE daily_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by text, -- name of the crew_lead
  update_date DATE NOT NULL
  work_description TEXT NOT NULL,
  ai_summary TEXT,
  project_phase_worked_on VARCHAR(100),
  project_phase_progress INTEGER CHECK (project_phase_progress BETWEEN 0 AND 100),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- PHOTOS TABLE
-- =========================================================================

CREATE TABLE update_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_update_id UUID NOT NULL REFERENCES daily_updates(id) ON DELETE CASCADE,
  storage_bucket TEXT NOT NULL DEFAULT 'onsite-photos',
  storage_path TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- PROJECT CHECK-INS TABLE
-- =========================================================================

CREATE TABLE project_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  crew_lead_id UUID REFERENCES crew_leads(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP DEFAULT NOW(),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================================
-- TRIGGERS
-- =========================================================================

-- Function to auto-update updated_date timestamp
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_date trigger to all relevant tables
CREATE TRIGGER update_users_updated_date
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_date_column();

CREATE TRIGGER update_contractors_updated_date
  BEFORE UPDATE ON contractors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_date_column();

CREATE TRIGGER update_crew_leads_updated_date
  BEFORE UPDATE ON crew_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_date_column();

CREATE TRIGGER update_projects_updated_date
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_date_column();

CREATE TRIGGER update_daily_updates_updated_date
  BEFORE UPDATE ON daily_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_date_column();

-- Function to validate crew lead assignment
CREATE OR REPLACE FUNCTION validate_crew_lead_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.crew_lead_id IS NOT NULL THEN
    -- Check if crew lead exists and is active
    IF NOT EXISTS (
      SELECT 1 FROM crew_leads
      WHERE id = NEW.crew_lead_id
      AND status = 'active'
      AND contractor_id = NEW.contractor_id
    ) THEN
      RAISE EXCEPTION 'Crew lead must be active and belong to the same contractor';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_crew_lead_on_project
  BEFORE INSERT OR UPDATE OF crew_lead_id ON projects
  FOR EACH ROW
  EXECUTE FUNCTION validate_crew_lead_assignment();

-- Function to auto-update project status based on dates
CREATE OR REPLACE FUNCTION auto_update_project_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If actual_completion_date is set, mark as completed
  IF NEW.actual_completion_date IS NOT NULL AND OLD.actual_completion_date IS NULL THEN
    NEW.project_status = 'completed';
  -- If actual_start_date is set and status is planning, mark as in_progress
  ELSIF NEW.actual_start_date IS NOT NULL AND OLD.actual_start_date IS NULL AND OLD.project_status = 'planning' THEN
    NEW.project_status = 'in_progress';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_status_on_dates
  BEFORE UPDATE OF actual_start_date, actual_completion_date ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_project_status();

-- =========================================================================
-- INDEXES
-- =========================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Contractors indexes
CREATE INDEX idx_contractors_verified ON contractors(verified);
CREATE INDEX idx_contractors_subscription ON contractors(subscription_tier);

-- Crew leads indexes
CREATE INDEX idx_crew_leads_contractor ON crew_leads(contractor_id);
CREATE INDEX idx_crew_leads_status ON crew_leads(status);
CREATE INDEX idx_crew_leads_invite_token ON crew_leads(invite_token);

-- Projects indexes
CREATE INDEX idx_projects_contractor ON projects(contractor_id);
CREATE INDEX idx_projects_crew_lead ON projects(crew_lead_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_dates ON projects(estimated_start_date, estimated_end_date);
CREATE INDEX idx_projects_location ON projects(city, state, zip_code);

-- Daily updates indexes
CREATE INDEX idx_daily_updates_project ON daily_updates(project_id);
CREATE INDEX idx_daily_updates_date ON daily_updates(update_date);
CREATE INDEX idx_daily_updates_project_date ON daily_updates(project_id, update_date DESC);

-- Photos indexes
CREATE INDEX idx_update_photos_daily_update ON update_photos(daily_update_id);
CREATE INDEX idx_update_photos_uploaded_by ON update_photos(uploaded_by);

-- Check-ins indexes
CREATE INDEX idx_check_ins_project ON project_check_ins(project_id);
CREATE INDEX idx_check_ins_crew_lead ON project_check_ins(crew_lead_id);
CREATE INDEX idx_check_ins_contractor ON project_check_ins(contractor_id);
CREATE INDEX idx_check_ins_time ON project_check_ins(check_in_time DESC);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_check_ins ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- USERS TABLE POLICIES
-- =========================================================================

-- Any authenticated user can view their own record
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

-- =========================================================================
-- CONTRACTORS TABLE POLICIES
-- =========================================================================

-- Admins can see all contractors
CREATE POLICY contractors_admin_all ON contractors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Contractors can see and update their own record
CREATE POLICY contractors_own_record ON contractors
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =========================================================================
-- CREW LEADS TABLE POLICIES
-- =========================================================================

-- Admins can see all crew leads
CREATE POLICY crew_leads_admin_all ON crew_leads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Contractors can manage their own crew leads
CREATE POLICY crew_leads_contractor_manage ON crew_leads
  FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());

-- Crew leads can see and update their own record
CREATE POLICY crew_leads_own_record ON crew_leads
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY crew_leads_update_own ON crew_leads
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =========================================================================
-- PROJECTS TABLE POLICIES
-- =========================================================================

-- Admins can see all projects
CREATE POLICY projects_admin_all ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Contractors can manage their own projects
CREATE POLICY projects_contractor_manage ON projects
  FOR ALL
  TO authenticated
  USING (contractor_id = auth.uid())
  WITH CHECK (contractor_id = auth.uid());

-- Crew leads can view projects they're assigned to
CREATE POLICY projects_crew_lead_view ON projects
  FOR SELECT
  TO authenticated
  USING (
    crew_lead_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM crew_leads cl
      WHERE cl.id = auth.uid()
      AND projects.crew_lead_id = cl.id
    )
  );

-- Crew leads can update projects they're assigned to (limited fields)
CREATE POLICY projects_crew_lead_update ON projects
  FOR UPDATE
  TO authenticated
  USING (crew_lead_id = auth.uid())
  WITH CHECK (crew_lead_id = auth.uid());

-- =========================================================================
-- DAILY UPDATES TABLE POLICIES
-- =========================================================================

-- Admins can see all updates
CREATE POLICY daily_updates_admin_all ON daily_updates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Contractors can see all updates for their projects
CREATE POLICY daily_updates_contractor_view ON daily_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_updates.project_id
      AND p.contractor_id = auth.uid()
    )
  );

-- Crew leads can view updates for their assigned projects
CREATE POLICY daily_updates_crew_lead_view ON daily_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_updates.project_id
      AND p.crew_lead_id = auth.uid()
    )
  );

-- Crew leads can create updates for their assigned projects
CREATE POLICY daily_updates_crew_lead_create ON daily_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_updates.project_id
      AND p.crew_lead_id = auth.uid()
    )
  );

-- Crew leads can update their own updates
CREATE POLICY daily_updates_crew_lead_update ON daily_updates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_updates.project_id
      AND p.crew_lead_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_updates.project_id
      AND p.crew_lead_id = auth.uid()
    )
  );

-- Contractors can update updates for their projects
CREATE POLICY daily_updates_contractor_update ON daily_updates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_updates.project_id
      AND p.contractor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_updates.project_id
      AND p.contractor_id = auth.uid()
    )
  );

-- =========================================================================
-- UPDATE PHOTOS TABLE POLICIES
-- =========================================================================

-- Admins can see all photos
CREATE POLICY update_photos_admin_all ON update_photos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Users can see photos for updates they have access to
CREATE POLICY update_photos_view ON update_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_updates du
      JOIN projects p ON p.id = du.project_id
      WHERE du.id = update_photos.daily_update_id
      AND (p.contractor_id = auth.uid() OR p.crew_lead_id = auth.uid())
    )
  );

-- Crew leads can upload photos to their project updates
CREATE POLICY update_photos_crew_lead_create ON update_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_updates du
      JOIN projects p ON p.id = du.project_id
      WHERE du.id = update_photos.daily_update_id
      AND p.crew_lead_id = auth.uid()
    )
  );

-- Users can delete photos they uploaded
CREATE POLICY update_photos_delete_own ON update_photos
  FOR DELETE
  TO authenticated
  USING (
    uploaded_by = (SELECT name FROM users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM daily_updates du
      JOIN projects p ON p.id = du.project_id
      WHERE du.id = update_photos.daily_update_id
      AND (p.contractor_id = auth.uid() OR p.crew_lead_id = auth.uid())
    )
  );

-- =========================================================================
-- PROJECT CHECK-INS TABLE POLICIES
-- =========================================================================

-- Admins can see all check-ins
CREATE POLICY check_ins_admin_all ON project_check_ins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Contractors can see all check-ins for their projects
CREATE POLICY check_ins_contractor_view ON project_check_ins
  FOR SELECT
  TO authenticated
  USING (
    contractor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_check_ins.project_id
      AND p.contractor_id = auth.uid()
    )
  );

-- Crew leads can see their own check-ins
CREATE POLICY check_ins_crew_lead_view ON project_check_ins
  FOR SELECT
  TO authenticated
  USING (crew_lead_id = auth.uid());

-- Crew leads can create check-ins for their assigned projects
CREATE POLICY check_ins_crew_lead_create ON project_check_ins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    crew_lead_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_check_ins.project_id
      AND p.crew_lead_id = auth.uid()
    )
  );
