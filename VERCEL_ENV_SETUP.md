# Setting Environment Variables in Vercel

Your serverless function needs these environment variables to be set in Vercel. Here's how:

## Method 1: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/josh-clancys-projects/on-site-rcm
2. Click on **Settings**
3. Click on **Environment Variables**
4. Add these variables:

| Name                        | Value                                      | Environments                     |
| --------------------------- | ------------------------------------------ | -------------------------------- |
| `SUPABASE_URL`              | `https://zynznjrkzmuokbiiyhcu.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY`         | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`  | Production, Preview, Development |

5. Save each variable

## Method 2: Via Vercel CLI

Run these commands:

```bash
# Add SUPABASE_URL
vercel env add SUPABASE_URL

# When prompted:
# - Enter the value: https://zynznjrkzmuokbiiyhcu.supabase.co
# - Select all environments (Production, Preview, Development)

# Add SUPABASE_ANON_KEY
vercel env add SUPABASE_ANON_KEY

# When prompted:
# - Enter the value from your .env file
# - Select all environments

# Add SUPABASE_SERVICE_ROLE_KEY (IMPORTANT - Keep secret!)
vercel env add SUPABASE_SERVICE_ROLE_KEY

# When prompted:
# - Enter the value from your .env file
# - Select all environments
```

## After Adding Variables

You MUST redeploy for the variables to take effect:

```bash
vercel --prod
# or for preview
vercel
```

## Check if Variables Are Set

To verify variables are set:

```bash
vercel env ls
```

## Current Issue

The "Unexpected end of JSON input" error means the API is returning an empty response, likely because:

- Environment variables are missing in Vercel
- The Supabase client can't initialize without them
- The function fails silently

Once you add the environment variables and redeploy, the registration should work!
