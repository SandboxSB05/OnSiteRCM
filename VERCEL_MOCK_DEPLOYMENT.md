# Vercel Deployment Guide - Mock Version

This application is configured to run with **mock data only** and does NOT require any external services or API keys.

## What's Been Changed for Mock Deployment

All API endpoints in the `/api/auth/` folder now use mock data instead of connecting to Supabase:

- ✅ `/api/auth/login` - Accepts any email/password, returns mock user data
- ✅ `/api/auth/register` - Creates mock user accounts (data not persisted)
- ✅ `/api/auth/me` - Returns user info from JWT token
- ✅ `/api/auth/logout` - Returns success without database operations

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

### No Environment Variables Required!

Since this is a mock version, you don't need to set any environment variables in Vercel. The app will work without:

- ❌ SUPABASE_URL
- ❌ SUPABASE_SERVICE_ROLE_KEY
- ❌ JWT_SECRET (uses default mock secret)
- ❌ Any other API keys

## Test Accounts (Mock Data)

You can log in with any of these pre-configured accounts:

- **Admin User**
  - Email: `admin@onsite.com`
  - Password: Any password (accepts anything)
- **Regular User**
  - Email: `user@onsite.com`
  - Password: Any password
- **Client User**

  - Email: `client@example.com`
  - Password: Any password

- **Or create your own**
  - Email: any valid email format
  - Password: minimum 8 characters

## Important Notes

⚠️ **This is a DEMO/MOCK version**

- No data is persisted (everything is in-memory or JWT-based)
- No real authentication/security (any password works)
- Not suitable for production use
- No external API calls

✅ **For Production Deployment**

- Set up a real Supabase instance
- Add proper environment variables
- Restore the original API code (see `*.backup` files)
- Implement proper password hashing and validation

## Project Structure

```
/
├── api/                    # Vercel serverless functions
│   └── auth/              # Auth endpoints (using mock data)
│       ├── login.ts
│       ├── register.ts
│       ├── me.ts
│       └── logout.ts
├── src/                   # React frontend
├── dist/                  # Build output (auto-generated)
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies
```

## Build Configuration

The `vercel.json` file is configured to:

- Build the Vite React app (`npm run build`)
- Deploy TypeScript serverless functions from `/api`
- Route `/api/*` requests to serverless functions
- Route all other requests to the React SPA

## Troubleshooting

### Build fails in Vercel

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `npm run build`

### API endpoints return 404

- Check that `vercel.json` routes are configured correctly
- Ensure `/api` folder structure matches the routes

### Frontend loads but API fails

- Check browser console for CORS errors
- Verify API endpoints are deployed (check Vercel Functions tab)

## Support

For issues with the mock version deployment, check:

1. Vercel build logs
2. Browser console errors
3. API function logs in Vercel dashboard
