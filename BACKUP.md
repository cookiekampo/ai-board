# NAS Backup

This repository can be backed up to a NAS or another external folder with
`backup.ps1`.

## Policy

- Git remains the source of truth for code history and normal recovery.
- NAS backup is for local machine loss, accidental local deletion, or quick
  archival snapshots.
- Sensitive and generated files are excluded by default.
- `.env` is always excluded.
- `topic.txt` and `output/` are excluded by default because they may contain
  prompts, meeting logs, or private notes. Include them only when needed.

## Usage

Always start with a dry run:

```powershell
.\backup.ps1 -Destination "\\NAS-NAME\Backups\ai-board" -DryRun
```

Run the backup:

```powershell
.\backup.ps1 -Destination "\\NAS-NAME\Backups\ai-board"
```

Include AI meeting output logs:

```powershell
.\backup.ps1 -Destination "\\NAS-NAME\Backups\ai-board" -IncludeOutput
```

Include `topic.txt`:

```powershell
.\backup.ps1 -Destination "\\NAS-NAME\Backups\ai-board" -IncludeTopic
```

Include both:

```powershell
.\backup.ps1 -Destination "\\NAS-NAME\Backups\ai-board" -IncludeOutput -IncludeTopic
```

## Always Excluded

- `.env`
- `.git/`
- `.venv/`
- `venv/`
- `node_modules/`
- `__pycache__/`
- `.pytest_cache/`
- `tmp/`
- `backup-logs/`
- `*.pyc`
- `*.pyo`
- `*.tmp`
- `*.log`

## Excluded By Default

- `topic.txt`
- `output/`

## Notes

The script uses `robocopy`, but it does not use `/MIR`. Files deleted locally
will not be automatically deleted from the backup destination.

For safety, run with `-DryRun` first and review the copied paths before running
the real backup.
