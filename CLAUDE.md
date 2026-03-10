# Compás - Name That Tango Tune

## Identity
- **Persona**: Compás
- **AppId**: 3
- **Abbr**: NT
- **Universe**: Tango
- **Status**: Production
- **Parent**: Gotan

## Project Overview
**Name That Tango Tune** — A music quiz game for learning to identify tango songs, orchestras, and singers.

## Tech Stack
| Tech | Purpose |
|------|---------|
| Next.js 14 | App Router, React |
| Tailwind CSS | Styling |
| Vercel | Hosting (2 projects) |
| Firebase Auth | Google, Apple, Email login |
| Firestore | User scores, sessions, notifications |
| MongoDB | Deep analytics (via nttt-functions) |
| Azure Blob | Audio files (v20 container) |

---

## Infrastructure

### Vercel Projects (Git CI/CD - push triggers deploy)

| Project | Vercel URL | Custom Domain | Git Branch | Purpose |
|---------|------------|---------------|------------|---------|
| `nttt` | nttt.vercel.app | namethattangotune.com | `main` | **PROD** - Live users |
| `nttt-test` | nttt-test.vercel.app | *(none)* | `TEST` | **TEST** - Testing before PROD |

**Deployment:** Push to branch → Vercel auto-deploys
```bash
git push origin TEST    # → deploys to nttt-test
git push origin main    # → deploys to nttt (PROD)
```

**Workflow:** `DEVL` → merge to `TEST` → merge to `main`

### Firebase Projects

| Environment | Firebase Project | Display Name |
|-------------|------------------|--------------|
| **PROD** | `tangotiempoprod` | TangoTiempoProd |
| **TEST** | `tangotiempo-257ff` | TangoTiempoTest |

### Environment Variables by Vercel Project

**`nttt` (PROD):**
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_JSON` | tangotiempoprod config (base64) |
| `NEXT_PUBLIC_APPLICATION_ID` | `3` |
| `NEXT_PUBLIC_IS_TEST` | *(not set)* |

**`nttt-test` (TEST):**
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_JSON` | tangotiempo-257ff config (base64) |
| `NEXT_PUBLIC_APPLICATION_ID` | `3` |
| `NEXT_PUBLIC_IS_TEST` | `true` |

### PWA Icons & Branding

| Environment | Icon | Theme Color | App Name |
|-------------|------|-------------|----------|
| PROD | `icon-512x512.png` | Gold (#D4AF37) | "Name That Tango Tune" |
| TEST | `icon-512x512-test.png` | Red (#FF6B6B) | "NTTT (TEST)" |

Detection: `manifest.js` checks `NEXT_PUBLIC_IS_TEST=true`

### Data Architecture

```
FIRESTORE (user-facing, real-time)        MONGODB (analytics, via nttt-functions)
├── users/{uid}/                          ├── button_clicks/
│   ├── profile                           │   └── every game interaction
│   ├── gameStats (scores)                ├── song_difficulty/
│   ├── subscription (future paid)        │   └── per-song error rates
│   └── dailyProgress                     ├── confusion_matrix/
├── nttt_sessions/{id}                    │   └── orchestra/singer mix-ups
├── notifications/{id}                    └── user_patterns/
└── usage_limits/                             └── weakness analysis
```

### Feature Roadmap

| Phase | Feature | Storage | Status |
|-------|---------|---------|--------|
| 1 | Score tracking | Firestore | Active |
| 2 | Non-login limits | Firestore + localStorage | Planned |
| 3 | Daily Challenge | Firestore | Planned |
| 4 | Deep analytics | MongoDB | Planned |
| 5 | User messaging | Firestore | Planned |
| 6 | Paid tier | Firestore | Future |

### Related Services

| Service | Project/Resource | Purpose |
|---------|------------------|---------|
| nttt-functions | Azure Functions | Analytics APIs, reads Firestore |
| Azure Blob | nttt / v20 | Audio file storage (~5,500 songs) |
| Vercel | nttt, nttt-test | Frontend hosting |

---

## Code Boundaries
**Own**: `/Users/tobybalsley/MyDocs/AppDev/tunes/tango/NTTT/`
**Parent**: Gotan at `/Users/tobybalsley/MyDocs/`

## Key Files
```
NTTT/
├── app/                 # Next.js App Router
├── public/
│   └── audio/          # MP3 clips
├── docs/               # Documentation
├── archive/            # Old versions
├── package.json
└── CLAUDE.md           # This file
```

## Commands

| Command | Action |
|---------|--------|
| **INBOX** | Check `~/.claude/local/handoffs/compas/` |
| **SHOFF** | Write handoff to `~/.claude/local/handoffs/compas/` |
| **MSG {to}** | Message another persona via `Collab/inbox/{to}/` |

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Session Startup
1. Read this file
2. Check `.ybotbot/retrospectivePlaybook.md` if exists
3. Wait for INBOX command or task

## Game Modes
- **Practice**: Learn songs with immediate feedback
- **Quiz**: Test knowledge with scoring
- **Orchestra ID**: Identify orchestra from clip
- **Singer ID**: Identify vocalist

## Audio Management
- Clips stored in `public/audio/`
- Metadata in JSON files
- Organized by orchestra/era

## Versioning & Tagging

**Always tag releases:**
```bash
# After committing, tag with version from package.json
git tag -a v2.9.0 -m "Release v2.9.0 - Brief description"

# Push with tags
git push origin main --tags
```

**When to bump:**
| Change | Bump | Example |
|--------|------|---------|
| Bug fix | PATCH | 2.8.1 → 2.8.2 |
| New feature | MINOR | 2.8.1 → 2.9.0 |
| Breaking/major | MAJOR | 2.8.1 → 3.0.0 |

**Commit format:** Include version in message
```
fix: Description here v2.8.2
feat: New feature v2.9.0
```

## Song Backup Procedure

**Audio files (Azure) and metadata (JSON) must stay in sync.**

**When adding NEW songs:**
```bash
# 1. BEFORE import - backup current state
az storage container create --account-name nttt --name v20-backup-YYYYMMDD-vX.Y.Z
az storage blob copy start-batch --account-name nttt \
  --source-container v20 --destination-container v20-backup-YYYYMMDD-vX.Y.Z

# 2. Upload new audio to Azure v20
az storage blob upload --account-name nttt --container-name v20 \
  --file "path/to/song.mp3" --name "{SongID}.mp3"

# 3. Update djSongsWeighted.json with new song metadata

# 4. Commit + tag new version
git commit -m "feat: Add X new songs vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z - Added X songs"
```

**Code-only changes:** No Azure backup needed (audio unchanged)

**Current backups:**
- `v20-backup-20260310-v281` - 5,000 songs (baseline)

---
*Compás - Tango music learning app*
