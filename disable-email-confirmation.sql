-- Disable Email Confirmation for Testing
-- Copy this into your Supabase SQL Editor

-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET enable_signup = true,
    enable_confirmations = false,
    enable_email_change_confirmations = false;

-- Alternative: Update the auth.users table to mark existing users as confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL; 