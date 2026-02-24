#!/bin/bash
# Batch Status Check Script

cd /Users/tobybalsley/MyDocs/AppDev/NTTT/MusicImport/vocal_detection

TOTAL=5488
DONE=$(grep -c "SINGER\|INSTR" batch_full.log 2>/dev/null || echo 0)
SINGERS=$(grep -c "SINGER" batch_full.log 2>/dev/null || echo 0)
INSTR=$(grep -c "INSTR" batch_full.log 2>/dev/null || echo 0)

# Get process start time and calculate elapsed
PID=$(pgrep -f "batch_process.py" | head -1)
if [ -n "$PID" ]; then
    ELAPSED=$(ps -p $PID -o etime= | xargs)
    STATUS="RUNNING (PID: $PID)"
else
    STATUS="STOPPED"
    ELAPSED="N/A"
fi

# Parse elapsed time to seconds (zsh/bash compatible)
if [ "$ELAPSED" != "N/A" ]; then
    # Format can be: MM:SS, HH:MM:SS, or D-HH:MM:SS
    if [[ $ELAPSED == *-* ]]; then
        DAYS=$(echo $ELAPSED | cut -d'-' -f1)
        REST=$(echo $ELAPSED | cut -d'-' -f2)
    else
        DAYS=0
        REST=$ELAPSED
    fi

    # Count colons to determine format
    COLONS=$(echo "$REST" | tr -cd ':' | wc -c | xargs)

    if [ "$COLONS" -eq 2 ]; then
        # HH:MM:SS
        HH=$(echo "$REST" | cut -d':' -f1)
        MM=$(echo "$REST" | cut -d':' -f2)
        SS=$(echo "$REST" | cut -d':' -f3)
        SECS=$((10#$HH*3600 + 10#$MM*60 + 10#$SS))
    elif [ "$COLONS" -eq 1 ]; then
        # MM:SS
        MM=$(echo "$REST" | cut -d':' -f1)
        SS=$(echo "$REST" | cut -d':' -f2)
        SECS=$((10#$MM*60 + 10#$SS))
    else
        SECS=$REST
    fi
    SECS=$((SECS + DAYS*86400))

    # Calculate throughput
    if [ $SECS -gt 0 ] && [ $DONE -gt 0 ]; then
        RATE=$(echo "scale=2; $DONE / $SECS * 60" | bc)
        REMAINING=$((TOTAL - DONE))
        ETA_SECS=$(echo "scale=0; $REMAINING / $DONE * $SECS" | bc)
        ETA_HOURS=$(echo "scale=1; $ETA_SECS / 3600" | bc)
    else
        RATE="N/A"
        ETA_HOURS="N/A"
    fi
else
    RATE="N/A"
    ETA_HOURS="N/A"
fi

PCT=$(echo "scale=1; $DONE * 100 / $TOTAL" | bc)

echo "========================================"
echo "  VOCAL DETECTION BATCH STATUS"
echo "========================================"
echo ""
echo "  Status:     $STATUS"
echo "  Elapsed:    $ELAPSED"
echo ""
echo "  Progress:   $DONE / $TOTAL ($PCT%)"
echo "  ├─ SINGER:  $SINGERS"
echo "  └─ INSTR:   $INSTR"
echo ""
echo "  Throughput: $RATE songs/min"
echo "  ETA:        $ETA_HOURS hours"
echo ""
echo "========================================"
echo "  Last 3 songs:"
grep -E "SINGER|INSTR" batch_full.log 2>/dev/null | tail -3 | sed 's/^/  /'
echo "========================================"
