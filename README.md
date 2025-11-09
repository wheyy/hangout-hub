# Hangout Hub

## Description

Online platform that aims to streamline meet ups and location indecision.

Integrating location searching with carpark availability and navigation for an all encompassing solution.

## Deployment

This application is deployed on Vercel for production testing.

**Live Demo:** https://hangout-hub-ten.vercel.app/

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 18.3.1
- **Styling:** Tailwind CSS 4.1.9
- **Component Library:** Radix UI + shadcn/ui
- **State Management:** Zustand 5.0.8
- **Form Handling:** React Hook Form with Zod validation
- **Icons:** Lucide React, React Icons

### Maps & Location Services
- **Map Rendering:** MapLibre GL JS 5.9.0
- **Geocoding:** Google Places API (Text Search v1)
- **Routing:** OpenStreetMap Routing Machine (OSRM)
- **Coordinate Conversion:** svy21 (SVY21 ↔ WGS84 for Singapore data)

### Backend & Database
- **Authentication:** Firebase Authentication (email/password)
- **Database:** Cloud Firestore (NoSQL)
- **Admin SDK:** Firebase Admin 13.5.0

### Build Tools
- **Package Manager:** npm
- **CSS Processing:** PostCSS 8.5, Autoprefixer
- **Analytics:** Vercel Analytics

## Architecture

Hangout Hub is a Next.js web application with a client-server architecture using Firebase as the backend.

### Overview:

- **Frontend:** React-based Next.js application with server-side rendering
- **Authentication:** Firebase Authentication for user login and session management
- **Database:** Cloud Firestore (NoSQL) storing users, meetups, invitations, and real-time locations
- **State Management:** Zustand for managing global application state
- **Real-time Updates:** Firestore listeners enable live location tracking and automatic UI updates
- **External APIs:**
  - Google Places API for venue search and geocoding
  - Singapore Data.gov.sg for HDB carpark availability
  - OpenStreetMap Routing Machine (OSRM) for directions

### How It Works:

1. Users sign in via Firebase Authentication
2. Application data is stored and retrieved from Firestore
3. Real-time location sharing updates automatically through Firestore listeners
4. Map interface displays hangout spots, parking, and live member locations
5. External APIs provide venue search, parking data, and navigation

## File Structure

```
hangout-hub/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page (map interface)
│   ├── api/places/               # Google Places API routes
│   ├── auth/                     # Authentication pages (login, register, verify, reset)
│   ├── meetups/                  # Meetups list & invitations page
│   ├── meetup/[id]/              # Individual meetup page with live map
│   ├── places/[id]/              # Place details page
│   └── profile/                  # User profile management
│
├── components/                   # React components
│   ├── layout/                   # App-wide layout (header, auth guard, theme)
│   ├── map/                      # Map components (map view, search, drawers, markers, controls)
│   ├── meetup/                   # Meetup features (create, invitations, management)
│   └── ui/                       # Reusable UI primitives (shadcn/ui components)
│
├── lib/                          # Core business logic
│   ├── config/                   # Configuration
│   │   └── firebase.ts           # Firebase initialization
│   ├── auth/                     # Authentication
│   │   └── auth-service.ts       # Firebase auth operations (signup, login, password reset)
│   ├── models/                   # Domain models (Active Record pattern)
│   │   ├── user.ts               # User model with persistence methods
│   │   ├── meetup.ts             # Meetup model
│   │   ├── hangoutspot.ts        # Hangout location data
│   │   ├── parkingspot.ts        # Parking location data
│   │   ├── invitation.ts         # Invitation type definitions
│   │   └── location.ts           # Location interface
│   ├── services/                 # Business services
│   │   ├── db/                   # Database abstraction layer
│   │   │   ├── db-service.ts     # Database interface
│   │   │   ├── db-factory.ts     # Factory for DB implementation
│   │   │   ├── firestore-db.ts   # Firestore implementation (production)
│   │   │   └── mock-db.ts        # Mock implementation (testing)
│   │   ├── google-places.ts      # Google Places API wrapper
│   │   ├── carpark-api.ts        # Singapore HDB carpark integration
│   │   ├── invitations.ts        # Invitation management
│   │   ├── location-tracking.ts  # Real-time location updates
│   │   ├── osrm.ts               # OSRM routing engine
│   │   └── osrm-directions.ts    # Direction calculation
│   ├── map/                      # Map abstraction
│   │   ├── map-provider.tsx      # Map context provider
│   │   ├── maplibre-map.ts       # MapLibre wrapper
│   │   └── types.ts              # Map type definitions
│   ├── utils/                    # Utility functions
│   └── constants/                # Application constants
│   
├── hooks/                        # React hooks
│   ├── user-store.ts             # Zustand user state management
│   └── use-toast.ts              # Toast notification hook
│
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   └── singapore-boundary.json   # GeoJSON for Singapore boundary
│
└── Configuration files
    ├── package.json              # Dependencies and scripts
    ├── tsconfig.json             # TypeScript configuration
    ├── next.config.mjs           # Next.js configuration
    ├── tailwind.config.js        # Tailwind CSS configuration
    ├── postcss.config.mjs        # PostCSS configuration
    └── .env.local                # Environment variables
```

