param(
  [Parameter(Mandatory = $true)][string]$ProjectDir,
  [string]$UserImagePath = "",
  [string]$DisplayName = "",
  [string]$Role = ""
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$projectPath = (Resolve-Path $ProjectDir).Path
$assetsDir = Join-Path $projectPath "assets"
$notesPath = Join-Path $projectPath "delivery-notes.md"
$manifestPath = Join-Path $assetsDir "media-manifest.json"

if (!(Test-Path $assetsDir)) {
  New-Item -ItemType Directory -Path $assetsDir | Out-Null
}

function Resolve-InputImage {
  param([string]$ProvidedPath, [string]$SearchDir)

  if (-not [string]::IsNullOrWhiteSpace($ProvidedPath)) {
    $candidate = if ([System.IO.Path]::IsPathRooted($ProvidedPath)) {
      $ProvidedPath
    } else {
      Join-Path $projectPath $ProvidedPath
    }
    if (Test-Path $candidate) {
      return (Resolve-Path $candidate).Path
    }
    throw "User image file not found: $ProvidedPath"
  }

  $detected = Get-ChildItem -Path $SearchDir -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -match '^\.(jpg|jpeg|png|webp)$' -and $_.BaseName -notin @('hero','favicon','og-image') } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if ($detected) { return $detected.FullName }
  return ""
}

function New-Canvas {
  param([int]$Width,[int]$Height)
  $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  return @($bmp, $gfx)
}

function Save-Jpeg {
  param([System.Drawing.Bitmap]$Bitmap, [string]$Path, [int]$Quality = 90)
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
  $Bitmap.Save($Path, $encoder, $encParams)
}

function Draw-CoverImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Image]$Image,
    [int]$TargetX,
    [int]$TargetY,
    [int]$TargetWidth,
    [int]$TargetHeight
  )

  $srcRatio = $Image.Width / [double]$Image.Height
  $dstRatio = $TargetWidth / [double]$TargetHeight

  if ($srcRatio -gt $dstRatio) {
    $srcHeight = $Image.Height
    $srcWidth = [int]([math]::Round($srcHeight * $dstRatio))
    $srcX = [int]([math]::Round(($Image.Width - $srcWidth) / 2.0))
    $srcY = 0
  } else {
    $srcWidth = $Image.Width
    $srcHeight = [int]([math]::Round($srcWidth / $dstRatio))
    $srcX = 0
    $srcY = [int]([math]::Round(($Image.Height - $srcHeight) / 2.0))
  }

  $destRect = New-Object System.Drawing.Rectangle($TargetX, $TargetY, $TargetWidth, $TargetHeight)
  $srcRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $srcWidth, $srcHeight)
  $Graphics.DrawImage($Image, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
}

$resolvedImage = Resolve-InputImage -ProvidedPath $UserImagePath -SearchDir $assetsDir
if ([string]::IsNullOrWhiteSpace($resolvedImage)) {
  $manifest = [ordered]@{
    mode = "no-image"
    sourceImage = ""
    heroImage = ""
    favicon = ""
    ogImage = ""
  } | ConvertTo-Json -Depth 4
  Set-Content -Path $manifestPath -Value $manifest -Encoding UTF8

  $note = @"
# Delivery Notes

- Media mode: no-image
- Reason: user image not provided or unreadable.
- Hero photo, favicon, and social share image were intentionally omitted.
"@
  Set-Content -Path $notesPath -Value $note -Encoding UTF8

  Write-Host "Media prep completed in no-image mode: $projectPath"
  exit 0
}

$srcExt = [System.IO.Path]::GetExtension($resolvedImage)
$originalOut = Join-Path $assetsDir ("user-original" + $srcExt)
Copy-Item -LiteralPath $resolvedImage -Destination $originalOut -Force

$heroOut = Join-Path $assetsDir "hero.jpg"
$faviconOut = Join-Path $assetsDir "favicon.png"
$ogOut = Join-Path $assetsDir "og-image.jpg"

