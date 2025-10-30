// Core Entity Types
export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: 'admin' | 'contractor' | 'client';
  phone?: string;
  avatar_url?: string;
  last_login?: string;
  created_date: string;
  updated_date?: string;
  payment_verified: boolean;
}

export interface Project {
  id: string;
  project_name: string;
  project_type: ProjectType;
  project_status: ProjectStatus;
  
  // Client Information
  client_name: string;
  client_email?: string;
  client_phone?: string;
  
  // Address (structured)
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code?: string;
  
  // Financial
  estimated_subtotal?: number;
  square_footage?: number;
  
  // Dates
  estimated_start_date?: string;
  actual_start_date?: string;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  
  // Project Management
  project_manager?: string;
  owner_user_id: string;
  
  // Metadata
  created_date: string;
  updated_date?: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export type ProjectType = 'residential_replacement' | 'residential_repair' | 'commercial_replacement' | 'commercial_repair' | 'new_construction';

export interface DailyUpdate {
  id: string;
  project_id: string;
  update_date: string;
  work_description: string;
  ai_summary?: string;
  photos: string[];
  author_user_id: string;
  created_date: string;
  updated_date?: string;
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

export interface Cost {
  id: string;
  project_id: string;
  category: CostCategory;
  description: string;
  amount: number;
  isExpected: boolean;
  date: string;
  created_date: string;
  updated_date?: string;
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
