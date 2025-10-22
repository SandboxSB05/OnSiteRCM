-- OnSite RCM Database Schema
-- Standardized schema for production implementation
-- Date: October 15, 2025


-- =========================================================================
-- USERS TABLE
-- =========================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'contractor', 'client')),
  phone VARCHAR(50),
  avatar_url VARCHAR(255),
  last_login TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  payment_verified BOOLEAN DEFAULT FALSE
);

-- =========================================================================
-- PROJECTS TABLE
-- =========================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  client_id UUID REFERENCES users(id),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20),
  estimated_subtotal DECIMAL(10, 2),
  square_footage DECIMAL(10, 2),
  estimated_start_date DATE,
  actual_start_date DATE,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- DAILY UPDATES TABLE
-- =========================================================================
CREATE TABLE daily_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id UUID REFERENCES users(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  update_date DATE NOT NULL,
  work_description TEXT NOT NULL,
  ai_summary TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);


-- =========================================================================
-- COSTS TABLE
-- =========================================================================
CREATE TABLE costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('materials', 'labor', 'equipment', 'permits', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  isExpected BOOLEAN DEFAULT TRUE,
  date DATE NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company ON users(company);

-- Projects indexes
CREATE INDEX idx_projects_owner ON projects(project_owner_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_city ON projects(city);
CREATE INDEX idx_projects_state ON projects(state);
CREATE INDEX idx_projects_zip ON projects(zip_code);
CREATE INDEX idx_projects_start_date ON projects(estimated_start_date);
CREATE INDEX idx_projects_completion_date ON projects(estimated_completion_date);
CREATE INDEX idx_projects_created_date ON projects(created_date);

-- Daily Updates indexes
CREATE INDEX idx_daily_updates_project ON daily_updates(project_id);
CREATE INDEX idx_daily_updates_author ON daily_updates(author_user_id);
CREATE INDEX idx_daily_updates_date ON daily_updates(update_date);
CREATE INDEX idx_daily_updates_created ON daily_updates(created_date);

-- Costs indexes
CREATE INDEX idx_costs_project ON costs(project_id);
CREATE INDEX idx_costs_category ON costs(category);
CREATE INDEX idx_costs_date ON costs(date);
CREATE INDEX idx_costs_expected ON costs(isExpected);
CREATE INDEX idx_costs_created ON costs(created_date);

-- Composite indexes for common queries
CREATE INDEX idx_projects_owner_status ON projects(project_owner_id, project_status);
CREATE INDEX idx_daily_updates_project_date ON daily_updates(project_id, update_date DESC);
CREATE INDEX idx_costs_project_category ON costs(project_id, category);
CREATE INDEX idx_costs_project_date ON costs(project_id, date DESC);


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- USERS TABLE POLICIES
-- =========================================================================

Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Contractors can view client users (needed for project client selection)
CREATE POLICY "Contractors can view client users"
  ON users FOR SELECT
  USING (
    role = 'client' AND get_user_role(auth.uid()) IN ('contractor', 'admin')
  );

-- =========================================================================
-- PROJECTS TABLE POLICIES
-- =========================================================================

-- Users can view their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = project_owner_id);

-- Clients can view projects they are assigned to
CREATE POLICY "Clients can view assigned projects"
  ON projects FOR SELECT
  USING (auth.uid() = client_id);

-- Users can insert their own projects
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = project_owner_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = project_owner_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = project_owner_id);

-- Admins can view all projects
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =========================================================================
-- DAILY UPDATES TABLE POLICIES
-- =========================================================================

-- Users can view updates for their projects
CREATE POLICY "Users can view updates for own projects"
  ON daily_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = daily_updates.project_id
      AND projects.project_owner_id = auth.uid()
    )
  );

-- Clients can view updates for their assigned projects
CREATE POLICY "Clients can view updates for assigned projects"
  ON daily_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = daily_updates.project_id
      AND projects.client_id = auth.uid()
    )
  );

-- Users can create updates for their projects
CREATE POLICY "Users can create updates for own projects"
  ON daily_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.project_owner_id = auth.uid()
    )
  );

-- Users can update their own updates
CREATE POLICY "Users can update own updates"
  ON daily_updates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = daily_updates.project_id
      AND projects.project_owner_id = auth.uid()
    )
  );


-- Users can delete updates for their projects
CREATE POLICY "Users can delete own updates"
  ON daily_updates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = daily_updates.project_id
      AND projects.project_owner_id = auth.uid()
    )
  );

-- =========================================================================
-- COSTS TABLE POLICIES
-- =========================================================================-- Users can view costs for their projects
CREATE POLICY "Users can view costs for own projects"
  ON costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = costs.project_id
      AND projects.project_owner_id = auth.uid()
    )
  );

-- Clients can view costs for their assigned projects
CREATE POLICY "Clients can view costs for assigned projects"
  ON costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = costs.project_id
      AND projects.client_id = auth.uid()
    )
  );

-- Users can create costs for their projects
CREATE POLICY "Users can create costs"
  ON costs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.project_owner_id = auth.uid()
    )
  );

-- Users can update costs for their projects
CREATE POLICY "Users can update costs"
  ON costs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = costs.project_id
      AND projects.project_owner_id = auth.uid()
    )
  );

-- Users can delete costs for their projects
CREATE POLICY "Users can delete costs"
  ON costs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = costs.project_id
      AND projects.project_owner_id = auth.uid()
    )
  );
