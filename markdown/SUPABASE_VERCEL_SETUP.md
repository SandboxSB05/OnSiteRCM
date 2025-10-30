# Supabase + Vercel Serverless Setup Guide

## Overview

This guide explains how to set up the OnSite authentication system using Supabase for the database and Vercel for serverless API endpoints.

## Architecture

```
Frontend (React) → Vercel Serverless Functions → Supabase PostgreSQL
                         ↓
                    JWT Tokens
                    bcrypt hashing
```

## Prerequisites

1. **Supabase Account** - Sign up at https://supabase.com
2. **Vercel Account** - Sign up at https://vercel.com
3. **Node.js 18+** installed locally

## Part 1: Supabase Setup

### 1.1 Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: OnSite Roofing Tracker
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### 1.2 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `api/database/schema.sql`
4. Paste into the SQL editor
5. Click **Run** to execute
6. Verify tables were created in **Table Editor**

### 1.3 Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `SUPABASE_URL`
   - **anon/public key**: `SUPABASE_ANON_KEY`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## Part 2: Local Development Setup

### 2.1 Install API Dependencies

```bash
cd api
npm install
```

This installs:

- `@supabase/supabase-js` - Supabase client
- `@vercel/node` - Vercel serverless types
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation

### 2.2 Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-random-secret-key-at-least-32-characters
```

**Generate a secure JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Test Locally with Vercel Dev

```bash
# From project root
npm install -g vercel
vercel dev
```

This starts a local server at `http://localhost:3000`

Test the endpoints:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Part 3: Vercel Deployment

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Link Project to Vercel

```bash
# From project root
vercel link
```

Follow the prompts:

- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No
- **What's your project's name?** onsite-roofing-tracker
- **In which directory is your code located?** ./

### 3.3 Add Environment Variables to Vercel

```bash
# Add Supabase URL
vercel env add SUPABASE_URL

# Add Supabase Service Key
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Add JWT Secret
vercel env add JWT_SECRET
```

For each variable:

- Choose **Production**, **Preview**, and **Development**
- Paste the value
- Press Enter

Or add them via the Vercel dashboard:

1. Go to your project on vercel.com
2. **Settings** → **Environment Variables**
3. Add each variable

### 3.4 Deploy to Production

```bash
vercel --prod
```

Your API will be available at: `https://your-project.vercel.app/api/`

## Part 4: Frontend Configuration

### 4.1 Update Frontend Environment

Create `.env` in project root:

```env
VITE_API_URL=https://your-project.vercel.app/api
```

For local development with local API:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4.2 Test Frontend Integration

1. Start the frontend dev server:

   ```bash
   npm run dev
   ```

2. Go to http://localhost:5173
3. Click "DEV: Skip to App" or try registering a real account
4. Check browser console for API calls
5. Verify in Supabase dashboard → Table Editor → users

## API Endpoints

All endpoints are available at `/api/auth/*`

### POST /api/auth/register

Register a new user account

**Request:**

```json
{
  "fullName": "John Smith",
  "email": "john@example.com",
  "company": "ABC Roofing",
  "password": "securepassword123"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Smith",
    "role": "admin",
    "company": "ABC Roofing"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Account created successfully"
}
```

### POST /api/auth/login

Authenticate user and get token

**Request:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Smith",
    "role": "admin",
    "company": "ABC Roofing"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### POST /api/auth/logout

Invalidate current session

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

Get current authenticated user

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Smith",
    "role": "admin",
    "company": "ABC Roofing"
  }
}
```

## Database Schema

The schema includes:

### Tables

- **users** - User accounts with authentication
- **sessions** - JWT token sessions
- **projects** - Roofing projects
- **daily_updates** - Daily work updates
- **materials_used** - Materials tracking
- **photos** - Project photos
- **client_updates** - Client communications

### Key Features

- UUID primary keys
- Row Level Security (RLS) enabled
- Company-based data isolation
- Automatic timestamp updates
- Foreign key constraints
- Performance indexes

## Security Features

1. **Password Hashing**

   - bcrypt with 10 salt rounds
   - Passwords never stored in plain text

2. **JWT Tokens**

   - 24-hour expiration
   - Signed with secret key
   - Includes user ID, role, company

3. **Session Management**

   - Tokens stored in database
   - Can be invalidated on logout
   - Automatic cleanup of expired sessions

4. **Row Level Security**
   - Users can only access their company's data
   - Enforced at database level

## Troubleshooting

### "Cannot find module '@vercel/node'"

```bash
cd api
npm install
```

### "Database connection failed"

- Check `SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- Check Supabase project is running

### "Invalid token" errors

- Ensure `JWT_SECRET` is the same across all environments
- Check token hasn't expired (24 hours)
- Verify `Authorization: Bearer <token>` header format

### CORS errors in development

Vercel dev should handle CORS automatically. If issues persist, you may need to add CORS headers to your API functions.

## Next Steps

1. ✅ Set up Supabase database
2. ✅ Deploy API to Vercel
3. ✅ Configure environment variables
4. ✅ Test authentication flow
5. ⏳ Implement remaining API endpoints (projects, updates, etc.)
6. ⏳ Set up file upload to Supabase Storage
7. ⏳ Implement email notifications
8. ⏳ Add AI integrations

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [JWT Best Practices](https://jwt.io/introduction)
- [bcrypt npm package](https://www.npmjs.com/package/bcryptjs)

---

**Status:** Ready for deployment  
**Last Updated:** October 9, 2025
