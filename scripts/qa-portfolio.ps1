param(
  [Parameter(Mandatory = $true)][string]$ProjectDir,
  [switch]$RequireStitchEnv
)

$ErrorActionPreference = "Stop"

$projectPath = (Resolve-Path $ProjectDir).Path
$copyDir = Join-Path $projectPath "copy"
$indexPath = Join-Path $projectPath "index.html"
$assetsDir = Join-Path $projectPath "assets"
$manifestPath = Join-Path $assetsDir "media-manifest.json"

$requiredCopy = @(
  (Join-Path $copyDir "website-copy.md"),
  (Join-Path $copyDir "seo-pack.md"),
  (Join-Path $copyDir "design-direction.md")
)

$errors = New-Object System.Collections.Generic.List[string]

foreach ($f in $requiredCopy) {
  if (!(Test-Path $f)) {
    $errors.Add("Missing required copy package file: $f")
  }
}

if ($RequireStitchEnv) {
  if ([string]::IsNullOrWhiteSpace($env:STITCH_API_KEY)) {
    $errors.Add("STITCH_API_KEY is not set.")
  }
  if ([string]::IsNullOrWhiteSpace($env:STITCH_HOST)) {
    Write-Host "STITCH_HOST not set; Stitch runner will use default host."
  }
}

if (!(Test-Path $indexPath)) {
  $errors.Add("Missing index.html: $indexPath")
} else {
  $html = Get-Content -Path $indexPath -Raw

  if ($html -notmatch '<meta\s+[^>]*name="viewport"') {
    $errors.Add("index.html missing viewport meta tag.")
  }

  $h1Matches = [regex]::Matches($html, '<h1\b', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if ($h1Matches.Count -lt 1) {
    $errors.Add("index.html missing H1 heading.")
  }

  if (Test-Path $manifestPath) {
    $manifest = Get-Content -Path $manifestPath -Raw | ConvertFrom-Json
    if ($manifest.mode -eq "image") {
      foreach ($asset in @("hero.jpg", "favicon.png", "og-image.jpg")) {
        if (!(Test-Path (Join-Path $assetsDir $asset))) {
          $errors.Add("Image mode requires asset missing: assets/$asset")
        }
      }

      if ($html -notmatch 'assets/hero\.jpg') { $errors.Add("Image mode requires hero image reference to assets/hero.jpg") }
      if ($html -notmatch 'assets/favicon\.png') { $errors.Add("Image mode requires favicon link to assets/favicon.png") }
      if ($html -notmatch 'property="og:image"\s+content="assets/og-image\.jpg"') { $errors.Add("Image mode requires og:image meta tag.") }
      if ($html -notmatch 'name="twitter:card"\s+content="summary_large_image"') { $errors.Add("Image mode requires twitter:card summary_large_image meta tag.") }
      if ($html -notmatch 'name="twitter:image"\s+content="assets/og-image\.jpg"') { $errors.Add("Image mode requires twitter:image meta tag.") }
    }

    if ($manifest.mode -eq "no-image") {
      if ($html -match 'assets/hero\.jpg') { $errors.Add("No-image mode should not reference assets/hero.jpg") }
      if ($html -match 'assets/favicon\.png') { $errors.Add("No-image mode should not reference assets/favicon.png") }
      if ($html -match 'assets/og-image\.jpg') { $errors.Add("No-image mode should not reference assets/og-image.jpg") }
    }
  } else {
    Write-Host "Warning: media-manifest.json not found; skipping media mode checks."
  }
}

if ($errors.Count -gt 0) {
  $errors | ForEach-Object { Write-Host "ERROR: $_" }
  throw "Portfolio QA failed with $($errors.Count) issue(s)."
}

Write-Host "Portfolio QA passed: $projectPath"
