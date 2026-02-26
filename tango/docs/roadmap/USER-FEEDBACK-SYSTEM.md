# User Feedback System

*Allow users to flag issues and provide feedback during gameplay*

---

## Goals

1. **Catch data errors** — Wrong answers, incorrect metadata
2. **Identify difficulty issues** — Songs in wrong tier
3. **Improve quality** — Crowdsourced validation
4. **Engage users** — They feel heard and involved

---

## Feedback Types

| Type | Description | Priority |
|------|-------------|----------|
| `wrong_answer` | "I think the correct answer is wrong" | High |
| `wrong_metadata` | "Year/singer/title seems incorrect" | High |
| `too_hard` | "This is too difficult for this tier" | Medium |
| `too_easy` | "This is too easy for this tier" | Medium |
| `audio_issue` | "Audio quality problem, wrong clip" | High |
| `other` | Free-form feedback | Low |

---

## User Flow

### During Results Screen

After answering, user sees the correct answer. If they disagree:

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ Incorrect                                               │
│                                                             │
│  Your answer: Carlos Di Sarli                              │
│  Correct answer: Juan D'Arienzo                            │
│                                                             │
│  "La Cumparsita" (1951)                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               [ Next Song ]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🤔 Something wrong?  [ Report Issue ]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Feedback Modal

When user clicks "Report Issue":

```
┌─────────────────────────────────────────────────────────────┐
│  📝 Report an Issue                              [ X ]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Song: "La Cumparsita" - Juan D'Arienzo (1951)             │
│                                                             │
│  What's the issue?                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ Wrong answer - I believe this is incorrect        │   │
│  │ ○ Wrong year/singer/title                           │   │
│  │ ○ Too difficult for this category                   │   │
│  │ ○ Too easy for this category                        │   │
│  │ ○ Audio problem (quality, wrong clip)               │   │
│  │ ○ Other                                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Details (optional):                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ I think this is actually Di Sarli because...        │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              [ Submit Feedback ]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ℹ️ Feedback helps improve the game for everyone           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Confirmation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ✅ Thank you for your feedback!                │
│                                                             │
│        We'll review this and update if needed.              │
│                                                             │
│                    [ Continue ]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Settings Page Option

Users can also provide general feedback from settings:

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Settings                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Account                                                    │
│  ├── Profile                                               │
│  ├── Preferences                                           │
│  └── Privacy                                               │
│                                                             │
│  Support                                                    │
│  ├── [ 📝 Send Feedback ]     ← General feedback           │
│  ├── [ ❓ Help / FAQ ]                                     │
│  └── [ 📧 Contact Us ]                                     │
│                                                             │
│  About                                                      │
│  └── Version 2.0.3                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Feedback Submission

```javascript
// Firestore: feedback/{feedbackId}
{
  feedbackId: "uuid",
  createdAt: timestamp,
  status: "pending",  // pending, reviewed, resolved, dismissed

  // User
  userId: "firebase-uid",
  displayName: "TangoMaster",
  userLevel: 5,
  isAuthenticated: true,

  // Context
  feedbackType: "wrong_answer",
  source: "results_screen",  // results_screen, settings, profile

  // The song in question
  songId: "uuid",
  songTitle: "La Cumparsita",
  orchestra: "Juan D'Arienzo",
  singer: "",
  year: 1951,
  style: "Tango",
  recognitionTier: 1,

  // Game context (if during game)
  gameType: "orchestra",
  gameMode: "timed",
  userAnswer: "Carlos Di Sarli",
  correctAnswer: "Juan D'Arienzo",
  wasCorrect: false,

  // User's feedback
  issueType: "wrong_answer",
  details: "I think this is actually Di Sarli because of the violin style",

  // Admin fields
  reviewedBy: null,
  reviewedAt: null,
  resolution: null,
  adminNotes: null
}
```

### Feedback Aggregation (Per Song)

```javascript
// Firestore: songFeedback/{songId}
{
  songId: "uuid",
  totalFeedback: 12,

  byType: {
    wrong_answer: 5,
    wrong_metadata: 2,
    too_hard: 3,
    too_easy: 1,
    audio_issue: 1,
    other: 0
  },

  // Flag for attention
  needsReview: true,
  lastFeedbackAt: timestamp,

  // Recent feedback IDs for quick access
  recentFeedbackIds: ["fb1", "fb2", "fb3"]
}
```

---

## Admin Review Queue

### Feedback Queue Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  📝 FEEDBACK QUEUE                         Pending: 47      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filter: [ All ] [ Wrong Answer ] [ Difficulty ] [ Audio ] │
│  Sort:   [ Newest ] [ Most Reports ] [ High Priority ]     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 HIGH - "La Cumparsita" (5 reports)               │   │
│  │    Type: Wrong Answer                               │   │
│  │    Latest: "I think this is Di Sarli..."           │   │
│  │    [ Review ] [ Dismiss All ]                       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟡 MED - "Poema" (3 reports)                        │   │
│  │    Type: Too Easy                                   │   │
│  │    Latest: "This is way too easy for Tier 2"       │   │
│  │    [ Review ] [ Dismiss All ]                       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟢 LOW - "Milonga Triste" (1 report)                │   │
│  │    Type: Audio Issue                                │   │
│  │    Latest: "Clip cuts off at the end"              │   │
│  │    [ Review ] [ Dismiss ]                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Review Detail View

```
┌─────────────────────────────────────────────────────────────┐
│  📝 Review Feedback: "La Cumparsita"                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SONG INFO                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Title: La Cumparsita                                │   │
│  │ Orchestra: Juan D'Arienzo                           │   │
│  │ Year: 1951                                          │   │
│  │ Tier: 1 (Iconic)                                    │   │
│  │ [ ▶️ Play Audio ]                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ANALYTICS                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Accuracy: 87% (234 attempts)                        │   │
│  │ Confused with: Di Sarli (8%), Troilo (3%)          │   │
│  │ Tier expectation: 85-95% ✅ In range               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  FEEDBACK (5 reports)                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ @TangoMaster (Lvl 5) - 2 hours ago                  │   │
│  │ "I think this is Di Sarli because of the violin"   │   │
│  │                                                      │   │
│  │ @MilongaQueen (Lvl 3) - 1 day ago                   │   │
│  │ "Doesn't sound like D'Arienzo to me"               │   │
│  │                                                      │   │
│  │ @NewbieDancer (Lvl 1) - 2 days ago                  │   │
│  │ "This is wrong!"                                    │   │
│  │                                                      │   │
│  │ [ Load more... ]                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  RESOLUTION                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ Confirmed correct - dismiss feedback              │   │
│  │ ○ Fix metadata - update song info                   │   │
│  │ ○ Change tier - move to different tier              │   │
│  │ ○ Remove song - exclude from game                   │   │
│  │ ○ Flag for audio review                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Admin notes:                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Verified: This is definitely D'Arienzo 1951.       │   │
│  │ Users confused by the slower tempo of this version │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ Resolve & Close ]  [ Save Draft ]  [ Skip ]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Priority Scoring

