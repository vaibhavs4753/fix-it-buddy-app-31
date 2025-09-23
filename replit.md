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
- ✅ Vite configuration updated for Replit (host: 0.0.0.0, port: 5000)
- ✅ Frontend workflow configured on port 5000 with webview output
- ✅ Supabase integration verified and working
- ✅ Application tested and running without errors
- ✅ Deployment configuration set up for autoscale deployment

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

## Recent Changes (September 23, 2025)
- Imported from GitHub and configured for Replit environment
- Fixed Vite configuration to work with Replit's proxy system
- Set up proper workflows and deployment configuration
- Verified all integrations are working correctly

## User Preferences
- Project follows React + TypeScript best practices
- Uses modern React patterns with hooks and functional components
- Follows shadcn/ui design system conventions