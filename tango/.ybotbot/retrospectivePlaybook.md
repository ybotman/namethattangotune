# NTTT Retrospective Playbook

Lessons learned during NTTT development. Read on session start to avoid repeating mistakes.

---

## 2026-02-24: Shell CWD + Folder Rename Issue

**Lesson:** When renaming folders that Claude's shell CWD points to, the shell gets stuck and all Bash commands fail.

**Workaround:** Use Read tool for file access or have user run commands manually until session restart.

**Prevention:** Before major folder restructuring, cd to a stable parent directory first, or plan to restart session after restructure.

---

## 2026-02-24: Conversion Job Incomplete

**Situation:** Audio format conversion ran to 72% (2,880/3,997) and stopped.

**Lesson:** Long-running batch jobs (ffmpeg conversion + Azure uploads) can timeout or get interrupted. The script has resume support via `conversion_progress.json`, so just re-run to continue.

**Action:** Always check `conversion_progress.json` to verify completion before assuming batch jobs finished.

---

## 2026-02-24: Vocal Analysis Not Merged

**Situation:** 5,455 songs analyzed for vocals but data never merged into `djSongs.json`.

**Lesson:** Analysis pipeline and merge step are separate. Just because analysis completed doesn't mean the app has the data.

**Files:**
- Analysis: `MusicImport/vocal_detection/vocalAnalysis.json`
- Target: `MusicImport/djSongs.json` (needs `hasVocals` field added)

---
