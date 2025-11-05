# Relay RCM - MVP Technical Explanation

## 🎯 Overview

Relay RCM is a **roofing contractor management system** that helps contractors track projects, manage daily updates, communicate with clients, and analyze project performance. This document explains how all the parts work together.

---

## 🏗️ Architecture Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Router** for navigation
- **shadcn/ui** components

### Backend

- **Supabase** (PostgreSQL database + Auth)
- **Vercel Serverless Functions** for API endpoints
- **Row Level Security (RLS)** for data isolation

---

## 🔐 Authentication Flow

### How Users Login

```
1. User enters email/password on /login page
   ↓
2. authService.login() called
   ↓
3. Supabase Auth validates credentials (in auth.users table)
   ↓
4. If valid, fetches user profile from public.users table
   ↓
5. AuthContext stores user globally
   ↓
6. User redirected to Dashboard or MyProjects based on role
```

### Key Files

- **`src/services/authService.ts`** - Handles login, register, logout
- **`src/contexts/AuthContext.tsx`** - Provides user state to entire app
- **`src/pages/Login.tsx`** - Login UI
- **`src/pages/Register.tsx`** - Registration UI (calls `/api/auth/register`)

### User Roles

- **Admin**: Full access to all projects and users
- **Contractor**: Can create and manage their own projects
- **Client**: Read-only access to their projects

---

## 📊 Database Architecture

### Core Tables

#### 1. **users** (User Profiles)

```sql
public.users
├── id (UUID) → References auth.users(id)
├── email
├── name
├── company
├── role (admin | contractor | client)
├── phone
└── payment_verified
```

**Purpose**: Stores user profile information. Authentication credentials are in Supabase's `auth.users` table.

**Key Relationship**: `id` is a foreign key to `auth.users(id)` - this links the profile to the authentication record.

#### 2. **projects** (Roofing Projects)

```sql
public.projects
├── id (UUID)
├── project_name
├── address
├── project_type
├── project_status (planning | in_progress | completed | on_hold)
├── estimated_subtotal
├── owner_user_id → References users(id)
├── client_name
├── client_email
├── start_date
└── expected_completion_date
```

**Purpose**: Main project records. Each project is owned by a contractor.

**Key Relationship**: `owner_user_id` → `users(id)` determines who owns the project.

#### 3. **daily_updates** (Daily Progress Updates)

```sql
public.daily_updates
├── id (UUID)
├── project_id → References projects(id)
├── update_date
├── work_summary
├── materials_used
├── hours_worked
├── issues_encountered
├── ai_summary (for client communication)
├── author_user_id → References users(id)
└── photos (array of URLs)
```

**Purpose**: Track daily work progress. Contractors write these; clients can view them.

**Key Relationships**:

- `project_id` → `projects(id)` - which project
- `author_user_id` → `users(id)` - who wrote it

#### 4. **client_updates** (Financial Updates)

```sql
public.client_updates
├── id (UUID)
├── project_id → References projects(id)
├── update_date
├── description
├── time_cost_labor
├── total_cost_to_date
├── total_paid
└── total_due
```

**Purpose**: Financial updates sent to homeowners about costs and payments.

#### 5. **project_collaborators** (Team Access)

```sql
public.project_collaborators
├── id (UUID)
├── project_id → References projects(id)
├── user_id → References users(id)
└── role (owner | editor | viewer)
```

**Purpose**: Allow multiple users to access a single project.

---

## 🔒 Row Level Security (RLS)

### What is RLS?

Row Level Security is **database-level access control**. Even if someone bypasses your API, they can't access unauthorized data because the database itself enforces permissions.

### How It Works

#### Projects Table Example

```sql
-- Users can only see projects they own
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (owner_user_id = auth.uid());

-- Users can only create projects where they are the owner
CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());
```

**Key Function**: `auth.uid()` returns the currently authenticated user's ID from the Supabase session.

### Policy Flow

```
User makes query: SELECT * FROM projects
         ↓
Supabase checks RLS policies
         ↓
Applies WHERE clause: owner_user_id = auth.uid()
         ↓
Returns only projects owned by current user
```

---

## 🔄 Data Flow: Creating a Project

### End-to-End Flow

