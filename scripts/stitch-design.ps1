param(
  [Parameter(Mandatory=$true)][string]$PromptFile,
  [Parameter(Mandatory=$true)][string]$OutputDir,
  [string]$ProjectId = "",
  [string]$DeviceType = "DESKTOP"
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($env:STITCH_API_KEY)) {
  throw 'STITCH_API_KEY missing. Stop immediately (no non-Stitch fallback allowed).'
}

if ([string]::IsNullOrWhiteSpace($env:STITCH_HOST)) {
  $env:STITCH_HOST = 'https://stitch.googleapis.com/mcp'
}

if (!(Test-Path $PromptFile)) {
  throw "Prompt file not found: $PromptFile"
}

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
  $nodePath = 'C:\Program Files\nodejs\node.exe'
  if (Test-Path $nodePath) {
    $nodeCmd = $nodePath
  } else {
    throw 'Node.js is required for @google/stitch-sdk and was not found.'
  }
}

$args = @(
  'scripts/stitch-generate.mjs',
  '--prompt-file', $PromptFile,
  '--output-dir', $OutputDir,
  '--device-type', $DeviceType
)
if (-not [string]::IsNullOrWhiteSpace($ProjectId)) {
  $args += @('--project-id', $ProjectId)
}

$output = & $nodeCmd $args 2>&1
if ($LASTEXITCODE -ne 0) {
  throw "Google Stitch SDK run failed. Stop immediately. $output"
}

$indexPath = Join-Path $OutputDir 'index.html'
if (!(Test-Path $indexPath)) {
  throw 'Google Stitch output missing index.html. Stop immediately.'
}

Write-Host $output
Write-Host "Stitch SDK output saved in: $OutputDir"
