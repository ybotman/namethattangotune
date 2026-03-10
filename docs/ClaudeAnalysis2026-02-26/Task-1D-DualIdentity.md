# Task 1D: Dual-Identity Artists - Separate Recording Eras

## Status: TODO

## Objective
Handle artists who recorded under different configurations (own orchestra vs ensemble/duo) with different end dates.

---

## Dual-Identity Artists

| Artist | Identity 1 | Last Year | Identity 2 | Last Year |
|--------|-----------|-----------|------------|-----------|
| Pedro Laurenz | Own Orchestra | ~1952 | Quinteto Real | 1966 |
| Horacio Salgán | Orquesta Típica | 1957/1963 | Duo Salgán-De Lío / Quinteto Real | ~2005 |

---

## The Problem

If djSongsWeighted has:
- "Pedro Laurenz" with year 1965 → This might be Quinteto Real, not his 1940s orchestra
- "Horacio Salgan" with year 2000 → This is Duo/Quinteto, not típica

This isn't necessarily a DQ issue - but users playing "orchestra mode" might get confused if a song from 2000 plays for Salgán when they're testing Golden Age knowledge.

---

## Tasks

### Step 1: Query Each Artist
- [ ] Pedro Laurenz: Find all years in djSongsWeighted
- [ ] Horacio Salgán: Find all years in djSongsWeighted
- [ ] Group songs by year range

### Step 2: Analyze Distribution
- [ ] Laurenz pre-1952: Own orchestra
- [ ] Laurenz 1960-1966: Quinteto Real
- [ ] Salgán pre-1963: Orquesta Típica
- [ ] Salgán post-1963: Duo/Quinteto

### Step 3: Evaluate Options

**Option A: Do Nothing**
- Accept that artist spans multiple eras
- Document in ArtistMaster but don't change data

**Option B: Split in ArtistMaster**
- Create separate entries: "Pedro Laurenz" vs "Quinteto Real"
- Requires updating djSongsWeighted Orchestra field

**Option C: Add Era Metadata**
- Add `era` field to songs in djSongsWeighted
- Filter by era in game mode

### Step 4: Recommend Action
- [ ] Document recommendation
- [ ] Present to user for decision

---

## Current State in ArtistMaster

**Pedro Laurenz:**
```json
{
  "artist": "Pedro Laurenz",
  "grouped": ["Quinteto Pedro Laurenz"]
}
```
Note: Already has "Quinteto Pedro Laurenz" as alias.

**Horacio Salgán:**
```json
{
  "artist": "Horacio Salgan",
  "grouped": ["Horacio Salgan y su Orquesta Típica"]
}
```
Note: No Duo/Quinteto aliases.

---

## Acceptance Criteria

1. Both artists' year distributions documented
2. Clear recommendation presented to user
3. User decision recorded
4. If action taken, logged to ChangeLog-Phase1.md

---

## Prompt for Compás

```
TASK 1D: Dual-Identity Artists

1. Read Task-1D-DualIdentity.md (this file)
2. Query djSongsWeighted for Pedro Laurenz - list all unique years
3. Query djSongsWeighted for Horacio Salgan - list all unique years
4. Group by era (pre-split vs post-split)
5. Present distribution to user with options A/B/C
6. Wait for user decision before proceeding
7. Log findings to ChangeLog-Phase1.md

This is an ANALYSIS task - do not make changes until user approves approach.
```

---

*Owner: Compás*
