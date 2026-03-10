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
| Vercel | Hosting |
| Audio files | Local MP3s in public/ |

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

---
*Compás - Tango music learning app*
