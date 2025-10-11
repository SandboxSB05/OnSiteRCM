-- =========================================================================
-- OnSite RCM - MVP Database Schema
-- =========================================================================
-- Purpose: Minimal viable schema for roofing contractor management
-- Auth: Supabase Auth (passwords handled by auth.users table)
-- Users: Public users table (profiles only, no passwords)
-- RLS: Row Level Security enabled for multi-tenant isolation
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- CORE TABLES
-- =========================================================================

-- -------------------------------------------------------------------------
-- Users Table (Profile data only - auth handled by Supabase Auth)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'contractor', 'client')),
  phone VARCHAR(50),
  avatar_url TEXT,
  payment_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles (passwords in auth.users)';
COMMENT ON COLUMN public.users.id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN public.users.role IS 'admin = full access, contractor = owns projects, client = read-only';

-- -------------------------------------------------------------------------
-- Projects Table
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name VARCHAR(255) NOT NULL,
  address TEXT,
  project_status VARCHAR(50) DEFAULT 'planning' CHECK (
    project_status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')
  ),
  project_budget DECIMAL(12, 2),
  owner_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.projects IS 'Roofing projects';
COMMENT ON COLUMN public.projects.owner_user_id IS 'Contractor who owns this project';
COMMENT ON COLUMN public.projects.project_status IS 'planning | in_progress | on_hold | completed | cancelled';

-- -------------------------------------------------------------------------
-- Daily Updates Table
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  update_date DATE NOT NULL,
  work_summary TEXT NOT NULL,
  materials_used TEXT,
  weather_conditions VARCHAR(100),
  hours_worked DECIMAL(5, 2),
  issues_encountered TEXT,
  ai_summary TEXT,
  sent_to_customer BOOLEAN DEFAULT false,
  author_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  created_date TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.daily_updates IS 'Daily progress updates from contractors';
COMMENT ON COLUMN public.daily_updates.photos IS 'Array of photo URLs';
COMMENT ON COLUMN public.daily_updates.videos IS 'Array of video URLs';
COMMENT ON COLUMN public.daily_updates.ai_summary IS 'AI-generated summary for client communication';

-- -------------------------------------------------------------------------
-- Client Updates Table (Financial updates sent to homeowners)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  update_date DATE NOT NULL,
  description TEXT NOT NULL,
  time_cost_labor DECIMAL(10, 2),
  time_cost_notes TEXT,
  additional_materials JSONB DEFAULT '[]',
  total_cost_to_date DECIMAL(12, 2),
  total_paid DECIMAL(12, 2),
  total_due DECIMAL(12, 2),
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  created_date TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.client_updates IS 'Professional financial updates sent to homeowners';
COMMENT ON COLUMN public.client_updates.additional_materials IS 'Array of {description, cost} objects';
COMMENT ON COLUMN public.client_updates.photos IS 'Array of photo URLs';

-- -------------------------------------------------------------------------
-- Update Threads Table (Comments on daily updates)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.update_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_update_id UUID NOT NULL REFERENCES public.daily_updates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.update_threads IS 'Comments/discussion threads on daily updates';

-- -------------------------------------------------------------------------
-- Project Collaborators Table (Multi-user projects)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

COMMENT ON TABLE public.project_collaborators IS 'Users who can access specific projects';
COMMENT ON COLUMN public.project_collaborators.role IS 'owner = full control, editor = can edit, viewer = read-only';

-- -------------------------------------------------------------------------
-- Costs Table (Track project expenses)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (
    category IN ('materials', 'labor', 'equipment', 'permits', 'other')
  ),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.costs IS 'Project expenses and costs';

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_company ON public.users(company);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_projects_owner ON public.projects(owner_user_id);
CREATE INDEX idx_projects_status ON public.projects(project_status);
CREATE INDEX idx_projects_created_date ON public.projects(created_date);

CREATE INDEX idx_daily_updates_project ON public.daily_updates(project_id);
CREATE INDEX idx_daily_updates_date ON public.daily_updates(update_date);
CREATE INDEX idx_daily_updates_author ON public.daily_updates(author_user_id);

CREATE INDEX idx_client_updates_project ON public.client_updates(project_id);
CREATE INDEX idx_client_updates_date ON public.client_updates(update_date);

CREATE INDEX idx_update_threads_update ON public.update_threads(daily_update_id);
CREATE INDEX idx_update_threads_user ON public.update_threads(user_id);

CREATE INDEX idx_collaborators_project ON public.project_collaborators(project_id);
CREATE INDEX idx_collaborators_user ON public.project_collaborators(user_id);

CREATE INDEX idx_costs_project ON public.costs(project_id);
CREATE INDEX idx_costs_date ON public.costs(date);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- Users Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -------------------------------------------------------------------------
-- Projects Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Project owners can update their projects"
  ON public.projects FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "Project owners can delete their projects"
  ON public.projects FOR DELETE
  USING (owner_user_id = auth.uid());

-- -------------------------------------------------------------------------
-- Daily Updates Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view updates for their projects"
  ON public.daily_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = daily_updates.project_id
      AND (
        owner_user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create updates for their projects"
  ON public.daily_updates FOR INSERT
  WITH CHECK (
    author_user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = daily_updates.project_id
      AND (
        owner_user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id
          AND user_id = auth.uid()
          AND role IN ('owner', 'editor')
        )
      )
    )
  );

CREATE POLICY "Update authors can update their updates"
  ON public.daily_updates FOR UPDATE
  USING (author_user_id = auth.uid());

CREATE POLICY "Update authors can delete their updates"
  ON public.daily_updates FOR DELETE
  USING (author_user_id = auth.uid());

-- -------------------------------------------------------------------------
-- Client Updates Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view client updates for their projects"
  ON public.client_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = client_updates.project_id
      AND (
        owner_user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create client updates for their projects"
  ON public.client_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = client_updates.project_id
      AND (
        owner_user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id
          AND user_id = auth.uid()
          AND role IN ('owner', 'editor')
        )
      )
    )
  );

-- -------------------------------------------------------------------------
-- Update Threads Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view threads for accessible updates"
  ON public.update_threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_updates du
      JOIN public.projects p ON p.id = du.project_id
      WHERE du.id = update_threads.daily_update_id
      AND (
        p.owner_user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = p.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create threads"
  ON public.update_threads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- -------------------------------------------------------------------------
-- Project Collaborators Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view collaborators for their projects"
  ON public.project_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_collaborators.project_id
      AND owner_user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Project owners can manage collaborators"
  ON public.project_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_collaborators.project_id
      AND owner_user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- Costs Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can view costs for their projects"
  ON public.costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = costs.project_id
      AND (
        owner_user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create costs for their projects"
  ON public.costs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = costs.project_id
      AND (
        owner_user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id
          AND user_id = auth.uid()
          AND role IN ('owner', 'editor')
        )
      )
    )
  );

-- =========================================================================
-- FUNCTIONS & TRIGGERS
-- =========================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- INITIAL DATA (Optional)
-- =========================================================================

-- Note: Users are created via /api/auth/register serverless function
-- This bypasses RLS using service role key

-- =========================================================================
-- SCHEMA COMPLETE
-- =========================================================================
-- Tables: 7 (users, projects, daily_updates, client_updates, update_threads, project_collaborators, costs)
-- Auth: Supabase Auth handles passwords, users table stores profiles
-- RLS: All tables protected with multi-tenant policies
-- Ready for MVP deployment
-- =========================================================================
