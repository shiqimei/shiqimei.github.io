import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const SITE_URL = 'https://shiqimei.github.io';
const SITE_TITLE = 'Shiqi Mei';
const SITE_DESCRIPTION = 'notes on software, systems, and tools';

// Configure marked for syntax highlighting classes
marked.setOptions({
  gfm: true,
  breaks: false
});

// Custom renderer to add language classes to code blocks
const renderer = {
  code({ text, lang }) {
    const language = lang || 'text';
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    return `<pre><code class="language-${language}">${escaped}</code></pre>`;
  }
};
marked.use({ renderer });

// Date formatting: "Mon D, YYYY"
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatDate(date) {
  const d = new Date(date);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function parseDate(dateStr) {
  return new Date(dateStr);
}

// Read and parse markdown files
function readMarkdownFiles(dir) {
  const files = [];
  const dirPath = path.join(ROOT, dir);

  if (!fs.existsSync(dirPath)) {
    return files;
  }

  for (const file of fs.readdirSync(dirPath)) {
    if (!file.endsWith('.md')) continue;

    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    const slug = file.replace('.md', '');

    files.push({
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt || '',
      content: body,
      html: marked(body)
    });
  }

  // Sort by date descending
  files.sort((a, b) => new Date(b.date) - new Date(a.date));
  return files;
}

// Read template files
function readTemplate(name) {
  return fs.readFileSync(path.join(ROOT, 'templates', name), 'utf-8');
}

// Generate post HTML files
// Creates both /posts/slug.html AND /posts/slug/index.html for extensionless URL support
function generatePosts(posts) {
  const template = readTemplate('post.html');
  const postsDir = path.join(ROOT, 'posts');

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  for (const post of posts) {
    const html = template
      .replace(/\{\{TITLE\}\}/g, post.title)
      .replace(/\{\{DATE\}\}/g, formatDate(post.date))
      .replace(/\{\{CONTENT\}\}/g, post.html);

    // Generate /posts/slug.html (traditional)
    fs.writeFileSync(path.join(postsDir, `${post.slug}.html`), html);

    // Generate /posts/slug/index.html (extensionless URL support)
    const slugDir = path.join(postsDir, post.slug);
    if (!fs.existsSync(slugDir)) {
      fs.mkdirSync(slugDir, { recursive: true });
    }
    fs.writeFileSync(path.join(slugDir, 'index.html'), html);
  }

  console.log(`Generated ${posts.length} posts`);
}

// Generate index.html with timeline
function generateIndex(posts) {
  const template = readTemplate('index.html');

  const timelineHtml = posts.map(post => `      <article class="timeline-item">
        <time class="timeline-date">${formatDate(post.date)}</time>
        <h2 class="timeline-title">
          <a href="posts/${post.slug}.html">${post.title}</a>
        </h2>
        <p class="timeline-excerpt">${post.excerpt}</p>
      </article>`).join('\n\n');

  const html = template.replace('{{TIMELINE}}', timelineHtml);
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  console.log('Generated index.html');
}

// Generate gists.html
function generateGists(gists) {
  const template = readTemplate('gists.html');

  const gistsHtml = gists.map(gist => `      <article class="gist" id="${gist.slug}">
        <header class="gist-header">
          <h2 class="gist-title">${gist.title}</h2>
          <time class="gist-date">${formatDate(gist.date)}</time>
        </header>
        <div class="gist-content">
          ${gist.html}
        </div>
      </article>`).join('\n\n');

  const html = template.replace('{{GISTS}}', gistsHtml);
  fs.writeFileSync(path.join(ROOT, 'gists.html'), html);
  console.log(`Generated gists.html with ${gists.length} gists`);
}

// Generate search-index.json
function generateSearchIndex(posts, gists) {
  // Read projects from projects.html (keep projects manual for now)
  const projectsHtml = fs.readFileSync(path.join(ROOT, 'projects.html'), 'utf-8');
  const projectMatches = projectsHtml.matchAll(/<article class="project" id="([^"]+)"[\s\S]*?<h2 class="project-title">([^<]+)<\/h2>[\s\S]*?<p class="project-tagline">([^<]+)<\/p>/g);

  const projects = [];
  for (const match of projectMatches) {
    projects.push({
      type: 'project',
      title: match[2],
      excerpt: match[3],
      date: formatDate(new Date()), // Use current date for projects
      url: `projects.html#${match[1]}`
    });
  }

  const index = [
    ...projects,
    ...posts.map(p => ({
      type: 'post',
      title: p.title,
      excerpt: p.excerpt,
      date: formatDate(p.date),
      url: `posts/${p.slug}.html`
    })),
    ...gists.map(g => ({
      type: 'gist',
      title: g.title,
      excerpt: g.excerpt || g.title,
      date: formatDate(g.date),
      url: `gists.html#${g.slug}`
    }))
  ];

  // Sort by date descending
  index.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateB - dateA;
  });

  fs.writeFileSync(
    path.join(ROOT, 'search-index.json'),
    JSON.stringify(index, null, 2)
  );
  console.log(`Generated search-index.json with ${index.length} entries`);
}

// Generate sitemap.xml
function generateSitemap(posts, gists) {
  const urls = [
    SITE_URL + '/',
    SITE_URL + '/about.html',
    SITE_URL + '/gists.html',
    SITE_URL + '/projects.html',
    ...posts.map(p => `${SITE_URL}/posts/${p.slug}.html`),
    ...gists.map(g => `${SITE_URL}/gists.html#${g.slug}`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  console.log('Generated sitemap.xml');
}

// Generate robots.txt
function generateRobots() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
  console.log('Generated robots.txt');
}

// Generate llms.txt
function generateLlmsTxt(posts, gists) {
  const content = `# ${SITE_TITLE}

> ${SITE_DESCRIPTION}

## About

Personal blog by Shiqi Mei, a software engineer focused on AI-powered developer tools.

## Posts

${posts.map(p => `- [${p.title}](${SITE_URL}/posts/${p.slug}.html) - ${formatDate(p.date)}`).join('\n')}

## Gists

${gists.map(g => `- [${g.title}](${SITE_URL}/gists.html#${g.slug}) - ${formatDate(g.date)}`).join('\n')}

## Contact

- Website: ${SITE_URL}
- GitHub: https://github.com/shiqimei
- Email: shiqi.mei@outlook.com
`;

  fs.writeFileSync(path.join(ROOT, 'llms.txt'), content);
  console.log('Generated llms.txt');
}

// Main build function
function build() {
  console.log('Building site...\n');

  const posts = readMarkdownFiles('src/posts');
  const gists = readMarkdownFiles('src/gists');

  generatePosts(posts);
  generateIndex(posts);
  generateGists(gists);
  generateSearchIndex(posts, gists);
  generateSitemap(posts, gists);
  generateRobots();
  generateLlmsTxt(posts, gists);

  console.log('\nBuild complete!');
}

build();
