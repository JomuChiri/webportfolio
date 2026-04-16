param(
  [string]$RepoRoot = 'C:\Users\muchi\OneDrive\Documents\webportfolio\stitch-skills',
  [string]$CodexSkillsRoot = 'C:\Users\muchi\.codex\skills'
)

$ErrorActionPreference = 'Stop'
$skills = @('stitch-design','stitch-loop','enhance-prompt','design-md','react-components')

if (!(Test-Path $CodexSkillsRoot)) {
  New-Item -ItemType Directory -Path $CodexSkillsRoot -Force | Out-Null
}

foreach ($name in $skills) {
  $src = Join-Path $RepoRoot "skills\$name"
  $dst = Join-Path $CodexSkillsRoot $name

  if (!(Test-Path $src)) {
    Write-Warning "Missing source skill: $src"
    continue
  }

  if (Test-Path $dst) {
    Write-Host "EXISTS: $name"
    continue
  }

  New-Item -ItemType Junction -Path $dst -Target $src | Out-Null
  Write-Host "LINKED: $name"
}
