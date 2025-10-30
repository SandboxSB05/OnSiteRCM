# Quick Start: Project-Client JOIN

## 1. Run This SQL (Supabase SQL Editor)

```sql
-- Create view that joins projects with users to get client info
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

-- Enable RLS
ALTER VIEW projects_with_clients SET (security_invoker = true);
```

## 2. That's It!

The code is already updated. Now when you:

```typescript
const projects = await Project.list();
```

Each project will automatically include:

- `client_name` - from users table
- `client_email` - from users table
- `client_phone` - from users table

Via the `client_id` foreign key!

## 3. How to Create Projects

```typescript
// Store only the client_id, not the client name/email/phone
await Project.create({
  project_name: "Smith Residence",
  project_owner_id: currentUser.id,
  client_id: "uuid-of-client-user", // Reference to users table
  address_line1: "123 Main St",
  // ...
});
```

## What Changed

### Before (Wrong):

- Projects stored `client_name`, `client_email`, `client_phone` as text
- Data duplication
- Updates to client info not reflected

### After (Correct):

- Projects store only `client_id` (UUID reference)
- JOIN automatically pulls client info from users table
- Single source of truth
- No data duplication

## Files Updated

1. **database/create_projects_view.sql** - Run this
2. **src/api/supabaseEntities.ts** - Already updated
3. **PROJECT_CLIENT_JOIN.md** - Full docs

Read the full docs for more details!