### Key Directories:

- **`app/`** - Next.js pages and API routes using the App Router architecture
- **`components/`** - Reusable React components organized by feature (layout, map, meetup, UI)
- **`lib/models/`** - Domain models with business logic that delegate persistence to database strategies
- **`lib/services/`** - Business logic and external service integrations
- **`lib/services/db/`** - Database abstraction layer implementing Strategy Pattern:
  - `db-service.ts` - Interface defining database contract (`DBInterface`)
  - `db-factory.ts` - Factory for selecting database strategy at runtime
  - `firestore-db.ts` - Firestore strategy implementation (production)
  - `mock-db.ts` - Mock strategy implementation (testing)
- **`hooks/`** - Custom React hooks for state management and UI interactions, including Observer pattern for reactive updates

## Prerequisites

- **Node.js:** Version 18.x or higher
- **npm:** Version 9.x or higher
- **Firebase Project:** Active Firebase project with Authentication and Firestore enabled
- **API Keys:** Google Places API key, Singapore Data.gov.sg HDB Carpark resource ID

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd hangout-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Google Places API
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key

   # Singapore HDB Carpark Data
   NEXT_PUBLIC_HDB_CARPARK_RESOURCE_ID=d_23f946fa557947f93a8043bbef41dd09

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Application URL (for email verification links)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**

   Navigate to `http://localhost:3000`

## Firestore Database Schema

The application uses Cloud Firestore with the following collections:

### Collections:

1. **`users`** - User profiles
   - `id` (string) - User UID from Firebase Auth
   - `name` (string) - Display name
   - `email` (string) - Email address
   - `currentLocation` (array | null) - [longitude, latitude]
   - `meetupIds` (array) - Array of meetup IDs user is part of
   - `createdAt`, `updatedAt` (timestamp)

2. **`meetups`** - Meetup data
   - `id` (string) - Auto-generated document ID
   - `title` (string) - Meetup title
   - `dateTime` (timestamp) - Scheduled date and time
   - `destination` (object) - HangoutSpot details (name, coordinates, address, etc.)
   - `creatorId` (string) - User ID of creator
   - `memberIds` (array) - Array of member user IDs
   - `members` (object) - Map of userId to member status (traveling/arrived, location sharing settings)

3. **`invitations`** - Meetup invitations
   - `id` (string) - Auto-generated document ID
   - `meetupId` (string) - Associated meetup ID
   - `senderId`, `recipientId` (string) - User IDs
   - `status` (string) - "pending" | "accepted" | "rejected"
   - `sentAt`, `respondedAt` (timestamp)

4. **`locations`** - Real-time location tracking
   - `userId` (string) - User ID
   - `meetupId` (string) - Associated meetup ID
   - `latitude`, `longitude` (number) - Coordinates
   - `timestamp` (timestamp) - Last update time

## Key Features

- **Hangout Spot Discovery** - Search for venues across Singapore using Google Places API with geofencing
- **Parking Integration** - Real-time HDB carpark availability from Singapore Data.gov.sg
- **Group Meetups** - Create and manage meetups with up to 5 members
- **Invitations System** - Send, accept, and reject meetup invitations
- **Real-Time Location Tracking** - Optional location sharing with live map updates for meetup members
- **Directions & Navigation** - Route planning using OSRM with distance and duration calculations
- **Authentication & User Management** - Secure email/password authentication with email verification
- **Responsive Design** - Desktop (split-screen with sidebars) and mobile (bottom drawer) layouts

## External Services

- **Google Places API (v1)** - Venue search, autocomplete, place details
- **Singapore Data.gov.sg** - HDB carpark information and availability
- **OpenStreetMap Routing Machine (OSRM)** - Route calculation and navigation
- **Firebase Authentication** - User authentication and session management
- **Cloud Firestore** - NoSQL database for all application data
