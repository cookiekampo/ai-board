[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Destination,

    [switch]$IncludeOutput,
    [switch]$IncludeTopic,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Add-TrailingSlash {
    param([string]$Path)
    return $Path.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
}

$Source = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$DestinationFull = [System.IO.Path]::GetFullPath($Destination)

$SourceWithSlash = Add-TrailingSlash $Source
$DestinationWithSlash = Add-TrailingSlash $DestinationFull

if ($DestinationWithSlash.StartsWith($SourceWithSlash, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Destination must be outside the ai-board project folder."
}

$LogDir = Join-Path $Source "backup-logs"
if (-not (Test-Path -LiteralPath $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogPath = Join-Path $LogDir "backup_$Timestamp.log"

$ExcludeDirs = @(
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    "tmp",
    "backup-logs"
)

if (-not $IncludeOutput) {
    $ExcludeDirs += "output"
}

$ExcludeFiles = @(
    ".env",
    "*.pyc",
    "*.pyo",
    "*.tmp",
    "*.log"
)

if (-not $IncludeTopic) {
    $ExcludeFiles += "topic.txt"
}

$RoboArgs = @(
    $Source,
    $DestinationFull,
    "/E",
    "/Z",
    "/R:2",
    "/W:5",
    "/COPY:DAT",
    "/DCOPY:DAT",
    "/FFT",
    "/NP",
    "/TEE",
    "/LOG:$LogPath"
)

if ($DryRun) {
    $RoboArgs += "/L"
}

$RoboArgs += "/XD"
$RoboArgs += $ExcludeDirs
$RoboArgs += "/XF"
$RoboArgs += $ExcludeFiles

Write-Host "Source:      $Source"
Write-Host "Destination: $DestinationFull"
Write-Host "Dry run:     $DryRun"
Write-Host "Output:      $(if ($IncludeOutput) { 'included' } else { 'excluded' })"
Write-Host "topic.txt:   $(if ($IncludeTopic) { 'included' } else { 'excluded' })"
Write-Host "Log:         $LogPath"
Write-Host ""

& robocopy @RoboArgs
$ExitCode = $LASTEXITCODE

if ($ExitCode -ge 8) {
    Write-Error "robocopy failed with exit code $ExitCode. See log: $LogPath"
    exit $ExitCode
}

Write-Host ""
if ($DryRun) {
    Write-Host "Dry run complete. No files were copied."
} else {
    Write-Host "Backup complete."
}

exit 0
