# OnSite RCM - MVP API Specification

## Overview

This document outlines the **essential API endpoints** needed for the MVP (Minimum Viable Product) of OnSite RCM. This is a streamlined version focusing only on core functionality required to get contractors tracking projects and communicating with clients.

**MVP Core Features:**

- User authentication (Admin, Contractor, Homeowner roles)
- Project management (CRUD operations)
- Daily progress updates with photos
- Client-facing update reports with financials
- Basic dashboard analytics

---

## Table of Contents

1. [Authentication & Users](#authentication--users)
2. [Projects](#projects)
3. [Daily Updates](#daily-updates)
4. [Client Updates](#client-updates)
5. [File Upload](#file-upload)
6. [Email Integration](#email-integration)
7. [Data Models](#data-models)

---

## Authentication & Users

### 1. GET /api/auth/me

**Purpose:** Get currently logged-in user information  
**When Called:** Every page load, authentication checks  
**Authentication Required:** Yes (session/JWT)

**Response:**

```json
{
  "id": "user-123",
  "full_name": "John Smith",
  "email": "john@example.com",
  "role": "admin|user|client",
  "created_date": "2025-01-15T10:00:00Z"
}
```

**Notes:**

- `role` values:
  - `admin`: Full system access
  - `user`: Contractor with their own projects
  - `client`: Homeowner view-only access

---

### 2. POST /api/auth/login

**Purpose:** Authenticate user and create session  
**When Called:** Login page submission

**Request:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "id": "user-123",
  "full_name": "John Smith",
  "email": "john@example.com",
  "role": "user",
  "created_date": "2025-01-15T10:00:00Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**

```json
{
  "error": "Invalid credentials"
}
```

---

### 3. POST /api/auth/logout

**Purpose:** End user session  
**When Called:** User clicks logout button

**Response:**

```json
{
  "success": true
}
```

---

### 4. GET /api/users

**Purpose:** List all users (Admin only)  
**When Called:** Users management page  
**Query Parameters:**

- `sort`: Sort field (e.g., "-created_date" for newest first)
- `limit`: Max results (optional)

**Example:** `GET /api/users?sort=-created_date&limit=50`

**Response:**

```json
[
  {
    "id": "user-123",
    "full_name": "John Smith",
    "email": "john@example.com",
    "role": "user",
    "created_date": "2025-01-15T10:00:00Z"
  }
]
```

---

### 5. PUT /api/users/{id}

**Purpose:** Update user information (Admin only, or user updating themselves)  
**When Called:** Changing user role, updating profile

**Request:**

```json
{
  "role": "admin",
  "full_name": "John Smith Sr."
}
```

**Response:**

```json
{
  "id": "user-123",
  "full_name": "John Smith Sr.",
  "email": "john@example.com",
  "role": "admin",
  "created_date": "2025-01-15T10:00:00Z"
}
```

---

## Projects

### 6. GET /api/projects

**Purpose:** List projects with filtering  
**When Called:**

- Dashboard (recent projects)
- Projects page (admin: all projects)
- My Projects page (contractor: their projects)

**Query Parameters:**

- `sort`: Sort order (e.g., "-created_date")
- `limit`: Max results
- `owner_user_id`: Filter by owner (for contractor view)
- `project_status`: Filter by status

**Examples:**

```
GET /api/projects?sort=-created_date&limit=20
GET /api/projects?owner_user_id=user-123
GET /api/projects?project_status=in_progress
```

**Response:**

```json
[
  {
    "id": "proj-456",
    "project_name": "Smith Residence Roof Replacement",
    "address": "123 Main St, Austin, TX 78701",
    "project_status": "in_progress",
    "project_budget": 15000.0,
    "owner_user_id": "user-123",
    "client_name": "Sarah Smith",
    "client_email": "sarah@example.com",
    "start_date": "2025-01-10",
    "expected_completion_date": "2025-01-25",
    "actual_completion_date": null,
    "created_date": "2025-01-08T10:00:00Z",
    "updated_date": "2025-01-15T14:30:00Z"
  }
]
```

**Status Values:**

- `pending`: Not started
- `in_progress`: Active work
- `on_hold`: Paused
- `completed`: Finished

---

### 7. GET /api/projects/{id}

**Purpose:** Get single project details  
**When Called:** Project detail page

**Example:** `GET /api/projects/proj-456`

**Response:**

```json
{
  "id": "proj-456",
  "project_name": "Smith Residence Roof Replacement",
  "address": "123 Main St, Austin, TX 78701",
  "project_status": "in_progress",
  "project_budget": 15000.0,
  "owner_user_id": "user-123",
  "client_name": "Sarah Smith",
  "client_email": "sarah@example.com",
  "start_date": "2025-01-10",
  "expected_completion_date": "2025-01-25",
  "actual_completion_date": null,
  "created_date": "2025-01-08T10:00:00Z",
  "updated_date": "2025-01-15T14:30:00Z"
}
```

---

### 8. POST /api/projects

**Purpose:** Create new project  
**When Called:** User submits "New Project" form

**Request:**

```json
{
  "project_name": "Smith Residence Roof Replacement",
  "address": "123 Main St, Austin, TX 78701",
  "project_status": "pending",
  "project_budget": 15000.0,
  "owner_user_id": "user-123",
  "client_name": "Sarah Smith",
  "client_email": "sarah@example.com",
  "start_date": "2025-01-10",
  "expected_completion_date": "2025-01-25"
}
```

**Response:** Same as GET /api/projects/{id}

---

### 9. PUT /api/projects/{id}

**Purpose:** Update project information  
**When Called:** Editing project details, changing status, updating dates

**Request (partial update allowed):**

```json
{
  "project_status": "completed",
  "actual_completion_date": "2025-01-20"
}
```

**Response:** Updated project object

---

### 10. DELETE /api/projects/{id}

**Purpose:** Delete a project  
**When Called:** User deletes project (optional for MVP)

**Response:**

```json
{
  "success": true
}
```

---

## Daily Updates

### 11. GET /api/dailyupdates

**Purpose:** List daily updates with filtering  
**When Called:**

- Dashboard (recent updates)
- Project detail page (project's updates)
- Daily Updates page

**Query Parameters:**

- `sort`: Sort order (e.g., "-update_date")
- `limit`: Max results
- `project_id`: Filter by project

**Examples:**

```
GET /api/dailyupdates?sort=-update_date&limit=10
GET /api/dailyupdates?project_id=proj-456
```

**Response:**

```json
[
  {
    "id": "update-789",
    "project_id": "proj-456",
    "update_date": "2025-01-15",
    "work_summary": "Installed 3 bundles of shingles on north side. Completed underlayment.",
    "materials_used": "3 bundles GAF Timberline HDZ, 1 roll underlayment",
    "weather_conditions": "Sunny, 65°F",
    "hours_worked": 8,
    "issues_encountered": "None",
    "photos": [
      "https://storage.example.com/photos/abc123.jpg",
      "https://storage.example.com/photos/def456.jpg"
    ],
    "videos": [],
    "author_user_id": "user-123",
    "created_date": "2025-01-15T17:30:00Z"
  }
]
```

---

### 12. POST /api/dailyupdates

**Purpose:** Create new daily update  
**When Called:** User submits daily update form

**Request:**

```json
{
  "project_id": "proj-456",
  "update_date": "2025-01-15",
  "work_summary": "Installed 3 bundles of shingles on north side.",
  "materials_used": "3 bundles GAF Timberline HDZ",
  "weather_conditions": "Sunny, 65°F",
  "hours_worked": 8,
  "issues_encountered": "",
  "photos": ["https://storage.example.com/photos/abc123.jpg"],
  "videos": []
}
```

**Response:** Created daily update object (same structure as GET response)

**Notes:**

- `author_user_id` is set from authenticated user
- Photos/videos should be uploaded first (see File Upload section)

---

### 13. PUT /api/dailyupdates/{id}

**Purpose:** Update existing daily update  
**When Called:** Editing update text, adding photos

**Request (partial update allowed):**

```json
{
  "work_summary": "Installed 3 bundles of shingles on north side. Completed underlayment and flashing.",
  "photos": [
    "https://storage.example.com/photos/abc123.jpg",
    "https://storage.example.com/photos/new456.jpg"
  ]
}
```

**Response:** Updated daily update object

---

### 14. DELETE /api/dailyupdates/{id}

**Purpose:** Delete daily update  
**When Called:** User removes update

**Response:**

```json
{
  "success": true
}
```

---

## Client Updates

Client updates are professional financial summaries sent to homeowners. They include work description, additional costs, running totals, and photos.

### 15. GET /api/clientupdates

**Purpose:** List client updates  
**When Called:** Client updates history, project details

**Query Parameters:**

- `sort`: Sort order (e.g., "-update_date")
- `limit`: Max results
- `project_id`: Filter by project

**Examples:**

```
GET /api/clientupdates?sort=-update_date
GET /api/clientupdates?project_id=proj-456
```

**Response:**

```json
[
  {
    "id": "client-update-101",
    "project_id": "proj-456",
    "update_date": "2025-01-15",
    "description": "Completed north side shingle installation and all flashing work.",
    "time_cost_labor": 500.0,
    "time_cost_notes": "Additional repair work needed on chimney flashing",
    "additional_materials": [
      {
        "description": "Extra underlayment for chimney area",
        "cost": 75.0
      },
      {
        "description": "Chimney flashing kit",
        "cost": 125.0
      }
    ],
    "total_cost_to_date": 8500.0,
    "total_paid": 7500.0,
    "total_due": 1000.0,
    "photos": ["https://storage.example.com/photos/client-abc.jpg"],
    "videos": [],
    "created_date": "2025-01-15T18:00:00Z"
  }
]
```

---

### 16. GET /api/clientupdates/{id}

**Purpose:** Get single client update (PUBLIC - no auth required)  
**When Called:** Client clicks shareable link in email

**Example:** `GET /api/clientupdates/client-update-101`

**Response:** Same as list item above

**Notes:**

- This endpoint must be publicly accessible (no authentication)
- Used for shareable client links
- Consider implementing a time-limited token for security

---

### 17. POST /api/clientupdates

**Purpose:** Create new client update  
**When Called:** User submits client update form

**Request:**

```json
{
  "project_id": "proj-456",
  "update_date": "2025-01-15",
  "description": "Completed north side shingle installation and all flashing work.",
  "time_cost_labor": 500.0,
  "time_cost_notes": "Additional repair work needed on chimney flashing",
  "additional_materials": [
    {
      "description": "Extra underlayment for chimney area",
      "cost": 75.0
    }
  ],
  "total_cost_to_date": 8500.0,
  "total_paid": 7500.0,
  "total_due": 1000.0,
  "photos": ["https://storage.example.com/photos/client-abc.jpg"],
  "videos": []
}
```

**Response:** Created client update object

---

### 18. DELETE /api/clientupdates/{id}

**Purpose:** Delete client update  
**When Called:** User removes incorrect update

**Response:**

```json
{
  "success": true
}
```

---

## File Upload

### 19. POST /api/upload

**Purpose:** Upload photos/videos for updates  
**When Called:** Photo uploader component in daily updates and client updates

**Request:** Multipart form data

```
Content-Type: multipart/form-data

file: [binary file data]
type: "photo" | "video"
```

**Response:**

```json
{
  "url": "https://storage.example.com/uploads/2025/01/abc123-photo.jpg",
  "filename": "roof-photo-north-side.jpg",
  "size": 2456789,
  "uploaded_at": "2025-01-15T16:45:00Z"
}
```

**Notes:**

- Frontend uploads files first, then includes URLs in update creation
- Consider file size limits (e.g., 10MB per photo, 100MB per video)
- Supported formats: JPG, PNG, HEIC for photos; MP4, MOV for videos

---

## Email Integration

### 20. POST /api/email/send

**Purpose:** Send email to client with update link  
**When Called:** User clicks "Send to Client" after creating client update

**Request:**

```json
{
  "to": "sarah@example.com",
  "subject": "Smith Residence - Progress Update for January 15, 2025",
  "body": "<html>...email template with styled content...</html>",
  "from_name": "John's Roofing",
  "reply_to": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message_id": "msg-abc123",
  "sent_at": "2025-01-15T18:05:00Z"
}
```

**Error Response (400/500):**

```json
{
  "error": "Failed to send email",
  "details": "Invalid recipient email address"
}
```

**Notes:**

- Email body is HTML formatted by frontend
- Consider using email service (SendGrid, AWS SES, etc.)
- Include unsubscribe link for compliance

---

## Data Models

### User Model

```typescript
interface User {
  id: string; // Unique identifier
  full_name: string; // User's full name
  email: string; // Email (unique, used for login)
  role: "admin" | "user" | "client"; // Access level
  created_date: string; // ISO 8601 timestamp
}
```

### Project Model

```typescript
interface Project {
  id: string; // Unique identifier
  project_name: string; // Project title
  address?: string; // Job site address (optional)
  project_status: ProjectStatus; // Current status
  project_budget?: number; // Total budget (optional)
  owner_user_id: string; // Contractor who owns project
  client_name?: string; // Homeowner name (optional)
  client_email?: string; // Client contact (optional)
  start_date: string; // ISO date (YYYY-MM-DD)
  expected_completion_date?: string; // Target date (optional)
  actual_completion_date?: string; // Actual completion (optional)
  created_date: string; // ISO 8601 timestamp
  updated_date?: string; // Last modified timestamp
}

type ProjectStatus = "pending" | "in_progress" | "on_hold" | "completed";
```

### DailyUpdate Model

```typescript
interface DailyUpdate {
  id: string; // Unique identifier
  project_id: string; // Parent project
  update_date: string; // ISO date (YYYY-MM-DD)
  work_summary: string; // What was done today
  materials_used?: string; // Materials description (optional)
  weather_conditions?: string; // Weather notes (optional)
  hours_worked?: number; // Hours spent (optional)
  issues_encountered?: string; // Problems/notes (optional)
  photos: string[]; // Array of photo URLs
  videos?: string[]; // Array of video URLs (optional)
  author_user_id: string; // Who created update
  created_date: string; // ISO 8601 timestamp
}
```

### ClientUpdate Model

```typescript
interface ClientUpdate {
  id: string; // Unique identifier
  project_id: string; // Parent project
  update_date: string; // ISO date (YYYY-MM-DD)
  description: string; // Work description for client
  time_cost_labor: number; // Additional labor cost
  time_cost_notes?: string; // Labor cost explanation
  additional_materials: Material[]; // Extra materials
  total_cost_to_date: number; // Running total
  total_paid: number; // Amount paid so far
  total_due: number; // Outstanding balance
  photos: string[]; // Photo URLs
  videos?: string[]; // Video URLs (optional)
  created_date: string; // ISO 8601 timestamp
}

interface Material {
  description: string; // Material name/description
  cost: number; // Material cost
}
```

---

## Common Patterns

### Filtering & Sorting

Most list endpoints support:

- **Sorting:** `?sort=field` (ascending) or `?sort=-field` (descending)
- **Limiting:** `?limit=20`
- **Filtering:** `?field=value`

**Examples:**

```
GET /api/projects?owner_user_id=user-123&sort=-created_date&limit=10
GET /api/dailyupdates?project_id=proj-456&sort=-update_date
```

### Timestamps

All dates/times use **ISO 8601 format**:

- Dates: `YYYY-MM-DD` (e.g., "2025-01-15")
- Timestamps: `YYYY-MM-DDTHH:mm:ssZ` (e.g., "2025-01-15T18:00:00Z")

### Error Responses

Standard error format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": "Additional context (optional)"
}
```

**Common HTTP Status Codes:**

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

---

## Security Considerations

### Authentication

- Use **JWT tokens** or **session cookies**
- Include in `Authorization` header: `Bearer <token>`
- Tokens should expire (e.g., 24 hours)

### Authorization

**Role-based access:**

- **Admin:** Full access to all endpoints
- **User (Contractor):** Can only access/modify their own projects and updates
- **Client:** Read-only access to specific projects (future feature)

**Endpoint permissions:**

```
POST /api/projects         → Admin or User
PUT /api/projects/{id}     → Admin or Project Owner
DELETE /api/projects/{id}  → Admin or Project Owner
PUT /api/users/{id}        → Admin only (or user updating self)
```

### Public Endpoints

Only these endpoints should be publicly accessible:

- `POST /api/auth/login`
- `GET /api/clientupdates/{id}` (for client view links)

---

## MVP Implementation Priority

**Phase 1 - Core (Week 1):**

1. Authentication (login, logout, get user)
2. Projects CRUD
3. Daily Updates CRUD

**Phase 2 - Client Communication (Week 2):** 4. Client Updates CRUD 5. File upload 6. Email sending

**Phase 3 - Polish (Week 3):** 7. User management 8. Filtering/sorting optimization 9. Error handling refinement

---

## Next Steps

1. **Backend Setup:**

   - Set up database (PostgreSQL recommended)
   - Implement authentication middleware
   - Create API endpoints following this spec

2. **Frontend Integration:**

   - Replace mock `entities.ts` with real API calls
   - Update `base44Client.ts` with your API base URL
   - Add error handling for failed requests

3. **Testing:**

   - Test each endpoint with Postman/Insomnia
   - Verify authentication flows
   - Test file upload with real images

4. **Deployment:**
   - Deploy backend to production
   - Configure CORS for frontend domain
   - Set up file storage (S3, Cloudinary, etc.)
   - Configure email service (SendGrid, etc.)

---

## Questions or Clarifications?

If you need any endpoint modified or have questions about implementation:

1. Which database are you using?
2. What authentication method do you prefer (JWT vs sessions)?
3. What file storage service will you use?
4. What email service will you use?

This spec provides everything needed for a fully functional MVP! 🚀
