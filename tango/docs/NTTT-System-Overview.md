# NTTT - Name That Tango Tune: System Overview

*For LLM context and future development planning*

---

## Overall Goal

NTTT is a **tango music education and recognition training app**. It helps users learn to identify tango orchestras, singers, songs, and years by listening to audio clips. The app serves tango dancers and enthusiasts who want to improve their ability to recognize music at milongas (tango social dances).

---

## Tech Stack - Complete Infrastructure

### Frontend (NTTT Next.js App)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 15.1.11 | App Router, Turbopack |
| React | React | 19.0.0 | UI rendering |
| UI Library | MUI (Material-UI) | 6.2.1 | Components, icons |
| Styling | Emotion | 11.14.0 | CSS-in-JS for MUI |
| Audio | WaveSurfer.js | 7.8.11 | Waveform visualization & playback |
| Animation | Motion (Framer) | 12.34.3 | UI animations |
| Mobile Picker | react-mobile-picker | 1.2.0 | Dial/wheel selectors |
| Celebrations | react-rewards | 2.1.0 | Confetti effects |
| Sass | sass | 1.83.0 | SCSS compilation |

### Authentication & Database

| Service | Provider | Purpose |
|---------|----------|---------|
| **Firebase Auth** | Google Cloud | User authentication (Google, Email, Apple) |
| **Firestore** | Google Cloud | User profiles, scores (future) |
| MongoDB Atlas | (Planned) | Shared calendar data (BORIS project) |

### Cloud Storage & Hosting

| Service | Provider | Details |
|---------|----------|---------|
| **Azure Blob Storage** | Microsoft Azure | Audio files (~5,500 MP3s) |
| - Storage Account | `nttt` | Resource group: `tangotiempo` |
| - Container | `v20` | Version 2.0 audio files |
| - Container | `v20-originals` | Backup before format conversion |
| - Access | Public read | No SAS tokens needed for playback |
| **Vercel** | Vercel | Next.js hosting & deployment |
| **GitHub** | GitHub | Source control, CI/CD |

### Environment Variables

```bash
# Firebase (Base64-encoded JSON config)
NEXT_PUBLIC_FIREBASE_JSON=<base64-encoded-firebase-config>

# App identification
NEXT_PUBLIC_APPLICATION_ID=3  # 1=TT, 2=HJ, 3=NTTT, 4=DJ
```

### Python Tooling (MusicImport/)

| Tool | Purpose |
|------|---------|
| `uploadToAzure_v2.py` | Upload MP3s to Azure Blob with MD5 verification |
| `convert_audio_formats.py` | Convert FLAC/M4A → MP3 |
| `scan_audio_formats.py` | Detect mislabeled audio files |
| `add_recognition_scores.py` | Calculate song familiarity tiers |
| `djLibrary2Json.py` | Export from Mixxx DJ library |
| `vocal_detection/` | Whisper-based vocal analysis |

**Python Dependencies:**
- Azure CLI (`az`) for blob operations
- Whisper (OpenAI) for vocal detection
- FFmpeg for audio conversion

### Data Files (JSON)

| File | Location | Records | Purpose |
|------|----------|---------|---------|
| `djSongsWeighted.json` | NTTT/public/songData/ | 4,675 | **PRIMARY** - Songs with ratings, recognition tiers |
| `ArtistMaster.json` | NTTT/public/songData/ | 26 | Orchestra master list with levels |
| `SingerMaster.json` | NTTT/public/songData/ | ~100 | Singer database |
| `TangoPeriods.json` | NTTT/public/songData/ | 5 | Era definitions (year ranges) |
| `djLibrary.json` | MusicImport/ | 25,978 | Full Mixxx DJ library export |

### Git Repositories

| Repo | Branch | Purpose |
|------|--------|---------|
| `tunes/tango` | DEVL | Main development |
| | main | Production (Vercel auto-deploy) |

### Related Projects (Same Ecosystem)

