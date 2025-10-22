import { base44 } from './base44Client';

// Enhanced Mock Entity Classes with localStorage persistence and detailed logging
// This simulates a backend API - replace with real API calls when ready

const STORAGE_PREFIX = 'roof_tracker_';

interface MockEntityData {
  id: string;
  created_date: string;
  updated_date?: string;
  [key: string]: any;
}

class MockEntity {
  entityName: string;
  storageKey: string;
  mockData: MockEntityData[] = [];

  constructor(entityName: string) {
    this.entityName = entityName;
    this.storageKey = `${STORAGE_PREFIX}${entityName.toLowerCase()}`;
    this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    this.mockData = stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.mockData));
  }

  // GET /api/{entity}?sort={orderBy}&limit={limit}
  async list(orderBy: string = '-created_date', limit: number | null = null): Promise<MockEntityData[]> {
    console.log(`%c[API CALL] ${this.entityName}.list()`, 'color: #4CAF50; font-weight: bold');
    console.log('  → HTTP: GET /api/${this.entityName.toLowerCase()}s');
    console.log('  → Parameters:', { orderBy, limit });
    console.log('  → Expected backend action: Fetch all records, sort by', orderBy, limit ? `limit to ${limit}` : '');
    
    let result = [...this.mockData];
    
    // Simple sorting
    if (orderBy) {
      const desc = orderBy.startsWith('-');
      const field = desc ? orderBy.substring(1) : orderBy;
      result.sort((a: MockEntityData, b: MockEntityData) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal < bVal) return desc ? 1 : -1;
        if (aVal > bVal) return desc ? -1 : 1;
        return 0;
      });
    }
    
    if (limit) {
      result = result.slice(0, limit);
    }
    
    console.log('  ← Returning', result.length, 'records');
    return result;
  }

  // GET /api/{entity}?{filterKey}={filterValue}
  async filter(filters: Record<string, any> = {}, orderBy: string | null = null): Promise<MockEntityData[]> {
    console.log(`%c[API CALL] ${this.entityName}.filter()`, 'color: #2196F3; font-weight: bold');
    console.log('  → HTTP: GET /api/${this.entityName.toLowerCase()}s?' + new URLSearchParams(filters));
    console.log('  → Filters:', filters);
    console.log('  → Expected backend action: Query database with WHERE clauses for:', Object.keys(filters).join(', '));
    
    let result = this.mockData.filter((item: MockEntityData) => {
      return Object.entries(filters).every(([key, value]) => {
        // Handle special filters like project_id__in
        if (key.endsWith('__in')) {
          const actualKey = key.replace('__in', '');
          return Array.isArray(value) && value.includes(item[actualKey]);
        }
        return item[key] === value;
      });
    });

    if (orderBy) {
      const desc = orderBy.startsWith('-');
      const field = desc ? orderBy.substring(1) : orderBy;
      result.sort((a: MockEntityData, b: MockEntityData) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal < bVal) return desc ? 1 : -1;
        if (aVal > bVal) return desc ? -1 : 1;
        return 0;
      });
    }
    
    console.log('  ← Returning', result.length, 'filtered records');
    return result;
  }

  // GET /api/{entity}/{id}
  async findOne(id: string): Promise<MockEntityData | null> {
    console.log(`%c[API CALL] ${this.entityName}.findOne()`, 'color: #FF9800; font-weight: bold');
    console.log('  → HTTP: GET /api/${this.entityName.toLowerCase()}s/' + id);
    console.log('  → Expected backend action: Find single record by ID');
    
    const result = this.mockData.find((item: MockEntityData) => item.id === id) || null;
    console.log('  ← Returning:', result ? 'Found record' : 'Not found');
    return result;
  }

  // POST /api/{entity}
  async create(data: Partial<MockEntityData>): Promise<MockEntityData> {
    console.log(`%c[API CALL] ${this.entityName}.create()`, 'color: #9C27B0; font-weight: bold');
    console.log('  → HTTP: POST /api/${this.entityName.toLowerCase()}s');
    console.log('  → Data to save:', data);
    console.log('  → Expected backend action: INSERT new record into database');
    
    const newItem: MockEntityData = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      created_date: new Date().toISOString(),
      ...data
    };
    
    this.mockData.push(newItem);
    this.saveToStorage();
    
    console.log('  ← Created record with ID:', newItem.id);
    return newItem;
  }

  // PUT /api/{entity}/{id} or PATCH /api/{entity}/{id}
  async update(id: string, data: Partial<MockEntityData>): Promise<MockEntityData | null> {
    console.log(`%c[API CALL] ${this.entityName}.update()`, 'color: #FF5722; font-weight: bold');
    console.log('  → HTTP: PUT/PATCH /api/${this.entityName.toLowerCase()}s/' + id);
    console.log('  → ID:', id);
    console.log('  → Data to update:', data);
    console.log('  → Expected backend action: UPDATE record in database WHERE id =', id);
    
    const index = this.mockData.findIndex((item: MockEntityData) => item.id === id);
    if (index >= 0) {
      this.mockData[index] = {
        ...this.mockData[index],
        ...data,
        updated_date: new Date().toISOString()
      };
      this.saveToStorage();
      console.log('  ← Updated successfully');
      return this.mockData[index];
    }
    
    console.log('  ← Record not found');
    return null;
  }

  // DELETE /api/{entity}/{id}
  async delete(id: string): Promise<boolean> {
    console.log(`%c[API CALL] ${this.entityName}.delete()`, 'color: #F44336; font-weight: bold');
    console.log('  → HTTP: DELETE /api/${this.entityName.toLowerCase()}s/' + id);
    console.log('  → Expected backend action: DELETE FROM database WHERE id =', id);
    
    const index = this.mockData.findIndex((item: MockEntityData) => item.id === id);
    if (index >= 0) {
      this.mockData.splice(index, 1);
      this.saveToStorage();
      console.log('  ← Deleted successfully');
      return true;
    }
    
    console.log('  ← Record not found');
    return false;
  }

  // Alias for find
  async find(options: Record<string, any> = {}): Promise<MockEntityData[]> {
    return this.filter(options);
  }

  // Alias for findOne (used by some components)
  async get(id: string): Promise<MockEntityData | null> {
    return this.findOne(id);
  }
}