```
1. User clicks "New Project" button
   ↓ (src/pages/Projects.tsx)

2. ProjectForm modal opens
   ↓ (src/components/projects/ProjectForm.tsx)

3. User fills: project_name, address, client_name, etc.
   ↓

4. Form submits → handleSubmit() called
   ↓

5. Add owner_user_id from AuthContext
   projectData = {
     ...formData,
     owner_user_id: currentUser.id
   }
   ↓

6. Call Project.create(projectData)
   ↓ (src/api/supabaseEntities.ts)

7. Supabase Entity executes:
   supabase.from('projects').insert([projectData])
   ↓

8. Database receives INSERT request
   ↓

9. RLS policy checks: owner_user_id = auth.uid() ✅
   ↓

10. PostgreSQL inserts row, generates UUID
    ↓

11. Returns new project with ID
    ↓

12. UI refreshes, new project appears in list
```

### Code Breakdown

**Step 1-2: Opening the Form**

```typescript
// src/pages/Projects.tsx
const [showForm, setShowForm] = useState(false);

<Button onClick={() => setShowForm(true)}>New Project</Button>;
```

**Step 3-4: Form Submission**

```typescript
// src/components/projects/ProjectForm.tsx
const handleSubmit = (e) => {
  e.preventDefault();
  onSubmit(formData); // Passes to parent
};
```

**Step 5: Adding Owner ID**

```typescript
// src/pages/Projects.tsx
const { user: currentUser } = useAuth(); // From AuthContext

const handleSubmit = async (projectData) => {
  const projectWithOwner = {
    ...projectData,
    owner_user_id: currentUser.id, // ← Critical!
  };
  await Project.create(projectWithOwner);
};
```

**Step 6-7: Supabase Entity**

```typescript
// src/api/supabaseEntities.ts
class SupabaseEntity {
  async create(data) {
    const { data: newRecord, error } = await supabase
      .from(this.tableName)
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newRecord;
  }
}

export const Project = new SupabaseEntity("projects");
```

**Step 8-10: Database & RLS**

```sql
-- PostgreSQL processes:
INSERT INTO public.projects (
  project_name,
  address,
  owner_user_id,
  ...
) VALUES (
  'Smith Residence',
  '123 Main St',
  'uuid-of-current-user',
  ...
)

-- RLS checks:
WITH CHECK (owner_user_id = auth.uid())
-- If owner_user_id matches session user → ALLOWED
-- If not → PERMISSION DENIED
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App (src/main.tsx)
└── Pages (src/pages/index.tsx)
    └── Router + AuthProvider
        ├── Login
        ├── Register
        └── Layout (authenticated pages)
            ├── Dashboard
            ├── Projects
            │   ├── ProjectForm
            │   ├── ProjectGrid
            │   └── ProjectFilters
            ├── Project (detail page)
            │   ├── ProjectHeader
            │   ├── ProjectTabs
            │   ├── InteractiveTimeline
            │   └── DailyUpdatesThread
            ├── DailyUpdates
            ├── Analytics
            └── MyProjects
```

### Page-Level Routing

```typescript
// src/pages/index.tsx
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes with Layout */}
  <Route
    path="/Dashboard"
    element={
      <ProtectedRoute allowedRoles={["admin", "contractor"]}>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/Projects"
    element={
      <ProtectedRoute allowedRoles={["admin", "contractor"]}>
        <Projects />
      </ProtectedRoute>
    }
  />

  <Route
    path="/Project"
    element={
      <ProtectedRoute allowedRoles={["admin", "contractor"]}>
        <Project />
      </ProtectedRoute>
    }
  />
</Routes>
```

---

## 🔌 API Layer: Supabase Entities

### The Entity Pattern

Instead of writing raw SQL or Supabase queries everywhere, we use **Entity classes** that provide a clean API:

```typescript
// Instead of this everywhere:
const { data } = await supabase.from("projects").select("*");

// We do this:
const projects = await Project.list();
```

### Entity Methods

```typescript
class SupabaseEntity {
  // GET all records
  async list(orderBy = "created_date", limit = null);

  // GET with filters
  async filter(filters = {}, orderBy = null);

  // GET single record
  async get(id);

  // CREATE new record
  async create(data);

  // UPDATE existing record
  async update(id, data);

  // DELETE record
  async delete(id);
}
```

