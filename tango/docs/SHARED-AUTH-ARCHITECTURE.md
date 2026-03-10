# Tango Apps Shared Authentication Architecture

> **SUPERSEDED**: This document has been pulled up to the AppDev level.
> **Canonical doc**: `/Users/tobybalsley/MyDocs/AppDev/TANGO-FIREBASE-ARCHITECTURE.md`
> This file is kept for reference but the canonical doc is the source of truth.

**Status**: SUPERSEDED - See canonical doc
**Created**: 2026-03-03
**Author**: Compás (NTTT) + Gotan

---

## Overview

All Tango Universe apps share a common authentication system through the **tangotiempo** Firebase project. This enables single sign-on (SSO) across the ecosystem while allowing each app to maintain its own data store.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHARED AUTH LAYER                                 │
│                                                                      │
│   Firebase Project: tangotiempo-257ff                                │
│   ├── Firebase Auth (Google, Apple, Email)                          │
│   ├── Shared User Collection (users/{uid})                          │
│   │   ├── profile: { displayName, email, photoURL }                 │
│   │   ├── preferences: { theme, ... }                               │
│   │   └── apps: { nttt: {}, tangotiempo: {}, ... }                  │
│   └── Shared Session Cookie (*.tangotiempo.com subdomain)           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Auth Token
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    APP-SPECIFIC DATA LAYERS                          │
│                                                                      │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│   │  TangoTiempo    │  │  NTTT           │  │  HarmonyJunction│     │
│   │  tangotiempo.com│  │  namethattango  │  │  harmonyjunction│     │
│   │                 │  │  tune.com       │  │  .org           │     │
│   │  Data:          │  │                 │  │                 │     │
│   │  - Events       │  │  Data:          │  │  Data:          │     │
│   │  - Calendar     │  │  - Game stats   │  │  - Events       │     │
│   │  - Preferences  │  │  - Sessions     │  │  - Preferences  │     │
│   │                 │  │  - Scores       │  │                 │     │
│   │  [tangotiempo   │  │                 │  │  [tangotiempo   │     │
│   │   Firestore]    │  │  [tangotiempo   │  │   Firestore]    │     │
│   │                 │  │   Firestore]    │  │                 │     │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. Single Sign-On (SSO)
- Users authenticate once via tangotiempo Firebase Auth
- Auth token is valid across all Tango apps
- Login on one app = logged in on all apps (if same browser)

### 2. Shared User Profile
- Basic profile data lives in tangotiempo Firestore
- All apps read/write to `users/{uid}` collection
- Profile includes: displayName, email, photoURL, createdAt

### 3. App-Specific Data in Shared Firestore
- Each app stores its data in tangotiempo Firestore
- Data is namespaced by app (e.g., `users/{uid}/apps/nttt/...`)
- Alternative: top-level collections per app (e.g., `nttt-sessions/`)

### 4. Cross-Domain Auth (Future)
- Session cookies can be shared across subdomains
- Requires: `*.tangotiempo.com` subdomain setup
- Or: Custom auth state persistence across domains

---

## Current Implementation

### Firebase Projects

| Project | Purpose | Apps Using |
|---------|---------|------------|
| `tangotiempo-257ff` | Auth + Shared Data | All Tango apps |
| `nttttest` | (Deprecated) | Was NTTT test data |
| `ntttprod` | (Deprecated) | Was NTTT prod data |

### Environment Variables

Each app needs these env vars pointing to tangotiempo:

```bash
# Base64-encoded Firebase config for tangotiempo
NEXT_PUBLIC_FIREBASE_JSON=ewogICAgImFwaUtleSI6ICJBSXphU3lC...

# App identifier (for analytics)
NEXT_PUBLIC_APPLICATION_ID=3  # 1=TT, 2=HJ, 3=NTTT, etc.
```

### Firestore Security Rules (tangotiempo)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // App-specific collections
    match /nttt-sessions/{sessionId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    // Song feedback (anonymous create)
    match /songFeedback/{feedbackId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

---

## Migration Path

### Phase 1: Current State (2026-03)
- [x] NTTT uses tangotiempo for auth
- [x] NTTT user data in tangotiempo Firestore (after fix)
- [ ] TangoTiempo user prefs in MongoDB (legacy)

### Phase 2: Consolidate TangoTiempo Data
- [ ] Move TangoTiempo user preferences from MongoDB to Firestore
- [ ] Create shared `users/{uid}/preferences` structure
- [ ] Update TangoTiempo frontend to use Firestore

### Phase 3: Cross-Domain SSO
- [ ] Set up subdomain structure (nttt.tangotiempo.com)
- [ ] Configure Firebase Auth session persistence
- [ ] Test cross-app login flow

### Phase 4: Unified User Dashboard
- [ ] Create shared "My Account" component
- [ ] Show cross-app activity (NTTT scores, TT events, etc.)
- [ ] Unified notification preferences

---

## Data Schema

### Shared User Document (`users/{uid}`)

```javascript
{
  // Profile (shared across apps)
  profile: {
    displayName: "Toby Balsley",
    email: "toby@example.com",
    photoURL: "https://...",
    createdAt: Timestamp,
  },

  // Global preferences
  preferences: {
    theme: "dark",
    emailNotifications: true,
  },

  // Last login timestamp
  lastLoginAt: Timestamp,

  // App-specific data (nested)
  apps: {
    nttt: {
      gameStats: {
        "orchestra-quiz": { ... },
        "singer-quiz": { ... },
      },
      preferences: {
        defaultNumSongs: 10,
        defaultTimeLimit: 15,
      },
    },
    tangotiempo: {
      preferences: {
        homeRegion: "boston",
        favoriteOrganizers: [...],
      },
    },
    harmonyjunction: {
      preferences: { ... },
    },
  },
}
```

---

## Known Issues & Constraints

### 1. Cross-Project Auth Doesn't Work
- **Problem**: Auth token from Project A isn't valid for Project B's Firestore
- **Solution**: Use single project (tangotiempo) for all auth AND data
- **Status**: RESOLVED - All apps use tangotiempo

### 2. Cross-Domain Cookies
- **Problem**: Cookies don't share across different domains
- **Solution**: Use subdomains (*.tangotiempo.com) or explicit token passing
- **Status**: FUTURE - Currently each domain has separate session

### 3. MongoDB Legacy Data
- **Problem**: TangoTiempo stores user prefs in MongoDB via calendar-be-af
- **Solution**: Migrate to Firestore in tangotiempo project
- **Status**: TODO - Needs calendar-be-af update

---

## App Configuration Reference

### NTTT (namethattangotune.com)

```javascript
// src/app/utils/firebase.js
// Uses NEXT_PUBLIC_FIREBASE_JSON (tangotiempo config)
// Firestore: tangotiempo-257ff
// Auth: tangotiempo-257ff
```

### TangoTiempo (tangotiempo.com)

```javascript
// Current: MongoDB for user prefs (via calendar-be-af)
// Target: Firestore in tangotiempo-257ff
```

### HarmonyJunction (harmonyjunction.org)

```javascript
// Uses same NEXT_PUBLIC_FIREBASE_JSON
// Auth: tangotiempo-257ff
```

---

## Related Documents

- `NTTT/docs/DATA-PIPELINE.md` - Song data flow
- `tango/docs/NTTT-System-Overview.md` - NTTT architecture
- `MyDocs/CLAUDE.md` - Persona registry (Gotan overseer)

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-03-03 | Initial design document | Compás |

