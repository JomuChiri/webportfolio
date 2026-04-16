param(
  [string]$Token = $env:VERCEL_TOKEN
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($Token)) {
  throw 'VERCEL_TOKEN is required. Set env var or pass -Token.'
}

$root = (Get-Location).Path
$vercelLink = Join-Path $root '.vercel\project.json'
if (!(Test-Path $vercelLink)) {
  throw "Missing Vercel project link: $vercelLink. Run 'npx vercel link' for the intended project, then retry."
}

Write-Host 'Deploying linked Vercel project in production mode...'
npx.cmd --yes vercel deploy --prod --yes --token $Token

