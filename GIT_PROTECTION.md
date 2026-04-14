# StarkFlow Git Protection Strategy

## How We Got Here
During development, multiple `git reset` commands during deployment troubleshooting caused some features to be lost. The git reflog showed we reset to different commits, and when files were restored, they were incomplete versions.

## Protection Measures

### 1. Backup Branch
- Branch `backup-working` always mirrors the last known good state
- **Before any major changes:** Update the backup branch first
  ```bash
  git checkout backup-working
  git merge main  # or cherry-pick specific commits
  git push origin backup-working
  ```

### 2. Branch Protection (GitHub)
Settings → Branches → Add rule for `main`:
- ✅ Require pull requests before merging
- ✅ Require status checks to pass
- ✅ Do not allow bypassing

### 3. Safe Git Practices
- **NEVER** use `git reset --hard` unless absolutely necessary
- Prefer `git reset --soft` to review changes before committing
- Always `git status` and `git diff` before resetting
- Use `git stash` instead of resetting when testing

### 4. Recovery Script
Run `bash scripts/recover.sh` to restore from backup branch.

### 5. Before Any Risky Operations
```bash
# Always do this before potentially destructive git operations:
git branch backup-temp  # Create temporary backup
git log --oneline -5    # Review recent commits
```

## Quick Recovery Commands

### Restore specific files from backup branch:
```bash
git checkout backup-working -- src/app/portfolio/page.tsx
```

### Restore entire src from backup:
```bash
git checkout backup-working -- src/
```

### View differences between main and backup:
```bash
git diff main..backup-working --stat
```

## If Something Goes Wrong
1. Run `git reflog` to see all recent operations
2. Find the last good commit: `git log --oneline -20`
3. Restore specific files: `git show <good-commit>:<file> > <file>`
4. Or reset soft: `git reset --soft <good-commit>`
