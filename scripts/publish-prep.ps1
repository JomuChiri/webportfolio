param(
  [string]$OutputDir = ".vercel-publish"
)

$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
$publish = Join-Path $root $OutputDir

if (Test-Path $publish) {
  Remove-Item -Recurse -Force $publish
}
New-Item -ItemType Directory -Path $publish | Out-Null

# Copy root homepage
Copy-Item -LiteralPath (Join-Path $root 'index.html') -Destination (Join-Path $publish 'index.html') -Force

# Copy full top-level project folders that contain an index.html
Get-ChildItem -Directory | ForEach-Object {
  $srcIndex = Join-Path $_.FullName 'index.html'
  if (Test-Path $srcIndex) {
    $dstDir = Join-Path $publish $_.Name
    if (Test-Path $dstDir) {
      Remove-Item -Recurse -Force $dstDir
    }
    Copy-Item -LiteralPath $_.FullName -Destination $dstDir -Recurse -Force
  }
}

Write-Host "Prepared publish directory: $publish"

