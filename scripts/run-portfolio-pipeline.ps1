param(
  [Parameter(Mandatory = $true)][string]$ProjectSlug,
  [Parameter(Mandatory = $true)][string]$DisplayName,
  [string]$Role = "",
  [string]$LinkedInUrl = "",
  [string]$CvPath = "",
  [string]$UserImagePath = "",
  [string]$ProjectRoot = ".",
  [switch]$SkipStitch,
  [switch]$SkipPublish
)

$ErrorActionPreference = "Stop"

$rootPath = (Resolve-Path $ProjectRoot).Path
$projectPath = Join-Path $rootPath $ProjectSlug
$copyDir = Join-Path $projectPath "copy"
$assetsDir = Join-Path $projectPath "assets"
$inputDir = Join-Path $projectPath "input"
$intakePath = Join-Path $projectPath "intake.md"

if (!(Test-Path $projectPath)) { New-Item -ItemType Directory -Path $projectPath | Out-Null }
foreach ($d in @($copyDir, $assetsDir, $inputDir)) {
  if (!(Test-Path $d)) { New-Item -ItemType Directory -Path $d | Out-Null }
}

function Copy-OptionalFile {
  param([string]$SourcePath, [string]$DestinationDir)

  if ([string]::IsNullOrWhiteSpace($SourcePath)) { return "" }

  $resolved = if ([System.IO.Path]::IsPathRooted($SourcePath)) {
    $SourcePath
  } else {
    Join-Path $rootPath $SourcePath
  }

  if (!(Test-Path $resolved)) {
    throw "Referenced file not found: $SourcePath"
  }

  $name = Split-Path $resolved -Leaf
  $dest = Join-Path $DestinationDir $name
  Copy-Item -LiteralPath $resolved -Destination $dest -Force
  return $dest
}

$copiedCv = Copy-OptionalFile -SourcePath $CvPath -DestinationDir $inputDir
$copiedImage = Copy-OptionalFile -SourcePath $UserImagePath -DestinationDir $assetsDir

$intake = @"
# Portfolio Intake

- Slug: $ProjectSlug
- Name: $DisplayName
- Role: $Role
- LinkedIn: $LinkedInUrl
- CV File: $(if ([string]::IsNullOrWhiteSpace($copiedCv)) { "Not provided" } else { $copiedCv })
- User Image: $(if ([string]::IsNullOrWhiteSpace($copiedImage)) { "Not provided" } else { $copiedImage })
- Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@
Set-Content -Path $intakePath -Value $intake -Encoding UTF8

foreach ($required in @("website-copy.md", "seo-pack.md", "design-direction.md")) {
  $path = Join-Path $copyDir $required
  if (!(Test-Path $path)) {
    throw "Missing copy package file $path. Run copywriter-agent first and retry."
  }
}

& powershell -ExecutionPolicy Bypass -File (Join-Path $rootPath "scripts/prepare-portfolio-media.ps1") -ProjectDir $projectPath -UserImagePath $copiedImage -DisplayName $DisplayName -Role $Role
if ($LASTEXITCODE -ne 0) { throw "Media preparation failed." }

& powershell -ExecutionPolicy Bypass -File (Join-Path $rootPath "scripts/build-stitch-prompt.ps1") -ProjectDir $projectPath -UserImagePath $copiedImage
if ($LASTEXITCODE -ne 0) { throw "Stitch prompt build failed." }

if (-not $SkipStitch) {
  & powershell -ExecutionPolicy Bypass -File (Join-Path $rootPath "scripts/stitch-design.ps1") -PromptFile (Join-Path $projectPath "stitch-prompt.txt") -OutputDir $projectPath
  if ($LASTEXITCODE -ne 0) { throw "Stitch generation failed." }
}

& powershell -ExecutionPolicy Bypass -File (Join-Path $rootPath "scripts/inject-portfolio-metadata.ps1") -ProjectDir $projectPath
if ($LASTEXITCODE -ne 0) { throw "Metadata injection failed." }

if ($SkipStitch) {
  & powershell -ExecutionPolicy Bypass -File (Join-Path $rootPath "scripts/qa-portfolio.ps1") -ProjectDir $projectPath
} else {
  & powershell -ExecutionPolicy Bypass -File (Join-Path $rootPath "scripts/qa-portfolio.ps1") -ProjectDir $projectPath -RequireStitchEnv
}
if ($LASTEXITCODE -ne 0) { throw "Portfolio QA failed." }

if (-not $SkipPublish) {
  $remote = git -C $rootPath remote get-url origin 2>$null
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remote)) {
    throw "GitHub remote origin is not configured. Stop immediately."
  }

  git -C $rootPath add -A
  $commitMsg = "Add portfolio build for $DisplayName from CV/LinkedIn"
  git -C $rootPath commit -m $commitMsg
  if ($LASTEXITCODE -ne 0) {
    Write-Host "No commit created (possibly no staged changes)."
  } else {
    git -C $rootPath push origin main
    if ($LASTEXITCODE -ne 0) { throw "git push origin main failed." }
  }
}

Write-Host "Portfolio pipeline completed for: $ProjectSlug"
