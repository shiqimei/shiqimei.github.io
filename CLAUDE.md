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

## Blog Post Workflow

For technical/survey blog posts, follow this workflow:

### 1. Research & Brainstorm
- Use `WebSearch` to gather current information on the topic
- Use `Task` agent (Explore) to investigate related codebases or papers
- Discuss with user to refine scope and angle

### 2. Create Outline
- Draft detailed section-by-section outline
- Identify key concepts that need visual explanation
- Get user approval before proceeding

### 3. Create SVG Figures (Critical Step)
- Create figures in `images/<post-slug>/` folder
- Follow blog theme: black background (#000), white/gray text, SF Mono font, sharp corners
- **Important**: Escape `&` as `&amp;` in SVG text elements
- Test SVGs render correctly before proceeding

### 4. Write Blog Post
- Create markdown in `src/posts/<slug>.md`
- Include bilingual content (EN in `<div class="lang-en">`, ZH in `<div class="lang-zh">`)
- Reference SVG figures with: `<img src="../images/<folder>/<file>.svg" style="width:100%;max-width:700px;margin:1.5rem 0;">`

### 5. Build & Publish
```bash
npm run build
git add . && git commit -m "Add post: <title>" && git push
```

## Skills

- `blog-creator` - Create new blog posts (writes markdown, runs build)
- `gist-creator` - Create new gists (writes markdown, runs build)
