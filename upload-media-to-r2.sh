#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# Upload local media/ directory to Cloudflare R2 bucket
# ─────────────────────────────────────────────────────
set -euo pipefail

BUCKET="pazl"
SRC_DIR="/Users/yerbolkuandykov/Downloads/pazl/pazl-mnt/media"
# Files are uploaded with key = media/<relative-path>
PREFIX="media"
PARALLEL=10
LOG_FILE="/Users/yerbolkuandykov/projects/pazl-web/upload-r2.log"
FAIL_LOG="/Users/yerbolkuandykov/projects/pazl-web/upload-r2-failures.log"

# Clear previous logs
> "$LOG_FILE"
> "$FAIL_LOG"

TOTAL=$(find "$SRC_DIR" -type f | wc -l | tr -d ' ')
echo "🚀 Uploading $TOTAL files from $SRC_DIR → R2 bucket '$BUCKET/$PREFIX/'"
echo "   Parallelism: $PARALLEL workers"
echo "   Log: $LOG_FILE"
echo ""

COUNTER=0

upload_file() {
  local filepath="$1"
  local total="$2"
  local log_file="$3"
  local fail_log="$4"
  local bucket="$5"
  local src_dir="$6"
  local prefix="$7"

  # Relative path from the media root
  local relpath="${filepath#$src_dir/}"
  local key="${prefix}/${relpath}"

  if wrangler r2 object put "${bucket}/${key}" --file="$filepath" --content-type="$(file --brief --mime-type "$filepath")" --remote > /dev/null 2>&1; then
    echo "✅ $key" >> "$log_file"
  else
    echo "❌ FAIL: $key" >> "$fail_log"
    echo "❌ $key" >> "$log_file"
  fi
}

export -f upload_file

# Use xargs for parallel execution with progress
find "$SRC_DIR" -type f -print0 | \
  xargs -0 -n1 -P "$PARALLEL" -I{} bash -c \
    'upload_file "$@"' _ {} "$TOTAL" "$LOG_FILE" "$FAIL_LOG" "$BUCKET" "$SRC_DIR" "$PREFIX" &

# Background PID for the upload process
UPLOAD_PID=$!

# Progress monitor
while kill -0 $UPLOAD_PID 2>/dev/null; do
  DONE=$(wc -l < "$LOG_FILE" 2>/dev/null | tr -d ' ')
  FAILED=$(wc -l < "$FAIL_LOG" 2>/dev/null | tr -d ' ')
  printf "\r📊 Progress: %s / %s uploaded  |  ❌ %s failed" "$DONE" "$TOTAL" "$FAILED"
  sleep 2
done

wait $UPLOAD_PID 2>/dev/null || true

# Final report
DONE=$(wc -l < "$LOG_FILE" | tr -d ' ')
FAILED=$(wc -l < "$FAIL_LOG" | tr -d ' ')
echo ""
echo ""
echo "═══════════════════════════════════════"
echo "📦 Upload complete!"
echo "   ✅ Uploaded: $((DONE - FAILED)) / $TOTAL"
echo "   ❌ Failed:   $FAILED"
if [ "$FAILED" -gt 0 ]; then
  echo "   📝 Failures saved to: $FAIL_LOG"
fi
echo "═══════════════════════════════════════"