### Usage Examples

```typescript
// List all projects
const projects = await Project.list("-created_date");

// Filter projects by status
const activeProjects = await Project.filter({
  project_status: "in_progress",
});

// Get single project
const project = await Project.get("uuid-here");

// Create new project
const newProject = await Project.create({
  project_name: "New Roof",
  owner_user_id: currentUser.id,
  address: "123 Main St",
});

// Update project
await Project.update("uuid-here", {
  project_status: "completed",
});

// Delete project
await Project.delete("uuid-here");
```

---

## 🔄 State Management

### AuthContext (Global User State)

```typescript
// src/contexts/AuthContext.tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, check for existing session
  useEffect(() => {
    const currentUser = await getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Any component can access user
export function useAuth() {
  return useContext(AuthContext);
}
```

### Using AuthContext

```typescript
// In any component:
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      Welcome, {user.name}!<button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 🛣️ Navigation & URL Structure

### Route Definitions

| Path              | Component    | Access            | Purpose             |
| ----------------- | ------------ | ----------------- | ------------------- |
| `/`               | Home         | Public            | Landing page        |
| `/login`          | Login        | Public            | Login form          |
| `/register`       | Register     | Public            | Registration form   |
| `/Dashboard`      | Dashboard    | Admin, Contractor | Overview stats      |
| `/Projects`       | Projects     | Admin, Contractor | All projects list   |
| `/Project?id=xxx` | Project      | Admin, Contractor | Project detail view |
| `/MyProjects`     | MyProjects   | All roles         | User's own projects |
| `/DailyUpdates`   | DailyUpdates | Admin, Contractor | All daily updates   |
| `/Analytics`      | Analytics    | Admin             | Company analytics   |
| `/Users`          | Users        | Admin             | User management     |

### URL Parameters

```typescript
// Getting project ID from URL
const projectId = new URLSearchParams(window.location.search).get("id");

// Navigating to project detail
<Link to={createPageUrl(`Project?id=${project.id}`)}>View Project</Link>;
```

---

## 📋 Key User Workflows

### 1. Contractor Creates a Project

```
1. Login as contractor
2. Navigate to /Projects
3. Click "New Project"
4. Fill form:
   - Project Name: "Smith Roof Replacement"
   - Address: "123 Main St"
   - Client Name: "John Smith"
   - Client Email: "john@example.com"
   - Project Type: "Residential Replacement"
   - Status: "Planning"
5. Click "Create Project"
6. System adds owner_user_id automatically
7. Project saved to database
8. Project appears in list
```

### 2. Contractor Adds Daily Update

```
1. Navigate to project detail page
2. Click "Daily Updates" tab
3. Click "New Update"
4. Fill update:
   - Work Summary: "Removed old shingles, inspected deck"
   - Materials Used: "50 bundles removed"
   - Hours Worked: 6.5
   - Issues: "Found water damage in corner"
5. Upload photos
6. Click "Save Update"
7. Update saved with author_user_id
8. Update appears in timeline
```

### 3. Client Views Project

```
1. Login as client
2. Navigate to /MyProjects
3. See only projects where they are collaborator
4. Click project
5. View timeline and daily updates
6. See AI summaries (simplified for homeowners)
7. Cannot edit or delete anything
```

---

## 🔐 Security Model

### Multi-Layered Security

```
Layer 1: Frontend Route Protection
└── ProtectedRoute checks user role
    └── Redirects if unauthorized

Layer 2: AuthContext
└── Provides user session globally
    └── Only if valid Supabase session exists

Layer 3: Supabase Client (RLS)
└── Every query filtered by auth.uid()
    └── Database enforces ownership rules

Layer 4: Database Constraints
└── Foreign keys, CHECK constraints
    └── Ensures data integrity
```

### Example: Trying to View Someone Else's Project

```
Malicious user tries:
  SELECT * FROM projects WHERE id = 'other-users-project-id'

Database applies RLS:
  SELECT * FROM projects
  WHERE id = 'other-users-project-id'
  AND owner_user_id = auth.uid()  ← Added automatically

Result:
  Returns empty (no rows) because owner_user_id doesn't match
