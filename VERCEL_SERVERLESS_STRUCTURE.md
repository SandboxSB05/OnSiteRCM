# Vercel Serverless Functions Structure for OnSite RCM MVP

## Overview

With Vercel, each API route becomes a serverless function (lambda). You'll have **approximately 14-16 serverless functions** in total, organized by resource type.

---

## What Each API Does in the App

### **Authentication APIs** (`/api/auth/*`)

- **me.ts** - Checks who is currently logged in. Called on every page load to verify the user's session and get their role (admin/contractor/homeowner).
- **login.ts** - Handles user login. Takes email/password, verifies credentials, and returns a JWT token for authentication.
- **logout.ts** - Ends the user's session when they click the logout button.

### **User Management APIs** (`/api/users/*`)

- **index.ts** - Lists all users in the system. Used by admins on the Users page to see and manage team members.
- **[id].ts** - Gets or updates a single user's information. Used when admins change someone's role or when users update their profile.

### **Project APIs** (`/api/projects/*`)

- **index.ts** - Lists and creates projects. Powers the "My Projects" and "All Projects" pages, showing all active jobs.
- **[id].ts** - Gets, updates, or deletes a specific project. Used on project detail pages and when editing project info like status, budget, or completion dates.

### **Daily Updates APIs** (`/api/dailyupdates/*`)

- **index.ts** - Lists and creates daily progress updates. Powers the "Daily Updates" page where contractors log their daily work.
- **[id].ts** - Gets, updates, or deletes a specific daily update. Used when contractors edit or remove progress entries.

### **Client Updates APIs** (`/api/clientupdates/*`)

- **index.ts** - Lists and creates client-facing financial updates. Powers the "Client Updates" page where contractors generate professional reports.
- **[id].ts** - Gets or deletes a specific client update. The GET endpoint is PUBLIC (no login required) - this is what clients see when they click the link in their email.

### **File Upload API** (`/api/upload.ts`)

- **upload.ts** - Handles photo and video uploads. Called when contractors add images to daily updates or client reports. Files are stored in cloud storage (S3 or Vercel Blob), and the API returns the public URL.

### **Email API** (`/api/email/send.ts`)

- **send.ts** - Sends emails to clients. Called when contractors click "Send to Client" after creating a client update. Sends a professionally formatted email with project progress and a link to view the full update.

### **AI API** (`/api/ai/*`)

- **generate-email.ts** - Uses AI (OpenAI GPT-4, Claude, etc.) to generate professional email content for client updates. Takes project details and work description, returns a polished email with subject line and HTML body. Currently MOCKED in the frontend but should be implemented as a real API for production.

---

## How They Work Together

**Typical User Flow:**

1. **Login** → `POST /api/auth/login` → Returns JWT token
2. **View Dashboard** → `GET /api/auth/me` → Verifies user, `GET /api/projects` → Shows their projects
3. **Create Daily Update** → `POST /api/upload` → Upload photos, `POST /api/dailyupdates` → Save update with photo URLs
4. **Create Client Update** → `POST /api/upload` → Upload photos, `POST /api/clientupdates` → Create update, **`POST /api/ai/generate-email`** → Generate professional email content, `POST /api/email/send` → Email client with link
5. **Client Views Update** → Client clicks email link → `GET /api/clientupdates/[id]` (no auth required) → Sees professional update page

---

## File Structure

```
/api
  /auth
    me.ts              → GET /api/auth/me
    login.ts           → POST /api/auth/login
    logout.ts          → POST /api/auth/logout

  /users
    index.ts           → GET /api/users (list all users)
    [id].ts            → GET /api/users/[id] (single user)
                       → PUT /api/users/[id] (update user)

  /projects
    index.ts           → GET /api/projects (list/filter)
                       → POST /api/projects (create)
    [id].ts            → GET /api/projects/[id] (single project)
                       → PUT /api/projects/[id] (update)
                       → DELETE /api/projects/[id] (delete)

  /dailyupdates
    index.ts           → GET /api/dailyupdates (list/filter)
                       → POST /api/dailyupdates (create)
    [id].ts            → GET /api/dailyupdates/[id] (single)
                       → PUT /api/dailyupdates/[id] (update)
                       → DELETE /api/dailyupdates/[id] (delete)

  /clientupdates
    index.ts           → GET /api/clientupdates (list/filter)
                       → POST /api/clientupdates (create)
    [id].ts            → GET /api/clientupdates/[id] (single - PUBLIC)
                       → DELETE /api/clientupdates/[id] (delete)

  /upload.ts           → POST /api/upload (file upload)

  /email
    send.ts            → POST /api/email/send (send email)

  /ai
    generate-email.ts  → POST /api/ai/generate-email (AI email generation)
```

