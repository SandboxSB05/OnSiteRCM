# Supabase Setup Guide for OnSite RCM

## Overview

Your schema works great with Supabase! I've created a Supabase-optimized version with important adjustments.

## Key Differences for Supabase

### 1. **User Management**

**Original Schema:** Custom `users` table with password hashing
**Supabase Version:** Uses `auth.users` (built-in) + `profiles` table

### 2. **UUID Generation**

**Original:** `uuid_generate_v4()`
**Supabase:** `gen_random_uuid()` (PostgreSQL 13+ built-in)

### 3. **Row Level Security (RLS)**

**Added:** Full RLS policies for all tables
**Benefit:** Automatic data security - users only see their own data

## Implementation Steps

### Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to be ready (~2 minutes)
4. Note your:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret!)

### Step 2: Apply Database Schema

#### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `schema_supabase.sql`
5. Click **Run** (or Ctrl+Enter)

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize in your project (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# For server-side operations (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Update Your Supabase Client

Your `lib/supabaseClient.ts` should look like:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Step 5: Enable Authentication

In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (default)
3. Optional: Enable **Google**, **GitHub**, etc.
4. Configure email templates if needed

### Step 6: Test Authentication

Create a test user:

```typescript
// Register new user
const { data, error } = await supabase.auth.signUp({
  email: "test@example.com",
  password: "secure-password",
  options: {
    data: {
      full_name: "Test User",
      role: "contractor",
    },
  },
});
```

## Row Level Security (RLS) Policies Explained

### Projects Table Policies

```sql
-- Users can only see their own projects
"Users can view own projects"
USING (auth.uid() = owner_user_id)

-- Admins can see all projects
"Admins can view all projects"
USING (role = 'admin' from profiles)
```

### What This Means:

- Regular users automatically only see their projects
- No need to filter by user_id in your queries!
- Supabase handles security automatically

## Using Supabase in Your App

### 1. **Create a Project**

```typescript
import { supabase } from "@/lib/supabaseClient";

const createProject = async (projectData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...projectData,
      owner_user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### 2. **Fetch User's Projects**

```typescript
// RLS automatically filters to current user's projects!
const { data: projects, error } = await supabase
  .from("projects")
  .select("*")
  .order("created_date", { ascending: false });
```

### 3. **Update a Project**

```typescript
const { data, error } = await supabase
  .from("projects")
  .update({
    project_status: "in_progress",
    actual_start_date: "2025-10-30",
  })
  .eq("id", projectId)
  .select()
  .single();
```

### 4. **Upload Files (Photos/Videos)**

```typescript
// Upload a file
const { data, error } = await supabase.storage
  .from("project-photos")
  .upload(`${projectId}/${fileName}`, file);

// Get public URL
const {
  data: { publicUrl },
} = supabase.storage
  .from("project-photos")
  .getPublicUrl(`${projectId}/${fileName}`);

// Save URL to daily_update.photos array
```

## Storage Buckets Setup

For project photos and videos:

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:

   - `project-photos` (public)
   - `project-videos` (public)
   - `daily-update-photos` (public)

3. Set RLS policies for buckets:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-photos');

-- Allow public read
CREATE POLICY "Public can read photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-photos');
```

## Real-time Subscriptions (Optional)

Listen for project changes in real-time:

```typescript
const projectsSubscription = supabase
  .channel("projects-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "projects",
    },
    (payload) => {
      console.log("Project changed:", payload);
      // Update your UI
    }
  )
  .subscribe();
```

## Important Supabase Features

### 1. **Automatic Timestamps**

- `created_date` auto-set on insert
- `updated_date` auto-updated via trigger

### 2. **Foreign Key Cascades**

- Delete a project → all related updates/costs deleted automatically
- No orphaned data!

### 3. **Type Safety**

Generate TypeScript types from your database:

```bash
npx supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts
```

### 4. **Database Functions**

You can create custom functions:

```sql
CREATE FUNCTION get_project_total_cost(project_uuid UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM costs
  WHERE project_id = project_uuid;
$$ LANGUAGE SQL;
```

Call from your app:

```typescript
const { data } = await supabase.rpc("get_project_total_cost", {
  project_uuid: projectId,
});
```

## Migration from Mock Data

To migrate your existing mock data:

1. Export from localStorage (if needed)
2. Transform to match schema
3. Import via Supabase SQL Editor or API

```typescript
// Example: Migrate mock projects
const mockProjects = JSON.parse(localStorage.getItem("roof_tracker_Project"));

for (const project of mockProjects) {
  await supabase.from("projects").insert({
    ...project,
    owner_user_id: currentUserId,
  });
}
```

## Testing Checklist

- [ ] Database schema applied successfully
- [ ] Can create user account
- [ ] Profile auto-created on signup
- [ ] Can create project (RLS allows)
- [ ] Can view own projects only
- [ ] Cannot view other users' projects
- [ ] Admin can view all projects
- [ ] File upload works
- [ ] Triggers update `updated_date`

## Common Issues & Solutions

### Issue: "Permission denied for table"

**Solution:** Make sure RLS policies are set up correctly

### Issue: "User not found"

**Solution:** Check `auth.uid()` is not null (user must be logged in)

### Issue: "Foreign key violation"

**Solution:** Ensure `owner_user_id` matches an actual user in `auth.users`

### Issue: "Function uuid_generate_v4 does not exist"

**Solution:** Use `gen_random_uuid()` instead (already done in Supabase schema)

## Next Steps

1. ✅ Apply `schema_supabase.sql` to your Supabase project
2. ✅ Set up environment variables
3. ✅ Test authentication
4. ✅ Create a test project
5. ✅ Set up storage buckets for files
6. ✅ Update your frontend to use Supabase client instead of mock entities

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)

---

**Your schema is 100% compatible with Supabase!** 🎉

Use `schema_supabase.sql` for the optimized version with RLS policies.
