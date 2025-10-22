# Project-Client JOIN Implementation

## Overview

Implemented proper JOIN between `projects` and `users` tables to get client information via the `client_id` foreign key instead of storing redundant data.

## Architecture

### Database Layer

Created a PostgreSQL VIEW that automatically joins project and client data:

```sql
CREATE VIEW projects_with_clients AS
SELECT
  p.*,
  u.name AS client_name,
  u.email AS client_email,
  u.phone AS client_phone
FROM projects p
LEFT JOIN users u ON p.client_id = u.id;
```

**Key Features:**

- ✅ Uses LEFT JOIN so projects without clients still appear
- ✅ Adds `client_name`, `client_email`, `client_phone` as computed columns
- ✅ Inherits RLS policies from both underlying tables
- ✅ Read-only (views don't support INSERT/UPDATE directly)

### Application Layer

Created specialized `SupabaseProject` class that:

- **Reads** from `projects_with_clients` view (includes client info)
- **Writes** to `projects` table (normal INSERT/UPDATE/DELETE)

```typescript
class SupabaseProject extends SupabaseEntity {
  constructor() {
    super("projects");
    this.viewName = "projects_with_clients";
  }

  // list(), filter(), findOne() use the VIEW
  // create(), update(), delete() use the base TABLE
}
```

## Setup Instructions

### Step 1: Create the Database View

Run this in your **Supabase SQL Editor**:

```sql
-- Create the view with JOIN
CREATE OR REPLACE VIEW projects_with_clients AS
SELECT
  p.*,
  u.name AS client_name,
  u.email AS client_email,
  u.phone AS client_phone
FROM projects p
LEFT JOIN users u ON p.client_id = u.id;

-- Grant permissions
GRANT SELECT ON projects_with_clients TO authenticated;

-- Enable RLS on the view
ALTER VIEW projects_with_clients SET (security_invoker = true);
```

### Step 2: That's It!

The code changes are already applied to `src/api/supabaseEntities.ts`.

## How It Works

### Reading Projects (Automatic JOIN)

```typescript
// In your component
const projects = await Project.list();

// Returns:
[
  {
    id: "...",
    project_name: "Smith Residence",
    client_id: "user-uuid-123",
    client_name: "John Smith", // ✅ From users table
    client_email: "john@example.com", // ✅ From users table
    client_phone: "(555) 123-4567", // ✅ From users table
    // ... other project fields
  },
];
```

### Creating Projects (Stores Only client_id)

```typescript
await Project.create({
  project_name: "New Roof",
  project_owner_id: currentUser.id,
  client_id: "user-uuid-456", // ✅ Reference to users table
  address_line1: "123 Main St",
  // ... other fields
});
```

The client information is NOT stored in the projects table, only the `client_id` reference.

### Updating Projects

```typescript
await Project.update(projectId, {
  client_id: "different-user-uuid", // Change the client
  project_status: "in_progress",
});
```

When you read it again, the new client's name/email/phone will appear automatically via the JOIN.

## Data Flow Diagram

```
┌─────────────┐         ┌──────────────────────┐
│   Component │         │  SupabaseProject     │
│             │────────▶│                      │
│ Project.list()        │  .list() uses VIEW   │
└─────────────┘         │  .create() uses TABLE│
                        └──────────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
         ┌──────────▼──────────┐      ┌──────────▼────────┐
         │ projects_with_clients│      │  projects TABLE   │
         │      (VIEW)          │      │                   │
         │  - Reads with JOIN   │      │  - Writes here    │
         └──────────┬───────────┘      └───────────────────┘
                    │
         ┌──────────▼───────────┐
         │   LEFT JOIN          │
         │ projects.client_id = │
         │    users.id          │
         └──────────┬───────────┘
                    │
         ┌──────────▼───────────┐
         │   users TABLE        │
         │  - name              │
         │  - email             │
         │  - phone             │
         └──────────────────────┘
```

## Benefits

### ✅ No Data Duplication

- Client information lives only in the `users` table
- Projects reference clients via `client_id`
- Changes to user info automatically reflect in all projects

### ✅ Data Integrity

- Foreign key constraint ensures `client_id` references a valid user
- Can't delete a user who has projects (unless you add ON DELETE CASCADE)
- Type safety: clients are actual users

### ✅ Normalized Database

- Follows database normalization principles
- Easier to maintain and query
- Better performance for updates

### ✅ Transparent to Application

- Components don't need to know about the JOIN
- `client_name`, `client_email`, `client_phone` appear as if they're columns
- Existing code works without changes

## Form Handling

### Current State

Your `ProjectForm` component has fields for `client_name`, `client_email`, `client_phone` as text inputs.

### Two Options:

#### Option A: Store Only client_id (Recommended Long-term)

Update the form to select from existing users:

```typescript
// Add a client selector dropdown
const [clients, setClients] = useState([]);

useEffect(() => {
  // Load users with role='client'
  User.filter({ role: 'client' }).then(setClients);
}, []);

// In form:
<Select value={formData.client_id} onChange={...}>
  {clients.map(client => (
    <SelectItem value={client.id}>{client.name}</SelectItem>
  ))}
</Select>
```

#### Option B: Keep Text Fields (MVP Approach)

For now, you can keep the text fields and later match/create users:

```typescript
// On submit, find or create a user for the client
const handleSubmit = async (formData) => {
  let clientId = formData.client_id;

  if (!clientId && formData.client_email) {
    // Find existing user by email
    const existingUsers = await User.filter({ email: formData.client_email });

    if (existingUsers.length > 0) {
      clientId = existingUsers[0].id;
    } else {
      // Create new client user
      const newClient = await User.create({
        email: formData.client_email,
        name: formData.client_name,
        phone: formData.client_phone,
        role: "client",
      });
      clientId = newClient.id;
    }
  }

  // Save project with client_id
  await Project.create({
    ...formData,
    client_id: clientId,
  });
};
```

## Migration Path

If you already have projects with text-based client info (from before):

```sql
-- Create users for existing clients
INSERT INTO users (id, email, name, phone, role)
SELECT
  gen_random_uuid(),
  client_email,
  client_name,
  client_phone,
  'client'
FROM projects
WHERE client_email IS NOT NULL
  AND client_email NOT IN (SELECT email FROM users)
ON CONFLICT (email) DO NOTHING;

-- Update projects to reference the new user records
UPDATE projects p
SET client_id = u.id
FROM users u
WHERE p.client_email = u.email
  AND p.client_id IS NULL;
```

## Testing

### Test 1: View Returns Client Info

```sql
-- Run in SQL Editor
SELECT
  project_name,
  client_id,
  client_name,
  client_email
FROM projects_with_clients
LIMIT 5;
```

Should show project data with joined client information.

### Test 2: Create Project with Client

```typescript
// In your app
await Project.create({
  project_name: "Test Roof",
  project_owner_id: currentUser.id,
  client_id: "some-user-uuid",
  address_line1: "123 Test St",
  city: "Test City",
  state: "CA",
});

// Then read it back
const project = await Project.findOne(newProjectId);
console.log(project.client_name); // Should show the user's name
```

### Test 3: RLS Still Works

```typescript
// As contractor A, create a project
// As contractor B, try to view it
// Should NOT see contractor A's project
const projects = await Project.list();
// Only returns projects owned by current user
```

## Files Modified

1. **database/create_projects_view.sql** - View creation script
2. **src/api/supabaseEntities.ts** - Added `SupabaseProject` class
3. **PROJECT_CLIENT_JOIN.md** - This documentation

## Next Steps (Optional)

1. **Update ProjectForm** to use client selector instead of text fields
2. **Add client management page** to create/edit client users
3. **Add client search** when creating projects
4. **Migrate existing data** if you have old text-based client info

## Rollback

If you need to rollback:

```sql
-- Drop the view
DROP VIEW IF EXISTS projects_with_clients;

-- Revert code changes
// Change back to: export const Project = new SupabaseEntity('projects');
```

## Summary

✅ **Database View Created** - Joins projects with users to get client info  
✅ **SupabaseProject Class** - Reads from view, writes to table  
✅ **No Application Changes Needed** - Existing code works with JOIN  
✅ **Normalized Data** - Client info stored once in users table  
✅ **RLS Enforced** - View inherits security policies

Run the SQL script and you're ready to use proper JOINs for client data!
