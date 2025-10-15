# Hangout Hub - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Data Models](#data-models)
6. [Frontend Structure](#frontend-structure)
7. [Map Integration](#map-integration)
8. [Services & Business Logic](#services--business-logic)
9. [Current Implementation Status](#current-implementation-status)
10. [Comparison with Class Diagram](#comparison-with-class-diagram)
11. [Missing & Incomplete Features](#missing--incomplete-features)
12. [Next Steps](#next-steps)

---

## Overview

**Hangout Hub** is a map-first social meetup application designed for discovering hangout spots and coordinating group meetings with live location sharing, specifically targeting Singapore locations.

### Core Purpose
- Help users discover hangout spots (cafes, restaurants, parks, etc.)
- Create and manage meetup sessions
- Share live locations during active meetups
- View nearby parking information
- Search and filter places by various criteria

### Key Features
- Interactive map interface with Google Maps integration
- Real-time meetup coordination
- Live location sharing for active sessions
- Parking availability integration
- Advanced search and filtering
- Mobile-responsive design

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **Component Library**: Radix UI (shadcn/ui components)
- **Icons**: Lucide React, React Icons
- **Map Provider**: @vis.gl/react-google-maps 1.5.5
- **Forms**: React Hook Form 7.60.0 with Zod validation
- **Date Handling**: date-fns 4.1.0

### Development Tools
- TypeScript with strict mode
- ESLint for code quality
- PostCSS with Tailwind

### Backend/Database
**Status**: NOT YET IMPLEMENTED
- Placeholder database client exists at [lib/database.ts](lib/database.ts:1)
- Planned: Supabase (based on code comments)
- Auth: Placeholder service at [lib/auth.ts](lib/auth.ts:1)

### Analytics
- Vercel Analytics 1.3.1

---

## Project Structure

```
hangout-hub/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with fonts and analytics
│   ├── page.tsx                 # Home page (map interface)
│   ├── loading.tsx              # Loading state
│   ├── auth/                    # Authentication pages
│   │   ├── login/page.tsx      # Login page
│   │   └── register/page.tsx   # Registration page
│   ├── search/page.tsx          # Search & filter interface
│   ├── meetups/page.tsx         # Meetups list
│   ├── meetup/[id]/page.tsx     # Individual meetup details (with edit capability)
│   ├── sessions/                # Session management
│   │   ├── page.tsx            # Sessions list
│   │   ├── [id]/page.tsx       # Session details
│   │   ├── [id]/live/page.tsx  # Live session with real-time tracking
│   │   └── create/page.tsx     # Create new session
│   ├── places/[id]/page.tsx     # Place details page
│   ├── profile/page.tsx         # User profile with edit functionality
│   └── landing/page.tsx         # Landing page
│
├── components/                   # React components
│   ├── ui/                      # Shadcn UI components (71 files)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   └── ... (67 more UI components)
│   ├── map/                     # Map-related components
│   │   ├── map-controls.tsx    # Zoom, location controls
│   │   ├── map-markers.tsx     # Renders spot and parking markers
│   │   ├── search-bar.tsx      # Map search interface
│   │   ├── explore-drawer.tsx  # Desktop: Browse spots sidebar
│   │   ├── parking-drawer.tsx  # Desktop: Parking info sidebar
│   │   ├── bottom-sheet.tsx    # Mobile: Bottom drawer for spots/parking
│   │   ├── directions-bar.tsx  # Navigation directions display
│   │   └── create-meetup-fab.tsx # Floating action button
│   ├── meetup/                  # Meetup-specific components
│   │   ├── create-meetup-modal.tsx
│   │   ├── members-drawer.tsx
│   │   ├── session-header.tsx
│   │   └── session-map-markers.tsx
│   ├── navbar.tsx               # Navigation bar (responsive)
│   ├── auth-guard.tsx           # Authentication wrapper
│   ├── theme-provider.tsx       # Theme context
│   ├── live-location-map.tsx    # Live tracking map
│   ├── live-map-view.tsx        # Live map view for sessions
│   ├── group-management.tsx     # Manage meetup members
│   └── real-time-session-status.tsx # Real-time status updates
│
├── lib/                         # Core library code
│   ├── types.ts                # Global TypeScript interfaces
│   ├── utils.ts                # Utility functions (cn, etc.)
│   ├── database.ts             # Database client (NOT IMPLEMENTED)
│   ├── auth.ts                 # Auth service (NOT IMPLEMENTED)
│   │
│   ├── data/                   # Data models and mock data
│   │   ├── location.ts         # Location interface
│   │   ├── user.ts             # User class
│   │   ├── meetup.ts           # Meetup class
│   │   ├── hangoutspot.ts      # HangoutSpot interface + mock data
│   │   └── parkingspot.ts      # ParkingSpot class
│   │
│   ├── map/                    # Map abstraction layer
│   │   ├── types.ts            # MapAdapter interface
│   │   ├── map-provider.tsx    # Map context provider
│   │   ├── adapters/
│   │   │   ├── mock-map.tsx    # Mock map for testing
│   │   │   └── google-map-adapter.tsx # Google Maps implementation
│   │   └── google-visgl-adapter.tsx # Alternative Google adapter
│   │
│   ├── meetup/                 # Meetup business logic
│   │   ├── meetup-types.ts     # MeetupSession, MeetupMember types
│   │   └── meetup-service.ts   # In-memory meetup management
│   │
│   ├── search/                 # Search functionality
│   │   └── search-service.ts   # Search and filtering logic
│   │
│   └── directions/             # Directions service
│       └── directions-service.ts # Navigation/routing
│
├── hooks/                       # Custom React hooks
│   ├── use-toast.ts            # Toast notifications
│   └── use-mobile.ts           # Mobile detection
│
├── public/                      # Static assets
├── styles/                      # Global styles
├── scripts/                     # Build/utility scripts
└── .vscode/                     # VS Code settings
```

---

## Architecture & Design Patterns

### Frontend Architecture

#### App Router Structure
The app uses Next.js 14's App Router with:
- Server-side rendering by default
- Client components marked with `"use client"`
- Route-based code splitting
- Loading states with `loading.tsx`

#### Component Architecture
1. **UI Components** (Radix UI + Tailwind)
   - Atomic, reusable components in [components/ui/](components/ui/)
   - Consistent styling with `cn()` utility from [lib/utils.ts](lib/utils.ts:1)

2. **Feature Components**
   - Map-related: [components/map/](components/map/)
   - Meetup-related: [components/meetup/](components/meetup/)
   - Domain-specific logic and state

3. **Page Components**
   - Route-level components in [app/](app/)
   - Compose feature components
   - Handle data fetching (currently mock data)

#### State Management
- **Local State**: React `useState` hooks
- **Context**: Map provider context at [lib/map/map-provider.tsx](lib/map/map-provider.tsx:1)
- **No Global State Manager**: Currently no Redux/Zustand
  - All data is local or mock
  - Real implementation will likely need global state for user session, active meetups, etc.

### Map Abstraction Layer

The app implements an **Adapter Pattern** for map providers:

```typescript
// lib/map/types.ts defines MapAdapter interface
interface MapAdapter {
  initialize(container: HTMLElement, options: MapOptions): Promise<void>
  setCenter(lng: number, lat: number): void
  addMarker(marker: MarkerOptions): string
  // ... more methods
}
```

**Current Adapters**:
1. **MockMapAdapter** ([lib/map/adapters/mock-map.tsx](lib/map/adapters/mock-map.tsx:1)) - Active in production
2. **GoogleMapAdapter** ([lib/map/adapters/google-map-adapter.tsx](lib/map/adapters/google-map-adapter.tsx:1)) - Exists but not fully integrated

**Why This Pattern?**
- Allows switching map providers without changing app code
- Easy testing with mock implementation
- Future-proof for adding MapLibre, Mapbox, etc.

### Responsive Design Pattern
- **Desktop**: Side drawers for explore/parking ([components/map/explore-drawer.tsx](components/map/explore-drawer.tsx:1))
- **Mobile**: Bottom sheet with tabs ([components/map/bottom-sheet.tsx](components/map/bottom-sheet.tsx:1))
- Hook: `useIsMobile()` from [hooks/use-mobile.ts](hooks/use-mobile.ts:1)

---

## Data Models

### Core Entities

#### User
**Location**: [lib/data/user.ts](lib/data/user.ts:1)

```typescript
class User {
  id: string
  name: string
  email: string
  currentLocation: GeolocationCoordinates
  private meetups: Meetup[]

  addMeetup(meetup: Meetup): void
  removeMeetup(meetup: Meetup): void
  getMeetups(): Array<Meetup>
}
```

**Also Defined**: `AuthUser` interface in [lib/auth.ts](lib/auth.ts:1-6)

#### HangoutSpot
**Location**: [lib/data/hangoutspot.ts](lib/data/hangoutspot.ts:1)

```typescript
interface HangoutSpot {
  id: string
  name: string
  category: string
  priceRange: "$" | "$$" | "$$$" | "$$$$"
  rating: number
  reviewCount: number
  coordinates: [number, number] // [lng, lat]
  address: string
  description: string
  imageUrl: string
  amenities: string[]
  openingHours: string
  parkingInfo?: {
    available: boolean
    type: "street" | "indoor" | "surface" | "mall"
    capacity?: number
    occupied?: number
    pricePerHour?: number
  }
}
```

**Mock Data**: 4 Singapore spots defined in same file ([lib/data/hangoutspot.ts](lib/data/hangoutspot.ts:27-112))
- Marina Bay Sands SkyPark
- Gardens by the Bay
- East Coast Park
- Lau Pa Sat

**Note**: A commented-out `HangoutSpot` class exists ([lib/data/hangoutspot.ts](lib/data/hangoutspot.ts:137-186)) with getter/setter methods, but is not currently used.

#### Meetup
**Location**: [lib/data/meetup.ts](lib/data/meetup.ts:1)

```typescript
class Meetup {
  id: string
  title: String
  dateTime: Intl.DateTimeFormat
  destination: HangoutSpot
  leader: User
  private members: User[]

  addMember(user: User): void
  removeMember(user: User): void
  start(): void
  end(): void
  updateDateTime(newDateTime: Intl.DateTimeFormat): boolean
  updateLeader(newLeader: User): boolean
  updateDestination(newHangoutSpot: HangoutSpot): boolean
  updateTitle(newTitle: String): boolean
}
```

#### MeetupSession (Alternative Model)
**Location**: [lib/meetup/meetup-types.ts](lib/meetup/meetup-types.ts:1)

```typescript
interface MeetupSession {
  id: string
  title: string
  hostId: string
  hostName: string
  destination: {
    name: string
    coordinates: [number, number]
    address: string
  }
  scheduledTime: Date
  status: "scheduled" | "active" | "ended"
  members: MeetupMember[]
  createdAt: Date
  startedAt?: Date
  endedAt?: Date
}

interface MeetupMember {
  id: string
  name: string
  avatar: string
  status: "invited" | "accepted" | "on-the-way" | "arrived" | "sharing" | "paused"
  location?: [number, number]
  lastUpdated?: Date
  joinedAt?: Date
  arrivedAt?: Date
}
```

**Note**: This is a **different model** than the `Meetup` class above. Used by `MeetupService`.

#### ParkingSpot
**Location**: [lib/data/parkingspot.ts](lib/data/parkingspot.ts:1)

```typescript
class ParkingSpot implements Location {
  name: string
  address: string
  coordinates: GeolocationCoordinates
  carparkCode: string
  rate: string
  totalCapacity: number
  currentAvailability: number
  parkingType: ParkingType // enum: MSCP, StreetParking, OutdoorParking
  operatingHours: string

  // Getters and update methods
}
```

#### Session (Generic Model)
**Location**: [lib/types.ts](lib/types.ts:28-40)

```typescript
interface Session {
  id: string
  title: string
  description?: string
  place_id: string
  creator_id: string
  scheduled_time: string
  status: SessionStatus // "planned" | "active" | "completed" | "cancelled"
  max_participants?: number
  is_location_sharing_enabled: boolean
  created_at: string
  updated_at: string
}
```

**Note**: Another session model, likely intended for database schema.

### Type Enumerations

**Location**: [lib/types.ts](lib/types.ts:60-66)

```typescript
type PlaceCategory = "cafe" | "restaurant" | "park" | "mall" | "entertainment" | "sports" | "cultural"
type PriceRange = "free" | "budget" | "moderate" | "expensive"
type SessionStatus = "planned" | "active" | "completed" | "cancelled"
type ParticipantStatus = "invited" | "accepted" | "declined" | "maybe"
```

### Location Sharing
**Location**: [lib/types.ts](lib/types.ts:50-58)

```typescript
interface LocationShare {
  id: string
  session_id: string
  user_id: string
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: string
}
```

---

## Frontend Structure

### Pages

#### Home Page ([app/page.tsx](app/page.tsx:1))
- **Route**: `/`
- **Purpose**: Main map interface
- **Components**:
  - `MapProviderComponent` (mock provider active)
  - `MapMarkers` - Displays hangout spots and parking
  - `MapControls` - Zoom/location buttons
  - `SearchBar` - Search interface
  - `ExploreDrawer` (desktop) / `BottomSheet` (mobile)
  - `ParkingDrawer` (desktop)
  - `CreateMeetupFAB` - Floating action button
  - `Navbar`

#### Search Page ([app/search/page.tsx](app/search/page.tsx:1))
- **Route**: `/search`
- **Purpose**: Advanced search with filters
- **Features**:
  - Text search across name/description/address
  - Filters: category, price range, rating, parking
  - Grid view of results
  - Links to place details

#### Meetup Detail Page ([app/meetup/[id]/page.tsx](app/meetup/[id]/page.tsx:1))
- **Route**: `/meetup/[id]`
- **Purpose**: View and edit meetup details
- **Features**:
  - View meetup info (title, destination, date/time)
  - Edit mode with settings icon
  - Two tabs: "Live Map" and "Group Management"
  - Uses `LiveMapView` and `GroupManagement` components

#### Session Detail Page ([app/sessions/[id]/page.tsx](app/sessions/[id]/page.tsx:1))
- **Route**: `/sessions/[id]`
- **Purpose**: View session details, join/decline
- **Features**:
  - Session info (title, description, place, time)
  - Creator information
  - Participant list with status badges
  - Join buttons (Going/Maybe/Can't Make It)
  - Get directions button
  - Share session
  - Links to live session if active

#### Live Session Page ([app/sessions/[id]/live/page.tsx](app/sessions/[id]/live/page.tsx:1))
- **Route**: `/sessions/[id]/live`
- **Purpose**: Real-time location tracking during active meetup
- **Features**:
  - Live badge with pulse animation
  - Session duration counter
  - `LiveLocationMap` component
  - `RealTimeSessionStatus` sidebar
  - Quick actions (chat, call, share location)
  - Safety notice

#### Profile Page ([app/profile/page.tsx](app/profile/page.tsx:289))
- **Route**: `/profile`
- **Purpose**: View and edit user profile
- **Features**:
  - Edit name and email
  - Change password with validation
  - Form validation (email format, password length, confirmation)
  - Success/error messages

### Key Components

#### Map Components

##### MapProviderComponent ([lib/map/map-provider.tsx](lib/map/map-provider.tsx:1))
- **Purpose**: Context provider for map instance
- **Usage**: Wraps map interface, provides `useMap()` hook
- **Props**:
  - `provider`: "mock" | "google"
  - `options`: center, zoom, etc.
- **State**: map adapter, loading, error

##### MapMarkers ([components/map/map-markers.tsx](components/map/map-markers.tsx:1))
- **Purpose**: Renders markers on map
- **Marker Types**:
  1. **Spot Markers**: Color-coded by rating (green 4.5+, blue 4.0+, amber 3.5+, red <3.5)
  2. **Parking Markers**: Color-coded by occupancy (green available, amber limited, red full)
- **Popups**: Display spot/parking info on hover

##### SearchBar ([components/map/search-bar.tsx](components/map/search-bar.tsx:1))
- **Purpose**: Search interface for map
- **Integration**: Likely uses `SearchService`

#### Meetup Components

##### CreateMeetupModal ([components/meetup/create-meetup-modal.tsx](components/meetup/create-meetup-modal.tsx:1))
- **Purpose**: Form to create new meetup
- **Expected Fields**: title, destination, date/time, description

##### MembersDrawer ([components/meetup/members-drawer.tsx](components/meetup/members-drawer.tsx:1))
- **Purpose**: Display and manage meetup participants
- **Features**: List members, show status, invite/remove

##### SessionMapMarkers ([components/meetup/session-map-markers.tsx](components/meetup/session-map-markers.tsx:1))
- **Purpose**: Render member locations on map during live session

#### Live Components

##### LiveLocationMap ([components/live-location-map.tsx](components/live-location-map.tsx:1))
- **Purpose**: Map with real-time member location markers
- **Props**: sessionId, participants, isLocationSharingEnabled

##### RealTimeSessionStatus ([components/real-time-session-status.tsx](components/real-time-session-status.tsx:1))
- **Purpose**: Sidebar showing member status in real-time
- **Display**: Member avatars, status (on-the-way, arrived, etc.)

##### GroupManagement ([components/group-management.tsx](components/group-management.tsx:1))
- **Purpose**: Manage group members during meetup
- **Features**: Add/remove members, view member status

#### Navigation

##### Navbar ([components/navbar.tsx](components/navbar.tsx:1))
- **Desktop**: Horizontal nav with Map/Meetups/Profile links
- **Mobile**: Hamburger menu with dropdown
- **Styling**: Sticky header, backdrop blur
- **Active Route Highlighting**: Uses `usePathname()`

---

## Map Integration

### Current Setup

#### Map Provider Configuration
**File**: [lib/map/map-provider.tsx](lib/map/map-provider.tsx:39-89)

- **Active Provider**: `"mock"` (hardcoded in [app/page.tsx](app/page.tsx:26))
- **Default Center**: `[103.8198, 1.3521]` (Singapore)
- **Default Zoom**: `11`

#### Google Maps Integration
- **Package**: `@vis.gl/react-google-maps` (deck.gl-based)
- **API Key**: Required in `.env` as `GOOGLE_MAPS_API_KEY`
- **Map ID**: Optional `GOOGLE_MAPS_MAP_ID` for custom styling
- **Status**: GoogleMapAdapter exists but not activated in production

#### Mock Map Implementation
**File**: [lib/map/adapters/mock-map.tsx](lib/map/adapters/mock-map.tsx:1)

- **Purpose**: Testing without Google Maps API
- **Features**:
  - Simulates map initialization
  - Stores markers in memory
  - Implements full `MapAdapter` interface
  - No actual map rendering (markers appended to DOM container)

### Map Features

#### Markers
- **Spot Markers**: All hangout spots from mock data
- **Parking Markers**: Spots with `parkingInfo.available = true`
- **User Markers**: For live location sharing (in live session)

#### Interactions
- **Marker Click**: Show popup with spot/parking info
- **Zoom/Pan Controls**: Via `MapControls` component
- **Fit Bounds**: Adjust map to show all markers

#### Clustering
**Status**: NOT IMPLEMENTED
- `ClusterOptions` interface defined in [lib/map/types.ts](lib/map/types.ts:48-52)
- Not used anywhere in codebase

---

## Services & Business Logic

### MeetupService ([lib/meetup/meetup-service.ts](lib/meetup/meetup-service.ts:1))

**Purpose**: In-memory meetup management (no database)

**Key Methods**:

```typescript
// Create a new meetup session
static async createSession(data: {
  title: string
  destination: { name, coordinates, address }
  scheduledTime: Date
}): Promise<MeetupSession>

// Get session by ID
static async getSession(sessionId: string): Promise<MeetupSession | null>

// Start an active session
static async startSession(sessionId: string): Promise<void>

// Update member location (real-time)
static async updateMemberLocation(
  sessionId: string,
  memberId: string,
  coordinates: [number, number]
): Promise<void>

// Auto-arrival detection (within 50m of destination)
// Auto-end when all members arrived
```

**Features**:
- **Mock Members**: `addMockMembers()` adds 3 test users
- **Location Simulation**: `simulateLocationUpdates()` moves members toward destination every 5s
- **Distance Calculation**: Haversine formula for coordinate distance
- **Status Colors/Labels**: Helper methods for UI

**Storage**: `Map<string, MeetupSession>` in memory (resets on server restart)

### SearchService ([lib/search/search-service.ts](lib/search/search-service.ts:1))

**Purpose**: Search and filter hangout spots

**Key Methods**:

```typescript
// Search for place/area suggestions
static async searchSuggestions(query: string): Promise<SearchSuggestion[]>

// Search spots with filters and geographic bounds
static async searchSpots(
  destination: SearchSuggestion,
  origin?: [number, number],
  filters?: SearchFilters
): Promise<SearchResult>
```

**Filters** ([lib/search/search-service.ts](lib/search/search-service.ts:11-17)):
- `priceRange`: string[]
- `minRating`: number
- `maxTravelTime`: number (not used)
- `hasParking`: boolean
- `categories`: string[]

**Search Types**:
1. **Place Search**: 1km radius around coordinates
2. **Area Search**: Filter by bounding box

**Mock Data**: 5 Singapore locations (Marina Bay, Orchard Road, Chinatown, Sentosa, Clarke Quay)

### DirectionsService ([lib/directions/directions-service.ts](lib/directions/directions-service.ts:1))

**Status**: File exists but likely placeholder (not reviewed in detail)

**Expected Purpose**: Get navigation routes between two points

---

## Current Implementation Status

### ✅ Implemented Features

#### Core UI
- [x] Responsive layout (desktop/mobile)
- [x] Navigation bar with route highlighting
- [x] Map interface with controls
- [x] Marker system (spots, parking)
- [x] Bottom sheet / side drawers

#### Pages
- [x] Home page with map
- [x] Search page with filters
- [x] Meetup detail page (view & edit)
- [x] Session detail page
- [x] Live session page
- [x] Profile page (view & edit)
- [x] Auth pages (UI only, no backend)

#### Meetup Features
- [x] Create meetup modal (UI)
- [x] View meetup details
- [x] Edit meetup info (local state only)
- [x] Member list display
- [x] Join/decline buttons (UI only)
- [x] Live location map (UI framework)

#### Map Features
- [x] Mock map implementation
- [x] Marker rendering with color coding
- [x] Popups with spot/parking info
- [x] Map controls (zoom, center)

#### Search
- [x] Text search
- [x] Filtering (category, price, rating, parking)
- [x] Suggestions (mock data)
- [x] Geographic search (place/area)

#### Services
- [x] MeetupService (in-memory CRUD)
- [x] SearchService (with mock data)
- [x] Distance calculation (Haversine)
- [x] Auto-arrival detection

### ⚠️ Partially Implemented

#### Authentication
- UI exists for login/register pages
- AuthService defined but throws errors
- No actual authentication logic
- No session management
- AuthGuard component exists but likely not functional

#### Database
- DatabaseClient interface defined
- All methods throw "Database not connected yet"
- No Supabase integration yet

#### Google Maps
- GoogleMapAdapter file exists
- Not activated in production (using mock)
- Needs API key and testing

#### Real-time Features
- UI components exist (LiveLocationMap, RealTimeSessionStatus)
- Location update logic in MeetupService
- BUT: No WebSocket/SSE for real-time sync
- Location updates only work via polling or manual refresh

### ❌ Not Implemented

#### Backend
- [ ] Database schema
- [ ] Database migrations
- [ ] API routes (Next.js API routes)
- [ ] Server-side data fetching
- [ ] Data persistence
- [ ] Image upload/storage

#### Authentication & Authorization
- [ ] User registration
- [ ] Login/logout
- [ ] Password reset
- [ ] Email verification
- [ ] Session management
- [ ] JWT/auth tokens
- [ ] Protected routes
- [ ] Role-based access control

#### Real-time Communication
- [ ] WebSocket server
- [ ] Live location broadcasting
- [ ] Real-time member status updates
- [ ] Chat functionality (button exists, no impl)
- [ ] Notifications

#### Meetup Features
- [ ] Invite system (email/link)
- [ ] RSVP tracking
- [ ] Meetup history
- [ ] Recurring meetups
- [ ] Meetup categories/tags
- [ ] Waitlist for full meetups

#### Places/Spots
- [ ] Place detail page (route exists, component missing)
- [ ] Reviews and ratings
- [ ] Photo galleries
- [ ] Favorites/bookmarks
- [ ] Place recommendations
- [ ] Recent/trending places

#### Parking
- [ ] Real parking data integration
- [ ] Parking API (Singapore LTA, URA, etc.)
- [ ] Real-time availability updates
- [ ] Parking reservations

#### User Features
- [ ] User settings/preferences
- [ ] Privacy settings
- [ ] Location sharing preferences
- [ ] Friend system
- [ ] User blocking
- [ ] Notifications settings

#### Search & Discovery
- [ ] Autocomplete with real data
- [ ] Search history
- [ ] Saved searches
- [ ] Nearby places
- [ ] "People also visited" recommendations

#### Mobile
- [ ] Native geolocation API integration
- [ ] Background location tracking
- [ ] Push notifications
- [ ] Offline mode
- [ ] PWA manifest (referenced but may be incomplete)

#### Analytics & Monitoring
- [ ] User analytics (beyond Vercel Analytics)
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] A/B testing

#### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Test coverage

#### DevOps
- [ ] CI/CD pipeline
- [ ] Environment configuration (dev/staging/prod)
- [ ] Database backups
- [ ] Monitoring/alerts
- [ ] Logging infrastructure

---

## Comparison with Class Diagram

### Overview
The class diagram at [classdiagram.png](classdiagram.png) shows a comprehensive MVC architecture with Views, Controllers, Models, and API Services. The actual codebase has **significant differences**.

### Key Discrepancies

#### 1. Architecture Pattern

**Class Diagram Shows**:
- Clear MVC separation
- Controller layer (MeetupController, SessionController, etc.)
- API Services layer (Google Maps, CarParkAvailability, Cloudinary)
- Model layer with User, Meetup, Participant, Buddy entities

**Actual Implementation**:
- No explicit controller layer
- No API routes (Next.js API folder not used)
- Services exist but are in-memory (MeetupService, SearchService)
- No external API integrations except Google Maps (not active)

#### 2. Missing Controllers

The diagram shows controllers that **don't exist** in the code:
- `MeetupController`
- `SessionController`
- `LocationController`
- `ParkingController`
- `UserController`

**Reality**: All logic is in:
- React components (page-level)
- Service classes (MeetupService, SearchService)
- No server-side request handling

#### 3. Data Models

**Class Diagram** shows:
- `User` with: username, email, password, location, list of meetups/buddies
- `Meetup` with: meetupName, dateTime, participants, location, status
- `Participant` with: userId, status, role, joinedAt
- `Buddy` with: buddyId, status, addedAt
- `Location` with: latitude, longitude, name, address

**Actual Code** has:
- `User` class ([lib/data/user.ts](lib/data/user.ts:1)) - Similar but no password field, no buddies
- `Meetup` class ([lib/data/meetup.ts](lib/data/meetup.ts:1)) - Different structure (leader instead of participants)
- `MeetupSession` interface ([lib/meetup/meetup-types.ts](lib/meetup/meetup-types.ts:1)) - Separate model with different fields
- `MeetupMember` interface - Separate from Participant
- **No Buddy/Friend system** at all
- Multiple `Location` representations (interface, GeolocationCoordinates, coordinates arrays)

#### 4. API Services

**Class Diagram** shows:
- `GoogleMaps API` - For maps and directions
- `CarParkAvailability API` - For parking data
- `Cloudinary API` - For image uploads

**Actual Code**:
- Google Maps: Package installed, adapter exists, but **mock map is active**
- CarPark API: **Not implemented** (parking data is hardcoded in HangoutSpot mock data)
- Cloudinary: **Not mentioned anywhere** in the code

#### 5. View Layer

**Class Diagram** shows pages:
- `ExploreTab`
- `BuddiesTab`
- `ProfileTab`
- `PastMeetupDashboard`

**Actual Code** has different pages:
- **No "ExploreTab"**: Home page has map with explore drawer
- **No "BuddiesTab"**: Buddies/friends feature doesn't exist
- **ProfileTab**: Profile page exists ([app/profile/page.tsx](app/profile/page.tsx:289))
- **No "PastMeetupDashboard"**: Only active/planned meetups

**Additional Pages Not in Diagram**:
- Search page ([app/search/page.tsx](app/search/page.tsx:1))
- Live session page ([app/sessions/[id]/live/page.tsx](app/sessions/[id]/live/page.tsx:1))
- Landing page ([app/landing/page.tsx](app/landing/page.tsx:1))

#### 6. Relationships

**Class Diagram** shows:
- User → Meetup: One-to-many (user hosts/participates in meetups)
- Meetup → Participant: One-to-many
- User → Buddy: Many-to-many (friend system)
- Location shared across models

**Actual Code**:
- User has `meetups: Meetup[]` array
- Meetup has `leader: User` and `members: User[]`
- MeetupSession has `members: MeetupMember[]` (not User references)
- **No Buddy/Friend relationship**
- Location is not a shared class/interface used consistently

#### 7. Authentication Flow

**Class Diagram** implies:
- UserController handles auth
- User model has password field
- Likely authentication middleware

**Actual Code**:
- No authentication implemented
- AuthService is a placeholder
- No password hashing
- No JWT/session management

#### 8. Database Layer

**Class Diagram** suggests:
- Models have database persistence
- CRUD operations via controllers

**Actual Code**:
- No database connection
- All data is in-memory or mock
- DatabaseClient interface exists but throws errors

### What Matches?

#### Similarities:
1. **Core Entities**: User, Meetup/Session, Location concepts exist
2. **Map Integration**: Both show map as central feature
3. **Parking Info**: Both include parking data (though implementation differs)
4. **Profile Management**: Both have user profile functionality
5. **Location Sharing**: Both support real-time location (though not fully implemented)

---

## Missing & Incomplete Features

### Critical Missing Features (For MVP)

1. **Database & Persistence**
   - **Impact**: All data is lost on refresh
   - **Required**: Supabase setup, schema design, migrations
   - **Effort**: High (1-2 weeks)

2. **Authentication System**
   - **Impact**: Can't identify users, no security
   - **Required**:
     - User registration/login
     - Session management
     - Protected routes
   - **Effort**: Medium (1 week)

3. **Real-time Communication**
   - **Impact**: "Live" features don't actually update live
   - **Required**:
     - WebSocket or Server-Sent Events
     - Real-time location broadcasting
     - Status updates
   - **Effort**: Medium-High (1-2 weeks)

4. **Google Maps Integration**
   - **Impact**: Using mock map in production
   - **Required**:
     - Activate GoogleMapAdapter
     - Configure API keys
     - Test real map features
   - **Effort**: Low (2-3 days)

5. **API Routes**
   - **Impact**: No server-side logic
   - **Required**:
     - Next.js API routes for CRUD
     - Data validation
     - Error handling
   - **Effort**: Medium (1 week)

### Important Missing Features

6. **Place Details Page**
   - Route exists at [app/places/[id]/page.tsx](app/places/[id]/page.tsx:1)
   - Component not implemented
   - Needed for viewing full spot information

7. **Meetup Invitations**
   - No way to invite users to meetups
   - No invitation acceptance/decline flow
   - No email/notification system

8. **Image Uploads**
   - No profile pictures (using placeholders)
   - No place photos (hardcoded image URLs)
   - Need Cloudinary or similar

9. **Real Parking Data**
   - Currently using mock parking in HangoutSpot
   - Need LTA/URA API integration for Singapore
   - Real-time availability updates

10. **Search Autocomplete**
    - Current search uses mock suggestions
    - Need Google Places API or similar
    - Better UX with real suggestions

### Nice-to-Have Features

11. **Friend/Buddy System**
    - Shown in class diagram, not implemented
    - Social connections between users
    - Invite friends to meetups

12. **Meetup History**
    - No past meetups view
    - No completed session archive
    - Analytics (total meetups, places visited)

13. **Notifications**
    - Email notifications for invites
    - Push notifications for location updates
    - Reminders for scheduled meetups

14. **Chat**
    - Chat button exists in live session
    - No chat implementation
    - Real-time group chat during meetup

15. **Reviews & Ratings**
    - Users can't rate places
    - No review system
    - Currently using mock ratings

16. **Favorites/Bookmarks**
    - Save favorite places
    - Bookmark meetups
    - Personalized recommendations

17. **Advanced Filters**
    - Distance from user
    - Open now
    - Accessibility features
    - Dietary restrictions (for restaurants)

18. **Mobile Optimizations**
    - Native geolocation
    - Background location tracking
    - Offline mode
    - PWA features

### Technical Debt

19. **Testing**
    - No unit tests
    - No integration tests
    - No E2E tests
    - CI/CD pipeline needed

20. **Error Handling**
    - Minimal error boundaries
    - No centralized error logging
    - Poor error messages

21. **Performance**
    - No code splitting optimization
    - No image optimization (Next.js Image not used)
    - No lazy loading for components

22. **Accessibility**
    - Keyboard navigation not fully tested
    - Screen reader support unknown
    - Color contrast issues possible

23. **Documentation**
    - No API documentation
    - No component documentation
    - No deployment guide

---

## Next Steps

### Phase 1: Core Functionality (MVP)
**Goal**: Working app with persistence and basic features

1. **Database Setup** (Week 1)
   - [ ] Set up Supabase project
   - [ ] Design database schema
   - [ ] Create migrations
   - [ ] Implement database.ts client
   - [ ] Replace mock data with DB queries

2. **Authentication** (Week 2)
   - [ ] Implement Supabase Auth
   - [ ] Create registration/login flow
   - [ ] Add session management
   - [ ] Protect routes with AuthGuard
   - [ ] Add user profile CRUD

3. **API Routes** (Week 3)
   - [ ] Create Next.js API routes
     - POST /api/meetups (create)
     - GET /api/meetups/[id] (read)
     - PUT /api/meetups/[id] (update)
     - DELETE /api/meetups/[id] (delete)
   - [ ] Add validation (Zod schemas)
   - [ ] Error handling middleware

4. **Google Maps Integration** (Week 3-4)
   - [ ] Switch from mock to GoogleMapAdapter
   - [ ] Configure environment variables
   - [ ] Test marker rendering
   - [ ] Add directions API
   - [ ] Optimize map performance

5. **Real-time Features** (Week 4-5)
   - [ ] Set up Supabase Realtime or Socket.io
   - [ ] Implement location broadcasting
   - [ ] Add real-time member status updates
   - [ ] Test with multiple users
   - [ ] Optimize for mobile networks

### Phase 2: Enhanced Features
**Goal**: Better UX and more functionality

6. **Place Details Page**
   - [ ] Create place detail component
   - [ ] Add reviews section
   - [ ] Photo gallery
   - [ ] Related places

7. **Invitations**
   - [ ] Email invitation system
   - [ ] Invitation acceptance flow
   - [ ] Notification when invited

8. **Real Parking Data**
   - [ ] Integrate LTA Carpark Availability API
   - [ ] Cache parking data
   - [ ] Update markers in real-time
   - [ ] Add parking filters

9. **Search Improvements**
   - [ ] Google Places Autocomplete API
   - [ ] Search history
   - [ ] Saved searches
   - [ ] Better filtering UI

10. **Image Uploads**
    - [ ] Set up Cloudinary/S3
    - [ ] Profile picture upload
    - [ ] Place photo uploads
    - [ ] Image optimization

### Phase 3: Social & Mobile
**Goal**: Social features and mobile optimization

11. **Friend System**
    - [ ] Add buddy/friend model
    - [ ] Friend requests
    - [ ] Friends list
    - [ ] Invite friends to meetups

12. **Chat**
    - [ ] Real-time chat during meetups
    - [ ] Message history
    - [ ] Typing indicators
    - [ ] Read receipts

13. **Notifications**
    - [ ] Email notifications
    - [ ] Push notifications (PWA)
    - [ ] In-app notification center

14. **Mobile Optimizations**
    - [ ] Native geolocation
    - [ ] Background tracking
    - [ ] Offline mode (Service Worker)
    - [ ] PWA manifest
    - [ ] Add to home screen

### Phase 4: Polish & Scale
**Goal**: Production-ready app

15. **Testing**
    - [ ] Unit tests (Vitest/Jest)
    - [ ] Component tests (React Testing Library)
    - [ ] E2E tests (Playwright)
    - [ ] Set up CI/CD

16. **Performance**
    - [ ] Code splitting
    - [ ] Image optimization
    - [ ] Lazy loading
    - [ ] Bundle size analysis
    - [ ] Lighthouse audit

17. **Monitoring**
    - [ ] Set up Sentry for errors
    - [ ] User analytics
    - [ ] Performance monitoring
    - [ ] Server monitoring

18. **Documentation**
    - [ ] API documentation (OpenAPI)
    - [ ] Component Storybook
    - [ ] Deployment guide
    - [ ] Contributing guidelines

### Immediate Action Items (This Week)

**Priority 1 - Database**:
1. Create Supabase account and project
2. Design initial schema (User, Meetup, Participant, Place tables)
3. Write migration scripts
4. Update [lib/database.ts](lib/database.ts:1) with Supabase client

**Priority 2 - Auth**:
1. Implement Supabase Auth in [lib/auth.ts](lib/auth.ts:1)
2. Connect login/register pages to auth service
3. Add session management
4. Test auth flow end-to-end

**Priority 3 - API**:
1. Create `/api/meetups` route folder
2. Implement basic CRUD endpoints
3. Add Zod validation
4. Update components to use API instead of MeetupService

---

## Conclusion

Hangout Hub is a **partially implemented** social meetup application with a solid frontend foundation but missing critical backend infrastructure. The app has:

### Strengths
- Well-structured React/Next.js architecture
- Responsive UI with modern component library
- Map abstraction for flexible provider switching
- Clear separation between UI and business logic
- Mock data allowing frontend development to continue

### Gaps
- No database or persistence
- No authentication/authorization
- No real-time communication (despite UI for it)
- Mock map instead of real Google Maps
- No server-side API routes
- Several planned features missing (friends, chat, reviews, etc.)

### Discrepancy with Class Diagram
The class diagram represents a **desired architecture** with MVC pattern, controllers, and external APIs. The actual codebase is **earlier in development** and follows a different pattern:
- No controller layer (uses React components + service classes)
- No API routes (yet)
- Different data models (MeetupSession vs. Meetup)
- Missing features (Buddy system, external APIs)

### Recommended Path Forward
1. **Phase 1 MVP** (5 weeks): Database + Auth + API + Google Maps + Realtime
2. **Phase 2 Features** (4 weeks): Place details, invites, parking, search, images
3. **Phase 3 Social** (4 weeks): Friends, chat, notifications, mobile
4. **Phase 4 Polish** (ongoing): Testing, performance, monitoring, docs

The codebase is well-organized and follows React/Next.js best practices, making it a good foundation for future development. The main work ahead is **backend implementation** and connecting the frontend to real data sources.

---

**Last Updated**: October 14, 2025
**Codebase Status**: Frontend MVP Complete | Backend Not Started
**Next Milestone**: Database Setup & Authentication