Automatically prioritize feedback:

```javascript
function calculateFeedbackPriority(feedback, songStats) {
  let score = 0;

  // More reports = higher priority
  score += Math.min(feedback.reportCount * 10, 50);

  // High-tier songs matter more
  if (songStats.recognitionTier === 1) score += 20;
  if (songStats.recognitionTier === 2) score += 10;

  // "Wrong answer" is most critical
  if (feedback.type === 'wrong_answer') score += 30;
  if (feedback.type === 'audio_issue') score += 25;

  // Experienced users' feedback weighted higher
  if (feedback.avgUserLevel >= 5) score += 15;

  // Recent feedback more urgent
  const daysSinceFirst = daysBetween(feedback.firstReportAt, now());
  if (daysSinceFirst < 1) score += 10;

  return score;
}
```

| Score | Priority |
|-------|----------|
| 70+ | 🔴 High |
| 40-69 | 🟡 Medium |
| 0-39 | 🟢 Low |

---

## User Feedback History

Users can see their submitted feedback:

```
┌─────────────────────────────────────────────────────────────┐
│  📝 My Feedback                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ "La Cumparsita" - Wrong Answer                      │   │
│  │ Submitted: 2 hours ago                              │   │
│  │ Status: 🟡 Under Review                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ "Poema" - Too Easy                                  │   │
│  │ Submitted: 3 days ago                               │   │
│  │ Status: ✅ Resolved - Tier changed to 1             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ "Milonga Triste" - Audio Issue                      │   │
│  │ Submitted: 1 week ago                               │   │
│  │ Status: ❌ Dismissed - Audio verified correct       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Notifications to Users

When feedback is resolved:

```
┌─────────────────────────────────────────────────────────────┐
│  🔔 Feedback Update                                         │
│                                                             │
│  Your feedback on "Poema" was reviewed!                    │
│                                                             │
│  ✅ We agreed - this song has been moved to Tier 1.        │
│                                                             │
│  Thanks for helping improve NTTT!                          │
│                                                             │
│                    [ View Details ]                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Rate Limiting

Prevent spam:

| User Type | Limit |
|-----------|-------|
| Authenticated | 10 feedback/day |
| Anonymous | Not allowed |
| New users (<10 games) | 3 feedback/day |
| Trusted users (Lvl 5+) | 20 feedback/day |

---

## Implementation Phases

### Phase 1: Basic Submission
- [ ] "Report Issue" button on results screen
- [ ] Feedback modal with dropdown
- [ ] Firestore write
- [ ] Thank you confirmation

### Phase 2: Admin Queue
- [ ] Admin-only feedback queue page
- [ ] Filter/sort functionality
- [ ] Resolution workflow
- [ ] Status updates

### Phase 3: Aggregation
- [ ] Per-song feedback rollup
- [ ] Priority scoring
- [ ] Auto-flagging high-priority songs

### Phase 4: User Experience
- [ ] User feedback history
- [ ] Resolution notifications
- [ ] Trusted user status
- [ ] Feedback achievements

---

*Last updated: 2026-02-26*
