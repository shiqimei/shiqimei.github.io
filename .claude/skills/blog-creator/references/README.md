# Blog Creator

## Overview

Create new blog posts for the Shiqi Mei blog (shiqimei.github.io). This static site uses a sharp B&W theme with a timeline-based homepage.

## When to Use This Skill

- "Create a new blog post about X"
- "Write an article on Y"
- "Add a post to the blog"

## Blog Structure

```
/Users/smei/repos/pages/
├── index.html           # Homepage with timeline
├── css/style.css        # Shared styles
└── posts/
    └── *.html           # Individual posts
```

## Creating a New Post

### Step 1: Create Post File

Create `posts/<slug>.html` using this template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POST_TITLE - Shiqi Mei</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div class="container">
    <a href="/" class="back-link">&larr; back</a>

    <article>
      <header class="post-header">
        <h1 class="post-title">POST_TITLE</h1>
        <p class="post-meta">DATE</p>
      </header>

      <div class="post-content">
        <!-- Content here -->
      </div>
    </article>

    <footer class="site-footer">
      <p>&copy; 2026 Shiqi Mei</p>
    </footer>
  </div>
</body>
</html>
```

### Step 2: Add Timeline Entry

Add entry to `index.html` inside `<main class="timeline">`, newest first:

```html
<article class="timeline-item">
  <time class="timeline-date">DATE</time>
  <h2 class="timeline-title">
    <a href="posts/SLUG.html">POST_TITLE</a>
  </h2>
  <p class="timeline-excerpt">EXCERPT</p>
</article>
```

### Step 3: Commit and Push

```bash
cd /Users/smei/repos/pages
git add -A && git commit -m "Add post: POST_TITLE" && git push
```

## Content Formatting

Available HTML elements in `.post-content`:

| Element | Usage |
|---------|-------|
| `<h2>` | Section headings (with top border) |
| `<h3>` | Subsection headings |
| `<p>` | Paragraphs |
| `<ul>/<ol>` | Lists |
| `<code>` | Inline code |
| `<pre><code>` | Code blocks |
| `<blockquote>` | Quotes |
| `<table>` | Tables |
| `<a>` | Links |

## Date Format

Use: `Mon D, YYYY` (e.g., "Jan 3, 2026")

## Slug Conventions

- Lowercase
- Hyphens for spaces
- Descriptive but concise
- Example: `macos-square-corners.html`
