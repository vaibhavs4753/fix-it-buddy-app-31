# Service Marketplace App - Project Documentation

## Overview
This is a React + Vite frontend application for a service marketplace that connects clients with technicians. The application uses Supabase as the backend for authentication, data storage, and real-time features. It includes features like service booking, payment processing, live tracking with maps, and user management for both clients and technicians.

## Project Architecture
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Auth, Real-time)
- **State Management**: TanStack React Query + Context API
- **Routing**: React Router DOM
- **Maps**: Mapbox GL for location tracking

## Current Setup Status
- ✅ Dependencies installed and TypeScript configuration fixed
- ✅ Vite configuration updated for Replit (host: 0.0.0.0, port: 5000, allowedHosts: all)
- ✅ Frontend workflow configured on port 5000 with webview output
- ✅ Supabase client configuration verified and working with existing credentials
- ✅ Application tested and running without errors in development mode
- ✅ Deployment configuration set up for autoscale deployment with serve package
- ✅ All Replit environment requirements satisfied

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

## Recent Changes
- **September 25, 2025**: Fresh GitHub import successfully configured for Replit
  - Installed all npm dependencies to resolve "vite not found" error
  - Verified TypeScript configuration is working properly
  - Confirmed Vite development server runs successfully on port 5000
  - Tested frontend accessibility and confirmed HTML is being served correctly
  - Configured deployment settings for autoscale deployment target
  - Application title shows as "FixIt Pro" and is fully functional

- **September 23, 2025**: Previous setup
  - Fixed Vite configuration for ES module support (__dirname compatibility)
  - Added critical `allowedHosts: "all"` setting for Replit proxy compatibility
  - Set up workflow for development server on port 5000

## User Preferences
- Project follows React + TypeScript best practices
- Uses modern React patterns with hooks and functional components
- Follows shadcn/ui design system conventions