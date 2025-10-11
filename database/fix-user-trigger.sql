-- Fix User Creation Trigger
-- Run this in your Supabase SQL editor

-- Option 1: DROP the trigger completely (RECOMMENDED)
-- The app now handles user creation directly in the register function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Option 2: If you want to keep the trigger, update it to be more robust
-- Uncomment the code below if you prefer to keep using a trigger

/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with default values
  INSERT INTO public.users (id, email, name, role, company)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'contractor',
    COALESCE(NEW.raw_user_meta_data->>'company', '')
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate key errors
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();
*/

-- Verify the trigger was dropped
SELECT 
  tgname as trigger_name,
  tgtype as trigger_type
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
-- Should return no rows if successfully dropped
