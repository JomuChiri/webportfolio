param(
  [Parameter(Mandatory = $true)][string]$ProjectDir,
  [string]$IndexFile = "index.html"
)

$ErrorActionPreference = "Stop"

$projectPath = (Resolve-Path $ProjectDir).Path
$indexPath = Join-Path $projectPath $IndexFile
$manifestPath = Join-Path $projectPath "assets/media-manifest.json"

if (!(Test-Path $indexPath)) {
  throw "index.html not found: $indexPath"
}
if (!(Test-Path $manifestPath)) {
  throw "media-manifest.json not found: $manifestPath"
}

$html = Get-Content -Path $indexPath -Raw
$manifest = Get-Content -Path $manifestPath -Raw | ConvertFrom-Json

function Ensure-BaseHrefScript {
  param([string]$Html)

  if ($Html -match 'window\.location\.pathname') {
    return $Html
  }

  $script = @"
<script>
      (function () {
        const path = window.location.pathname;
        const last = path.split('/').pop() || '';
        const hasExtension = last.includes('.');
        if (!path.endsWith('/') && !hasExtension) {
          const base = document.createElement('base');
          base.href = path + '/';
          document.head.prepend(base);
        }
      })();
    </script>
"@

  return $Html -replace '<head>', "<head>`r`n$script"
}

function Remove-DuplicateBaseScripts {
  param([string]$Html)

  $matches = [regex]::Matches($Html, '<script>\s*\(function \(\) \{\s*const path = window\.location\.pathname;[\s\S]*?\}\)\(\);\s*</script>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if ($matches.Count -le 1) {
    return $Html
  }

  $out = $Html
  for ($idx = 1; $idx -lt $matches.Count; $idx++) {
    $m = $matches[$idx]
    $out = $out.Remove($m.Index, $m.Length)
  }
  return $out
}

function Normalize-CopyrightYear {
  param([string]$Html)

  $year = (Get-Date).Year
  return [regex]::Replace(
    $Html,
    '©\s*\d{4}',
    "© $year",
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )
}

