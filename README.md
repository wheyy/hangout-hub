# Hangout Hub

A Next.js 14 social meetup application for Singapore that helps users discover hangout spots, manage group meetups, and navigate to destinations with real-time location tracking.

## Features

- **Hangout Spot Discovery**: Search and browse cafes, restaurants, parks, and other venues in Singapore
- **Parking Integration**: Find nearby parking spots with real-time availability data
- **Group Meetups**: Create and manage meetups with friends
- **Invitations**: Send and accept meetup invitations
- **Real-time Location**: Track group members' locations during active meetups
- **Directions**: Get routing directions to destinations
- **Firebase Authentication**: Secure user authentication and authorization

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: MapLibre GL JS
- **Backend**: Firebase (Firestore, Authentication)
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hangout-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
hangout-hub/
├── app/                          # Next.js 14 App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing/home page
│   ├── create-meetup/           # Create meetup page
│   ├── explore/                 # Explore hangout spots page
│   ├── invitations/             # View invitations page
│   ├── login/                   # Login page
│   ├── meetup-details/          # Meetup details page
│   ├── meetups/                 # Active meetups list page
│   └── past-meetups/            # Past meetups history page
│
├── components/                   # React components
│   ├── layout/                  # Layout components
│   │   ├── app-header.tsx       # Main navigation header
│   │   ├── auth-guard.tsx       # Protected route wrapper
│   │   └── theme-provider.tsx   # Theme context provider
│   │
│   ├── map/                     # Map-related components
│   │   ├── hangout-drawer.tsx   # Hangout spots sidebar (desktop)
│   │   ├── parking-drawer.tsx   # Parking spots sidebar (desktop)
│   │   ├── mobile-bottom-drawer.tsx  # Combined drawer (mobile)
│   │   ├── live-location-map.tsx     # Real-time location tracking map
│   │   ├── live-map-view.tsx         # Map view wrapper
│   │   ├── hangout-spot-card.tsx     # Hangout spot display card
│   │   └── parking-spot-card.tsx     # Parking spot display card
│   │
│   ├── meetup/                  # Meetup-related components
│   │   ├── group-management.tsx      # Meetup group controls
│   │   ├── invitation-card.tsx       # Invitation display card
│   │   └── send-invite-modal.tsx     # Send invitation modal
│   │
│   └── ui/                      # Reusable UI components (shadcn/ui)
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ...                  # Other UI primitives
│
├── lib/                         # Core business logic and utilities
│   ├── models/                  # Domain models (Active Record pattern)
│   │   ├── user.ts              # User model with Firebase persistence
│   │   ├── meetup.ts            # Meetup model with Firebase persistence
│   │   ├── hangoutspot.ts       # Hangout spot model
│   │   ├── parkingspot.ts       # Parking spot model
│   │   ├── invitation.ts        # Invitation type definitions
│   │   └── location.ts          # Location interface
│   │
│   ├── services/                # Business logic with side effects
│   │   ├── invitations.ts       # Invitation management service
│   │   ├── directions-service.ts # Routing/directions API
│   │   └── carpark-api.ts       # Singapore carpark API integration
│   │
│   ├── map/                     # Map library abstraction
│   │   ├── map-provider.tsx     # Map context provider
│   │   ├── maplibre-map.ts      # MapLibre wrapper class
│   │   ├── pin-icons.ts         # Custom map marker icons
│   │   └── types.ts             # Map-related type definitions
│   │
│   ├── auth/                    # Authentication logic
│   │   └── auth-service.ts      # Firebase auth operations
│   │
│   ├── config/                  # Configuration files
│   │   └── firebase.ts          # Firebase initialization
│   │
│   ├── utils/                   # Pure utility functions
│   │   ├── helpers.ts           # General helper functions
│   │   ├── distance.ts          # Distance calculations
│   │   └── singapore-boundary.ts # Singapore boundary validation
│   │
│   └── types/                   # Shared TypeScript types
│       └── index.ts             # Common type definitions
│
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts              # Authentication hook
│   ├── user-store.ts            # User state management (Zustand)
│   └── use-location-tracking.ts # Real-time location tracking hook
│
├── public/                      # Static assets
│   └── singapore-boundary.json  # Singapore boundary GeoJSON
│
└── [config files]               # Next.js, TypeScript, Tailwind configs
```

## Architecture Overview

### Design Pattern: Active Record

The application uses the **Active Record pattern** for domain models. Each model class encapsulates both data and behavior, including Firebase persistence operations.

**Key Models:**
- `User` ([lib/models/user.ts](lib/models/user.ts)) - Handles user data and Firebase CRUD operations
- `Meetup` ([lib/models/meetup.ts](lib/models/meetup.ts)) - Manages meetup lifecycle and member tracking
- `HangoutSpot` ([lib/models/hangoutspot.ts](lib/models/hangoutspot.ts)) - Represents venue/location data
- `ParkingSpot` ([lib/models/parkingspot.ts](lib/models/parkingspot.ts)) - Represents parking location data

Each model has methods like:
- Static `create()` - Creates instance and saves to Firebase
- Static `load()` / `loadFromFirestore()` - Fetches from Firebase
- Instance `save()` - Updates Firebase document
- Instance `delete()` / `deleteMeetup()` - Removes from Firebase

### Component Architecture

The UI follows a **component composition** pattern with three main categories:

1. **Layout Components** (`components/layout/`)
   - Provide app-wide functionality (auth, navigation, theming)
   - Used in root layout to wrap all pages

2. **Feature Components** (`components/meetup/`, `components/map/`)
   - Encapsulate specific features (meetups, maps)
   - Combine UI components with business logic
   - Handle user interactions and state management

3. **UI Components** (`components/ui/`)
   - Reusable, presentational components from shadcn/ui
   - No business logic, purely visual

### Data Flow

```
User Interaction
     ↓