// Mock User Authentication Entity
interface UserData extends MockEntityData {
  full_name: string;
  email: string;
  role: 'admin' | 'contractor' | 'client';
  company?: string;
  phone?: string;
  avatar_url?: string;
  payment_verified?: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

class MockUser extends MockEntity {
  currentUser: UserData | null;

  constructor() {
    super('User');
    this.currentUser = null;
    this.initializeDemoUser();
  }

  initializeDemoUser(): void {
    // Create a demo user if none exists
    if (this.mockData.length === 0) {
      this.mockData = [
        {
          id: '1',
          full_name: 'Demo Admin',
          email: 'admin@example.com',
          role: 'admin',
          created_date: new Date().toISOString()
        },
        {
          id: '2',
          full_name: 'Demo User',
          email: 'user@example.com',
          role: 'contractor',
          created_date: new Date().toISOString()
        }
      ] as UserData[];
      this.saveToStorage();
    }
  }

  // GET /api/auth/me
  async me(): Promise<UserData | null> {
    console.log('%c[API CALL] User.me()', 'color: #00BCD4; font-weight: bold');
    console.log('  → HTTP: GET /api/auth/me');
    console.log('  → Expected backend action: Get current authenticated user from session/token');
    
    if (!this.currentUser) {
      // Auto-login as demo admin for development
      this.currentUser = this.mockData[0] as UserData;
    }
    
    console.log('  ← Current user:', this.currentUser.full_name, `(${this.currentUser.role})`);
    return this.currentUser;
  }

  // POST /api/auth/logout
  async logout(): Promise<boolean> {
    console.log('%c[API CALL] User.logout()', 'color: #607D8B; font-weight: bold');
    console.log('  → HTTP: POST /api/auth/logout');
    console.log('  → Expected backend action: Clear session/destroy auth token');
    
    this.currentUser = null;
    console.log('  ← Logged out successfully');
    return true;
  }

