# EFIX Service Marketplace - Project Documentation

## Overview
EFIX is a React + Vite frontend application for a service marketplace that connects clients with professional technicians. The application features a modern dark theme with yellow/gold branding (HSL 45 93% 47%), uses Supabase as the backend for authentication, data storage, and real-time features. It includes service booking, payment processing, live tracking with maps, and user management for both clients and technicians providing electrical, mechanical, and plumbing services.

## Project Architecture
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Auth, Real-time)
- **State Management**: TanStack React Query + Context API
- **Routing**: React Router DOM
- **Maps**: Mapbox GL for location tracking

## Current Setup Status
- ✅ Dependencies installed (475 packages)
- ✅ Vite configuration updated for Replit (host: 0.0.0.0, port: 5000)
- ✅ Frontend workflow configured on port 5000 with webview output
- ✅ Supabase client configuration verified with hardcoded credentials
- ✅ Application tested and running without errors in development mode
- ✅ Deployment configuration set up for autoscale deployment with build + serve
- ✅ All Replit environment requirements satisfied
- ✅ GitHub import completed successfully (October 4, 2025)

## Key Features
- Dual user types: Clients and Technicians  
- Service booking and management
- Real-time location tracking
- Payment processing
- Profile setup for both user types
- Protected routes with authentication

## Development Workflow
- Run `npm run dev` to start the development server on port 5000
- The application uses Supabase for all backend services
- Maps functionality requires Mapbox token configuration

## Database Setup (Required for Full Functionality)
⚠️ **IMPORTANT**: Before using authentication features, you need to set up the database:
1. Open `setup_database.sql` in this project
2. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/evhorhcqnomgbvvufxnt/sql
3. Copy and paste the entire SQL script
4. Run it to create all required tables, triggers, and functions

See `DATABASE_SETUP_INSTRUCTIONS.md` for detailed instructions.

**Note**: The app will work in limited mode without database setup (using local user metadata), but features like profiles, technician management, and service requests require the database to be properly configured.

## Recent Changes
- **October 4, 2025**: Fresh GitHub clone setup for Replit environment
  - Installed all 475 npm dependencies successfully
  - Fixed Vite configuration to use port 5000 (was previously 8080)
  - Configured development workflow on port 5000 with proper host settings (0.0.0.0)
  - Validated Supabase integration with hardcoded credentials in client.ts
  - Set up autoscale deployment with build step and serve
  - Application running successfully with EFIX branding and dark theme
  - Login page tested and displaying correctly

- **October 3, 2025**: Fixed authentication issues and improved database setup
  - **IMPORTANT**: Created `setup_database.sql` file to set up required database tables
  - Added `DATABASE_SETUP_INSTRUCTIONS.md` with step-by-step setup guide
  - Improved AuthContext error handling to work even when database tables don't exist
  - App now uses fallback to user_metadata if profiles table is missing
  - Authentication will now work, but for full functionality you need to run the SQL setup script

- **October 1, 2025**: Complete EFIX rebrand and dark theme implementation
  - Rebranded entire application from "FixIt Pro" to "EFIX"
  - Implemented EFIX yellow/gold color scheme (HSL 45 93% 47%) as primary brand color
  - Applied comprehensive dark theme across all main interfaces:
    - Login and Auth pages with dark backgrounds and EFIX branding
    - Client Home with dark theme (bg-neutral-900/black) and yellow accents
    - Client Services selection with icon-based design using primary color
    - Technician Home with dark theme, status toggle, and welcome card
    - Footer updated to dark theme with EFIX branding
  - Created MenuSidebar component with Help, Payment, History, Settings options
  - Standardized all service icons to use consistent EFIX yellow color
  - Updated index.html with EFIX title, description, and OpenGraph/Twitter meta tags
  - Ensured all text is readable with white/neutral-400 colors on dark backgrounds

- **October 1, 2025**: Initial GitHub import configuration
  - Installed all npm dependencies (467 packages)
  - Verified TypeScript configuration is working properly
  - Confirmed Vite development server runs successfully on port 5000
  - Configured deployment settings for autoscale deployment with build + serve
  - Tested production build successfully (built in 10.37s)
  - Added .env files to .gitignore for security
  - Verified existing Supabase credentials working from .env file

- **September 25, 2025**: Previous setup
  - Fixed Vite configuration for ES module support (__dirname compatibility)
  - Added critical `allowedHosts: "all"` setting for Replit proxy compatibility
  - Set up workflow for development server on port 5000

## User Preferences
- Project follows React + TypeScript best practices
- Uses modern React patterns with hooks and functional components
- Follows shadcn/ui design system conventions