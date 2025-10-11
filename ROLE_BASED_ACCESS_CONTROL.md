# Role-Based Access Control (RBAC)

## Overview
The application now has proper role-based access control that restricts page access based on user roles, even if users try to access pages directly via URL.

## User Roles

### 1. **Admin** (`role: 'admin'`)
- Full access to all features
- Can manage users
- Can view all analytics and reports

### 2. **Contractor** (`role: 'contractor'`)
- Can manage their own projects
- Can create and view daily updates
- Can view analytics for their projects
- Cannot manage users

### 3. **Client** (`role: 'client'`)
- Read-only access
- Can view their projects
- Can view their analytics
- Cannot create or edit anything

## Page Access Matrix

| Page | Path | Admin | Contractor | Client | Description |
|------|------|-------|------------|--------|-------------|
| **Dashboard** | `/Dashboard` | ✅ | ✅ | ❌ | Main dashboard for contractors/admins |
| **Projects** | `/Projects` | ✅ | ✅ | ❌ | Project list and management |
| **Daily Updates** | `/DailyUpdates` | ✅ | ✅ | ❌ | Daily progress updates |
| **Analytics** | `/Analytics` | ✅ | ✅ | ❌ | Analytics dashboard |
| **Customer Portal** | `/CustomerPortal` | ✅ | ✅ | ❌ | Customer management |
| **My Projects** | `/MyProjects` | ✅ | ✅ | ✅ | View assigned projects |
| **Users** | `/Users` | ✅ | ❌ | ❌ | **Admin only** - User management |
| **Project** | `/Project` | ✅ | ✅ | ❌ | Individual project view |
| **My Analytics** | `/MyAnalytics` | ✅ | ✅ | ✅ | Personal analytics |
| **Client Updates** | `/ClientUpdates` | ✅ | ✅ | ❌ | Client update management |
| **Client Update Detail** | `/ClientUpdateDetail` | ✅ | ✅ | ✅ | View update details |

## How It Works

### 1. Authentication Check
```typescript
// First, verify user is logged in
if (!isAuthenticated || !user) {
  // Redirect to login page
}
```

### 2. Payment Verification Check
```typescript
// Second, verify payment is confirmed
if (!user.payment_verified) {
  // Redirect to payment-required page
}
```

### 3. Role-Based Access Check
```typescript
// Finally, check if user's role is allowed for this page
<ProtectedRoute allowedRoles={['admin', 'contractor']}>
  <Dashboard />
</ProtectedRoute>
```

### 4. Automatic Redirect
If a user tries to access a page they don't have permission for:
- **Clients** → Redirected to `/MyProjects`
- **Contractors/Admins** → Redirected to `/Dashboard`

## Examples

### Example 1: Client tries to access `/Dashboard`
1. User is authenticated ✅
2. Payment is verified ✅
3. Role check: Client is NOT in `['admin', 'contractor']` ❌
4. **Result:** Redirected to `/MyProjects`

### Example 2: Contractor tries to access `/Users`
1. User is authenticated ✅
2. Payment is verified ✅
3. Role check: Contractor is NOT in `['admin']` ❌
4. **Result:** Redirected to `/Dashboard`

### Example 3: Admin tries to access any page
1. User is authenticated ✅
2. Payment is verified ✅
3. Role check: Admin is in all `allowedRoles` ✅
4. **Result:** Access granted ✅

## Security Features

✅ **URL Protection** - Users cannot access pages by typing the URL directly
✅ **Role Enforcement** - Server-side role checks on all API calls (via RLS policies)
✅ **Payment Gate** - All users must have verified payment
✅ **Automatic Redirects** - Invalid access attempts redirect to appropriate pages
✅ **Type Safety** - TypeScript ensures only valid roles are used

## Testing Access Control

### Test as Admin:
1. Login with admin account
2. Should have access to ALL pages including `/Users`

### Test as Contractor:
1. Login with contractor account
2. Should have access to all pages EXCEPT `/Users`
3. Try accessing `/Users` directly - should redirect to `/Dashboard`

### Test as Client:
1. Login with client account
2. Should only access `/MyProjects`, `/MyAnalytics`, `/ClientUpdateDetail`
3. Try accessing `/Dashboard` - should redirect to `/MyProjects`
4. Try accessing `/Users` - should redirect to `/MyProjects`

## Database Security (RLS)

The role-based access is enforced at multiple levels:

1. **Frontend** - Routes block unauthorized access (this file)
2. **Database** - Row Level Security policies restrict data access
3. **API** - Serverless functions validate user permissions

### Example RLS Policy:
```sql
-- Only admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Future Enhancements

Potential improvements:
- [ ] Granular permissions (e.g., read-only contractor)
- [ ] Custom roles and permissions
- [ ] Project-specific access control
- [ ] Audit logging for access attempts
- [ ] Permission-based feature flags
