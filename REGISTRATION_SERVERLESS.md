# User Registration with Serverless Function

## Overview

User registration is now handled by a serverless function (`/api/auth/register`) that uses the Supabase service role key to bypass Row Level Security (RLS) policies. This ensures secure user creation without exposing sensitive operations to the frontend.

## Architecture

### Frontend Flow

1. User fills out registration form (`src/pages/Register.tsx`)
2. Form data is sent to `authService.register()` (`src/services/authService.ts`)
3. `authService.register()` calls `/api/auth/register` serverless endpoint
4. Response with user data and session is returned to frontend

### Backend Flow (Serverless Function)

1. **Validation**: Validates all required fields (name, email, company, password)
2. **Email Check**: Checks if user already exists
3. **Auth Creation**: Creates user in Supabase Auth using `admin.createUser()` with service role
4. **Profile Creation**: Creates user profile in `public.users` table (bypassing RLS)
5. **Session Creation**: Signs in the user and returns session token
6. **Error Handling**: If any step fails, cleans up (deletes auth user if profile creation fails)

## File Changes

### 1. Created: `/api/auth/register.ts`

- Serverless function that handles user registration
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- Creates both auth user and profile record
- Auto-confirms email (can be modified to send confirmation emails)
- Returns user object and session for immediate login

### 2. Updated: `/src/services/authService.ts`

- Changed `register()` function to call serverless API instead of direct Supabase
- Sets session in Supabase client after successful registration
- Proper error handling with meaningful messages

### 3. Updated: `/api/package.json`

- Added `jsonwebtoken` dependency for JWT token generation
- Added `@types/jsonwebtoken` for TypeScript support

## Environment Variables Required

The serverless function requires these environment variables (already in `.env.local`):

```bash
VITE_SUPABASE_URL=https://zynznjrkzmuokbiiyhcu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoint Specification

### POST /api/auth/register

**Request Body:**

```json
{
  "fullName": "John Smith",
  "email": "john@example.com",
  "company": "ABC Roofing",
  "phone": "555-1234",
  "password": "securepassword123",
  "role": "contractor"
}
```

**Success Response (201):**

```json
{
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Smith",
    "role": "contractor",
    "company": "ABC Roofing",
    "phone": "555-1234"
  },
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 3600
  },
  "token": "jwt-token-for-backwards-compatibility",
  "message": "Registration successful"
}
```

**Error Responses:**

- **400 Bad Request**: Missing required fields or validation errors
- **409 Conflict**: Email already exists
- **500 Internal Server Error**: Database or auth service errors

## Security Features

1. **Service Role Key**: Only used server-side, never exposed to frontend
2. **Email Validation**: Validates email format before creation
3. **Password Strength**: Enforces minimum 8 character password
4. **Duplicate Prevention**: Checks for existing users before creation
5. **Transaction Safety**: Deletes auth user if profile creation fails (atomic operation)
6. **RLS Bypass**: Only the serverless function can bypass RLS, not the frontend

## Database Schema

The function creates records in two places:

1. **Supabase Auth (`auth.users`)**: Managed by Supabase Auth

   - Stores encrypted password
   - Handles authentication tokens
   - Email verification status

2. **Public Users Table (`public.users`)**: Application profile
   - User profile information
   - Role and company data
   - Application-specific data

## Testing the Registration

1. Start the development server:

```bash
npm run dev
```

2. Navigate to the registration page
3. Fill out the form with:

   - Full Name
   - Email (must be unique)
   - Company
   - Phone (optional)
   - Password (min 8 characters)

4. Submit the form

5. Check for success:
   - User should be redirected to dashboard
   - User data should be in AuthContext
   - Session should be active in Supabase

## Troubleshooting

### "Failed to create user profile"

- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify that the `users` table exists in Supabase
- Check Supabase logs for RLS policy issues

### "Email already exists"

- User with that email is already registered
- Check Supabase Dashboard > Authentication > Users
- Delete test users if needed

### Session not created

- User is created but not automatically logged in
- User can manually log in using the login page
- Check Supabase Auth settings for email confirmation requirements

## Next Steps

1. **Email Verification**: Configure email confirmation flow
2. **Password Reset**: Add password reset serverless function
3. **Role Management**: Add admin endpoints to manage user roles
4. **Audit Logging**: Log user creation events for security
5. **Rate Limiting**: Add rate limiting to prevent abuse