```

---

## 🚀 Critical Implementation Details

### 1. Owner ID Must Be Set

**❌ WRONG:**

```typescript
await Project.create({
  project_name: "New Project",
  address: "123 Main St",
  // Missing owner_user_id!
});
// Error: null value in column "owner_user_id"
```

**✅ CORRECT:**

```typescript
const { user } = useAuth();

await Project.create({
  project_name: "New Project",
  address: "123 Main St",
  owner_user_id: user.id, // ← Required!
});
```

### 2. Field Names Must Match Schema

**Form fields must use exact database column names:**

| Form Field                                | Database Column                           | ✅/❌      |
| ----------------------------------------- | ----------------------------------------- | ---------- |
| `project_address`                         | `address`                                 | ❌ Wrong   |
| `address`                                 | `address`                                 | ✅ Correct |
| `estimated_start_date`                    | `start_date`                              | ❌ Wrong   |
| `start_date`                              | `start_date`                              | ✅ Correct |
| `project_type: "residential_replacement"` | `project_type: "Residential Replacement"` | ❌ Wrong   |
| `project_type: "Residential Replacement"` | `project_type: "Residential Replacement"` | ✅ Correct |

### 3. Authentication State Management

```typescript
// AuthContext initializes on app load
useEffect(() => {
  const initAuth = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };
  initAuth();
}, []);

// Components can then use:
const { user } = useAuth();
if (!user) return <div>Loading...</div>;
```

---

## 🔄 Data Relationships Diagram

```
auth.users (Supabase Auth - credentials)
    ↓ 1:1
public.users (profiles)
    ↓ 1:many
public.projects
    ↓ 1:many
    ├── daily_updates
    ├── client_updates
    ├── costs
    └── project_collaborators
            ↓ many:1
        public.users (team members)
```

---

## 🎯 MVP Scope - What's Implemented

### ✅ Core Features

- User authentication (login, register, logout)
- User roles (admin, contractor, client)
- Project CRUD operations
- Daily updates tracking
- Client communication updates
- Project collaboration/sharing
- Role-based access control
- Real-time database with RLS

### 🚧 Not Yet Implemented

- Payment processing
- File upload to cloud storage
- Email notifications
- AI summary generation
- Analytics charts with real data
- Mobile app
- Multi-language support

---

## 🔧 Environment Setup

### Required Environment Variables

```bash
# .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Configuration

1. Create Supabase project
2. Run `/api/database/schema.sql` to create tables
3. Enable Row Level Security on all tables
4. Copy connection details to `.env`

---

## 📚 File Structure Reference

```
roof-tracker-pro-fe525d7c/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── api/
│   │   └── supabaseEntities.ts     # Database entity classes
│   ├── services/
│   │   └── authService.ts          # Authentication functions
│   ├── contexts/
│   │   └── AuthContext.tsx         # Global user state
│   ├── pages/
│   │   ├── Login.tsx               # Login page
│   │   ├── Projects.tsx            # Projects list
│   │   ├── Project.tsx             # Project detail
│   │   └── Dashboard.tsx           # Dashboard
│   └── components/
│       ├── projects/
│       │   ├── ProjectForm.tsx     # Create/edit form
│       │   └── ProjectGrid.tsx     # Projects display
│       └── auth/
│           └── ProtectedRoute.tsx  # Route guard
├── lib/
│   └── supabaseClient.ts           # Supabase connection
├── api/
│   ├── auth/
│   │   └── register.ts             # Serverless registration
│   └── database/
│       └── schema.sql              # Database schema
└── .env                            # Environment variables
```

---

## 🎓 Key Concepts Summary

1. **Authentication**: Supabase Auth handles credentials; `public.users` stores profiles
2. **Authorization**: Row Level Security enforces data access at database level
3. **Entity Pattern**: Clean API layer over raw database queries
4. **Context API**: Global state for user authentication
5. **Protected Routes**: Frontend guards that check user role before rendering
6. **Foreign Keys**: Database relationships ensure data integrity
7. **UUID Primary Keys**: Universally unique identifiers for all records
8. **Cascade Deletes**: When project deleted, all updates/costs also deleted

---

This MVP provides a solid foundation for roofing contractors to manage projects, track daily work, and communicate with clients—all secured by role-based access control at the database level.
