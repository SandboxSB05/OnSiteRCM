# Dev Bypass Button - Quick Reference

## What Changed

### ✅ Dev Bypass Button Moved to Home Page
- **Location:** Top navigation bar on the home page
- **Appearance:** Yellow button with lightning bolt icon labeled "DEV: Skip to App"
- **Function:** Instantly logs you in as an Admin user and takes you to the Dashboard

### ✅ Removed from Login & Register Pages
- Clean login/register pages without dev clutter
- Dev bypass only accessible from the home page

### ✅ Role Switcher Fixed
- **Issue:** Role switcher wasn't properly updating the app state
- **Fix:** Now uses `window.location.href` to force a page reload after switching roles
- **Result:** Role changes now work correctly and immediately update the navigation

## How to Use

### Quick Start Development
1. Go to the home page (`http://localhost:5173/`)
2. Click the yellow **"DEV: Skip to App"** button in the top right
3. You'll be instantly logged in as an Admin and taken to the Dashboard

### Switch Roles While Testing
1. Inside the app, look for the purple **"Switch Role"** button in the sidebar
2. Click it to cycle through: Admin → Contractor → Homeowner
3. The page will reload and you'll see the navigation change based on the role

## Mock User Details

When you use the dev bypass button, you're logged in as:
```javascript
{
  id: 'dev-user-1',
  email: 'dev@onsite.com',
  name: 'Dev User',
  role: 'admin',
  company: 'OnSite Development'
}
```

## What Each Role Sees

### Admin
- Dashboard
- My Projects
- Daily Updates
- Analytics
- Customer Portal
- Users
- Settings

### Contractor (user)
- Dashboard
- My Projects
- Daily Updates
- Analytics

### Homeowner (client)
- My Projects
- Feature Request

## Important Notes

⚠️ **REMOVE BEFORE PRODUCTION!** 

Both the dev bypass button and the role switcher are for development only. Before deploying to production:

1. Remove the dev bypass button from `Home.tsx`
2. Remove or disable the role switcher in `Layout.tsx`
3. Implement proper authentication flow

## Files Modified

- ✅ `src/pages/Home.tsx` - Added dev bypass button
- ✅ `src/pages/Login.tsx` - Removed dev bypass button
- ✅ `src/pages/Register.tsx` - Removed dev bypass button
- ✅ `src/pages/Layout.tsx` - Fixed role switcher to use page reload

## Testing Checklist

- [x] Dev bypass button appears on home page
- [x] Clicking dev bypass logs you in as admin
- [x] Role switcher cycles through all three roles
- [x] Navigation updates correctly for each role
- [x] Login/Register pages are clean (no dev buttons)
- [x] Page reloads properly after role switch

---

**Status:** ✅ Complete and working

**Last Updated:** October 8, 2025