function Upsert-MetaTag {
  param([string]$Html, [string]$AttributeName, [string]$AttributeValue, [string]$Content)

  $pattern = '<meta\s+[^>]*' + [regex]::Escape($AttributeName) + '="' + [regex]::Escape($AttributeValue) + '"[^>]*>'
  $tag = "<meta $AttributeName=`"$AttributeValue`" content=`"$Content`"/>"
  if ($Html -match $pattern) {
    return [regex]::Replace($Html, $pattern, $tag, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  }

  return $Html -replace "</head>", "  $tag`r`n</head>"
}

function Upsert-IconLink {
  param([string]$Html, [string]$Href)

  $iconTag = "<link rel=`"icon`" type=`"image/png`" href=`"$Href`"/>"
  $appleTag = "<link rel=`"apple-touch-icon`" href=`"$Href`"/>"
  $cleaned = [regex]::Replace($Html, '<link\s+[^>]*rel="icon"[^>]*>\s*', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $cleaned = [regex]::Replace($cleaned, '<link\s+[^>]*rel="apple-touch-icon"[^>]*>\s*', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  return $cleaned -replace "</head>", "  $iconTag`r`n  $appleTag`r`n</head>"
}

function Remove-ImageMeta {
  param([string]$Html)

  $patterns = @(
    '<meta\s+[^>]*property="og:image"[^>]*>\s*',
    '<meta\s+[^>]*property="og:image:width"[^>]*>\s*',
    '<meta\s+[^>]*property="og:image:height"[^>]*>\s*',
    '<meta\s+[^>]*name="twitter:image"[^>]*>\s*',
    '<meta\s+[^>]*name="twitter:card"[^>]*>\s*',
    '<link\s+[^>]*rel="icon"[^>]*>\s*',
    '<link\s+[^>]*rel="apple-touch-icon"[^>]*>\s*'
  )

  $out = $Html
  foreach ($p in $patterns) {
    $out = [regex]::Replace($out, $p, '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  }
  return $out
}

function Ensure-HeroImage {
  param([string]$Html, [string]$HeroSrc)

  if ($Html -match [regex]::Escape($HeroSrc)) {
    return $Html
  }

  $heroTag = '<img src="' + $HeroSrc + '" alt="Portfolio profile image" loading="eager" class="w-44 h-44 rounded-full object-cover shadow-lg border-4 border-white/60"/>'
  $insertMarkup = "`r`n<div class=`"max-w-7xl mx-auto px-8 pt-8`">$heroTag</div>"

  $heroSectionMatch = [regex]::Match($Html, '<section[^>]*id="hero"[^>]*>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if ($heroSectionMatch.Success) {
    $insertAt = $heroSectionMatch.Index + $heroSectionMatch.Length
    return $Html.Insert($insertAt, $insertMarkup)
  }

  return $Html
}

function Normalize-ProfileImages {
  param([string]$Html, [string]$HeroSrc)

  $out = $Html
  # Remove previously injected nav/header profile block from older runs.
  $out = [regex]::Replace(
    $out,
    '<div\s+class="max-w-7xl\s+mx-auto\s+px-8\s+pt-8">\s*<img\s+[^>]*src="assets/hero\.jpg"[^>]*>\s*</div>\s*',
    '',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  # Replace common external stock/AI portrait URLs with provided hero image.
  $out = [regex]::Replace(
    $out,
    '<img([^>]*?)\s+src="https?://[^"]*(googleusercontent|unsplash|pexels|pixabay|freepik|shutterstock)[^"]*"([^>]*)>',
    '<img$1 src="' + $HeroSrc + '"$3>',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  return $out
}

$titleMatch = [regex]::Match($html, '<title>(.*?)</title>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$pageTitle = if ($titleMatch.Success) { $titleMatch.Groups[1].Value.Trim() } else { "Professional Portfolio" }
$descMatch = [regex]::Match($html, '<meta\s+name="description"\s+content="(.*?)"\s*/?>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$pageDesc = if ($descMatch.Success) { $descMatch.Groups[1].Value.Trim() } else { "Professional portfolio website generated from verified profile information." }

if ($manifest.mode -eq "image") {
  $html = Normalize-CopyrightYear -Html $html
  $html = Remove-DuplicateBaseScripts -Html $html
  $html = Ensure-BaseHrefScript -Html $html
  $html = Normalize-ProfileImages -Html $html -HeroSrc "assets/hero.jpg"
  $html = Upsert-IconLink -Html $html -Href "assets/favicon.png"
  $html = Upsert-MetaTag -Html $html -AttributeName "property" -AttributeValue "og:type" -Content "website"
  $html = Upsert-MetaTag -Html $html -AttributeName "property" -AttributeValue "og:title" -Content $pageTitle
  $html = Upsert-MetaTag -Html $html -AttributeName "property" -AttributeValue "og:description" -Content $pageDesc
  $html = Upsert-MetaTag -Html $html -AttributeName "property" -AttributeValue "og:image" -Content "assets/og-image.jpg"
  $html = Upsert-MetaTag -Html $html -AttributeName "property" -AttributeValue "og:image:width" -Content "1200"
  $html = Upsert-MetaTag -Html $html -AttributeName "property" -AttributeValue "og:image:height" -Content "630"
  $html = Upsert-MetaTag -Html $html -AttributeName "name" -AttributeValue "twitter:card" -Content "summary_large_image"
  $html = Upsert-MetaTag -Html $html -AttributeName "name" -AttributeValue "twitter:image" -Content "assets/og-image.jpg"
  $html = Ensure-HeroImage -Html $html -HeroSrc "assets/hero.jpg"
} else {
  $html = Remove-ImageMeta -Html $html
}

Set-Content -Path $indexPath -Value $html -Encoding UTF8
Write-Host "Updated portfolio metadata and hero image policy: $indexPath"
