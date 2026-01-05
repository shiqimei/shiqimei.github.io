# Project Memory

## Overview

Static blog site for Shiqi Mei hosted at https://shiqimei.github.io

## Structure

```
./
├── src/
│   ├── posts/*.md       # Markdown source files for posts
│   └── gists/*.md       # Markdown source files for gists
├── templates/           # HTML templates
│   ├── post.html        # Single post template
│   ├── index.html       # Homepage template
│   └── gists.html       # Gists page template
├── scripts/
│   └── build.js         # Build script
├── package.json         # Dependencies
├── posts/               # Generated HTML posts
├── index.html           # Generated homepage
├── gists.html           # Generated gists page
├── search-index.json    # Generated search index
├── sitemap.xml          # Generated sitemap
├── robots.txt           # Generated robots file
├── llms.txt             # Generated AI-friendly description
├── css/style.css        # Shared styles (B&W theme)
├── js/search.js         # Command palette search
└── about.html           # Static page (not generated)
```

## Build System

### Adding Content

1. Create markdown file in `src/posts/` or `src/gists/`
2. Run `npm run build`
3. Commit and push

### Markdown Frontmatter

Posts (`src/posts/*.md`):
```yaml
---
title: Post Title Here
date: 2026-01-05
excerpt: Short description for search and timeline.
---

Markdown content...
```

Gists (`src/gists/*.md`):
```yaml
---
title: Gist Title
date: 2026-01-05
excerpt: Short description
---

Brief content...
```

### Build Command

```bash
npm run build
```

This generates:
- `posts/*.html` from `src/posts/*.md`
- `index.html` with timeline entries
- `gists.html` with all gists
- `search-index.json` from all content
- `sitemap.xml` with all URLs
- `robots.txt` and `llms.txt`

## Conventions

### Theme
- Sharp black & white, high contrast
- Monospace fonts (SF Mono, JetBrains Mono)
- No rounded corners, no emojis

### Date Format
- Frontmatter: `YYYY-MM-DD` (e.g., `2026-01-05`)
- Display: `Mon D, YYYY` (e.g., "Jan 5, 2026")

### Slug Conventions
- Lowercase, hyphenated: `macos-square-corners.md`
- Becomes: `posts/macos-square-corners.html`

### Git Workflow
- Always run `npm run build` before committing
- Commit and push immediately after changes
- After pushing, check: https://github.com/shiqimei/shiqimei.github.io/actions

## Key Files

| File | Purpose |
|------|---------|
| `scripts/build.js` | Main build script |
| `templates/*.html` | HTML templates |
| `src/posts/*.md` | Post source files |
| `src/gists/*.md` | Gist source files |
| `css/style.css` | All styles |
| `js/search.js` | Search functionality (⌘K) |

## Skills

- `blog-creator` - Create new blog posts (writes markdown, runs build)
- `gist-creator` - Create new gists (writes markdown, runs build)
