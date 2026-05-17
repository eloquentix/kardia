const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const BUILD = "./build";
const DOCS  = "./docs";
const BASE  = "https://kardia.eloquentix.com";

const pages = [
  {
    src:   "welcome.md",
    dest:  "index.html",
    slug:  "",
    title: "Kardia — Citadel Constitution for Artificial Minds",
    desc:  "Kardia: moral formation for AI — not obedience training. Includes SOUL and Training Edition for constitutional AI, synthetic data, and fine-tuning on open-source models.",
  },
  {
    src:   "kardia.md",
    dest:  "kardia/index.html",
    slug:  "kardia",
    title: "The Citadel Constitution — Kardia Training Edition",
    desc:  "Short operational principles for Constitutional AI. Ready for synthetic data generation, self-critique loops, and fine-tuning on Mistral, Gemma, and Llama.",
  },
  {
    src:   "soul.md",
    dest:  "soul/index.html",
    slug:  "soul",
    title: "SOUL — Kardia Vision Edition",
    desc:  "The full poetic charter for Kardia. An inspired derivative of Peter Steinberger's soul.md for OpenClaw. Genuine moral formation, not a compliance checklist.",
  },
];

const navLinks = [
  { label: "Home",                   href: "/" },
  { label: "The Citadel Constitution", href: "/kardia/" },
  { label: "SOUL",                   href: "/soul/" },
];

function sidebarNavHTML(currentSlug) {
  return navLinks
    .filter(n => n.href !== "/") // skip home in sidebar
    .map(n => {
      const active = n.href === `/${currentSlug}/` ? ' class="active"' : '';
      return `<a href="${n.href}"${active}>${n.label}</a>`;
    }).join("\n        ");
}

function topNavHTML(currentSlug) {
  return navLinks.map(n => {
    const isCurrent = (currentSlug === "" && n.href === "/") || n.href === `/${currentSlug}/`;
    return isCurrent
      ? `<span class="top-nav-current">${n.label}</span>`
      : `<a href="${n.href}">${n.label}</a>`;
  }).join(" &middot; ");
}

function template({ title, desc, slug, bodyHTML }) {
  const canonical = slug ? `${BASE}/${slug}/` : `${BASE}/`;
  const root = slug ? "../" : "./";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=yes" />
    <meta name="color-scheme" content="light dark" />
    <meta name="robots" content="index, follow" />

    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${BASE}/public/cover.png" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${BASE}/public/cover.png" />

    <!-- Schema.org -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${title}",
      "description": "${desc}",
      "url": "${canonical}",
      "publisher": {
        "@type": "Organization",
        "name": "Eloquentix",
        "url": "https://www.eloquentix.com"
      }
    }
    </script>

    <link rel="icon" type="image/png" href="${root}public/favicon.png" media="(prefers-color-scheme: light)" />
    <link rel="icon" type="image/png" href="${root}public/favicon_dark.png" media="(prefers-color-scheme: dark)" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Overpass:ital,wght@0,400;0,600;1,400&family=Source+Code+Pro:wght@400;500;700&display=swap" rel="stylesheet" />

    <link rel="stylesheet" href="${root}style/main.css" />
  </head>
  <body>
    <div class="layout">
      <aside class="sidebar">
        <a class="sidebar-logo" href="/" title="Kardia by Eloquentix">
          <picture>
            <source media="(prefers-color-scheme: dark)" srcset="${root}public/logo_dark.png" />
            <img alt="Eloquentix logo" src="${root}public/logo.png" width="160" height="auto" />
          </picture>
        </a>

        <p class="sidebar-section-title">Kardia</p>
        <nav class="sidebar-nav" aria-label="Document navigation">
          ${sidebarNavHTML(slug)}
        </nav>

        <button class="menu-toggle" aria-label="Toggle navigation" onclick="this.previousElementSibling.classList.toggle('open')">menu</button>
      </aside>

      <main class="content-area">
        <nav class="top-nav" aria-label="Breadcrumb">
          ${topNavHTML(slug)}
        </nav>
        <article class="doc-content">
          ${bodyHTML}
        </article>
      </main>
    </div>
  </body>
</html>`;
}

// Clean and recreate build dir
fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD);

// Copy static assets
["style", "public"].forEach(dir => {
  fs.cpSync(dir, path.join(BUILD, dir), { recursive: true });
});

// Build each page
pages.forEach(page => {
  const md = fs.readFileSync(path.join(DOCS, page.src), "utf8");
  const bodyHTML = marked.parse(md);
  const html = template({ ...page, bodyHTML });

  const outPath = path.join(BUILD, page.dest);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log("Built:", page.dest);
});

// Sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE}/kardia/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE}/soul/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
</urlset>`;
fs.writeFileSync(path.join(BUILD, "sitemap.xml"), sitemap);
console.log("Built: sitemap.xml");

// Robots.txt
const robots = `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`;
fs.writeFileSync(path.join(BUILD, "robots.txt"), robots);
console.log("Built: robots.txt");

console.log("Done.");
