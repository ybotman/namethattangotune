# Vocal Detection Architecture for NTTT

## Status: POC WORKING

**Tested with Whisper - Detection working!**
- Songs with singers detected at 30-50% vocal time
- Instrumental songs show <10% (mostly false positives)
- Threshold: **>15% vocal = has singer**

---

## Goal
Detect where singers/vocals are present in tango songs to enable:
1. Filter songs WITH singers vs instrumental-only
2. Play ONLY vocal sections (for singer quiz)
3. AVOID vocal sections (for orchestra-only play)

## Recommended Stack

### SELECTED: OpenAI Whisper (base model)
- **What**: Speech recognition - transcribes audio to text with timestamps
- **Output**: Text + word-level timestamps for vocal segments
- **Pros**: Works great for tango vocals, gives lyrics preview, 20s/song
- **Cons**: May hallucinate on instrumentals (solved with 15% threshold)
- **Install**: `pip install openai-whisper`

### Alternatives Tested:
- **inaSpeechSegmenter**: Dependency conflicts with modern Python/numpy
- **Demucs**: Build issues with Python 3.14

## Data Structure

```json
{
  "songID": "abc123",
  "hasSinger": true,
  "vocalSegments": [
    { "start": 45.0, "end": 78.5, "confidence": 0.92 },
    { "start": 120.0, "end": 155.0, "confidence": 0.88 }
  ],
  "totalVocalTime": 68.5,
  "totalDuration": 180.0,
  "vocalPercentage": 38.0,
  "analysisVersion": "1.0",
  "analyzedAt": "2026-02-22T00:30:00Z"
}
```

## Resolution
- Analysis in ~5 second blocks
- Store start/end times for each vocal segment
- Merge adjacent vocal blocks

## Processing Pipeline

```
1. Download MP3 from Azure (or use local)
2. Run vocal detection
3. Extract timestamps
4. Store in vocalAnalysis.json
5. Merge into djSongs.json (add hasSinger, vocalSegments)
```

## Batch Processing Strategy
- Process in batches of 50-100 songs
- Estimate: ~10-30 sec per song
- 5,731 songs = 16-48 hours total
- Run overnight in chunks

## POC Plan
1. Test on 5-10 songs manually
2. Validate accuracy with known vocal/instrumental songs
3. Tune parameters if needed
4. Scale to full batch

## Files
- `poc_vocal_detect.py` - POC script
- `batch_process.py` - Batch processor
- `vocalAnalysis.json` - Results storage
