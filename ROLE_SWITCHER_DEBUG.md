# Role Switcher - Debug Guide

## Current Issue

**Symptom:** localStorage shows `role: "admin"` but the app displays "Homeowner" in button and shows Contractor view

**Root Cause:** State synchronization issue between localStorage and React Context

## Debug Steps

### 1. Open Browser Console

Open your browser's developer tools (F12 or Cmd+Option+I) and go to the Console tab.

### 2. Clear Everything and Start Fresh

```javascript
// Run this in the console to clear everything
localStorage.clear();
location.reload();
```

### 3. Click "DEV: Skip to App" Button

Watch the console. You should see:

```
🔐 AuthContext.setUser called: { previous: null, new: 'admin', newUserFull: {...} }
👤 Layout: User changed: { role: 'admin', name: 'Dev User', id: 'dev-user-1' }
📋 Navigation Items Updated: { role: 'admin', itemCount: 8, items: [...] }
```

### 4. Click "Switch Role" Button

Watch the console. You should see:

```
🔄 Role Switch: { currentRole: 'admin', nextRole: 'user', currentIndex: 0 }
📝 Updated User: { id: 'dev-user-1', email: 'dev@onsite.com', name: 'Dev User', role: 'user', ... }
🔐 AuthContext.setUser called: { previous: 'admin', new: 'user', newUserFull: {...} }
👤 Layout: User changed: { role: 'user', name: 'Dev User', id: 'dev-user-1' }
📋 Navigation Items Updated: { role: 'user', itemCount: 4, items: [...] }
🚀 Navigating to: /Dashboard
```

### 5. Check localStorage

In the console, run:

```javascript
JSON.parse(localStorage.getItem("roof_tracker_user"));
```

The role should match what you see in the UI.

## What Each Log Means

| Log Emoji | What It Shows                      | File              |
| --------- | ---------------------------------- | ----------------- |
| 🔐        | AuthContext is updating user state | `AuthContext.tsx` |
| 👤        | Layout component received new user | `Layout.tsx`      |
| 📋        | Navigation items recalculated      | `Layout.tsx`      |
| 🔄        | Role switch initiated              | `Layout.tsx`      |
| 📝        | New user object created            | `Layout.tsx`      |
| 🚀        | Navigation triggered               | `Layout.tsx`      |

## Expected Flow

```
User clicks "Switch Role"
  ↓
1. Calculate next role (admin → user → client)
   LOG: 🔄 Role Switch
  ↓
2. Create updated user object
   LOG: 📝 Updated User
  ↓
3. Update localStorage
  ↓
4. Call setUser(updatedUser) in AuthContext
   LOG: 🔐 AuthContext.setUser called
  ↓
5. Layout receives updated user via useAuth()
   LOG: 👤 Layout: User changed
  ↓
6. Navigation items recalculated (useMemo)
   LOG: 📋 Navigation Items Updated
  ↓
7. Toast notification appears
  ↓
8. Navigate to appropriate page
   LOG: 🚀 Navigating to
  ↓
9. UI updates with new navigation
```

## Common Issues

### Issue 1: "User changed" log shows old role

**Cause:** setUser not being called or AuthContext not propagating
**Fix:** Check that setUser is exposed in AuthContext value

### Issue 2: Navigation items don't recalculate

**Cause:** useMemo dependencies not set up correctly
**Fix:** Ensure `useMemo(..., [user?.role])` has role in deps

### Issue 3: localStorage has one role, UI shows another

**Cause:** AuthContext initialized with stale data
**Fix:** Hard reload (Cmd+Shift+R) or clear localStorage

### Issue 4: Button shows wrong role label

**Cause:** User object not being read correctly in template
**Fix:** Check `user?.role` is being accessed correctly

## Manual Testing Checklist

- [ ] Clear localStorage and reload
- [ ] Click "DEV: Skip to App"
- [ ] Verify you see Admin navigation (8 items)
- [ ] Verify button says "Switch Role (Admin)"
- [ ] Click "Switch Role"
- [ ] Verify you see Contractor navigation (4 items)
- [ ] Verify button says "Switch Role (Contractor)"
- [ ] Click "Switch Role"
- [ ] Verify you see Homeowner navigation (2 items)
- [ ] Verify button says "Switch Role (Homeowner)"
- [ ] Verify you're redirected to MyProjects
- [ ] Click "Switch Role"
- [ ] Verify you're back to Admin
- [ ] Verify you're redirected to Dashboard

## If It Still Doesn't Work

### Check 1: Verify AuthContext exports setUser

```typescript
// In src/contexts/AuthContext.tsx
const value: AuthContextType = {
  user,
  isLoading,
  isAuthenticated: !!user,
  logout,
  refreshUser,
  setUser, // ← Must be here!
};
```

### Check 2: Verify Layout imports setUser

```typescript
// In src/pages/Layout.tsx
const { user, logout: authLogout, setUser } = useAuth();
//                                  ^^^^^^^ Must destructure this
```

### Check 3: Verify useMemo has role dependency

```typescript
// In src/pages/Layout.tsx
const navigationItems = useMemo(() => {
  return getUserNavigationItems(user?.role || "user");
}, [user?.role]); // ← Must include role
//  ^^^^^^^^^^
```

## Emergency Reset

If all else fails, run this in console:

```javascript
// Nuclear option - clear everything and reload
localStorage.clear();
sessionStorage.clear();
location.href = "/";
```

---

**Status:** Debugging with console logs  
**Updated:** October 8, 2025