| Project | AppID | Shares |
|---------|-------|--------|
| tangotiempo.com | 1 | Firebase Auth, some components |
| harmonyjunction.org | 2 | Firebase Auth |
| **NTTT** | **3** | This app |
| TangoDJ | 4 | Planned - DJ tooling |

### API Keys & Secrets (Managed)

| Secret | Location | Used By |
|--------|----------|---------|
| Firebase Config | Vercel env vars | Auth, Firestore |
| Azure Storage | Local only (az login) | MusicImport scripts |
| (No API keys in code) | - | Public blob access |

---

## Current Menu Structure (GameHub)

```
┌─────────────────────────────────────────────────────────────┐
│  NTTT GameHub (/)                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─── TIMED QUIZ ───────────────────────────────────────┐  │
│  │  Race against the clock                              │  │
│  │  [Orchestra] [Singer] [Song Title] [Year]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── CLIP QUIZ ────────────────────────────────────────┐  │
│  │  No timer - replay clips                             │  │
│  │  [Orchestra] [Singer]                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── LEARN MODE ───────────────────────────────────────┐  │
│  │  Practice without pressure                           │  │
│  │  [Orchestra] [Singer]                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── OTHER ────────────────────────────────────────────┐  │
│  │  Listen & compare                                    │  │
│  │  [Listen] [Same Song]                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── TOOLS (password protected) ───────────────────────┐  │
│  │  [Recognition Validator] [Data Quality]              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Game Modes Explained

### Category 1: TIMED QUIZ
*Race against the clock - scored, competitive*

| Game | Path | Description |
|------|------|-------------|
| **Orchestra Quiz** | `/games/artist-quiz` | Hear a clip, identify the orchestra from 4 choices. Timed countdown per question. Score based on speed + accuracy. |
| **Singer Quiz** | `/games/singer-quiz` | Hear a vocal clip, identify the singer from 4 choices. |
| **Song Title Quiz** | `/games/song-quiz` | Hear a clip, identify the song title from 4 choices. |
| **Year Quiz** | `/games/year-learn` | Hear a clip, guess the recording year (decade-based scoring). |

**Common Config Options:**
- Number of songs (5-50)
- Time limit per song (5-60 seconds)
- Familiarity tiers (Iconic, Well-Known, Familiar, Obscure, Rare)
- Styles (Tango, Vals, Milonga)
- Vocals toggle (include songs with singers)
- Era filter (Old Guard, New Guard, Golden Age, Decline, Renaissance)

---

### Category 2: CLIP QUIZ
*No timer - replay clips as needed*

| Game | Path | Description |
|------|------|-------------|
| **Clip Orchestra** | `/games/clip-orchestra` | Same as Orchestra Quiz but untimed. Can replay clip. Better for learning. |
| **Clip Singer** | `/games/clip-singer` | Same as Singer Quiz but untimed. |

**Key Difference from Timed Quiz:**
- No countdown timer
- Can replay the audio clip multiple times
- Less pressure, more suitable for beginners

---

### Category 3: LEARN MODE
*Practice without pressure - no scoring*

| Game | Path | Description |
|------|------|-------------|
| **Orchestra Learn** | `/games/artist-learn` | Select ONE orchestra, listen to their songs sequentially. Learn that orchestra's distinctive sound. Sort by year option. |
| **Singer Learn** | `/games/singer-learn` | Select criteria, listen to songs with vocals. Learn singer voices. |

**Key Features:**
- No scoring or competition
- Sequential playback through a playlist
- Answer revealed immediately
- Focus on exposure and pattern recognition

---

### Category 4: OTHER
*Specialized listening tools*

| Game | Path | Description |
|------|------|-------------|
| **Listen** | `/games/listen` | Free-form listening. Pick any criteria, browse and play songs. Like a smart playlist generator. |
| **Same Song** | `/games/same-song` | Compare different recordings of the SAME song title by different orchestras. Great for learning how orchestras differ in their interpretations. |

---

### Category 5: TOOLS (Password Protected)
*Development and validation utilities*

| Tool | Path | Description |
|------|------|-------------|
| **Recognition Validator** | `/games/recognition-validator` | Tool for Toby to validate/update song familiarity tiers (Iconic → Rare). |
| **Data Quality** | `/games/data-quality` | Check for missing audio files, data inconsistencies, etc. |

---

## Common Selectors/Filters (Current Implementation)

| Selector | Component | Used In |
|----------|-----------|---------|
| **Number of Songs** | GameSetupDials (dial) | All quiz/learn modes |
| **Time Limit** | GameSetupDials (dial) | All timed modes |
| **Familiarity Tiers** | RecognitionSelector (tiles) | Quiz modes |
| **Styles** | StylesSelector (tiles: Tango/Vals/Milonga + Vocals) | All modes |
| **Era/Period** | PeriodsSelector (tiles) | All modes |
| **Orchestra** | Autocomplete dropdown | Listen, Some learn modes |
| **Singer** | Autocomplete dropdown | Listen mode |

---

## Audio Playback Flow

1. User configures game settings
2. Click Play → `fetchFilteredSongs()` queries `djSongsWeighted.json`
3. Songs filtered by criteria, shuffled/sorted
4. `PlayTab` renders with song list
5. WaveSurfer loads audio from Azure Blob (`AudioUrl` field)
6. Playback starts at random position (0-75% into song)
7. Fade in → Play for X seconds → Fade out
8. User answers (quiz) or continues (learn)

---

## Scoring System (Current - Local Only)

- Scores tracked in `GameContext`
- `currentScore`, `bestScore`, `totalScore`, `completedGames`
- Stored in localStorage per game
- **NOT** shared between users or devices
- No leaderboards yet

---

## Data Model

### djSongsWeighted.json (Primary Song Database)
```json
{
  "songs": [
    {
      "SongID": "unique-id",
      "Title": "La Cumparsita",
      "ArtistMaster": "Juan D'Arienzo",
      "Singer": "",
      "Year": "1951",
      "Style": "Tango",
      "AudioUrl": "https://storage.blob.core.windows.net/v20/...",
      "RecognitionTier": 1,  // 1=Iconic, 5=Rare
      "doNotPlay": false,
      "Composer": "Matos Rodriguez"
    }
  ]
}
```

### TangoPeriods.json
```json
[
  { "period": "Old Guard", "start_year": 1900, "end_year": 1925 },
  { "period": "Golden Age", "start_year": 1935, "end_year": 1955 }
]
```

---

# PROPOSED REDESIGN: GameHub 2.0

## Vision: Modern, Competition-Ready Game Hub

### New Menu Structure (Dial-Based Navigation)

```
┌─────────────────────────────────────────────────────────────┐
│  NTTT 3.0                          [Login] [Help] [?]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     [GAME TYPE DIAL]           [MODE DIAL]          │   │
│  │                                                      │   │
│  │      ◀ Orchestra ▶             ◀ Timed ▶            │   │
│  │        Singer                    Clip                │   │
│  │        Song                      Learn               │   │
│  │        Year                      Listen              │   │
│  │                                  Compare             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Selected: ORCHESTRA + TIMED = "Orchestra Timed Quiz"      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [COMPETITION]        [PRACTICE]        [CUSTOM]    │   │
│  │                                                      │   │
│  │  Play predefined      Free practice    Full config   │   │
│  │  levels, submit       no scoring       all options   │   │
│  │  to leaderboard                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## New Feature: Competition Mode