React Component
     ↓
Model Method (e.g., Meetup.create())
     ↓
Firebase API
     ↓
Firestore Database
```

For real-time updates:
```
Firestore Database
     ↓
Firebase Listener (in hooks/components)
     ↓
Zustand Store / React State
     ↓
React Component Re-render
```

### Key Features Explained

#### 1. Authentication Flow
- Firebase Authentication with email/password
- Protected routes use `AuthGuard` component ([components/layout/auth-guard.tsx](components/layout/auth-guard.tsx))
- User state managed via `useAuth` hook ([hooks/use-auth.ts](hooks/use-auth.ts))
- User profile stored in Firestore (`users` collection)

#### 2. Meetup Management
- Creator initializes `Meetup` via `Meetup.create()` ([lib/models/meetup.ts](lib/models/meetup.ts))
- Members join via invitations (stored in `invitations` collection)
- Meetup state synced to Firestore automatically via `save()` method
- Real-time member location tracked during active meetups

#### 3. Location Discovery
- Map interface for browsing Singapore ([components/map/live-map-view.tsx](components/map/live-map-view.tsx))
- Search functionality creates `HangoutSpot` instances from Google Places API
- Parking data fetched from Singapore government API ([lib/services/carpark-api.ts](lib/services/carpark-api.ts))
- Results filtered and displayed in responsive drawers

#### 4. Real-time Location Tracking
- Browser Geolocation API provides user coordinates
- Locations stored in Firestore with timestamps
- `useLocationTracking` hook ([hooks/use-location-tracking.ts](hooks/use-location-tracking.ts)) manages sharing state
- MapLibre renders live markers for all meetup members

#### 5. Invitations System
- Sender creates invitation via `createInvitation()` ([lib/services/invitations.ts](lib/services/invitations.ts))
- Stored in Firestore `invitations` collection
- Recipient accepts/rejects, updating meetup member list
- Status tracked: `pending`, `accepted`, `rejected`

### Utils vs Services

**Utils** ([lib/utils/](lib/utils/)) - Pure functions with no side effects:
- `calculateDistance()` - Math operations on coordinates
- `isInSingapore()` - Boundary validation
- Helper functions for formatting, validation, etc.

**Services** ([lib/services/](lib/services/)) - Functions with side effects:
- API calls (Google Maps, Singapore Carpark API)
- External integrations
- Business logic requiring I/O operations

### Map Abstraction Layer

The app uses **MapLibre GL JS** with a custom abstraction ([lib/map/maplibre-map.ts](lib/map/maplibre-map.ts)):
- Wraps MapLibre API with simpler interface
- Handles markers, routes, boundaries
- Custom pin designs ([lib/map/pin-icons.ts](lib/map/pin-icons.ts))
- Context provider for map instance sharing ([lib/map/map-provider.tsx](lib/map/map-provider.tsx))

## Firebase Collections

### `users`
```typescript
{
  id: string
  name: string
  email: string
  createdAt: timestamp
}
```

### `meetups`
```typescript
{
  id: string
  title: string
  dateTime: timestamp
  destination: HangoutSpot
  creatorId: string
  memberIds: string[]
  members: {
    [userId: string]: {
      status: "traveling" | "arrived"
      locationSharingEnabled: boolean
      arrivedAt: timestamp | null
      joinedAt: timestamp
    }
  }
}
```

### `invitations`
```typescript
{
  id: string
  meetupId: string
  meetupTitle: string
  destination: string
  dateTime: timestamp
  senderId: string
  senderName: string
  senderEmail: string
  recipientId: string
  recipientEmail: string
  recipientName: string
  status: "pending" | "accepted" | "rejected"
  sentAt: timestamp
  respondedAt?: timestamp
}
```

### `locations` (real-time tracking)
```typescript
{
  userId: string
  meetupId: string
  latitude: number
  longitude: number
  timestamp: timestamp
}
```

## Development Notes

- **Next.js App Router**: Pages are in `app/` folder, not `pages/`
- **Absolute Imports**: Use `@/` prefix (e.g., `@/lib/models/user`)
- **TypeScript**: Strict mode enabled, always type your code
- **No Backward Compatibility**: Code is kept clean without legacy support
- **Firebase Persistence**: Domain models handle their own database operations

## Contributing

1. Keep code clean and coherent
2. Follow established architectural patterns
3. Use absolute imports with `@/` prefix
4. Remove unused code immediately
5. Update types when modifying models
6. Test Firebase operations thoroughly

## License

[Add your license here]
