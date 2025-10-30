# Complete List of API Calls - Plain English

This is a complete list of every API call your Roof Tracker Pro app makes, described in simple terms.

## Authentication & Users

1. **Get Current User**

   - What: Find out who is logged in
   - When: Every page load, checking permissions
   - Returns: User's name, email, and role (admin or regular user)

2. **Login**

   - What: Sign in a user
   - When: User enters email and password
   - Does: Verify credentials, create session

3. **Logout**

   - What: Sign out the current user
   - When: User clicks logout
   - Does: End the session

4. **List All Users**

   - What: Get a list of all users in the system
   - When: Admin goes to Users page
   - Needs: Sort by creation date, limit results

5. **Find Users by Email**

   - What: Search for users by their email address
   - When: Loading author information for updates
   - Example: Find user where email = "john@example.com"

6. **Update User**
   - What: Change user information (like changing someone to admin)
   - When: Admin changes user role
   - Changes: Role, name, etc.

## Projects

7. **List All Projects**

   - What: Get all projects in the system
   - When: Admin views All Projects page
   - Needs: Sort by newest first, optional limit

8. **List My Projects**

   - What: Get projects owned by current user
   - When: Regular user views My Projects
   - Filter: Where owner_user_id = current user

9. **Filter Projects by Status**

   - What: Get only projects with certain status
   - When: Analytics showing completed projects
   - Options: in_progress, completed, on_hold, pending

10. **Get Single Project**

    - What: Load details for one specific project
    - When: Viewing project details page
    - Needs: Project ID

11. **Create New Project**

    - What: Add a brand new project
    - When: User submits "New Project" form
    - Saves: Name, address, client info, budget, status, dates

12. **Update Project**

    - What: Change project information
    - When: Editing project details, changing status, updating timeline
    - Can Update: Any field (name, budget, status, dates, etc.)

13. **Delete Project**
    - What: Remove a project
    - When: User deletes project (if you implement this feature)

## Daily Updates

14. **List All Daily Updates**

    - What: Get all updates across all projects
    - When: Admin dashboard showing recent activity
    - Needs: Sort by newest first, limit to 10-20

15. **Get Updates for One Project**

    - What: Load all daily updates for a specific project
    - When: Viewing project details, updates tab
    - Filter: Where project_id = specific project

16. **Get Updates for Multiple Projects**

    - What: Load updates for several projects at once
    - When: Customer portal viewing multiple projects
    - Filter: Where project_id is in [proj1, proj2, proj3...]

17. **Create Daily Update**

    - What: Add a new daily progress update
    - When: User submits daily update form
    - Saves: Date, work summary, materials, weather, hours, issues, photos, AI summary

18. **Update Daily Update**
    - What: Change an existing update
    - When:
      - Editing update text
      - Marking as sent to customer
      - Adding AI-generated summary
      - Deleting (soft delete with deleted_at date)

## Client Updates

19. **List All Client Updates**

    - What: Get all client-facing financial updates
    - When: Viewing client update history
    - Returns: List of client updates with financials and photos

20. **Get Client Updates for a Project**

    - What: Find all client updates for a specific project
    - When: Project detail page, client portal
    - Returns: Project's client updates sorted by date

21. **Get Single Client Update (Public)**

    - What: Get one client update without requiring login
    - When: Client clicks shareable link to view update
    - Returns: Update with description, costs, financials, photos
    - Note: This is publicly accessible for clients

22. **Create Client Update**

    - What: Generate a new client-facing project update
    - When: User fills out ClientUpdates form and clicks "Generate Update"
    - Saves:
      - Work description
      - Additional labor costs with notes
      - Additional material costs
      - Financial totals (cost to date, paid, remaining due)
      - Photos and videos

23. **Update Client Update**
    - What: Edit an existing client update
    - When: Making corrections or adding information
    - Changes: Any field in the update

## Project Collaborators

24. **Get My Collaborations**

    - What: Find all projects where I'm a collaborator (not owner)
    - When: My Projects page - showing projects I'm working on
    - Filter: Where user_id = current user

25. **Add Collaborator**

    - What: Add a team member to a project
    - When: Project owner shares project with team
    - Saves: Project ID, user ID, their role

