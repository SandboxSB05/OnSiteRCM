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
  private authTokenCache: { token: string; exp: number } | null;

  constructor() {
    super('projects');
    this.viewName = 'projects_with_clients';
    this.authTokenCache = null;
  }

  private encodeBase64(value: string) {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return window.btoa(value);
    }
    if (typeof btoa === 'function') {
      return btoa(value);
    }
    throw new Error('No base64 encoder available for auth token payload');
  }

  private async getServerlessAuthToken() {
    const stillValid = this.authTokenCache && this.authTokenCache.exp > Date.now() + 5000;
    if (stillValid) {
      return this.authTokenCache!.token;
    }

    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) {
      throw new Error('Not authenticated');
    }

    let role =
      (authUser.app_metadata && (authUser.app_metadata as Record<string, any>).role) ||
      (authUser.user_metadata && (authUser.user_metadata as Record<string, any>).role) ||
      null;

    if (!role) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      role = profile?.role || 'contractor';
    }

    const payload = {
      userId: authUser.id,
      role,
      exp: Date.now() + 30 * 60 * 1000, // 30 minutes
    };

    const token = `Bearer.${this.encodeBase64(JSON.stringify(payload))}`;
    this.authTokenCache = { token, exp: payload.exp };
    return token;
  }

  private buildQueryString(params: Record<string, any>) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return;
        searchParams.append(key, value.join(','));
        return;
      }

      searchParams.append(key, String(value));
    });
    const serialized = searchParams.toString();
    return serialized ? `?${serialized}` : '';
  }

  private async requestProjectsFallback(params: Record<string, any> = {}) {
    console.warn(
      '[SUPABASE] Falling back to direct Supabase client for projects request (serverless unavailable)'
    );

    const { order, limit, ...filters } = params;

    let query = supabase.from(this.viewName).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return;
        }
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    });

    if (order && typeof order === 'string') {
      const desc = order.startsWith('-');
      const field = desc ? order.substring(1) : order;
      query = query.order(field, { ascending: !desc });
    } else {
      query = query.order('created_date', { ascending: false });
    }

    if (limit) {
      const parsedLimit =
        typeof limit === 'string' ? parseInt(limit, 10) : Number(limit);
      if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase fallback error:', error);
      throw new Error(error.message);
    }

    return (data || []).map((project: any) => ({
      ...project,
      project_progress:
        project?.project_progress !== undefined ? project.project_progress : null,
    }));
  }

  private async requestProjects(params: Record<string, any> = {}) {
    try {
      const token = await this.getServerlessAuthToken();
      const queryString = this.buildQueryString(params);

      const response = await fetch(`/api/projects/list${queryString}`, {
        headers: {
          Authorization: token,
        },
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Unexpected content type: ${contentType || 'unknown'}`);
      }

      const payload = await response.json();

      if (!response.ok) {
        const message =
          payload?.message || payload?.error || 'Failed to fetch projects';
        throw new Error(message);
      }

      return (payload?.projects || []) as any[];
    } catch (error) {
      console.warn('Serverless projects API error:', error);
      return this.requestProjectsFallback(params);
    }
  }

  /**
   * List projects with client information joined from users table
   * Uses the projects_with_clients view
   */
  async list(orderBy = 'created_date', limit: number | null = null) {
    console.log(`%c[SUPABASE] ${this.tableName}.list() [WITH CLIENT JOIN]`, 'color: #4CAF50; font-weight: bold');
    
    const params: Record<string, any> = {};
    if (orderBy) {
      params.order = orderBy;
    }
    if (limit) {
      params.limit = limit;
    }

    const projects = await this.requestProjects(params);

    console.log(`  ← Returning ${projects.length} records with client info`);
    return projects;
  }

  /**
   * Filter projects with client information joined from users table
   * Uses the projects_with_clients view
   */
  async filter(filters: Record<string, any> = {}, orderBy: string | null = null) {
    console.log(`%c[SUPABASE] ${this.tableName}.filter() [WITH CLIENT JOIN]`, 'color: #2196F3; font-weight: bold');
    console.log('  → Filters:', filters);

    const params: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (key.endsWith('__in') && Array.isArray(value)) {
        const actualKey = key.replace('__in', '');
        params[actualKey] = value;
      } else {
        params[key] = value;
      }
    });

    if (orderBy) {
      params.order = orderBy;
    }

    const projects = await this.requestProjects(params);

    console.log(`  ← Returning ${projects.length || 0} filtered records with client info`);
    return projects;
  }

  /**
   * Find a single project by ID with client information
   * Uses the projects_with_clients view
   */
  async findOne(id: string) {
    console.log(`%c[SUPABASE] ${this.tableName}.findOne() [WITH CLIENT JOIN]`, 'color: #FF9800; font-weight: bold');
    console.log('  → Searching for ID:', id);

    const projects = await this.requestProjects({ id });
    const project = projects[0] || null;

    if (!project) {
      console.warn(`  ⚠️ No ${this.tableName} found with ID: ${id}`);
      return null;
    }

    console.log('  ← Found record with client info');
    return project;
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
