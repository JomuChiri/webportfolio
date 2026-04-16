# Agent System For Web Portfolio

This folder (`C:\Users\muchi\OneDrive\Documents\webportfolio`) is the parent workspace for all mini websites.

## Default Workflow
1. Run `copywriter-agent` first.
2. Pass its copy package + design direction to `designer-coder-agent`.
3. `designer-coder-agent` must use Google Stitch for design generation and updates.
4. If Google Stitch fails, stop immediately and report failure (no manual design fallback).
5. Ensure every mini-project folder has an `index.html` homepage file.
6. After any changes, commit and push to the linked GitHub repository.

## Mandatory Copy-to-Stitch Rule
- `designer-coder-agent` must inject the full copy package into the Stitch prompt every run:
  - `copy/website-copy.md`
  - `copy/seo-pack.md`
  - `copy/design-direction.md`
- Generated pages must use actual copywriter content, not placeholders.
- If the copy package is missing or unreadable, stop and report failure.

## Active Agents
- `.agents/copywriter-agent.md`
- `.agents/designer-coder-agent.md`

## GitHub Publish Rule (Permanent)
After any change in this workspace:

```powershell
git add -A
git commit -m "your concise change summary"
git push origin main
```

## GitHub Safety Constraint (Permanent)
- This workspace must publish changes only through the linked GitHub repository remote.
- Push only to the intended project repository for this folder.
- Do not publish this workspace into unrelated repositories.
- If the folder has no GitHub remote configured, stop and report failure.

## Vercel Constraint
- Do not run direct Vercel deploy commands from this workspace as the default publish path.
- Vercel may be used only if explicitly requested by the user in that specific task.

## Stitch Rule
Set Stitch key in env before design runs:

```powershell
$env:STITCH_API_KEY='YOUR_STITCH_KEY'
$env:STITCH_HOST='https://stitch.googleapis.com/mcp'
```

`designer-coder-agent` must only generate UI through Google Stitch and then save outputs into the target project folder.

Use the official SDK installed in this workspace:

```powershell
npm install @google/stitch-sdk
```

## Stitch Skill Symlinks (Installed)
The following skills are linked from `stitch-skills` into `C:\Users\muchi\.codex\skills`:
- `stitch-design`
- `stitch-loop`
- `enhance-prompt`
- `design-md`
- `react-components`

Use these linked skills for Stitch + copy-package (CP) handoff execution.

