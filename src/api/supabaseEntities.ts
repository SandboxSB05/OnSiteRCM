/**
 * Supabase Entity Classes
 * Real database operations using Supabase client
 * Replaces mock localStorage-based entities
 */

import { supabase } from '../../lib/supabaseClient';

// =========================================================================
// BASE SUPABASE ENTITY CLASS
// =========================================================================

class SupabaseEntity {
  constructor(tableName: string) {
    this.tableName = tableName;
  }

  tableName: string;

  /**
   * List all records with optional sorting and limit
   * GET /api/{entity}?sort={orderBy}&limit={limit}
   */
  async list(orderBy = 'created_date', limit: number | null = null) {
    console.log(`%c[SUPABASE] ${this.tableName}.list()`, 'color: #4CAF50; font-weight: bold');
    
    let query = supabase.from(this.tableName).select('*');

    // Handle sorting
    if (orderBy) {
      const desc = orderBy.startsWith('-');
      const field = desc ? orderBy.substring(1) : orderBy;
      query = query.order(field, { ascending: !desc });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error listing ${this.tableName}:`, error);
      throw new Error(error.message);
    }

    console.log(`  ← Returning ${data?.length || 0} records`);
    return data || [];
  }

  /**
   * Filter records based on conditions
   * GET /api/{entity}?{filterKey}={filterValue}
   */
  async filter(filters: Record<string, any> = {}, orderBy: string | null = null) {
    console.log(`%c[SUPABASE] ${this.tableName}.filter()`, 'color: #2196F3; font-weight: bold');
    console.log('  → Filters:', filters);

    let query = supabase.from(this.tableName).select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key.endsWith('__in') && Array.isArray(value)) {
        // Handle IN queries
        const actualKey = key.replace('__in', '');
        query = query.in(actualKey, value);
      } else {
        // Standard equality filter
        query = query.eq(key, value);
      }
    });

    // Handle sorting
    if (orderBy) {
      const desc = orderBy.startsWith('-');
      const field = desc ? orderBy.substring(1) : orderBy;
      query = query.order(field, { ascending: !desc });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error filtering ${this.tableName}:`, error);
      throw new Error(error.message);
    }

    console.log(`  ← Returning ${data?.length || 0} filtered records`);
    return data || [];
  }

  /**
   * Find a single record by ID
   * GET /api/{entity}/{id}
   */
  async findOne(id: string) {
    console.log(`%c[SUPABASE] ${this.tableName}.findOne()`, 'color: #FF9800; font-weight: bold');
    console.log('  → Searching for ID:', id);

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`  ⚠️ No ${this.tableName} found with ID: ${id}`);
        return null;
      }
      console.error(`Error finding ${this.tableName}:`, error);
      throw new Error(error.message);
    }

    console.log('  ← Found record');
    return data;
  }

  /**
   * Alias for findOne
   */
  async get(id: string) {
    return this.findOne(id);
  }

  /**
   * Create a new record
   * POST /api/{entity}
   */
  async create(data: Record<string, any>) {
    console.log(`%c[SUPABASE] ${this.tableName}.create()`, 'color: #9C27B0; font-weight: bold');
    console.log('  → Data:', data);

    const { data: newRecord, error } = await supabase
      .from(this.tableName)
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw new Error(error.message);
    }

    console.log('  ← Created record with ID:', newRecord?.id);
    return newRecord;
  }

  /**
   * Update an existing record
   * PUT/PATCH /api/{entity}/{id}
   */
  async update(id: string, data: Record<string, any>) {
    console.log(`%c[SUPABASE] ${this.tableName}.update()`, 'color: #FF5722; font-weight: bold');
    console.log('  → ID:', id);
    console.log('  → Data:', data);

    const { data: updatedRecord, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw new Error(error.message);
    }

    console.log('  ← Updated successfully');
    return updatedRecord;
  }

  /**
   * Delete a record
   * DELETE /api/{entity}/{id}
   */
  async delete(id: string) {
    console.log(`%c[SUPABASE] ${this.tableName}.delete()`, 'color: #F44336; font-weight: bold');
    console.log('  → ID:', id);

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw new Error(error.message);
    }

    console.log('  ← Deleted successfully');
    return true;
  }

  /**
   * Alias for filter
   */
  async find(options: Record<string, any> = {}) {
    return this.filter(options);
  }
}

// =========================================================================
// USER ENTITY WITH AUTH
// =========================================================================

