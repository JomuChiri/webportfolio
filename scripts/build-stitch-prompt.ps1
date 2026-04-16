param(
  [Parameter(Mandatory = $true)][string]$ProjectDir,
  [string]$OutFile = "stitch-prompt.txt",
  [string]$UserImagePath = ""
)

$ErrorActionPreference = "Stop"

$projectPath = Resolve-Path $ProjectDir
$copyDir = Join-Path $projectPath "copy"

$websiteCopy = Join-Path $copyDir "website-copy.md"
$seoPack = Join-Path $copyDir "seo-pack.md"
$designDirection = Join-Path $copyDir "design-direction.md"

foreach ($f in @($websiteCopy, $seoPack, $designDirection)) {
  if (!(Test-Path $f)) {
    throw "Required copy package file missing: $f"
  }
}

$websiteCopyText = Get-Content $websiteCopy -Raw
$seoPackText = Get-Content $seoPack -Raw
$designDirectionText = Get-Content $designDirection -Raw

$projectName = Split-Path $projectPath -Leaf
$outPath = Join-Path $projectPath $OutFile
$assetsDir = Join-Path $projectPath "assets"

function Resolve-UserImage {
  param(
    [string]$ProvidedPath,
    [string]$SearchDir
  )

  if (-not [string]::IsNullOrWhiteSpace($ProvidedPath)) {
    $candidate = if ([System.IO.Path]::IsPathRooted($ProvidedPath)) {
      $ProvidedPath
    } else {
      Join-Path $projectPath $ProvidedPath
    }
    if (Test-Path $candidate) {
      return (Resolve-Path $candidate).Path
    }
    throw "Provided user image path was not found: $ProvidedPath"
  }

  if (Test-Path $SearchDir) {
    $detected = Get-ChildItem -Path $SearchDir -File |
      Where-Object { $_.Extension -match '^\.(jpg|jpeg|png|webp)$' } |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1
    if ($detected) {
      return $detected.FullName
    }
  }

  return ""
}

$resolvedUserImage = Resolve-UserImage -ProvidedPath $UserImagePath -SearchDir $assetsDir
$hasUserImage = -not [string]::IsNullOrWhiteSpace($resolvedUserImage)
$mediaInstruction = ""
if ($hasUserImage) {
  $mediaInstruction = @"
- A user profile image is available at: $resolvedUserImage
- Use this user image in the hero section (real image, not placeholder).
- Use the user image as browser icon source by linking favicon to ./assets/favicon.png.
- Set Open Graph/Twitter preview image to ./assets/og-image.jpg.
- Include these social tags in <head>: og:type, og:title, og:description, og:image, og:image:width=1200, og:image:height=630, twitter:card=summary_large_image, twitter:image.
"@
} else {
  $mediaInstruction = @"
- User image is not available. Enable no-image mode:
  - Do not render broken/empty image containers in hero.
  - Omit favicon and og/twitter image tags if image assets are missing.
  - Keep page visually balanced without profile photo.
"@
}

$prompt = @"
Design and generate a complete multi-section personal portfolio website for $projectName using the EXACT content package below.

Hard requirements:
- Use the actual provided copy. Do not use placeholder text.
- Do not invent facts, credentials, dates, metrics, IDs, or company claims not present in the copy package.
- Preserve factual values exactly where specified (for example certification IDs, percentages, and timelines).
- Return a complete, valid HTML document (<!doctype html> ... </html>) for web deployment.
- Do not return markdown, prose explanations, or copy-package text dumps as final output.
- Generate semantic, accessible HTML with clear heading hierarchy and keyboard-friendly navigation.
- Include a homepage at index.html and ensure all internal navigation links resolve correctly.
- Keep copy faithful to source text while improving layout, readability, and visual hierarchy.
- Apply metadata and information architecture intent from the SEO pack.
- Apply visual language, palette, typography mood, and component guidance from design direction.
- Social/Media requirements:
$mediaInstruction

Output intent:
- Professional, modern, engineering-leadership portfolio style.
- Designed for desktop-first responsiveness, with solid mobile behavior.

=== COPY PACKAGE: website-copy.md ===
$websiteCopyText

=== COPY PACKAGE: seo-pack.md ===
$seoPackText

=== COPY PACKAGE: design-direction.md ===
$designDirectionText
"@

Set-Content -Path $outPath -Value $prompt -Encoding UTF8
Write-Host "Wrote Stitch prompt: $outPath"
