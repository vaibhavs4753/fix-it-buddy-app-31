# Database Setup Instructions for EFIX

## Problem
If you're experiencing issues with sign-in or sign-up (e.g., the process gets stuck), it's likely because the database tables haven't been created in your Supabase project yet.

## Solution
You need to run the database setup script to create the required tables, functions, and triggers.

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/evhorhcqnomgbvvufxnt
2. Click on the "SQL Editor" in the left sidebar
3. Click "New query" button

### Step 2: Run the Setup Script
1. Open the file `setup_database.sql` in this project
2. Copy all the contents of the file
3. Paste it into the Supabase SQL Editor
4. Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)

### Step 3: Verify the Setup
After running the script, you should see a success message. The script creates:
- **profiles** table - stores user information
- **technician_profiles** table - stores technician-specific data
- **service_requests** table - stores service booking requests
- **Triggers** - automatically create user profiles on sign-up
- **RLS Policies** - secure access to data
- **Functions** - for role switching and management

### Step 4: Test Authentication
1. Go back to your EFIX app
2. Try to create a new account
3. Sign in should now work properly

## What This Fixes
- ✅ Sign-up and sign-in will work correctly
- ✅ User profiles will be automatically created
- ✅ Role management (client/technician) will function
- ✅ Service requests can be created and managed
- ✅ Data is properly secured with Row Level Security

## Email Confirmation (Optional)
By default, Supabase may require email confirmation for new sign-ups. To disable this for testing:

1. Go to: https://supabase.com/dashboard/project/evhorhcqnomgbvvufxnt/auth/settings
2. Scroll to "Email Auth"
3. Toggle OFF "Enable email confirmations"
4. Click "Save"

**Note:** For production, you should keep email confirmation enabled for security.

## Need Help?
If you encounter any errors:
1. Check the error message in the SQL Editor
2. Make sure you're signed into the correct Supabase project
3. Verify your Supabase project ID matches the one in the .env file
4. Contact Supabase support if issues persist

## Database Schema Overview
```
auth.users (managed by Supabase)
    ↓
profiles (your app data)
    ↓
technician_profiles (if user is a technician)
    ↓
service_requests (bookings)
```
