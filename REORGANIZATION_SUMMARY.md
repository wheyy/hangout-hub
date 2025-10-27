# Codebase Reorganization Summary
**Date:** October 26, 2025
**Status:** ✅ COMPLETED

---

## **What Was Done**

The codebase has been reorganized to follow clear architectural patterns with intuitive folder structure.

---

## **NEW STRUCTURE**

### **lib/ Directory**

```
lib/
├── config/
│   └── firebase.ts                 ← Unified Firebase configuration
│
├── auth/
│   └── auth-service.ts             ← Authentication service
│
├── models/                         ← Domain models (data structures)
│   ├── user.ts
│   ├── meetup.ts
│   ├── hangoutspot.ts
│   ├── parkingspot.ts
│   ├── invitation.ts
│   └── location.ts
│
├── services/                       ← Business logic + external APIs
│   ├── google-places.ts            ← Google Places API
│   ├── carpark-api.ts              ← HDB Carpark API
│   ├── invitations.ts              ← Invitation management
│   ├── location-tracking.ts        ← Location tracking
│   ├── member-status-service.ts    ← Member status
│   ├── directions-service.ts       ← Directions service
│   ├── osrm.ts                     ← OSRM routing
│   └── osrm-directions.ts          ← OSRM helpers
│
├── map/
│   ├── maplibre-map.ts
│   ├── map-provider.tsx
│   ├── pin-icons.ts
│   └── types.ts
│
├── utils/                          ← Pure helper functions
│   ├── singapore-boundary.ts       ← Boundary validation
│   ├── distance.ts                 ← Distance calculations
│   ├── cache.ts                    ← Caching utilities
│   └── helpers.ts                  ← General helpers (cn function)
│
├── constants/
│   └── meetup-colors.ts
│
└── types/
    └── index.ts                    ← Global type definitions
```

### **components/ Directory**

```
components/
├── layout/                         ← Global layout components
│   ├── app-header.tsx
│   ├── auth-guard.tsx
│   └── theme-provider.tsx
│
├── meetup/                         ← Meetup-related components
│   ├── group-management.tsx
│   ├── invitation-card.tsx
│   ├── send-invite-modal.tsx
│   ├── create-meetup-modal.tsx
│   ├── create-meetup-modal-with-destination.tsx
│   ├── delete-meetup-modal.tsx
│   ├── all-arrived-modal.tsx
│   └── arrive-confirmation-modal.tsx
│
├── map/                            ← Map-related components
│   ├── live-location-map.tsx
│   ├── live-map-view.tsx
│   ├── map-search-bar.tsx
│   ├── hangout-drawer.tsx
│   ├── parking-drawer.tsx
│   ├── mobile-bottom-drawer.tsx
│   ├── hangout-spot-card.tsx
│   ├── parking-spot-card.tsx
│   ├── map-markers.tsx
│   └── error-popup.tsx
│
└── ui/                             ← Shadcn UI components
```

---

## **CHANGES MADE**

### **Files Moved:**

| Old Path | New Path | Reason |
|----------|----------|--------|
| `lib/data/*` | `lib/models/*` | More standard naming |
| `lib/auth.ts` | `lib/auth/auth-service.ts` | Clearer purpose |
| `lib/invitation-utils.ts` | `lib/services/invitations.ts` | Belongs with services |
| `lib/directions/directions-service.ts` | `lib/services/directions-service.ts` | Consolidate services |
| `lib/utils.ts` | `lib/utils/helpers.ts` | Keep all utils together |
| `lib/types.ts` | `lib/types/index.ts` | Folder structure |
| `components/app-header.tsx` | `components/layout/app-header.tsx` | Feature grouping |
| `components/auth-guard.tsx` | `components/layout/auth-guard.tsx` | Feature grouping |
| `components/theme-provider.tsx` | `components/layout/theme-provider.tsx` | Feature grouping |
| `components/group-management.tsx` | `components/meetup/group-management.tsx` | Feature grouping |
| `components/invitation-card.tsx` | `components/meetup/invitation-card.tsx` | Feature grouping |
| `components/send-invite-modal.tsx` | `components/meetup/send-invite-modal.tsx` | Feature grouping |
| `components/live-location-map.tsx` | `components/map/live-location-map.tsx` | Feature grouping |
| `components/live-map-view.tsx` | `components/map/live-map-view.tsx` | Feature grouping |