26. **Remove Collaborator**
    - What: Remove someone from project team
    - When: Owner removes access

## Update Threads/Folders

27. **Get Update Threads**

    - What: Get organizational folders for updates
    - When: Updates page with folder view
    - Filter: Where project_id = specific project
    - Special: One thread is marked as "daily" (is_daily = true)

28. **Create Update Thread**
    - What: Make a new folder/category for updates
    - When: Auto-created for daily updates if doesn't exist
    - Saves: Name, project ID, is_daily flag

## Materials & Costs

29. **Get Project Costs**

    - What: Load all expenses for a project
    - When: Viewing project financials, cost breakdown
    - Filter: Where project_id = specific project

30. **Add Cost**

    - What: Record a new expense
    - When: Tracking project spending

31. **List Roofing Materials**
    - What: Get available materials catalog
    - When: Materials dropdown in update form

## Integrations (External Services)

32. **Generate AI Text**

    - What: Use AI to create summaries or insights
    - When:
      - Auto-generating customer-friendly update summary
      - Creating AI insights in analytics
      - Drafting professional text
      - **NEW:** Generating client update email/SMS messages
    - Sends: The prompt/text to analyze
    - Gets: AI-generated response
    - **Backend Needs:** OpenAI API, Claude API, or Gemini API

33. **Send Email**

    - What: Deliver emails to customers or team
    - When: Sending daily updates, client updates, or notifications
    - Sends: To address, subject, email body (HTML), attachments
    - **Backend Needs:** SendGrid, AWS SES, Mailgun, or SMTP server

34. **Upload File**
    - What: Upload photos or documents
    - When: Adding photos to daily updates or client updates
    - Sends: The actual file
    - Gets: Public URL where file is accessible
    - **Backend Needs:** AWS S3, Azure Blob Storage, Cloudinary, or file server

## How These Work Together

### Example Flow: Creating a Daily Update

1. User opens Daily Updates page
   - → Calls **List My Projects** to populate project dropdown
2. User selects project and fills out form
   - → Calls **Get Update Threads** to find/create daily folder
3. User uploads photos
   - → Calls **Upload File** for each photo
   - → Gets back URLs
4. User clicks "Generate AI Summary"
   - → Calls **Generate AI Text** with work description
   - → Gets back professional summary
5. User submits form
   - → Calls **Create Daily Update** with all data
6. User clicks "Send to Customer"
   - → Calls **Send Email** with customer's email and update
   - → Calls **Update Daily Update** to mark as sent

### Example Flow: Viewing Dashboard

1. Page loads
   - → Calls **Get Current User** to check who's logged in
2. If admin:
   - → Calls **List All Projects** (newest 20)
   - → Calls **List All Daily Updates** (newest 10)
3. If regular user:
   - → Calls **List My Projects** (owned by user)
   - → Calls **Get My Collaborations** (projects shared with user)
   - → Calls **Get Updates for Multiple Projects** for all user's projects

## Summary Counts

- **6** Authentication/User endpoints
- **7** Project management endpoints
- **5** Daily update endpoints
- **5** Client update endpoints _(NEW)_
- **3** Collaboration endpoints
- **2** Update thread endpoints
- **3** Cost/material endpoints
- **3** Integration endpoints (AI, Email, File Upload)

**Total: 34 API endpoints**

**Total: ~30 different API calls** your backend needs to handle

## Priority Order for Implementation

### Phase 1 - Core Functionality

1. User authentication (login, logout, me)
2. Project CRUD (create, read, update)
3. Daily update CRUD
4. User management basics

### Phase 2 - Team Features

5. Collaborators
6. Update threads/folders
7. Project filtering and search

### Phase 3 - Advanced Features

8. File uploads
9. Email integration
10. AI integration
11. Cost tracking
12. Analytics queries

## Notes

- All dates are ISO 8601 format: `"2025-10-03T14:30:00Z"`
- IDs can be strings or numbers (your choice)
- Sorting: prefix with `-` for descending (e.g., `-created_date` = newest first)
- Filtering: use query parameters (e.g., `?status=completed`)
- Pagination recommended: `?limit=20&offset=0`

Every one of these calls is currently **mocked** and will log to your browser console showing exactly what data is being requested and what your backend should return.
