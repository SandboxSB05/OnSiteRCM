# Database Migration Guide

## Overview

This guide explains the standardized database schema and the changes from the previous hardcoded implementation.

## Schema Changes

### Projects Table - Field Mapping

| **Old Field Name** | **New Field Name**                           | **Type**                     | **Notes**                                  |
| ------------------ | -------------------------------------------- | ---------------------------- | ------------------------------------------ |
| `address`          | `address_line1`, `city`, `state`, `zip_code` | Split into structured fields | Better for filtering, mapping, and display |
| `project_budget`   | `estimated_budget`                           | DECIMAL(10, 2)               | Renamed for clarity                        |
| N/A                | `project_type`                               | VARCHAR(50)                  | **NEW** - Required field                   |
| N/A                | `client_phone`                               | VARCHAR(50)                  | **NEW** - Optional field                   |
| N/A                | `address_line2`                              | VARCHAR(255)                 | **NEW** - Optional field                   |
| N/A                | `square_footage`                             | DECIMAL(10, 2)               | **NEW** - Optional field                   |
| `start_date`       | `estimated_start_date`                       | DATE                         | Renamed for clarity                        |
| N/A                | `actual_start_date`                          | DATE                         | **NEW** - Optional field                   |
| N/A                | `estimated_end_date`                         | DATE                         | **NEW** - Optional field                   |
| N/A                | `project_manager`                            | VARCHAR(255)                 | **NEW** - Optional field                   |
| N/A                | `updated_date`                               | TIMESTAMPTZ                  | **NEW** - Auto-updated                     |

### Project Type Values

```typescript
"residential_replacement" |
  "residential_repair" |
  "commercial_replacement" |
  "commercial_repair" |
  "new_construction";
```

### Project Status Values

```typescript
"planning" | "in_progress" | "on_hold" | "completed" | "cancelled";
```

## Migration Steps

### 1. Apply Database Schema

```bash
# Using psql
psql -U your_username -d your_database -f database/schema.sql

# Or using Supabase CLI
supabase db reset
```

### 2. Update Frontend Code

The following files have been updated to use the new schema:

- ✅ `src/types/entities.types.ts` - Project interface updated
- ✅ `src/api/entities.ts` - Mock data updated with new fields
- ⚠️ `src/components/projects/ProjectForm.tsx` - **Needs update** to match new fields
- ⚠️ `src/components/projects/ProjectGrid.tsx` - **Needs update** for address display
- ⚠️ `src/pages/Projects.tsx` - **Needs update** for filtering
- ⚠️ `src/pages/Analytics.tsx` - **Needs update** for budget field name

### 3. Required Frontend Updates

#### ProjectForm.tsx

- Split `project_address` into separate fields: `address_line1`, `city`, `state`, `zip_code`
- Add `address_line2` field (optional)
- Add `client_phone` field
- Rename `estimated_subtotal` → `estimated_budget`
- Add `actual_start_date` field
- Add project type selection (required)

#### Display Components

Update all components that display addresses:

```typescript
// Old
{project.address}

// New
{project.address_line1}
{project.address_line2 && `, ${project.address_line2}`}
, {project.city}, {project.state} {project.zip_code}
```

Update budget references:

```typescript
// Old
{
  project.project_budget;
}

// New
{
  project.estimated_budget;
}
```

### 4. Supabase RLS Policies

Add Row Level Security policies for the projects table:

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid()::text = owner_user_id);

-- Policy: Users can create projects
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid()::text = owner_user_id);

-- Policy: Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid()::text = owner_user_id);

-- Policy: Admins can view all projects
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.role = 'admin'
    )
  );
```

## Data Validation

### Required Fields

- `project_name`
- `project_type`
- `project_status`
- `client_name`
- `address_line1`
- `city`
- `state`
- `owner_user_id`

### Optional Fields

- `client_email`
- `client_phone`
- `address_line2`
- `zip_code`
- `estimated_budget`
- `square_footage`
- `estimated_start_date`
- `actual_start_date`
- `estimated_end_date`
- `actual_completion_date`
- `project_manager`

## Example API Calls

### Create Project

```typescript
const newProject = await Project.create({
  project_name: "Smith Residence Roof",
  project_type: "residential_replacement",
  project_status: "planning",
  client_name: "John Smith",
  client_email: "john@example.com",
  client_phone: "(555) 123-4567",
  address_line1: "123 Main St",
  city: "Austin",
  state: "TX",
  zip_code: "78701",
  estimated_budget: 15000,
  square_footage: 2400,
  estimated_start_date: "2025-11-01",
  estimated_end_date: "2025-11-15",
  project_manager: "Mike Johnson",
  owner_user_id: userId,
});
```

### Update Project

```typescript
await Project.update(projectId, {
  project_status: "in_progress",
  actual_start_date: "2025-10-30",
});
```

### Query Projects

```typescript
// Get all active projects in a city
const projects = await Project.filter({
  project_status: "in_progress",
  city: "Austin",
});

// Get projects by type
const residentialProjects = await Project.filter({
  project_type: "residential_replacement",
});
```

## Testing Checklist

- [ ] Create new project with all fields
- [ ] Create project with only required fields
- [ ] Update project status
- [ ] Search projects by city/state
- [ ] Filter projects by type and status
- [ ] Display project addresses correctly
- [ ] Calculate project budgets correctly
- [ ] Date fields display and sort correctly

## Rollback Plan

If issues occur, you can restore the old schema:

1. Keep a backup of the old `entities.types.ts`
2. Use git to revert changes: `git checkout HEAD~ src/types/entities.types.ts`
3. Restore old database schema from backup

## Support

For issues or questions, check:

- `database/schema.sql` - Full database schema
- `src/types/entities.types.ts` - TypeScript interfaces
- `src/api/entities.ts` - Mock data examples
