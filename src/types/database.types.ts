/**
 * Database Table Types
 * These interfaces match the database schema exactly
 * Generated from: database/schema.sql
 * Date: October 15, 2025
 */

// =========================================================================
// ENUMS
// =========================================================================

export type UserRole = 'admin' | 'contractor' | 'client';

export type ProjectType = 
  | 'residential_replacement'
  | 'residential_repair'
  | 'commercial_replacement'
  | 'commercial_repair'
  | 'new_construction';

export type ProjectStatus = 
  | 'planning'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';

export type CostCategory = 
  | 'materials'
  | 'labor'
  | 'equipment'
  | 'permits'
  | 'other';

export type MaterialType = 
  | 'shingles'
  | 'underlayment'
  | 'flashing'
  | 'fasteners'
  | 'sealant'
  | 'other';

// =========================================================================
// DATABASE TABLE INTERFACES
// =========================================================================

export interface DbUser {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_date: string;
  updated_date: string;
}

export interface DbProject {
  id: string;
  
  // Basic Information
  project_name: string;
  project_type: ProjectType;
  project_status: ProjectStatus;
  
  // Client Information
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  
  // Address
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  
  // Financial
  estimated_budget: number | null;
  square_footage: number | null;
  
  // Dates
  estimated_start_date: string | null;  // ISO date string
  actual_start_date: string | null;
  estimated_end_date: string | null;
  actual_completion_date: string | null;
  
  // Project Management
  project_manager: string | null;
  owner_user_id: string;

  // Progress tracking
  project_progress: Record<string, any> | null;
  
  // Metadata
  created_date: string;  // ISO timestamp
  updated_date: string;
}

export interface DbDailyUpdate {
  id: string;
  project_id: string;
  update_date: string;  // ISO date string
  work_summary: string;
  materials_used: string | null;
  weather_conditions: string | null;
  hours_worked: number | null;
  issues_encountered: string | null;
  ai_summary: string | null;
  sent_to_customer: boolean;
  author_user_id: string | null;
  created_by: string;
  photos: string[];  // JSONB array
  videos: string[];  // JSONB array
  created_date: string;
  updated_date: string;
}

export interface DbClientUpdate {
  id: string;
  project_id: string;
  update_date: string;
  description: string;
  time_cost_labor: number;
  time_cost_notes: string | null;
  additional_materials: AdditionalMaterial[];  // JSONB array
  total_cost_to_date: number;
  total_paid: number;
  total_due: number;
  photos: string[];
  videos: string[];
  created_date: string;
  updated_date: string;
}

export interface AdditionalMaterial {
  name: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
}

export interface DbProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: CollaboratorRole;
  created_date: string;
}

export interface DbCost {
  id: string;
  project_id: string;
  category: CostCategory;
  description: string;
  amount: number;
  date: string;  // ISO date string
  created_date: string;
  updated_date: string;
}

export interface DbProjectContact {
  id: string;
  project_id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  created_date: string;
}

export interface DbRoofingMaterial {
  id: string;
  name: string;
  type: MaterialType;
  unit: string;
  unit_cost: number;
  supplier: string | null;
  created_date: string;
  updated_date: string;
}

export interface DbUpdateThread {
  id: string;
  daily_update_id: string;
  user_id: string;
  message: string;
  created_date: string;
}

// =========================================================================
// CREATE/UPDATE PAYLOAD TYPES (without id, created_date, updated_date)
// =========================================================================

export type CreateProjectPayload = Omit<DbProject, 'id' | 'created_date' | 'updated_date'> & {
  id?: string;  // Optional for auto-generation
};

export type UpdateProjectPayload = Partial<Omit<DbProject, 'id' | 'created_date' | 'updated_date' | 'owner_user_id'>>;

export type CreateDailyUpdatePayload = Omit<DbDailyUpdate, 'id' | 'created_date' | 'updated_date'> & {
  id?: string;
};

export type UpdateDailyUpdatePayload = Partial<Omit<DbDailyUpdate, 'id' | 'created_date' | 'updated_date' | 'project_id'>>;

export type CreateClientUpdatePayload = Omit<DbClientUpdate, 'id' | 'created_date' | 'updated_date'> & {
  id?: string;
};

export type UpdateClientUpdatePayload = Partial<Omit<DbClientUpdate, 'id' | 'created_date' | 'updated_date' | 'project_id'>>;

// =========================================================================
// QUERY FILTER TYPES
// =========================================================================

export interface ProjectFilters {
  project_status?: ProjectStatus;
  project_type?: ProjectType;
  owner_user_id?: string;
  city?: string;
  state?: string;
  client_email?: string;
}

export interface DailyUpdateFilters {
  project_id?: string;
  author_user_id?: string;
  sent_to_customer?: boolean;
  update_date?: string;
}

export interface ClientUpdateFilters {
  project_id?: string;
  update_date?: string;
}

// =========================================================================
// HELPER TYPES
// =========================================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
}

export interface ListResponse<T> {
  data: T[];
  total?: number;
  limit?: number;
  offset?: number;
}

// =========================================================================
// VALIDATION HELPERS
// =========================================================================

export const PROJECT_TYPES: ProjectType[] = [
  'residential_replacement',
  'residential_repair',
  'commercial_replacement',
  'commercial_repair',
  'new_construction'
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  'planning',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled'
];

export const USER_ROLES: UserRole[] = [
  'admin',
  'contractor',
  'client'
];

export const COST_CATEGORIES: CostCategory[] = [
  'materials',
  'labor',
  'equipment',
  'permits',
  'other'
];

export const MATERIAL_TYPES: MaterialType[] = [
  'shingles',
  'underlayment',
  'flashing',
  'fasteners',
  'sealant',
  'other'
];

// =========================================================================
// TYPE GUARDS
// =========================================================================

export function isProjectType(value: string): value is ProjectType {
  return PROJECT_TYPES.includes(value as ProjectType);
}

export function isProjectStatus(value: string): value is ProjectStatus {
  return PROJECT_STATUSES.includes(value as ProjectStatus);
}

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

// =========================================================================
// DISPLAY LABELS
// =========================================================================

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  residential_replacement: 'Residential Replacement',
  residential_repair: 'Residential Repair',
  commercial_replacement: 'Commercial Replacement',
  commercial_repair: 'Commercial Repair',
  new_construction: 'New Construction'
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  on_hold: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
};
