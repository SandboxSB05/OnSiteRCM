# Project Creation with Client JOIN - Complete Implementation

## What Was Fixed

The application was trying to save `client_name`, `client_email`, and `client_phone` directly to the `projects` table, but with the JOIN approach, these fields are read-only (they come from the `users` table via the view).

## Changes Made

### 1. Projects.tsx (Admin View)

**Added:**

- `useAuth` hook to get current user
- Filter out view-only fields (`client_name`, `client_email`, `client_phone`) before saving
- Add `project_owner_id` when creating new projects

**Before:**

```typescript
const handleSubmit = async (projectData: any) => {
  await Project.create(projectData); // ❌ Tries to save client_name, client_email, client_phone
};
```

**After:**

```typescript
const handleSubmit = async (projectData: any) => {
  // Remove view-only fields from JOIN
  const { client_name, client_email, client_phone, ...projectFields } =
    projectData;

  const projectWithOwner = {
    ...projectFields,
    project_owner_id: user.id,
  };
  await Project.create(projectWithOwner); // ✅ Only saves valid table columns
};
```

### 2. MyProjects.tsx (Contractor View)

**Fixed:**

- Changed `owner_user_id` to `project_owner_id` (correct schema field)
- Filter out view-only fields before saving
- Consistent with Projects.tsx implementation

### 3. SupabaseEntities.ts

**Already done in previous step:**

- Created `SupabaseProject` class that reads from `projects_with_clients` view
- Writes still go to base `projects` table

### 4. Database View

**Created:**

- `projects_with_clients` view that JOINs projects with users table

## How It Works Now

### Creating a Project

1. **User fills out form** with client info (still text fields for now)
2. **Form submits** including `client_name`, `client_email`, `client_phone`
3. **handleSubmit filters them out:**
   ```typescript
   const { client_name, client_email, client_phone, ...projectFields } =
     projectData;
   ```
4. **Only valid fields saved** to `projects` table:

   - `project_name`
   - `project_owner_id` ✅ (added automatically)
   - `client_id` (if provided)
   - `address_line1`, `city`, `state`, etc.
   - `estimated_subtotal`, `square_footage`
   - `estimated_start_date`, `estimated_completion_date`
   - etc.

5. **When reading back:**
   - Query goes to `projects_with_clients` view
   - JOIN automatically adds `client_name`, `client_email`, `client_phone` from users table
   - If `client_id` is NULL, these fields will be NULL too

### Data Flow

```
┌──────────────┐
│ ProjectForm  │
│ (has client  │
│  text fields)│
└──────┬───────┘
       │
       │ Submits with client_name, client_email, client_phone
       ▼
┌──────────────────────┐
│  handleSubmit()      │
│  Filters out:        │
│  - client_name       │
│  - client_email      │
│  - client_phone      │
│  Adds:               │
│  - project_owner_id  │
└──────┬───────────────┘
       │
       │ Only valid fields
       ▼
┌──────────────────────┐
│ Project.create()     │
│ Writes to:           │
│ projects TABLE       │
└──────┬───────────────┘
       │
       │ Project saved with client_id = NULL
       ▼
┌──────────────────────┐
│ Project.list()       │
│ Reads from:          │
│ projects_with_clients│
│ VIEW                 │
└──────┬───────────────┘
       │
       │ Returns project with client_name/email/phone = NULL
       ▼
┌──────────────────────┐
│ Component displays   │
│ (client fields empty)│
└──────────────────────┘
```

## Current Behavior

### ✅ What Works:

- Projects can be created without error
- `project_owner_id` is automatically set
- View-only fields are filtered out
- No schema mismatch errors

### ⚠️ Current Limitation:

The form still has text input fields for `client_name`, `client_email`, `client_phone`, but:

- These values are **not saved** (filtered out)
- When you read the project back, these fields will be **empty/NULL**
- This is because `client_id` is NULL (no link to a user)

## Next Steps (Two Options)

### Option A: Store client_id (Proper JOIN Approach)

Update the form to:

1. Add a client selector dropdown
2. Load users with `role='client'`
3. Store the selected user's ID as `client_id`
4. Then the JOIN will populate `client_name`, `client_email`, `client_phone` automatically

**Pros:**

- ✅ True relational database design
- ✅ No data duplication
- ✅ Client info automatically updated everywhere

**Cons:**

- Requires clients to be users in the system
- More complex form UI

### Option B: Add text columns to projects table (Simple MVP)

Add actual columns to the projects table:

```sql
ALTER TABLE projects
ADD COLUMN client_name VARCHAR(255),
ADD COLUMN client_email VARCHAR(255),
ADD COLUMN client_phone VARCHAR(50);
```

Then remove the field filtering in the code.

**Pros:**

- ✅ Simple, works immediately
- ✅ No user management needed
- ✅ Form works as-is

**Cons:**

- Data duplication
- Updates not automatic
- Less normalized

## Recommended Approach

For **MVP**, I recommend **Option B** (add text columns) because:

1. Simpler for contractors to use
2. No client user management required
3. Works with existing form
4. Can migrate to Option A later

For **production**, I recommend **Option A** (proper JOIN) because:

1. Better data integrity
2. Scalable
3. Follows best practices

## Files Modified

1. ✅ `src/pages/Projects.tsx` - Filter view-only fields, add project_owner_id
2. ✅ `src/pages/MyProjects.tsx` - Filter view-only fields, fix field name
3. ✅ `src/api/supabaseEntities.ts` - SupabaseProject class with view
4. ✅ `database/create_projects_view.sql` - View creation script

## Testing

### Test 1: Create a Project

```
1. Login as contractor
2. Go to "My Projects"
3. Click "New Project"
4. Fill out form (including client fields)
5. Submit
6. ✅ Should create without PGRST204 error
7. ⚠️ Client fields will be empty when viewing (client_id is NULL)
```

### Test 2: Verify Project Saved

```sql
SELECT
  project_name,
  project_owner_id,
  client_id,
  address_line1
FROM projects
ORDER BY created_date DESC
LIMIT 1;
```

Should show your project with `project_owner_id` set and `client_id` = NULL.

## Summary

✅ **Fixed:** Project creation now works without schema errors  
✅ **View-only fields:** Filtered out before saving to database  
✅ **Owner assignment:** `project_owner_id` automatically added  
✅ **Field names:** Fixed `owner_user_id` → `project_owner_id`  
⚠️ **Client info:** Currently not saved (need to choose Option A or B)

The application is now functional. Choose your approach for client information based on your needs!
