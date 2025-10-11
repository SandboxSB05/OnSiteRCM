// Core Entity Types
export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'contractor' | 'client';
  created_date: string;
}

export interface Project {
  id: string;
  project_name: string;
  address?: string;
  project_status: ProjectStatus;
  project_budget?: number;
  owner_user_id: string;
  client_name?: string;
  client_email?: string;
  start_date: string;
  actual_completion_date?: string;
  created_date: string;
  updated_date?: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface DailyUpdate {
  id: string;
  project_id: string;
  update_date: string;
  work_summary: string;
  materials_used?: string;
  weather_conditions?: string;
  hours_worked?: number;
  issues_encountered?: string;
  ai_summary?: string;
  sent_to_customer: boolean;
  author_user_id: string;
  created_by: string;
  photos: string[];
  videos?: string[];
  created_date: string;
}

export interface ClientUpdate {
  id: string;
  project_id: string;
  update_date: string;
  description: string;
  time_cost_labor?: number;
  time_cost_notes?: string;
  additional_materials?: AdditionalMaterial[];
  total_cost_to_date?: number;
  total_paid?: number;
  total_due?: number;
  photos: string[];
  videos?: string[];
  created_date: string;
}

export interface AdditionalMaterial {
  name: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
}

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: CollaboratorRole;
  created_date: string;
}

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';

export interface Cost {
  id: string;
  project_id: string;
  category: CostCategory;
  description: string;
  amount: number;
  date: string;
  created_date: string;
}

export type CostCategory = 'materials' | 'labor' | 'equipment' | 'permits' | 'other';

export interface ProjectContact {
  id: string;
  project_id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  created_date: string;
}

export interface RoofingMaterial {
  id: string;
  name: string;
  type: MaterialType;
  unit: string;
  unit_cost: number;
  supplier?: string;
  created_date: string;
}

export type MaterialType = 'shingles' | 'underlayment' | 'flashing' | 'fasteners' | 'sealant' | 'other';

export interface UpdateThread {
  id: string;
  daily_update_id: string;
  user_id: string;
  message: string;
  created_date: string;
}

// API Response Types
export interface ListResponse<T> {
  data: T[];
  total?: number;
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  orderBy?: string;
  limit?: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthUser extends User {
  token?: string;
}

// Email Template Types
export interface EmailTemplate {
  subject: string;
  body: string;
}
