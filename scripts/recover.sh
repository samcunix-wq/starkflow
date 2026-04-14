#!/bin/bash
# StarkFlow Recovery Script
# Use this to restore the app to a known good state

echo "StarkFlow Recovery Script"
echo "========================="
echo ""

# Get the backup branch or last known good commit
BACKUP_COMMIT=$(git log --oneline backup-working -1 2>/dev/null | cut -d' ' -f1)
MAIN_COMMIT=$(git log --oneline main -1 | cut -d' ' -f1)

echo "Main branch: $MAIN_COMMIT"
echo "Backup branch: $BACKUP_COMMIT"
echo ""

read -p "Restore from backup-working branch? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Restoring from backup-working..."
    git checkout backup-working -- .
    git checkout backup-working -- src/
    echo "Files restored. Run 'npm run build' to verify."
else
    echo "Aborted. Your files are unchanged."
fi
