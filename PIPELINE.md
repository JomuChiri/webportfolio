# Portfolio Pipeline (CV/LinkedIn + User Image)

## Purpose
Build one client portfolio per folder using the mandatory flow:
1. copywriter package
2. Stitch generation
3. metadata/media enforcement
4. QA
5. git publish

## Required Inputs per Client
- Full name
- Professional role/title
- CV file and/or LinkedIn URL
- Optional profile image (if missing, no-image mode is used)

## Folder Structure
`<slug>/`
- `copy/website-copy.md`
- `copy/seo-pack.md`
- `copy/design-direction.md`
- `assets/` (generated media)
- `index.html`
- `stitch-prompt.txt`
- `delivery-notes.md`

## Commands
### 1) Run complete pipeline (recommended)
```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-portfolio-pipeline.ps1 `
  -ProjectSlug "john-doe" `
  -DisplayName "John Doe" `
  -Role "Product Designer" `
  -LinkedInUrl "https://www.linkedin.com/in/john-doe" `
  -CvPath "C:\path\JohnDoeCV.pdf" `
  -UserImagePath "C:\path\john-doe.jpg"
```

### 2) Run media prep only
```powershell
powershell -ExecutionPolicy Bypass -File scripts/prepare-portfolio-media.ps1 -ProjectDir "john-doe" -UserImagePath "C:\path\john-doe.jpg" -DisplayName "John Doe" -Role "Product Designer"
```

### 3) Build Stitch prompt only
```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-stitch-prompt.ps1 -ProjectDir "john-doe" -UserImagePath "assets\\user-original.jpg"
```

### 4) Inject metadata/hero policy only
```powershell
powershell -ExecutionPolicy Bypass -File scripts/inject-portfolio-metadata.ps1 -ProjectDir "john-doe"
```

### 5) Run QA only
```powershell
powershell -ExecutionPolicy Bypass -File scripts/qa-portfolio.ps1 -ProjectDir "john-doe" -RequireStitchEnv
```

## Image Mode Rules
When an image is available, pipeline generates:
- `assets/hero.jpg`
- `assets/favicon.png`
- `assets/og-image.jpg` (1200x630 branded card)
- `assets/media-manifest.json`

And enforces:
- hero image usage
- favicon link
- OG/Twitter metadata (`og:image`, `twitter:image`, etc.)

## No-Image Mode Rules
If image is missing/unreadable:
- pipeline continues
- hero/favicons/social image tags are omitted
- `delivery-notes.md` records no-image mode

## Hard Stops
- Missing copy package files
- Stitch failures
- Missing `index.html`
- GitHub remote not configured when publish is enabled
