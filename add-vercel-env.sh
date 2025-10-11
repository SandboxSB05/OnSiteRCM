#!/bin/bash

# Script to add environment variables to Vercel
# This will add all necessary Supabase variables

echo "Adding environment variables to Vercel..."
echo ""

# Read values from .env file
source .env

echo "📝 You'll need to manually add these environment variables to Vercel:"
echo ""
echo "Go to: https://vercel.com/josh-clancys-projects/on-site-rcm/settings/environment-variables"
echo ""
echo "Add these 5 variables (select all environments: Production, Preview, Development):"
echo ""
echo "1. VITE_SUPABASE_URL"
echo "   Value: $VITE_SUPABASE_URL"
echo ""
echo "2. VITE_SUPABASE_ANON_KEY"
echo "   Value: $VITE_SUPABASE_ANON_KEY"
echo ""
echo "3. SUPABASE_URL"
echo "   Value: $SUPABASE_URL"
echo ""
echo "4. SUPABASE_ANON_KEY"
echo "   Value: $SUPABASE_ANON_KEY"
echo ""
echo "5. SUPABASE_SERVICE_ROLE_KEY"
echo "   Value: $SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "After adding all variables, redeploy with: vercel"