---

## Function Count Breakdown

### Total Functions: **15 Serverless Functions**

1. **Auth Functions (3):**

   - `api/auth/me.ts`
   - `api/auth/login.ts`
   - `api/auth/logout.ts`

2. **User Functions (2):**

   - `api/users/index.ts` (handles GET list)
   - `api/users/[id].ts` (handles GET, PUT for single user)

3. **Project Functions (2):**

   - `api/projects/index.ts` (handles GET list, POST create)
   - `api/projects/[id].ts` (handles GET, PUT, DELETE for single project)

4. **Daily Update Functions (2):**

   - `api/dailyupdates/index.ts` (handles GET list, POST create)
   - `api/dailyupdates/[id].ts` (handles GET, PUT, DELETE)

5. **Client Update Functions (2):**

   - `api/clientupdates/index.ts` (handles GET list, POST create)
   - `api/clientupdates/[id].ts` (handles GET public, DELETE)

6. **Upload Function (1):**

   - `api/upload.ts` (handles POST for file uploads)

7. **Email Function (1):**

   - `api/email/send.ts` (handles POST for sending emails)

8. **AI Function (1):**
   - `api/ai/generate-email.ts` (handles POST for AI email generation)

---

## Example Function Implementation

### Dynamic Route Example: `/api/projects/[id].ts`

```typescript
import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      return handleGet(req, res, id as string);
    case "PUT":
      return handlePut(req, res, id as string);
    case "DELETE":
      return handleDelete(req, res, id as string);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse, id: string) {
  // Verify authentication
  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get project from database
  const project = await db.projects.findById(id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Check authorization (user can only see their own projects unless admin)
  if (user.role !== "admin" && project.owner_user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  return res.status(200).json(project);
}

async function handlePut(req: VercelRequest, res: VercelResponse, id: string) {
  // Verify authentication
  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get existing project
  const project = await db.projects.findById(id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Check authorization
  if (user.role !== "admin" && project.owner_user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Update project
  const updatedProject = await db.projects.update(id, req.body);

  return res.status(200).json(updatedProject);
}

async function handleDelete(
  req: VercelRequest,
  res: VercelResponse,
  id: string
) {
  // Verify authentication
  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get existing project
  const project = await db.projects.findById(id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Check authorization
  if (user.role !== "admin" && project.owner_user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Delete project
  await db.projects.delete(id);

  return res.status(200).json({ success: true });
}
```

### Collection Route Example: `/api/projects/index.ts`

```typescript
import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case "GET":
      return handleList(req, res);
    case "POST":
      return handleCreate(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  // Verify authentication
  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Build query from parameters
  const { sort, limit, owner_user_id, project_status } = req.query;

  let query = db.projects.query();

  // Apply filters
  if (owner_user_id) {
    query = query.where("owner_user_id", owner_user_id);
  } else if (user.role !== "admin") {
    // Non-admins can only see their own projects
    query = query.where("owner_user_id", user.id);
  }

  if (project_status) {
    query = query.where("project_status", project_status);
  }

  // Apply sorting
  if (sort) {
    const descending = sort.startsWith("-");
    const field = descending ? sort.slice(1) : sort;
    query = query.orderBy(field, descending ? "desc" : "asc");
  }

  // Apply limit
  if (limit) {
    query = query.limit(parseInt(limit as string));
  }

  const projects = await query.execute();

  return res.status(200).json(projects);
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  // Verify authentication
  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Validate required fields
  const { project_name, start_date } = req.body;
  if (!project_name || !start_date) {
    return res.status(400).json({
      error: "Missing required fields: project_name, start_date",
    });
  }

  // Create project
  const newProject = await db.projects.create({
    ...req.body,
    owner_user_id: req.body.owner_user_id || user.id, // Default to current user
    created_date: new Date().toISOString(),
  });

  return res.status(201).json(newProject);
}
```

