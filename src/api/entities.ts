import { base44 } from './base44Client';

// Enhanced Mock Entity Classes with localStorage persistence and detailed logging
// This simulates a backend API - replace with real API calls when ready

const STORAGE_PREFIX = 'roof_tracker_';

class MockEntity {
  constructor(entityName) {
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
  async list(orderBy = '-created_date', limit = null) {
    console.log(`%c[API CALL] ${this.entityName}.list()`, 'color: #4CAF50; font-weight: bold');
    console.log('  → HTTP: GET /api/${this.entityName.toLowerCase()}s');
    console.log('  → Parameters:', { orderBy, limit });
    console.log('  → Expected backend action: Fetch all records, sort by', orderBy, limit ? `limit to ${limit}` : '');
    
    let result = [...this.mockData];
    
    // Simple sorting
    if (orderBy) {
      const desc = orderBy.startsWith('-');
      const field = desc ? orderBy.substring(1) : orderBy;
      result.sort((a, b) => {
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
  async filter(filters = {}, orderBy = null) {
    console.log(`%c[API CALL] ${this.entityName}.filter()`, 'color: #2196F3; font-weight: bold');
    console.log('  → HTTP: GET /api/${this.entityName.toLowerCase()}s?' + new URLSearchParams(filters));
    console.log('  → Filters:', filters);
    console.log('  → Expected backend action: Query database with WHERE clauses for:', Object.keys(filters).join(', '));
    
    let result = this.mockData.filter(item => {
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
      result.sort((a, b) => {
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
  async findOne(id) {
    console.log(`%c[API CALL] ${this.entityName}.findOne()`, 'color: #FF9800; font-weight: bold');
    console.log('  → HTTP: GET /api/${this.entityName.toLowerCase()}s/' + id);
    console.log('  → Expected backend action: Find single record by ID');
    
    const result = this.mockData.find(item => item.id === id) || null;
    console.log('  ← Returning:', result ? 'Found record' : 'Not found');
    return result;
  }

  // POST /api/{entity}
  async create(data) {
    console.log(`%c[API CALL] ${this.entityName}.create()`, 'color: #9C27B0; font-weight: bold');
    console.log('  → HTTP: POST /api/${this.entityName.toLowerCase()}s');
    console.log('  → Data to save:', data);
    console.log('  → Expected backend action: INSERT new record into database');
    
    const newItem = {
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
  async update(id, data) {
    console.log(`%c[API CALL] ${this.entityName}.update()`, 'color: #FF5722; font-weight: bold');
    console.log('  → HTTP: PUT/PATCH /api/${this.entityName.toLowerCase()}s/' + id);
    console.log('  → ID:', id);
    console.log('  → Data to update:', data);
    console.log('  → Expected backend action: UPDATE record in database WHERE id =', id);
    
    const index = this.mockData.findIndex(item => item.id === id);
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
  async delete(id) {
    console.log(`%c[API CALL] ${this.entityName}.delete()`, 'color: #F44336; font-weight: bold');
    console.log('  → HTTP: DELETE /api/${this.entityName.toLowerCase()}s/' + id);
    console.log('  → Expected backend action: DELETE FROM database WHERE id =', id);
    
    const index = this.mockData.findIndex(item => item.id === id);
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
  async find(options = {}) {
    return this.filter(options);
  }

  // Alias for findOne (used by some components)
  async get(id) {
    return this.findOne(id);
  }
}

// Mock User Authentication Entity
class MockUser extends MockEntity {
  constructor() {
    super('User');
    this.currentUser = null;
    this.initializeDemoUser();
  }

  initializeDemoUser() {
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
      ];
      this.saveToStorage();
    }
  }

  // GET /api/auth/me
  async me() {
    console.log('%c[API CALL] User.me()', 'color: #00BCD4; font-weight: bold');
    console.log('  → HTTP: GET /api/auth/me');
    console.log('  → Expected backend action: Get current authenticated user from session/token');
    
    if (!this.currentUser) {
      // Auto-login as demo admin for development
      this.currentUser = this.mockData[0];
    }
    
    console.log('  ← Current user:', this.currentUser.full_name, `(${this.currentUser.role})`);
    return this.currentUser;
  }

  // POST /api/auth/logout
  async logout() {
    console.log('%c[API CALL] User.logout()', 'color: #607D8B; font-weight: bold');
    console.log('  → HTTP: POST /api/auth/logout');
    console.log('  → Expected backend action: Clear session/destroy auth token');
    
    this.currentUser = null;
    console.log('  ← Logged out successfully');
    return true;
  }

  // POST /api/auth/login
  async login(credentials) {
    console.log('%c[API CALL] User.login()', 'color: #3F51B5; font-weight: bold');
    console.log('  → HTTP: POST /api/auth/login');
    console.log('  → Credentials:', { email: credentials.email, password: '***' });
    console.log('  → Expected backend action: Verify credentials, create session/token');
    
    // Mock login - just find user by email
    const user = this.mockData.find(u => u.email === credentials.email);
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
if (Project.mockData.length === 0) {
  console.log('%c[DEMO DATA] Initializing with sample projects...', 'color: #FFC107; font-weight: bold');
  
  // Create sample projects
  const project1 = Project.create({
    project_name: 'Sample Residential Roof - Smith House',
    address: '123 Main St, Anytown USA',
    project_status: 'in_progress',
    project_budget: 15000,
    owner_user_id: '1',
    client_name: 'John Smith',
    client_email: 'john@example.com',
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  });

  const project2 = Project.create({
    project_name: 'Commercial Building Roof Replacement',
    address: '456 Business Blvd, Commerce City',
    project_status: 'in_progress',
    project_budget: 45000,
    owner_user_id: '1',
    client_name: 'ABC Corporation',
    client_email: 'facilities@abc-corp.com',
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
  });

  const project3 = Project.create({
    project_name: 'Johnson Residence Shingle Repair',
    address: '789 Oak Lane, Suburbia',
    project_status: 'completed',
    project_budget: 8500,
    owner_user_id: '2',
    client_name: 'Sarah Johnson',
    client_email: 'sarah.j@email.com',
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    actual_completion_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  });

  // Add some sample daily updates
  DailyUpdate.create({
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

  DailyUpdate.create({
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

  DailyUpdate.create({
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