  // POST /api/auth/login
  async login(credentials: LoginCredentials): Promise<UserData> {
    console.log('%c[API CALL] User.login()', 'color: #3F51B5; font-weight: bold');
    console.log('  → HTTP: POST /api/auth/login');
    console.log('  → Credentials:', { email: credentials.email, password: '***' });
    console.log('  → Expected backend action: Verify credentials, create session/token');
    
    // Mock login - just find user by email
    const user = this.mockData.find((u: MockEntityData) => (u as UserData).email === credentials.email) as UserData;
    if (user) {
      this.currentUser = user;
      console.log('  ← Login successful:', user.full_name);
      return user;
    }
    
    console.log('  ← Login failed: User not found');
    throw new Error('Invalid credentials');
  }
}

// Create entity instances
export const Project = new MockEntity('Project');
export const DailyUpdate = new MockEntity('DailyUpdate');
export const ClientUpdate = new MockEntity('ClientUpdate');
export const ProjectCollaborator = new MockEntity('ProjectCollaborator');
export const Cost = new MockEntity('Cost');
export const ProjectContact = new MockEntity('ProjectContact');
export const RoofingMaterial = new MockEntity('RoofingMaterial');
export const UpdateThread = new MockEntity('UpdateThread');
export const User = new MockUser();

// Attach to base44 client
base44.entities = {
  Project,
  DailyUpdate,
  ClientUpdate,
  ProjectCollaborator,
  Cost,
  ProjectContact,
  RoofingMaterial,
  UpdateThread,
};
base44.auth = User;

// Initialize with some demo data if storage is empty
(async function initializeDemoData() {
  if (Project.mockData.length === 0) {
    console.log('%c[DEMO DATA] Initializing with sample projects...', 'color: #FFC107; font-weight: bold');
    
    // Create sample projects
    const project1 = await Project.create({
      project_name: 'Sample Residential Roof - Smith House',
      project_type: 'residential_replacement',
      project_status: 'in_progress',
      client_name: 'John Smith',
      client_email: 'john@example.com',
      client_phone: '(555) 123-4567',
      address_line1: '123 Main St',
      city: 'Anytown',
      state: 'TX',
      zip_code: '78701',
      estimated_subtotal: 15000,
      square_footage: 2400,
      estimated_start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual_start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_completion_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      project_manager: 'Mike Johnson',
      owner_user_id: '1',
    });

    const project2 = await Project.create({
      project_name: 'Commercial Building Roof Replacement',
      project_type: 'commercial_replacement',
      project_status: 'in_progress',
      client_name: 'ABC Corporation',
      client_email: 'facilities@abc-corp.com',
      client_phone: '(555) 987-6543',
      address_line1: '456 Business Blvd',
      city: 'Commerce City',
      state: 'TX',
      zip_code: '78702',
      estimated_subtotal: 45000,
      square_footage: 8000,
      estimated_start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual_start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_completion_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      project_manager: 'Sarah Williams',
      owner_user_id: '1',
    });

    const project3 = await Project.create({
      project_name: 'Johnson Residence Shingle Repair',
      project_type: 'residential_repair',
      project_status: 'completed',
      client_name: 'Sarah Johnson',
      client_email: 'sarah.j@email.com',
      client_phone: '(555) 456-7890',
      address_line1: '789 Oak Lane',
      city: 'Suburbia',
      state: 'TX',
      zip_code: '78703',
      estimated_subtotal: 8500,
      square_footage: 1200,
      estimated_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_completion_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actual_completion_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      project_manager: 'Mike Johnson',
      owner_user_id: '2',
    });

    // Add some sample daily updates
    await DailyUpdate.create({
      project_id: project1.id,
      update_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // yesterday
      work_summary: 'Removed old shingles from the north side of the roof. Inspected decking - found minor water damage in one area that will need repair.',
      materials_used: 'Removed approximately 200 sq ft of asphalt shingles',
      weather_conditions: 'Sunny, 72°F, light breeze',
      hours_worked: 6,
      issues_encountered: 'Minor water damage found in decking - will need to replace a 4x8 section',
      ai_summary: 'Great progress today on the Smith residence. We removed old shingles from the north side and identified a small area needing deck repair before we can proceed.',
      sent_to_customer: false,
      author_user_id: '1',
      created_by: 'admin@example.com',
      photos: []
    });

    await DailyUpdate.create({
      project_id: project1.id,
      update_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      work_summary: 'Delivered materials to site. Conducted safety briefing with crew. Set up scaffolding and safety equipment.',
      materials_used: '30 bundles of architectural shingles, underlayment, drip edge',
      weather_conditions: 'Clear, 68°F',
      hours_worked: 4,
      issues_encountered: 'None',
      ai_summary: 'Project kickoff went smoothly. All materials delivered and safety equipment in place.',
      sent_to_customer: true,
      author_user_id: '1',
      created_by: 'admin@example.com',
      photos: []
    });

    await DailyUpdate.create({
      project_id: project2.id,
      update_date: new Date().toISOString(), // today
      work_summary: 'Continued installing TPO membrane on west section. Completed approximately 1,500 sq ft today.',
      materials_used: 'TPO membrane, adhesive, fasteners',
      weather_conditions: 'Partly cloudy, 65°F',
      hours_worked: 8,
      issues_encountered: 'None',
      ai_summary: 'Excellent progress on the ABC Corporation project. West section installation is ahead of schedule.',
      sent_to_customer: false,
      author_user_id: '1',
      created_by: 'admin@example.com',
      photos: []
    });

    console.log('  ✓ Created 3 sample projects');
    console.log('  ✓ Created 3 sample daily updates');
    console.log('  → Start using the app - data will persist in localStorage!');
  }
})();