class SupabaseUser extends SupabaseEntity {
  constructor() {
    super('users');
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async me() {
    console.log('%c[SUPABASE] User.me()', 'color: #00BCD4; font-weight: bold');

    // Get the authenticated user from Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      console.error('Not authenticated:', authError);
      throw new Error('Not authenticated');
    }

    // Fetch the user profile from the public.users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw new Error(profileError.message);
    }

    console.log('  ← Current user:', userProfile?.name, `(${userProfile?.role})`);
    return userProfile;
  }

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  async logout() {
    console.log('%c[SUPABASE] User.logout()', 'color: #607D8B; font-weight: bold');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      throw new Error(error.message);
    }

    console.log('  ← Logged out successfully');
    return true;
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(credentials: { email: string; password: string }) {
    console.log('%c[SUPABASE] User.login()', 'color: #3F51B5; font-weight: bold');
    console.log('  → Email:', credentials.email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('Login error:', error);
      throw new Error(error.message);
    }

    // Fetch user profile
    const userProfile = await this.me();
    console.log('  ← Login successful:', userProfile?.name);
    return userProfile;
  }
}

// =========================================================================
// PROJECT ENTITY WITH CLIENT JOIN
// =========================================================================

class SupabaseProject extends SupabaseEntity {
  viewName: string;

  constructor() {
    super('projects');
    this.viewName = 'projects_with_clients';
  }

  /**
   * List projects with client information joined from users table
   * Uses the projects_with_clients view
   */
  async list(orderBy = 'created_date', limit: number | null = null) {
    console.log(`%c[SUPABASE] ${this.tableName}.list() [WITH CLIENT JOIN]`, 'color: #4CAF50; font-weight: bold');
    
    let query = supabase.from(this.viewName).select('*');

    // Handle sorting
    if (orderBy) {
      const desc = orderBy.startsWith('-');
      const field = desc ? orderBy.substring(1) : orderBy;
      query = query.order(field, { ascending: !desc });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error listing ${this.tableName}:`, error);
      throw new Error(error.message);
    }

    console.log(`  ← Returning ${data?.length || 0} records with client info`);
    return data || [];
  }

  /**
   * Filter projects with client information joined from users table
   * Uses the projects_with_clients view
   */
  async filter(filters: Record<string, any> = {}, orderBy: string | null = null) {
    console.log(`%c[SUPABASE] ${this.tableName}.filter() [WITH CLIENT JOIN]`, 'color: #2196F3; font-weight: bold');
    console.log('  → Filters:', filters);

    let query = supabase.from(this.viewName).select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key.endsWith('__in') && Array.isArray(value)) {
        // Handle IN queries
        const actualKey = key.replace('__in', '');
        query = query.in(actualKey, value);
      } else {
        // Standard equality filter
        query = query.eq(key, value);
      }
    });

    // Handle sorting
    if (orderBy) {
      const desc = orderBy.startsWith('-');
      const field = desc ? orderBy.substring(1) : orderBy;
      query = query.order(field, { ascending: !desc });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error filtering ${this.tableName}:`, error);
      throw new Error(error.message);
    }

    console.log(`  ← Returning ${data?.length || 0} filtered records with client info`);
    return data || [];
  }

  /**
   * Find a single project by ID with client information
   * Uses the projects_with_clients view
   */
  async findOne(id: string) {
    console.log(`%c[SUPABASE] ${this.tableName}.findOne() [WITH CLIENT JOIN]`, 'color: #FF9800; font-weight: bold');
    console.log('  → Searching for ID:', id);

    const { data, error } = await supabase
      .from(this.viewName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`  ⚠️ No ${this.tableName} found with ID: ${id}`);
        return null;
      }
      console.error(`Error finding ${this.tableName}:`, error);
      throw new Error(error.message);
    }

    console.log('  ← Found record with client info');
    return data;
  }

  // Create, update, and delete still use the base table (inherited from SupabaseEntity)
}

// =========================================================================
// EXPORT ENTITY INSTANCES
// =========================================================================

export const Project = new SupabaseProject(); // Uses view with client JOIN
export const DailyUpdate = new SupabaseEntity('daily_updates');
export const ClientUpdate = new SupabaseEntity('client_updates');
export const ProjectCollaborator = new SupabaseEntity('project_collaborators');
export const Cost = new SupabaseEntity('costs');
export const UpdateThread = new SupabaseEntity('update_threads');
export const User = new SupabaseUser();

// Legacy base44 compatibility (if needed)
export const base44 = {
  entities: {
    Project,
    DailyUpdate,
    ClientUpdate,
    ProjectCollaborator,
    Cost,
    UpdateThread,
  },
  auth: User,
};

console.log('%c[SUPABASE ENTITIES] Initialized with real database connection', 'color: #4CAF50; font-weight: bold');
