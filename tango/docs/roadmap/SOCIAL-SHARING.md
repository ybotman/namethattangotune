# Social Sharing & Viral Features

*How NTTT spreads through social media*

---

## Goals

1. **Every play is shareable** — make it easy to brag
2. **Links drive installs** — every share is an ad
3. **Achievements are trophies** — public recognition
4. **Competition creates FOMO** — "I need to beat that"

---

## Share Formats

### 1. Daily Challenge Result

```
🎵 NTTT Daily #127 🎵

🎻 Orchestra: 🟩🟩🟩🟩 Perfect!
🎤 Singer:    🟩🟩🟩⬜ 3/4
📅 Year:      🟩🟩⬜⬜ 2/4

Score: 920/1000
🔥 12-day streak

Can you beat me?
👉 nttt.app/daily
```

**Implementation:**
- Generate text on results screen
- Copy to clipboard button
- Share sheet (Web Share API)
- Direct links to Twitter/FB/WhatsApp

### 2. Competition Level Result

```
🏆 NTTT Competition 🏆

Level: Golden Age Classics
Score: 847/1000
Rank: #42 of 1,247

🥇 Top score: 982 by @TangoMaster
🥈 #2: 978 by @MilongaKing

Challenge the leaderboard:
👉 nttt.app/compete/golden-iconic

#TangoQuiz #NTTT
```

### 3. Achievement Unlocked

```
🏅 Achievement Unlocked! 🏅

"D'Arienzo Expert"
Correctly identified 50 D'Arienzo songs

🎵 Name That Tango Tune
👉 nttt.app

#TangoAchievement #NTTT
```

### 4. Milestone Share

```
🎉 NTTT Milestone 🎉

I just reached Level 5: Milonguero!

📊 Stats:
• 500 games played
• 4,200 XP earned
• 89% accuracy
• 23-day best streak

Think you can beat me?
👉 nttt.app

#TangoMaster #NTTT
```

---

## Share Buttons Location

### Results Screen
```
┌─────────────────────────────────────────┐
│           🎉 Great Job! 🎉             │
│                                         │
│           Score: 850/1000               │
│           Rank: #42                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📋 Copy   🐦 Tweet   📱 Share  │   │
│  └─────────────────────────────────┘   │
│                                         │
│         [ Play Again ] [ Home ]         │
└─────────────────────────────────────────┘
```

### Achievement Pop-up
```
┌─────────────────────────────────────────┐
│     🏅 Achievement Unlocked! 🏅        │
│                                         │
│     [Badge Image]                       │
│     "Perfect Game"                      │
│     10/10 correct answers               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        [ Share Achievement ]     │   │
│  └─────────────────────────────────┘   │
│                                         │
│              [ Continue ]               │
└─────────────────────────────────────────┘
```

### Profile Page
```
┌─────────────────────────────────────────┐
│  My Achievements (12/50)                │
│                                         │
│  🏅 🏅 🏅 🏅 🏅 🏅 🔒 🔒 🔒 🔒         │
│  🏅 🏅 🔒 🔒 🔒 🔒 🔒 🔒 🔒 🔒         │
│                                         │
│  Recent:                                │
│  ┌─────────────────────────────────┐   │
│  │ 🏅 Perfect Game      [Share]    │   │
│  │ 🏅 7-Day Streak      [Share]    │   │
│  │ 🏅 100 Games         [Share]    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Deep Links

Every shared link should deep-link to relevant content:

| Link | Destination |
|------|-------------|
| `nttt.app/daily` | Today's daily challenge |
| `nttt.app/daily/127` | Specific daily (for comparison) |
| `nttt.app/compete/golden-iconic` | Specific competition level |
| `nttt.app/leaderboard/golden-iconic` | Leaderboard for level |
| `nttt.app/profile/user123` | User's public profile |
| `nttt.app/achievement/perfect-game` | Achievement description |

---

## Social Meta Tags

For link previews on Twitter/Facebook/etc:

```html
<!-- Daily Challenge -->
<meta property="og:title" content="NTTT Daily Challenge #127" />
<meta property="og:description" content="Can you identify these tango songs?" />
<meta property="og:image" content="https://nttt.app/og/daily-127.png" />
<meta property="og:url" content="https://nttt.app/daily/127" />

<!-- Competition -->
<meta property="og:title" content="Golden Age Classics Leaderboard" />
<meta property="og:description" content="Top score: 982. Can you beat it?" />
<meta property="og:image" content="https://nttt.app/og/compete-golden.png" />
```

---

## Share API Implementation

```javascript
// Web Share API (mobile-friendly)
async function shareResult(result) {
  const shareData = {
    title: 'NTTT Daily Challenge',
    text: generateShareText(result),
    url: `https://nttt.app/daily/${result.dailyNumber}`
  };

  if (navigator.share && navigator.canShare(shareData)) {
    await navigator.share(shareData);
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(shareData.text);
    showToast('Copied to clipboard!');
  }
}

// Generate emoji grid
function generateEmojiGrid(answers) {
  return answers.map(a => a.correct ? '🟩' : '⬜').join('');
}
```

---

## Viral Loop

```
User plays → Gets score → Shares to social
                              ↓
                    Friend sees share
                              ↓
                    Clicks link → Lands on game
                              ↓
                    Plays → Gets score → Shares...
```

---

## Hashtags

Suggested hashtags for discoverability:

- `#NTTT`
- `#TangoQuiz`
- `#NameThatTangoTune`
- `#TangoMusic`
- `#Milonga`
- `#ArgentineTango`

---

*Last updated: 2026-02-26*