### Concept
Pre-defined "Levels" with fixed settings that allow global score comparison.

### Level Definition Schema
```json
{
  "levelId": "orch-golden-iconic-15",
  "name": "Golden Age Classics",
  "description": "Identify iconic Golden Age orchestras",
  "gameType": "orchestra",
  "mode": "timed",
  "settings": {
    "numSongs": 10,
    "timeLimit": 15,
    "recognitionTiers": [1],
    "periods": ["Golden Age"],
    "styles": ["Tango", "Vals", "Milonga"],
    "includeSinger": true
  },
  "scoring": {
    "maxScore": 1000,
    "speedBonus": true,
    "streakBonus": true
  },
  "leaderboard": true
}
```

### Level Categories
1. **Beginner** - Iconic songs, generous time, Golden Age only
2. **Intermediate** - Well-known songs, moderate time, mixed eras
3. **Expert** - All tiers, tight time limits, full catalog
4. **Daily Challenge** - Rotating preset, resets daily
5. **Weekly Tournament** - Fixed seed, ranked competition

---

## New Feature: User System

### User Profile
```json
{
  "userId": "firebase-uid",
  "displayName": "TangoMaster42",
  "avatar": "url",
  "stats": {
    "totalGamesPlayed": 150,
    "totalScore": 45000,
    "bestScores": {
      "orch-golden-iconic-15": 980
    },
    "achievements": ["first-perfect", "100-games", "streak-10"]
  },
  "preferences": {
    "theme": "dark",
    "defaultFilters": { ... }
  }
}
```

