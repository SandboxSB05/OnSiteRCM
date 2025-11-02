-- OnSite RCM Database Schema for Supabase
-- Optimized for Supabase PostgreSQL
-- Date: October 15, 2025

-- Note: UUID extension is already enabled in Supabase by default
-- No need to enable it again

-- =========================================================================
-- USER PROFILES TABLE
-- Links to Supabase auth.users table
-- =========================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'contractor', 'client')),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'contractor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
  
  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  
  -- Address (structured for better querying and mapping)
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20),
  
  -- Financial Information
  estimated_subtotal DECIMAL(10, 2),
  square_footage DECIMAL(10, 2),
  
  -- Date Tracking
  estimated_start_date DATE,
  actual_start_date DATE,
  estimated_end_date DATE,
  actual_completion_date DATE,
  
  -- Project Management
  project_manager VARCHAR(255),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadata
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Admins can view all projects
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =========================================================================
-- DAILY UPDATES TABLE
-- =========================================================================
CREATE TABLE daily_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  update_date DATE NOT NULL
  work_description TEXT NOT NULL,
  ai_summary TEXT,
  created_by VARCHAR(255), -- Email of creator
  photos JSONB DEFAULT '[]'::jsonb,
  project_phase_worked_on VARCHAR(100),
  project_phase_progress INTEGER CHECK (project_phase_progress BETWEEN 0 AND 100),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for daily_updates
ALTER TABLE daily_updates ENABLE ROW LEVEL SECURITY;

-- Daily updates policies
CREATE POLICY "Users can view updates for their projects"
  ON daily_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = daily_updates.project_id
      AND projects.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create updates for their projects"
  ON daily_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.owner_user_id = auth.uid()
    )
  );
-- =========================================================================
-- PROJECT COLLABORATORS TABLE
-- =========================================================================
CREATE TABLE project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- COSTS TABLE
-- =========================================================================
CREATE TABLE costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('materials', 'labor', 'equipment', 'permits', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view costs for their projects"
  ON costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = costs.project_id
      AND projects.owner_user_id = auth.uid()
    )
  );

-- =========================================================================
-- PROJECT CONTACTS TABLE
-- =========================================================================
CREATE TABLE project_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- ROOFING MATERIALS TABLE
-- =========================================================================
CREATE TABLE roofing_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('shingles', 'underlayment', 'flashing', 'fasteners', 'sealant', 'other')),
  unit VARCHAR(50) NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  supplier VARCHAR(255),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE roofing_materials ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- UPDATE THREADS TABLE (Comments on Daily Updates)
-- =========================================================================
CREATE TABLE update_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_update_id UUID NOT NULL REFERENCES daily_updates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE update_threads ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================

-- Projects indexes
CREATE INDEX idx_projects_owner ON projects(owner_user_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_city ON projects(city);
CREATE INDEX idx_projects_state ON projects(state);
CREATE INDEX idx_projects_client_email ON projects(client_email);

-- Daily Updates indexes
CREATE INDEX idx_daily_updates_project ON daily_updates(project_id);
CREATE INDEX idx_daily_updates_date ON daily_updates(update_date);
CREATE INDEX idx_daily_updates_author ON daily_updates(author_user_id);

-- Client Updates indexes
CREATE INDEX idx_client_updates_project ON client_updates(project_id);
CREATE INDEX idx_client_updates_date ON client_updates(update_date);

-- Collaborators indexes
CREATE INDEX idx_collaborators_project ON project_collaborators(project_id);
CREATE INDEX idx_collaborators_user ON project_collaborators(user_id);

-- Costs indexes
CREATE INDEX idx_costs_project ON costs(project_id);
CREATE INDEX idx_costs_date ON costs(date);

-- Contacts indexes
CREATE INDEX idx_contacts_project ON project_contacts(project_id);

-- Update Threads indexes
CREATE INDEX idx_threads_daily_update ON update_threads(daily_update_id);
CREATE INDEX idx_threads_user ON update_threads(user_id);

-- =========================================================================
-- TRIGGERS FOR UPDATED_DATE
-- =========================================================================

-- Function to update updated_date timestamp
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_profiles_updated_date BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();

CREATE TRIGGER update_projects_updated_date BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();

CREATE TRIGGER update_daily_updates_updated_date BEFORE UPDATE ON daily_updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();

CREATE TRIGGER update_client_updates_updated_date BEFORE UPDATE ON client_updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();

CREATE TRIGGER update_costs_updated_date BEFORE UPDATE ON costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();

CREATE TRIGGER update_materials_updated_date BEFORE UPDATE ON roofing_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
