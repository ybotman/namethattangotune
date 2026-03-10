# NTTT - Name That Tango Tune

A tango music learning and quiz application built with Next.js.

## Overview

NTTT helps users learn to recognize tango orchestras, singers, songs, and eras through interactive games and listening modes. The app features 10 different game modes ranging from learning (no scoring) to competitive quizzes.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, MUI 6 |
| Audio Playback | WaveSurfer.js |
| Audio Storage | Azure Blob Storage |
| Authentication | Firebase Auth |
| Deployment | Vercel |

## Game Modes

### Learning Modes (No Scoring)
- **Mastering Orchestras** - Focus on one orchestra, listen with info displayed
- **Mastering Singers** - Learn singer voices with clips starting in vocal sections
- **Listen Mode** - Pure listening, auto-plays through filtered songs

### Quiz Modes (Scored)
- **Orchestra Quiz** - Identify the orchestra from a clip
- **Singer Quiz** - Identify the singer from a vocal clip
- **Song Quiz** - Guess the song title
- **Year Quiz** - Slide to guess the recording year
- **Clip Quiz: Orchestra** - Fast 5-second orchestra identification
- **Clip Quiz: Singer** - Fast vocal snippet identification
- **Same Song Compare** - Compare recordings of the same song by different orchestras

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_FIREBASE_JSON` - Firebase config (JSON string)

## Version History

### v2.1.0 (Current)
- Added Firebase login requirement - redirects unauthenticated users to `/auth/login`
- Added pulsing arrow onboarding UX to help new users discover Help buttons
- Arrow appears for first 3 visits to each game, then hides permanently
- Created UserContext stub for future Firestore sync

### v2.0.x
- 10 game modes with full configuration options
- WaveSurfer.js audio playback
- Recognition tier filtering
- Era/period filtering
- 3D styled UI components

## Project Structure

```
NTTT/
├── src/app/
│   ├── auth/           # Login, signup, reset-password pages
│   ├── components/     # Shared UI components
│   │   └── ui/         # PlayButton, HelpButton, PulsingArrow
│   ├── contexts/       # AuthContext, ScoreContext, UserContext
│   ├── games/          # All 10 game mode pages
│   ├── hooks/          # Custom hooks (useTheme, useFullscreen)
│   └── utils/          # Data fetching, analytics, Firebase
├── public/
│   └── songData/       # JSON data files
└── package.json
```

## Data Files

Song data is stored in JSON format:
- `djSongs.json` - Master song database (~5,500 songs)
- `ArtistMaster.json` - Orchestra metadata
- `SingerMaster.json` - Singer metadata

## License

Private - All rights reserved
