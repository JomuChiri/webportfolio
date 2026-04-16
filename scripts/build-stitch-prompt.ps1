param(
  [Parameter(Mandatory = $true)][string]$ProjectDir,
  [string]$OutFile = "stitch-prompt.txt"
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

$prompt = @"
Design and generate a complete multi-section personal portfolio website for $projectName using the EXACT content package below.

Hard requirements:
- Use the actual provided copy. Do not use placeholder text.
- Do not invent facts, credentials, dates, metrics, IDs, or company claims not present in the copy package.
- Preserve factual values exactly where specified (for example certification IDs, percentages, and timelines).
- Generate semantic, accessible HTML with clear heading hierarchy and keyboard-friendly navigation.
- Include a homepage at index.html and ensure all internal navigation links resolve correctly.
- Keep copy faithful to source text while improving layout, readability, and visual hierarchy.
- Apply metadata and information architecture intent from the SEO pack.
- Apply visual language, palette, typography mood, and component guidance from design direction.

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
