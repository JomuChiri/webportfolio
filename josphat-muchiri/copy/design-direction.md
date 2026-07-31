# Design Direction - Josphat Muchiri

## Visual Position

Build a premium cybersecurity knowledge platform, not a generic portfolio. The interface should feel like a hybrid of GitHub Docs, Microsoft Learn, Splunk documentation, Vercel, Stripe, and Apple product pages.

## Design Goals

- Professional
- Fast
- Minimal
- Documentation-focused
- Responsive
- Modern
- No hacker cliches
- No Matrix green

## Theme

- Background: dark charcoal `#111827`
- Surface: `#172033`
- Muted surface: `#1F2937`
- Typography: white and cool gray
- Accent: blue `#3B82F6`
- Success/info accents: restrained cyan and violet only as secondary highlights

## UI Language

- Glassmorphism cards with thin borders
- Large technical screenshots and documentation panels
- Mermaid architecture diagrams
- Syntax-highlighted command and code samples
- Badges for tools, stacks, tags, difficulty, and status
- Interactive tabs, filters, and content cards
- Dense but readable documentation pages
- Sticky navigation and strong mobile support

## Typography Mood

Use a modern sans-serif for interface text, clean documentation rhythm, compact metadata, and generous line-height for technical reading.

## Layout Notes

- First viewport should clearly show Josphat's name, role, portrait, and technical positioning.
- Navigation should include Home, Projects, Labs, Knowledge Base, Investigations, Timeline, Resume, and Contact.
- The homepage should surface content automatically from MDX metadata.
- Do not show raw Markdown. MDX is a content database; React components are the presentation layer.

