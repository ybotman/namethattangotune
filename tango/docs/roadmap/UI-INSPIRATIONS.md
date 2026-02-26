# UI/UX Inspirations for NTTT

*Reference designs from successful apps*

---

## 1. Heardle Model (Closest Analog)

Heardle was the Wordle-for-music game Spotify acquired. Key patterns:

### What They Do Well

**Genre/Era Sub-Hubs**
- Heardle 80s, 90s, K-pop, Rock as separate entry points
- NTTT equivalent: "Golden Age Hub," "D'Arienzo Challenge," "Vals Only"

**Daily Challenge as Hero**
- Homepage immediately presents today's challenge
- One tap to play, no menu drilling
- Creates FOMO if you miss a day

**Progressive Reveal Mechanic**
- Each wrong guess unlocks more of the clip
- 1 sec → 2 sec → 4 sec → 8 sec → 16 sec → full
- Different from NTTT's current model but could be a new mode

**Shareable Emoji Grid Results**
```
🟩⬜⬜⬜⬜⬜
Heardle #247
```
- Dead simple to implement
- Hugely viral on social media
- No spoilers (just colors)

### NTTT Adaptation

```
🎵 NTTT Daily #127 🎵

Orchestra: 🟩⬜⬜⬜
Singer:    🟩🟩⬜⬜
Year:      🟩🟩🟩⬜

Score: 850 | 🔥 12 days

Play: nttt.app/daily
```

---

## 2. Duolingo Model (Gamification Gold Standard)

The most successful language learning app. Patterns that apply to NTTT:

### Linear Path UI
- Visual "trail" instead of button grid
- Levels are nodes you progress through
- Clear sense of forward momentum

```
    🔒 Pugliese Advanced
       │
    🔒 Mixed Era Challenge
       │
    ⭐ Golden Age Well-Known  ← YOU ARE HERE
       │
    ✅ Golden Age Iconic
       │
    ✅ Beginner Basics
```

### Streaks
- Track consecutive days played
- Tango dancers already habitual (dance multiple nights/week)
- Streak freeze as a "save" mechanic

### Leagues/Leaderboards
- Weekly competitions
- Bronze → Silver → Gold → Diamond
- Top 10 get promoted, bottom 5 demoted
- Creates natural competition

### XP System
- Every action earns points
- Unified currency across all activities
- Speed bonus, accuracy bonus, streak bonus

### Progress Bars Everywhere
- Lesson progress
- Daily goal progress
- Level progress
- Creates constant sense of momentum

### Hearts/Lives
- Limited mistakes before retry
- Creates stakes without a timer
- Optional for NTTT (might frustrate)

---

## 3. Hearthstone Tavern Menu (Themed Atmosphere)

The entire menu IS the game world.

### NTTT Adaptation
- Dark background like a milonga
- Warm lighting, amber tones
- Tango-themed visual metaphors

### Clickable Objects Instead of Buttons
- Vinyl records for game modes
- Bandoneon for settings
- Dance floor tiles for difficulty
- Old radio for "Listen" mode

---

## 4. Modern Web Quiz Patterns

Common patterns across React quiz apps:

### Three-Step Flow
```
Config → Play → Results
```
NTTT already has this (ConfigTab → PlayTab → Score)

### Category Tiles with Icons
- Large, tappable cards
- Icon + title + brief description
- Better than dropdowns for mobile

```
┌──────────────────────┐
│      🎵              │
│   Orchestra          │
│   Name the band      │
└──────────────────────┘
```

### Autocomplete Search
- For specific orchestra/singer selection
- NTTT already has this (good!)

### Real-Time Feedback
- Color flash on answer (green/red)
- Brief info card with correct answer
- Celebratory animation on correct

---

## 5. Proposed GameHub 3.0 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🔥 DAILY CHALLENGE                              [12:42:00] │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Golden Age Orchestra Quiz                          │   │
│  │  🎵 10 songs • ⏱️ 15 sec • 🎯 Iconic only          │   │
│  │                                                      │   │
│  │              [ PLAY NOW ]                           │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  📊 YOUR STATS                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ 🔥 12  │ │ ⭐ 847 │ │ 🏆 #42 │ │ 📈 Lvl │              │
│  │ Streak │ │ Today  │ │ Rank   │ │   5    │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
├─────────────────────────────────────────────────────────────┤
│  QUICK PLAY                                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │  🎵    │ │  🎤    │ │  📝    │ │  📅    │              │
│  │ Orch.  │ │ Singer │ │  Song  │ │  Year  │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
├─────────────────────────────────────────────────────────────┤
│  MODE   [ Timed ][ Practice ][ Learn ][ Listen ]           │
├─────────────────────────────────────────────────────────────┤
│  ▼ Advanced Config                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Era: [Golden][New][Old][Decline][Renaiss.]         │   │
│  │ Style: [Tango][Vals][Milonga] [+Vocals]            │   │
│  │ Familiarity: [Iconic][Known][Familiar][Obscure]    │   │
│  │ Songs: ◀ 10 ▶    Time: ◀ 15s ▶                     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  [ 📊 Leaderboard ] [ 🏅 Achievements ] [ ⚙️ Settings ]    │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. MUI Component Mapping

| UI Element | MUI Component |
|------------|---------------|
| Daily Challenge card | `Card` + `CardActionArea` |
| Stats bar | `Box` with `Typography` + `Chip` |
| Game type tiles | `Grid` + `Paper` + `IconButton` |
| Mode selector | `ToggleButtonGroup` |
| Advanced config | `Accordion` |
| Era/Style chips | `Chip` (clickable) |
| Songs/Time dials | Keep existing `react-mobile-picker` |
| Progress bars | `LinearProgress` |
| Leaderboard | `List` + `ListItem` + `Avatar` |
| Achievements | `Badge` + `Tooltip` |

---

## 7. Color Palette Suggestions

### Current
- Background: dark (#1a1a2e)
- Accent: blue (#66aaff)
- Foreground: white

### Tango-Themed Alternative
- Background: deep burgundy (#2d1b1b)
- Accent: gold (#d4af37)
- Secondary: warm amber (#ff9800)
- Foreground: cream (#f5f5dc)

---

## 8. Animation Opportunities

| Trigger | Animation |
|---------|-----------|
| Correct answer | Confetti burst (`react-rewards`) |
| Wrong answer | Shake + red flash |
| Level up | Full-screen celebration |
| Streak milestone | Fire emoji rain |
| Daily complete | Share prompt slide-up |
| Achievement unlock | Badge zoom + glow |

---

*Last updated: 2026-02-26*