---

## Shared Utilities

Create shared utilities to avoid code duplication:

### `/api/_lib/auth.ts`

```typescript
import { VercelRequest } from "@vercel/node";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "admin" | "user" | "client";
}

export async function authenticateRequest(
  req: VercelRequest
): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthenticatedUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "24h" });
}
```

### `/api/_lib/db.ts`

```typescript
// Database connection and query utilities
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),

  // Helper methods for common operations
  projects: {
    findById: async (id: string) => {
      const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
        id,
      ]);
      return result.rows[0] || null;
    },
    // ... other helpers
  },

  // Similar for other tables
  users: {
    /* ... */
  },
  dailyupdates: {
    /* ... */
  },
  clientupdates: {
    /* ... */
  },
};
```

### `/api/_lib/validation.ts`

```typescript
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateProjectData(data: any): string[] {
  const errors: string[] = [];

  if (!data.project_name) {
    errors.push("project_name is required");
  }

  if (!data.start_date) {
    errors.push("start_date is required");
  }

  // Add more validation...

  return errors;
}
```

---

## Environment Variables

Add these to your Vercel project settings:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# File Storage (if using AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# Email (if using SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# Other
NODE_ENV=production
```

---

## Deployment Steps

1. **Initialize Vercel Project:**

   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables:**

   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables

3. **Deploy:**

   ```bash
   vercel --prod
   ```

4. **Test Endpoints:**
   ```bash
   curl https://your-project.vercel.app/api/auth/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

---

## Database Setup

For Vercel, use a hosted PostgreSQL database:

**Recommended Options:**

- **Vercel Postgres** (easiest integration)
- **Supabase** (includes auth + storage)
- **Neon** (serverless Postgres)
- **PlanetScale** (MySQL alternative)

**Schema Example:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'client')),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name VARCHAR(255) NOT NULL,
  address TEXT,
  project_status VARCHAR(50) NOT NULL,
  project_budget DECIMAL(10, 2),
  owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  start_date DATE NOT NULL,
  expected_completion_date DATE,
  actual_completion_date DATE,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Updates table
CREATE TABLE daily_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  update_date DATE NOT NULL,
  work_summary TEXT NOT NULL,
  materials_used TEXT,
  weather_conditions VARCHAR(255),
  hours_worked DECIMAL(5, 2),
  issues_encountered TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  author_user_id UUID REFERENCES users(id),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Client Updates table
CREATE TABLE client_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  update_date DATE NOT NULL,
  description TEXT NOT NULL,
  time_cost_labor DECIMAL(10, 2) DEFAULT 0,
  time_cost_notes TEXT,
  additional_materials JSONB DEFAULT '[]'::jsonb,
  total_cost_to_date DECIMAL(10, 2) DEFAULT 0,
  total_paid DECIMAL(10, 2) DEFAULT 0,
  total_due DECIMAL(10, 2) DEFAULT 0,
  photos JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_owner ON projects(owner_user_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_daily_updates_project ON daily_updates(project_id);
CREATE INDEX idx_daily_updates_date ON daily_updates(update_date);
CREATE INDEX idx_client_updates_project ON client_updates(project_id);
```

---

## File Upload Strategy

For file uploads on Vercel, use external storage:

**Option 1: AWS S3**

```typescript
// api/upload.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse multipart form data
  const formData = await parseMultipartForm(req);
  const file = formData.files.file;

  const fileName = `${Date.now()}-${file.name}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.type,
    })
  );

  const url = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileName}`;

  return res.status(200).json({ url, filename: file.name });
}
```

**Option 2: Vercel Blob Storage**

```typescript
import { put } from "@vercel/blob";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const blob = await put("photo.jpg", req.body, { access: "public" });
  return res.status(200).json({ url: blob.url });
}
```

---

## Summary

✅ **14 Serverless Functions** organized by resource  
✅ Each function handles multiple HTTP methods via switch statements  
✅ Shared utilities for auth, database, validation  
✅ Works seamlessly with Vercel's infrastructure  
✅ Easy to scale and deploy

This structure is optimized for Vercel and follows serverless best practices! 🚀