$img = [System.Drawing.Image]::FromFile($originalOut)
try {
  # hero (1200x1200 cover)
  $heroPack = New-Canvas -Width 1200 -Height 1200
  $heroBmp = $heroPack[0]
  $heroGfx = $heroPack[1]
  try {
    Draw-CoverImage -Graphics $heroGfx -Image $img -TargetX 0 -TargetY 0 -TargetWidth 1200 -TargetHeight 1200
    Save-Jpeg -Bitmap $heroBmp -Path $heroOut -Quality 90
  } finally {
    $heroGfx.Dispose()
    $heroBmp.Dispose()
  }

  # favicon (512x512 png)
  $favPack = New-Canvas -Width 512 -Height 512
  $favBmp = $favPack[0]
  $favGfx = $favPack[1]
  try {
    Draw-CoverImage -Graphics $favGfx -Image $img -TargetX 0 -TargetY 0 -TargetWidth 512 -TargetHeight 512
    $favBmp.Save($faviconOut, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $favGfx.Dispose()
    $favBmp.Dispose()
  }

  # Branded OG card (1200x630)
  $ogPack = New-Canvas -Width 1200 -Height 630
  $ogBmp = $ogPack[0]
  $ogGfx = $ogPack[1]
  try {
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
      (New-Object System.Drawing.Rectangle(0,0,1200,630)),
      ([System.Drawing.Color]::FromArgb(255, 11, 28, 58)),
      ([System.Drawing.Color]::FromArgb(255, 29, 78, 216)),
      30.0
    )
    $ogGfx.FillRectangle($bgBrush, 0, 0, 1200, 630)
    $bgBrush.Dispose()

    Draw-CoverImage -Graphics $ogGfx -Image $img -TargetX 56 -TargetY 56 -TargetWidth 460 -TargetHeight 518

    $overlayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(95, 255, 255, 255))
    $ogGfx.FillRectangle($overlayBrush, 540, 56, 604, 518)
    $overlayBrush.Dispose()

    $name = if ([string]::IsNullOrWhiteSpace($DisplayName)) { "Professional Portfolio" } else { $DisplayName }
    $title = if ([string]::IsNullOrWhiteSpace($Role)) { "Portfolio Website" } else { $Role }

    $titleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 46, [System.Drawing.FontStyle]::Bold)
    $roleFont = New-Object System.Drawing.Font("Segoe UI", 26, [System.Drawing.FontStyle]::Regular)
    $brandFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)

    $darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 8, 17, 39))
    $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 37, 53, 89))

    $layoutTitle = New-Object System.Drawing.RectangleF(570, 120, 540, 220)
    $layoutRole = New-Object System.Drawing.RectangleF(570, 320, 540, 120)
    $layoutBrand = New-Object System.Drawing.RectangleF(570, 490, 540, 60)

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Near
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Near

    $ogGfx.DrawString($name, $titleFont, $darkBrush, $layoutTitle, $sf)
    $ogGfx.DrawString($title, $roleFont, $mutedBrush, $layoutRole, $sf)
    $ogGfx.DrawString("webportfolio", $brandFont, $mutedBrush, $layoutBrand, $sf)

    $sf.Dispose()
    $titleFont.Dispose()
    $roleFont.Dispose()
    $brandFont.Dispose()
    $darkBrush.Dispose()
    $mutedBrush.Dispose()

    Save-Jpeg -Bitmap $ogBmp -Path $ogOut -Quality 90
  } finally {
    $ogGfx.Dispose()
    $ogBmp.Dispose()
  }
} finally {
  $img.Dispose()
}

$manifest = [ordered]@{
  mode = "image"
  sourceImage = (Resolve-Path $originalOut).Path
  heroImage = (Resolve-Path $heroOut).Path
  favicon = (Resolve-Path $faviconOut).Path
  ogImage = (Resolve-Path $ogOut).Path
} | ConvertTo-Json -Depth 4
Set-Content -Path $manifestPath -Value $manifest -Encoding UTF8

$note = @"
# Delivery Notes

- Media mode: image
- Hero image: ./assets/hero.jpg
- Favicon: ./assets/favicon.png
- Social image: ./assets/og-image.jpg (1200x630 branded card)
"@
Set-Content -Path $notesPath -Value $note -Encoding UTF8

Write-Host "Media prep completed with image assets: $projectPath"
