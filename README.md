# Service Marketplace

A modern React application for connecting clients with technicians. This service marketplace allows clients to book various services and enables technicians to manage their service offerings and appointments.

## Features

### For Clients
- Browse and book various services
- Real-time tracking of technician location
- Secure payment processing
- Service request management
- Profile management

### for Technicians
- Service offering management
- Request handling and scheduling
- Location tracking for clients
- Profile and availability management

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: TanStack React Query + Context API
- **Routing**: React Router DOM
- **Maps**: Mapbox GL for location tracking

## Getting Started

### Prerequisites
- Node.js 20+ or Bun
- A Supabase account and project
- Mapbox account for map features

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Set up your environment variables:
   - Supabase URL and anon key (configured in `src/integrations/supabase/client.ts`)
   - Mapbox API key (for map functionality)

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Project Structure

- `/src/components/` - Reusable UI components
- `/src/pages/` - Page components organized by user type (client/technician)
- `/src/context/` - React context providers for auth and services
- `/src/integrations/supabase/` - Supabase client and type definitions
- `/src/hooks/` - Custom React hooks
- `/supabase/` - Database migrations and functions

## Deployment

The application is configured for deployment on various platforms:

- **Build**: `npm run build`
- **Preview**: `npm run preview`

The build outputs to the `dist/` directory and can be served statically.

## Database Schema

The application uses Supabase with the following main tables:
- Users (clients and technicians)
- Services
- Service requests
- Profiles
- Location tracking

See `/supabase/migrations/` for detailed schema definitions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.