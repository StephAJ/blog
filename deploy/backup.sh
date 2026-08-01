#!/usr/bin/env bash
# Snapshot the SQLite database and uploaded media.
# Add to cron for nightly backups:
#   0 3 * * * /var/www/blog/deploy/backup.sh >> /var/www/blog/logs/backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."

DB_PATH="${DATABASE_PATH:-./data/blog.db}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${KEEP_DAYS:-30}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_PATH" ]; then
  echo "No database at $DB_PATH — nothing to back up."
  exit 0
fi

# .backup is safe to run against a live database; a plain file copy is not.
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/blog-$STAMP.db'"
gzip -f "$BACKUP_DIR/blog-$STAMP.db"

if [ -d ./public/uploads ] && [ -n "$(ls -A ./public/uploads 2>/dev/null)" ]; then
  tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C ./public uploads
fi

find "$BACKUP_DIR" -name "*.gz" -mtime "+$KEEP_DAYS" -delete

echo "✓ Backed up to $BACKUP_DIR (keeping $KEEP_DAYS days)"
