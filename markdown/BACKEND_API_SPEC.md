# Roof Tracker Pro - Backend API Specification

## Overview

This document outlines all the API calls your Roof Tracker Pro frontend makes. You'll need to implement these endpoints in your backend to replace the mock implementations.

---

## Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Project Management](#project-management)
3. [Daily Updates](#daily-updates)
4. [Project Collaborators](#project-collaborators)
5. [Update Threads](#update-threads)
6. [Costs & Materials](#costs--materials)
7. [Integrations (Email, AI, File Upload)](#integrations)
8. [Data Models](#data-models)

---

## Authentication & User Management

### GET /api/auth/me

**Purpose:** Get the currently logged-in user's information  
**When Called:** On every page load, Layout component initialization  
**Authentication:** Requires valid session/JWT token  
**Response:**

```json
{
  "id": "string",
  "full_name": "string",
  "email": "string",
  "role": "admin|user",
  "created_date": "ISO date string"
}
```

### POST /api/auth/login

**Purpose:** Authenticate user and create session  
**When Called:** Login page  
**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** Same as /api/auth/me

### POST /api/auth/logout

**Purpose:** End user session  
**When Called:** User clicks logout button  
**Response:** `{ "success": true }`

### GET /api/users

**Purpose:** List all users (admin only)  
**When Called:** Users page load  
**Query Parameters:**

- `sort`: Sort field (e.g., "-created_date" for descending)
- `limit`: Max results to return
  **Response:** Array of user objects

### GET /api/users?{field}={value}

**Purpose:** Filter users by specific criteria  
**When Called:** Searching for users by email, etc.  
**Example:** `/api/users?email=john@example.com`

### PUT /api/users/{id}

**Purpose:** Update user properties (like changing role)  
**When Called:** Admin changes user role  
**Request Body:**

```json
{
  "role": "admin|user",
  "full_name": "string (optional)"
}
```

---

## Project Management

### GET /api/projects

**Purpose:** List all projects  
**When Called:** Projects page (admin view), Dashboard  
**Query Parameters:**

- `sort`: e.g., "-created_date" (descending by creation date)
- `limit`: Max number of results
  **Response:** Array of project objects

### GET /api/projects?owner_user_id={userId}

**Purpose:** Filter projects by owner  
**When Called:** MyProjects page, user-specific dashboards  
**Example:** `/api/projects?owner_user_id=123`

### GET /api/projects?project_status={status}

**Purpose:** Filter projects by status  
**When Called:** Analytics, filtering completed projects  
**Possible Values:** `in_progress`, `completed`, `on_hold`, `pending`

### POST /api/projects

**Purpose:** Create a new project  
**When Called:** User submits "New Project" form  
**Request Body:**

```json
{
  "project_name": "string",
  "address": "string",
  "client_name": "string",
  "client_email": "string",
  "project_status": "string",
  "project_budget": number,
  "owner_user_id": "string",
  "start_date": "ISO date string (optional)",
  "estimated_completion_date": "ISO date string (optional)"
}
```

### PUT /api/projects/{id}

**Purpose:** Update project details  
**When Called:** Editing project, updating timeline, changing status  
**Request Body:** Any subset of project fields to update

### DELETE /api/projects/{id}

**Purpose:** Delete a project  
**When Called:** User deletes a project (if implemented)

---

## Daily Updates

### GET /api/dailyupdates

**Purpose:** List all daily updates  
**When Called:** Dashboard recent updates  
**Query Parameters:**

- `sort`: e.g., "-update_date"
- `limit`: Max results

### GET /api/dailyupdates?project_id={projectId}

**Purpose:** Get all updates for a specific project  
**When Called:** Project details page, daily updates view  
**Example:** `/api/dailyupdates?project_id=abc123`  
**Response:** Array of daily update objects

### GET /api/dailyupdates?project_id\_\_in={id1,id2,...}

**Purpose:** Get updates for multiple projects  
**When Called:** Customer portal (viewing all updates for a customer's projects)  
**Example:** `/api/dailyupdates?project_id__in=proj1,proj2,proj3`

### POST /api/dailyupdates

**Purpose:** Create a new daily update  
**When Called:** User submits daily update form  
**Request Body:**

```json
{
  "project_id": "string",
  "update_date": "ISO date string",
  "work_summary": "string",
  "materials_used": "string",
  "weather_conditions": "string",
  "hours_worked": number,
  "issues_encountered": "string",
  "ai_summary": "string (AI-generated)",
  "sent_to_customer": boolean,
  "author_user_id": "string",
  "created_by": "string (email)",
  "photos": ["array of photo URLs"]
}
```

### PUT /api/dailyupdates/{id}

**Purpose:** Update a daily update  
**When Called:**

- Editing an existing update
- Marking as sent to customer (`sent_to_customer: true`)
- Adding AI summary
- Soft delete (`deleted_at: "ISO date string"`)
  **Request Body:** Any subset of fields to update

---

## Client Updates

### GET /api/clientupdates

**Purpose:** Get all client updates  
**When Called:** Client updates list/history view  
**Query Parameters:**

- `sort` (optional): Sort order, e.g., `-update_date`
- `limit` (optional): Number of records to return

**Response:**

```json
[
  {
    "id": "string",
    "project_id": "string",
    "update_date": "ISO date string",
    "description": "string",
    "time_cost_labor": number,
    "time_cost_notes": "string",
    "additional_materials": [
      { "description": "string", "cost": number }
    ],
    "total_cost_to_date": number,
    "total_paid": number,
    "total_due": number,
    "photos": ["url1", "url2"],
    "videos": ["url1"],
    "created_date": "ISO date string"
  }
]
```

### GET /api/clientupdates?project_id={projectId}

**Purpose:** Get all client updates for a specific project  
**When Called:** Project detail page, client portal  
**Response:** Array of client update objects (same structure as above)

### GET /api/clientupdates/{id}

**Purpose:** Get a single client update (public-facing, no auth required)  
**When Called:** ClientUpdateDetail page - public link for clients  
**Response:** Single client update object

### POST /api/clientupdates

**Purpose:** Create a new client update  
**When Called:** ClientUpdates page - when generating a new update  
**Request Body:**

```json
{
  "project_id": "string (required)",
  "update_date": "ISO date string (required)",
  "description": "string (required)",
  "time_cost_labor": number,
  "time_cost_notes": "string",
  "additional_materials": [
    { "description": "string", "cost": number }
  ],
  "total_cost_to_date": number,
  "total_paid": number,
  "total_due": number,
  "photos": ["url1", "url2"],
  "videos": ["url1"]
}
```

**Response:** Created client update object with generated `id`

### PUT /api/clientupdates/{id}

**Purpose:** Update an existing client update  
**When Called:** Editing a client update  
**Request Body:** Any subset of fields to update

---

## Project Collaborators

### GET /api/projectcollaborators?user_id={userId}

**Purpose:** Find all projects where a user is a collaborator  
**When Called:** MyProjects page - to show both owned and collaborated projects  
**Response:**

```json
[
  {
    "id": "string",
    "project_id": "string",
    "user_id": "string",
    "role": "string"
  }
]
```

### POST /api/projectcollaborators

**Purpose:** Add a collaborator to a project  
**When Called:** Admin/owner adds team member to project

### DELETE /api/projectcollaborators/{id}

**Purpose:** Remove a collaborator from project  
**When Called:** Admin removes team member

---

## Update Threads

### GET /api/updatethreads?project_id={projectId}

**Purpose:** Get organized threads/folders of updates for a project  
**When Called:** UpdatesWithFolders component  
**Response:**

```json
[
  {
    "id": "string",
    "project_id": "string",
    "name": "string",
    "is_daily": boolean,
    "created_date": "ISO date string"
  }
]
```

### POST /api/updatethreads

**Purpose:** Create a new update thread/folder  
**When Called:** Auto-created for daily updates if doesn't exist  
**Request Body:**

```json
{
  "project_id": "string",
  "name": "string",
  "is_daily": boolean
}
```

---

## Costs & Materials

### GET /api/costs?project_id={projectId}

**Purpose:** Get all costs for a project  
**When Called:** Project cost breakdown, analytics

### POST /api/costs

**Purpose:** Add a cost entry to a project  
**When Called:** Tracking project expenses

### GET /api/roofingmaterials

**Purpose:** List available roofing materials  
**When Called:** Materials dropdown in daily update form

---

## Integrations

### POST /api/integrations/llm/invoke

**Purpose:** Generate AI content (summaries, insights, etc.)  
**When Called:**

- Generating AI summary for daily update
- Creating AI insights in analytics
- Auto-generating customer-friendly text
  **Request Body:**

```json
{
  "prompt": "string (the text to send to AI)",
  "model": "string (optional, e.g., 'gpt-4')",
  "temperature": number (optional, 0-1),
  "max_tokens": number (optional)
}
```

**Response:**

```json
{
  "response": "string (AI-generated text)",
  "usage": {
    "promptTokens": number,
    "completionTokens": number,
    "totalTokens": number
  }
}
```

**Implementation Notes:**

- Connect to OpenAI API, Anthropic Claude, or similar
- Store API keys securely on backend
- Consider cost tracking/billing

### POST /api/integrations/email/send

**Purpose:** Send emails to customers  
**When Called:**

- Sending daily update to customer
- Emailing project summary
- Customer notifications
  **Request Body:**

```json
{
  "to": "string or array of strings",
  "subject": "string",
  "body": "string (HTML formatted)",
  "from": "string (optional)",
  "cc": "array (optional)",
  "bcc": "array (optional)",
  "attachments": "array (optional)"
}
```

**Response:**

```json
{
  "success": boolean,
  "messageId": "string",
  "message": "string"
}
```

**Implementation Notes:**

- Use service like SendGrid, AWS SES, Mailgun, or SMTP
- Track email delivery status
- Handle bounces and unsubscribes
- Log all emails for audit trail

### POST /api/integrations/storage/upload

**Purpose:** Upload files (photos, documents)  
**When Called:**

- Photo uploader in daily updates
- Any file attachments
  **Request:** Multipart form data with file
  **Response:**

```json
{
  "success": boolean,
  "url": "string (public accessible URL)",
  "filename": "string",
  "size": number,
  "type": "string (MIME type)"
}
```

**Implementation Notes:**

- Use AWS S3, Azure Blob Storage, Cloudinary, or similar
- Validate file types and sizes
- Generate secure unique filenames
- Set appropriate permissions (public/private)
- Consider CDN for faster delivery

---

## Data Models

### Project

```json
{
  "id": "string",
  "project_name": "string",
  "address": "string",
  "client_name": "string",
  "client_email": "string",
  "project_status": "in_progress|completed|on_hold|pending",
  "project_budget": number,
  "owner_user_id": "string",
  "start_date": "ISO date string",
  "estimated_completion_date": "ISO date string",
  "actual_completion_date": "ISO date string (optional)",
  "created_date": "ISO date string",
  "updated_date": "ISO date string"
}
```

### DailyUpdate

```json
{
  "id": "string",
  "project_id": "string",
  "update_date": "ISO date string",
  "work_summary": "string",
  "materials_used": "string",
  "weather_conditions": "string",
  "hours_worked": number,
  "issues_encountered": "string",
  "ai_summary": "string",
  "sent_to_customer": boolean,
  "author_user_id": "string",
  "created_by": "string (email)",
  "photos": ["array of URLs"],
  "created_date": "ISO date string",
  "updated_date": "ISO date string",
  "deleted_at": "ISO date string (optional, for soft delete)"
}
```

### User

```json
{
  "id": "string",
  "full_name": "string",
  "email": "string (unique)",
  "password_hash": "string (never send to frontend)",
  "role": "admin|user",
  "created_date": "ISO date string",
  "updated_date": "ISO date string"
}
```

### ProjectCollaborator

```json
{
  "id": "string",
  "project_id": "string",
  "user_id": "string",
  "role": "string (optional)",
  "created_date": "ISO date string"
}
```

### UpdateThread

```json
{
  "id": "string",
  "project_id": "string",
  "name": "string",
  "is_daily": boolean,
  "created_date": "ISO date string"
}
```

---

## Common Patterns

### Sorting

- Prefix field with `-` for descending order
- Example: `sort=-created_date` (newest first)
- Example: `sort=project_name` (alphabetical)

### Filtering

- Use query parameters: `?field=value`
- Special operators:
  - `field__in=val1,val2` - Match any of the values
  - `field__gte=value` - Greater than or equal (dates, numbers)
  - `field__lte=value` - Less than or equal

### Pagination (Recommended to implement)

- `limit`: Number of results per page
- `offset`: Number to skip
- Example: `/api/projects?limit=20&offset=40` (page 3)

### Response Format

All responses should be JSON. Error responses should include:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## Security Considerations

1. **Authentication**

   - Use JWT tokens or session-based auth
   - Implement refresh tokens for long sessions
   - Require HTTPS in production

2. **Authorization**

   - Admin users can see all projects
   - Regular users can only see projects they own or collaborate on
   - Validate user permissions on every request

3. **Input Validation**

   - Sanitize all inputs to prevent SQL injection
   - Validate email formats
   - Limit file upload sizes
   - Check for XSS in text fields

4. **Rate Limiting**

   - Limit API calls per user/IP
   - Especially important for expensive operations (AI calls, emails)

5. **API Keys**
   - Store third-party API keys (OpenAI, SendGrid, etc.) in environment variables
   - Never expose in frontend code

---

## Next Steps

1. **Choose Your Backend Stack**

   - Node.js + Express + PostgreSQL
   - Python + Django/Flask + PostgreSQL
   - Ruby on Rails
   - etc.

2. **Database Setup**

   - Create tables for each model
   - Set up relationships (foreign keys)
   - Add indexes for performance

3. **Implement Endpoints**

   - Start with authentication (/api/auth/\*)
   - Then basic CRUD for projects and users
   - Add daily updates
   - Finally integrations

4. **Testing**

   - Test each endpoint with tools like Postman
   - Write integration tests
   - Test error handling

5. **Deployment**

   - Deploy backend to cloud (AWS, Heroku, DigitalOcean, etc.)
   - Set up database
   - Configure environment variables
   - Set up CI/CD

6. **Update Frontend**
   - Replace mock API calls in `src/api/` with real HTTP requests
   - Update API_BASE_URL in base44Client.js to your backend URL
   - Handle loading states and errors properly
