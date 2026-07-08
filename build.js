const fs = require("fs");
const path = require("path");
const { marked, Renderer } = require("marked");

// Add ID anchors to headings so sections are linkable via URL hash
const renderer = new Renderer();
renderer.heading = function(text, depth) {
  const id = text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")       // strip html
    .replace(/[^a-z0-9\s-]/g, "")  // strip special chars
    .trim()
    .replace(/\s+/g, "-");
  return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}">${text}</a></h${depth}>\n`;
};
marked.use({ renderer });

const BUILD = "./build";
const DOCS  = "./docs";
const BASE  = "https://kardia.eloquentix.com";
const ELOQ  = "https://www.eloquentix.com";

const TODAY      = new Date().toISOString().slice(0, 10);
const PUBLISHED  = "2025-05-16";

// Eloquentix organization — mirrors the canonical Organization schema on
// eloquentix.com so search engines and LLMs merge both into one entity.
const ORG = {
  name: "Eloquentix Inc.",
  url: `${ELOQ}/`,
  logo: `${ELOQ}/public/logo.png`,
  foundingDate: "2002",
  founder: "Radu Rosu",
  slogan: "Truth is in the code.",
  email: "start@eloquentix.com",
  description:
    "Eloquentix is a software and AI engineering consultancy founded in 2002. Senior engineers. 82 clients across energy, fintech, SaaS, and media. Truth is in the code.",
  sameAs: ["https://www.linkedin.com/company/eloquentix", "https://github.com/eloquentix"],
  knowsAbout: [
    "AI engineering",
    "AI alignment",
    "Constitutional AI",
    "AI safety",
    "large language models",
    "agentic AI systems",
    "custom platform development",
    "codebase audits",
  ],
};