### Leaderboard API (Future Backend)
- Submit score: `POST /api/scores`
- Get leaderboard: `GET /api/leaderboard/:levelId`
- Get user rank: `GET /api/rank/:userId/:levelId`

---

## New Header/Footer Components

### Header
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] NTTT           [Daily] [Leaderboard] [Profile] [?]  │
└─────────────────────────────────────────────────────────────┘
```

### Footer/Help Drawer
- How to Play (per game mode)
- Scoring explanation
- About tango music (educational)
- Disclaimer (audio rights, beta status)
- Credits & contact

---

## Implementation Phases

### Phase 1: Dial Navigation
- Replace category cards with Type/Mode dials
- Dynamic game routing based on dial selection
- Maintain existing game logic

### Phase 2: User Accounts
- Firebase Auth (already partially implemented)
- User profile page
- Local score sync to cloud

### Phase 3: Competition Mode
- Level definition system
- Score submission API
- Basic leaderboards

### Phase 4: Social Features
- Share scores
- Challenge friends
- Daily/weekly tournaments

---

## File Structure (Current)

```
NTTT/src/app/
├── games/
│   ├── gamehub/page.js         # Main menu (this redesign target)
│   ├── artist-quiz/            # Orchestra timed quiz
│   ├── singer-quiz/            # Singer timed quiz
│   ├── song-quiz/              # Song title timed quiz
│   ├── year-learn/             # Year timed quiz
│   ├── clip-orchestra/         # Orchestra untimed quiz
│   ├── clip-singer/            # Singer untimed quiz
│   ├── artist-learn/           # Orchestra learn mode
│   ├── singer-learn/           # Singer learn mode
│   ├── listen/                 # Free listening
│   ├── same-song/              # Compare recordings
│   ├── recognition-validator/  # Admin tool
│   └── data-quality/           # Admin tool
├── components/ui/
│   ├── GameSetupDials.js       # Songs/Time dials
│   ├── PeriodsSelector.js      # Era tiles
│   ├── StylesSelector.js       # Style tiles
│   ├── RecognitionSelector.js  # Familiarity tiles
│   └── SongSnippet.js          # Visual timeline
├── contexts/
│   ├── GameContext.js          # Game state
│   └── AuthContext.js          # Firebase auth
├── hooks/
│   ├── useWaveSurfer.js        # Audio playback
│   └── useArtistQuiz.js        # Quiz logic
└── utils/
    └── dataFetching.js         # Song filtering
```

---

## Key Insights for Future Development

1. **All games share similar patterns** - ConfigTab + PlayTab structure
2. **Audio is the core** - WaveSurfer handles all playback
3. **Filtering is complex** - Many dimensions (era, style, tier, vocals, orchestra)
4. **Mobile-first** - All UIs designed for phone screens
5. **Offline-capable** - Static JSON, could be PWA
6. **No backend yet** - All client-side, localStorage only

---

*Document created: 2026-02-26*
*Persona: Compás (NTTT)*
