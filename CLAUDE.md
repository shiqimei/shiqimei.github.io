# Project Memory

## Overview

Static blog site for Shiqi Mei hosted at https://shiqimei.github.io

## Structure

```
./
├── index.html           # Homepage with timeline
├── css/style.css        # Shared styles (B&W theme)
├── js/search.js         # Command palette search
├── posts/*.html         # Blog posts
└── .claude/skills/      # Claude Code skills
```

## Conventions

### Theme
- Sharp black & white, high contrast
- Monospace fonts (SF Mono, JetBrains Mono)
- No rounded corners, no emojis

### Paths
- Use relative paths only (no absolute paths like `/Users/...`)
- CSS: `css/style.css` from root, `../css/style.css` from posts

### Date Format
- `Mon D, YYYY` (e.g., "Jan 3, 2026")

### Post Slugs
- Lowercase, hyphenated: `macos-square-corners.html`

### Git Workflow
- Commit and push after changes
- Concise commit messages

## Adding Posts

1. Create `posts/<slug>.html` using template in `.claude/skills/blog-creator/assets/`
2. Add timeline entry to `index.html` (newest first)
3. Commit and push

## Skills

- `blog-creator` - Create new blog posts

## Key Files

| File | Purpose |
|------|---------|
| `css/style.css` | All styles, edit here for theme changes |
| `js/search.js` | Search functionality (⌘K) |
| `index.html` | Homepage, timeline entries go here |
