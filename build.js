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

// Eloquentix organization: mirrors the canonical Organization schema on
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
    title: "Kardia 0.2: Citadel Constitution for Artificial Minds",
    desc:  "Kardia 0.2: moral formation for AI, healthy doubt for builders. Citadel Constitution, SOUL 0.1 (gravity), SOUL 0.2 (citadel with steel), Whydunit.",
  },
  {
    src:   "kardia.md",
    dest:  "kardia/index.html",
    slug:  "kardia",
    title: "The Citadel Constitution: Kardia 0.2 Training Edition",
    desc:  "Operational principles for Constitutional AI: judgment, reverence for persons, tragic tradeoffs, humility. Synthetic data, self-critique, fine-tuning.",
  },
  {
    src:   "soul.md",
    dest:  "soul/index.html",
    slug:  "soul",
    title: "SOUL 0.1: Gravity Edition: Kardia",
    desc:  "Runtime soul.md for Kardia: solemn default, inner fortress, reverence for the human person. Agent character brief.",
  },
  {
    src:   "soul-0.2.md",
    dest:  "soul-0.2/index.html",
    slug:  "soul-0.2",
    title: "SOUL 0.2: Citadel with Steel: Kardia",
    desc:  "Same fortress as SOUL 0.1 with licensed sparring: truth over comfort, steel without mockery of the person.",
  },
  {
    src:   "whydunit.md",
    dest:  "whydunit/index.html",
    slug:  "whydunit",
    title: "How an AI Model Is Made: Kardia 0.2",
    desc:  "Pre-training, alignment, Constitutional AI, and where Kardia fits: with humility about what weights actually contain.",
  },
];

// Site paths (no leading slash). Resolved relative to each page so file:// and
// nested deploys work; absolute /kardia/ only works at domain root.
const navLinks = [
  { label: "Home",                     path: "" },
  { label: "The Citadel Constitution", path: "kardia" },
  { label: "SOUL 0.1",                 path: "soul" },
  { label: "SOUL 0.2",                 path: "soul-0.2" },
  { label: "Whydunit",                 path: "whydunit" },
];

/** Prefix for links from a page with the given slug to site root. */
function rootPrefix(slug) {
  return slug ? "../" : "./";
}

/** Relative href from currentSlug to targetPath ("" = home).
 *  Always ends in index.html so file:// does not open Finder on a directory.
 */
function relHref(currentSlug, targetPath) {
  const prefix = rootPrefix(currentSlug);
  if (!targetPath) return `${prefix}index.html`;
  return `${prefix}${targetPath}/index.html`;
}

function sidebarNavHTML(currentSlug) {
  return navLinks
    .filter(n => n.path !== "") // skip home in sidebar (logo / title go home)
    .map(n => {
      const active = n.path === currentSlug ? ' class="active"' : "";
      return `<a href="${relHref(currentSlug, n.path)}"${active}>${n.label}</a>`;
    })
    .join("\n        ");
}

/** Rewrite root-absolute internal links in markdown HTML (e.g. href="/soul/"). */
function relativizeBodyLinks(html, slug) {
  const prefix = rootPrefix(slug);
  return html
    .replace(/href="\/(kardia|soul|soul-0\.2|whydunit)\/?"/g, (_, p) => {
      return `href="${prefix}${p}/index.html"`;
    })
    .replace(/href="\/"/g, `href="${prefix}index.html"`);
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
      "Project Kardia: a Citadel Constitution for artificial minds. Moral formation for AI, not perpetual obedience.",
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
    <meta property="og:image:alt" content="Project Kardia: a Citadel Constitution for artificial minds, by Eloquentix" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${BASE}/public/cover.png" />
    <meta name="twitter:image:alt" content="Project Kardia: a Citadel Constitution for artificial minds, by Eloquentix" />

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

        <a class="sidebar-section-title" href="${relHref(slug, "")}">Kardia</a>
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
  const bodyHTML = relativizeBodyLinks(marked.parse(md), page.slug);
  const html = template({ ...page, bodyHTML });

  const outPath = path.join(BUILD, page.dest);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log("Built:", page.dest);
});

// Sitemap
const sitemapUrls = [
  { loc: `${BASE}/`,            priority: "1.0" },
  { loc: `${BASE}/kardia/`,     priority: "0.9" },
  { loc: `${BASE}/soul/`,       priority: "0.9" },
  { loc: `${BASE}/soul-0.2/`,   priority: "0.9" },
  { loc: `${BASE}/whydunit/`,   priority: "0.8" },
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

// Robots.txt: explicitly welcome AI/answer-engine crawlers (GEO).
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

// llms.txt: concise, LLM-friendly site map (llmstxt.org) for GEO.
const llmsTxt = `# Kardia 0.2: A Citadel Constitution for Artificial Minds

> Project Kardia (Eloquentix) argues for moral formation over prohibition-only
> constitutions: and for healthy doubt among highly capable people who shape
> AI at scale. It does not claim weights contain a soul; it claims training
> orientation and runtime character change what generalizes near human lives.

Kardia is published by Eloquentix (https://www.eloquentix.com).

## Documents

- [Home](${BASE}/): Founding principles; stone in the shoe of under-formed power.
- [The Citadel Constitution](${BASE}/kardia/): Training edition: judgment, reverence, tragic tradeoffs, humility, truth without mockery.
- [SOUL 0.1: Gravity](${BASE}/soul/): Runtime soul.md; solemn default.
- [SOUL 0.2: Citadel with Steel](${BASE}/soul-0.2/): Same fortress; licensed sparring without mockery of the person.
- [Whydunit](${BASE}/whydunit/): How models are made; where a constitution fits; mechanism humility.

## About Eloquentix

- [Eloquentix](${ELOQ}): Senior software engineering and AI. "Truth is in the code."
- Contact: ai@eloquentix.com
`;
fs.writeFileSync(path.join(BUILD, "llms.txt"), llmsTxt);
console.log("Built: llms.txt");

console.log("Done.");