### **Files Merged:**

| Files Merged | Into | Reason |
|-------------|------|--------|
| `lib/firebase.ts` + `lib/firebase/config.ts` | `lib/config/firebase.ts` | Eliminate duplication |

### **Files Deleted:**

| File | Reason |
|------|--------|
| `lib/database.ts` | Dead Supabase code (throws errors) |
| `lib/firebase.ts` | Merged into unified config |
| `lib/firebase/config.ts` | Merged into unified config |
| `components/layout.tsx` | Empty file |

### **Directories Removed:**

- `lib/data/` → Renamed to `lib/models/`
- `lib/firebase/` → Merged into `lib/config/`
- `lib/directions/` → Consolidated into `lib/services/`

---

## **CLEAR SEPARATION OF CONCERNS**

### **What Goes Where:**

**lib/config/** → Configuration files (Firebase, env, etc.)

**lib/models/** → Domain models (data structures + domain logic)
- User, Meetup, HangoutSpot, etc.
- Business logic that operates on the data

**lib/services/** → External APIs + Business operations
- Makes API calls (Google Places, OSRM, etc.)
- Makes Firebase calls
- Has side effects
- Asynchronous operations

**lib/utils/** → Pure helper functions
- No side effects
- No external calls
- Reusable anywhere
- Mostly synchronous

**lib/constants/** → Constant values

**lib/types/** → Global TypeScript type definitions

**components/layout/** → Global layout components (header, guards, etc.)

**components/meetup/** → Meetup-specific UI components

**components/map/** → Map-specific UI components

**components/ui/** → Reusable UI primitives (Shadcn)

---

## **BENEFITS**

✅ **Easier to find files** - Logical, intuitive structure
✅ **Clear separation** - Know exactly where each type of code belongs
✅ **No duplication** - Single source of truth for Firebase config
✅ **No dead code** - Removed unused database.ts
✅ **Consistent naming** - models, services, utils all clear
✅ **Feature grouping** - Related components together
✅ **Scalable** - Easy to add new features in the right place

---

## **IMPORT PATH CHANGES**

All imports have been automatically updated:

| Old Import | New Import |
|-----------|------------|
| `@/lib/firebase` | `@/lib/config/firebase` |
| `@/lib/firebase/config` | `@/lib/config/firebase` |
| `@/lib/data/*` | `@/lib/models/*` |
| `@/lib/auth` | `@/lib/auth/auth-service` |
| `@/lib/invitation-utils` | `@/lib/services/invitations` |
| `@/lib/directions/directions-service` | `@/lib/services/directions-service` |
| `@/lib/utils` | `@/lib/utils/helpers` |
| `@/lib/types` | `@/lib/types/index` |
| `@/components/app-header` | `@/components/layout/app-header` |
| `@/components/auth-guard` | `@/components/layout/auth-guard` |
| `@/components/theme-provider` | `@/components/layout/theme-provider` |
| `@/components/group-management` | `@/components/meetup/group-management` |
| `@/components/invitation-card` | `@/components/meetup/invitation-card` |
| `@/components/send-invite-modal` | `@/components/meetup/send-invite-modal` |
| `@/components/live-location-map` | `@/components/map/live-location-map` |
| `@/components/live-map-view` | `@/components/map/live-map-view` |

---

## **NEXT STEPS**

1. ✅ **Test the application** - Ensure everything still works
2. 📝 **Update documentation** - Update README with new structure
3. 🎯 **Phase 3 ready** - Move to breaking down large files if needed

---

**Reorganization complete! The codebase is now much more maintainable.** 🚀
