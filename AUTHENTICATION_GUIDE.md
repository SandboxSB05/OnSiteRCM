# Authentication System

This document explains the authentication system implemented in the OnSite Roofing Contractor Management application.

## Overview

The authentication system uses:

- **JWT tokens** for secure authentication
- **React Context** for global auth state management
- **LocalStorage** for token persistence
- **Protected routes** for access control
- **Role-based permissions** (admin, user/contractor, client/homeowner)

## File Structure

```
src/
├── services/
│   └── authService.ts          # Authentication API calls
├── contexts/
│   └── AuthContext.tsx         # Global auth state provider
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx  # Route protection component
└── pages/
    ├── Login.tsx               # Login page
    └── Register.tsx            # Registration page
```

## Components

### 1. Authentication Service (`authService.ts`)

Handles all auth-related API calls:

**Functions:**

- `login(credentials)` - Authenticate user and get token
- `register(userData)` - Create new account
- `logout()` - Clear session and tokens
- `verifySession()` - Validate current token
- `getCurrentUser()` - Get user from localStorage
- `getAuthToken()` - Get JWT token
- `isAuthenticated()` - Check if user is logged in

**Usage:**

```typescript
import { login, register, logout } from "@/services/authService";

// Login
const response = await login({ email, password });

// Register
const response = await register({ fullName, email, company, password });

// Logout
await logout();
```

### 2. Auth Context (`AuthContext.tsx`)

Provides authentication state to the entire app:

**Properties:**

- `user` - Current user object or null
- `isLoading` - Loading state during auth check
- `isAuthenticated` - Boolean if user is logged in
- `logout()` - Logout function
- `refreshUser()` - Refresh user data

**Usage:**

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

### 3. Protected Route (`ProtectedRoute.tsx`)

Guards routes that require authentication:

**Usage:**

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Protect any route
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Protect with role restriction
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminPanel />
  </ProtectedRoute>
} />
```

### 4. Login Page (`Login.tsx`)

Features:

- Email/password authentication
- Form validation
- Error handling
- "Remember me" option
- Role-based redirects (clients → MyProjects, others → Dashboard)

### 5. Register Page (`Register.tsx`)

Features:

- Full name, email, company, password fields
- Password strength indicator
- Password confirmation
- Terms of service agreement
- Form validation

## API Integration

The authentication system expects the following API endpoints:

### POST /api/auth/login

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Smith",
    "role": "admin",
    "company": "ABC Roofing"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/register

**Request:**

```json
{
  "fullName": "John Smith",
  "email": "user@example.com",
  "company": "ABC Roofing",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Smith",
    "role": "admin",
    "company": "ABC Roofing"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/logout

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Smith",
    "role": "admin",
    "company": "ABC Roofing"
  }
}
```

## User Roles

The system supports three user roles:

1. **admin** - Full access to all features
2. **user** (contractor) - Access to projects, updates, analytics
3. **client** (homeowner) - Limited access to their own projects

## Environment Variables

Set the API URL in your `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
# or for production:
VITE_API_URL=https://your-domain.com/api
```

## Setup Instructions

1. **Wrap your app with AuthProvider** (already done in `main.tsx`):

```typescript
import { AuthProvider } from "@/contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

2. **Protect routes** in your router:

```typescript
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

3. **Use auth state** in components:

```typescript
import { useAuth } from "@/contexts/AuthContext";

const { user, isAuthenticated, logout } = useAuth();
```

## Security Features

- JWT tokens stored in localStorage
- Automatic session verification on app load
- Token included in all authenticated API requests
- Automatic redirect to login on session expiry
- Password validation (minimum 8 characters)
- Email format validation
- Protected routes with role-based access control

## Development Mode

For development, there's a role switcher button in the sidebar that allows you to switch between roles without logging out:

- Admin → Contractor → Homeowner (cycles through)
- Updates localStorage and refreshes the auth context
- Automatically navigates to the appropriate landing page

**Note:** This feature should be removed or disabled in production!

## Next Steps

To complete the authentication system:

1. **Set up backend API** following the specifications in `VERCEL_SERVERLESS_STRUCTURE.md`
2. **Configure environment variables** with your API URL
3. **Test authentication flow** with real API endpoints
4. **Remove dev role switcher** before deploying to production
5. **Add password reset functionality** (forgot password flow)
6. **Implement email verification** (optional but recommended)
7. **Add refresh token mechanism** for extended sessions