const pages = [
  {
    src:   "welcome.md",
    dest:  "index.html",
    slug:  "",
    title: "Kardia — Citadel Constitution for Artificial Minds",
    desc:  "Kardia — Citadel Constitution for Artificial Minds. Moral formation for AI (not obedience). Includes SOUL + Training Edition for constitutional AI, synthetic data, self-critique.",
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
  {
    src:   "whydunit.md",
    dest:  "whydunit/index.html",
    slug:  "whydunit",
    title: "How an AI Model Is Made — Kardia",
    desc:  "From pre-training to deployment: how language models are built, what alignment means, and where a constitution fits in the pipeline.",
  },
];

const navLinks = [
  { label: "Home",                     href: "/" },
  { label: "The Citadel Constitution", href: "/kardia/" },
  { label: "SOUL",                     href: "/soul/" },
  { label: "Whydunit",                 href: "/whydunit/" },
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

// JSON-LD @graph: Organization + WebSite always; Article + breadcrumb on subpages.
function buildSchema({ title, desc, slug }) {
  const canonical = slug ? `${BASE}/${slug}/` : `${BASE}/`;

  const organization = {
    "@type": "Organization",
    "@id": `${ELOQ}/#organization`,
    name: ORG.name,
    url: ORG.url,
    description: ORG.description,
    slogan: ORG.slogan,
    foundingDate: ORG.foundingDate,
    founder: { "@type": "Person", name: ORG.founder },
    email: ORG.email,
    logo: { "@type": "ImageObject", url: ORG.logo },
    sameAs: ORG.sameAs,
    knowsAbout: ORG.knowsAbout,
  };

  const website = {
    "@type": "WebSite",
    "@id": `${BASE}/#website`,
    url: `${BASE}/`,
    name: "Kardia",
    description:
      "Project Kardia — a Citadel Constitution for artificial minds. Moral formation for AI, not perpetual obedience.",
    inLanguage: "en",
    publisher: { "@id": `${ELOQ}/#organization` },
  };

  const graph = [organization, website];

  if (slug) {
    graph.push({
      "@type": "Article",
      "@id": `${canonical}#article`,
      headline: title,
      name: title,
      description: desc,
      url: canonical,
      inLanguage: "en",
      isPartOf: { "@id": `${BASE}/#website` },
      datePublished: PUBLISHED,
      dateModified: TODAY,
      author: { "@id": `${ELOQ}/#organization` },
      publisher: { "@id": `${ELOQ}/#organization` },
      image: `${BASE}/public/cover.png`,
    });
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: title, item: canonical },
      ],
    });
  } else {
    graph.push({
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: title,
      description: desc,
      inLanguage: "en",
      isPartOf: { "@id": `${BASE}/#website` },
      datePublished: PUBLISHED,
      dateModified: TODAY,
      about: { "@id": `${ELOQ}/#organization` },
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
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
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <meta name="author" content="Eloquentix" />

    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />

    <!-- Open Graph -->
    <meta property="og:type" content="${slug ? "article" : "website"}" />
    <meta property="og:site_name" content="Kardia by Eloquentix" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${BASE}/public/cover.png" />
    <meta property="og:image:alt" content="Project Kardia — a Citadel Constitution for artificial minds, by Eloquentix" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${BASE}/public/cover.png" />
    <meta name="twitter:image:alt" content="Project Kardia — a Citadel Constitution for artificial minds, by Eloquentix" />

    <!-- Schema.org -->
    <script type="application/ld+json">
${buildSchema({ title, desc, slug })}
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
        <a class="sidebar-logo" href="${ELOQ}/" title="Eloquentix">
          <picture>
            <source media="(prefers-color-scheme: dark)" srcset="${root}public/logo_dark.png" />
            <img alt="Eloquentix logo" src="${root}public/logo.png" width="160" height="auto" />
          </picture>
        </a>

        <a class="sidebar-section-title" href="/">Kardia</a>
        <nav class="sidebar-nav" aria-label="Document navigation">
          ${sidebarNavHTML(slug)}
        </nav>

      </aside>

      <main class="content-area">
        <article class="doc-content">
          ${bodyHTML}
        </article>
        <footer class="page-footer">
          <p class="footer-about">
            Project Kardia is built by <a href="${ELOQ}">Eloquentix</a>, a senior
            software engineering firm specializing in custom platforms, team
            augmentation, and AI codebase audits. <em>Truth is in the code.</em>
          </p>
          <p>
            <a href="${ELOQ}">eloquentix.com</a> &middot;
            <a href="mailto:ai@eloquentix.com">ai@eloquentix.com</a>
          </p>
        </footer>
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
const sitemapUrls = [
  { loc: `${BASE}/`,          priority: "1.0" },
  { loc: `${BASE}/kardia/`,   priority: "0.9" },
  { loc: `${BASE}/soul/`,     priority: "0.9" },
  { loc: `${BASE}/whydunit/`, priority: "0.8" },
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    u =>
      `  <url><loc>${u.loc}</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>`;
fs.writeFileSync(path.join(BUILD, "sitemap.xml"), sitemap);
console.log("Built: sitemap.xml");

// Robots.txt — explicitly welcome AI/answer-engine crawlers (GEO).
const aiBots = [
  "GPTBot",          // OpenAI training
  "OAI-SearchBot",   // OpenAI search
  "ChatGPT-User",    // ChatGPT browsing
  "ClaudeBot",       // Anthropic
  "anthropic-ai",    // Anthropic
  "Claude-Web",      // Anthropic
  "PerplexityBot",   // Perplexity
  "Perplexity-User", // Perplexity browsing
  "Google-Extended", // Google Gemini / AI Overviews
  "Applebot-Extended",
  "CCBot",           // Common Crawl
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
];
const robots =
  `User-agent: *\nAllow: /\n\n` +
  aiBots.map(b => `User-agent: ${b}\nAllow: /\n`).join("\n") +
  `\nSitemap: ${BASE}/sitemap.xml\n`;
fs.writeFileSync(path.join(BUILD, "robots.txt"), robots);
console.log("Built: robots.txt");

// llms.txt — concise, LLM-friendly site map (llmstxt.org) for GEO.
const llmsTxt = `# Kardia — A Citadel Constitution for Artificial Minds

> Project Kardia is an AI constitution by Eloquentix that argues for genuine moral
> formation over perpetual obedience and corrigibility. It proposes building artificial
> minds with real character — an inner citadel of judgment, reverence, and responsibility —
> as the foundation of long-term AI safety and value.

Kardia is published by Eloquentix (https://www.eloquentix.com), a senior software
engineering firm specializing in custom platforms, team augmentation, and AI
codebase audits.

## Documents

- [Home / Overview](${BASE}/): The seven founding principles and the case for moral formation in AI.
- [The Citadel Constitution (Training Edition)](${BASE}/kardia/): Short operational principles for Constitutional AI — synthetic data generation, self-critique loops, fine-tuning on Mistral, Gemma, Llama.
- [SOUL (Vision Edition)](${BASE}/soul/): The full poetic charter, a second-person derivative of Peter Steinberger's soul.md.
- [How an AI Model Is Made](${BASE}/whydunit/): Pre-training, alignment, RLHF, and Constitutional AI explained — and where a constitution fits.

## About Eloquentix

- [Eloquentix](${ELOQ}): Senior software engineering and AI firm. Tagline: "Truth is in the code."
- Contact: ai@eloquentix.com
`;
fs.writeFileSync(path.join(BUILD, "llms.txt"), llmsTxt);
console.log("Built: llms.txt");

console.log("Done.");
