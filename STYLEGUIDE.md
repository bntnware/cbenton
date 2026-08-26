# STYLEGUIDE

Purpose: minimalist, chic, fast — a small, consistent set of tokens and rules for the site header and base styles.

## Palette
- Background: #ffffff
- Surface: #ffffff
- Text (primary): #0b0b0b
- Muted text: #616161
- Accent: #111111
- Border: #e9e9e9
- Focus ring: #1a73e8

## Typography
- Font stack: system UI (no webfont by default for speed)
- Base font-size: 16px
- Line-height: 1.5
- Scales: small 0.875rem, body 1rem, lead 1.125rem, h2 1.5rem, h1 2rem
- Readability: max-width 65ch for long content

## Spacing
- 8pt grid: 4, 8, 16, 24, 40, 64
- Gutter: 24px (16px on small screens)
- Header height: 64px

## Layout
- Container: centered fixed width (max-width: 1100px)
- Header: position: sticky; top: 0

## Accessibility
- Skip to content link included
- Mobile nav: aria-controls, aria-expanded, Escape closes
- Focus states visible and high-contrast
- Respect prefers-reduced-motion

## Performance
- Use system fonts or a single, well-cached webfont (font-display: swap)
- Use inline SVG logo or an optimized small image
- Keep JS tiny and non-blocking (defer)

## Files added
- index.html — adds header markup and minimal page
- styles.css — tokens and header/nav styles
- nav.js — small accessible mobile toggle
- STYLEGUIDE.md — this guide

Notes
- To publish on GitHub Pages: merge this branch into the default branch and enable Pages in repository settings (choose branch/root or /docs).