const docs = [
  { slug: "kardia", file: "docs/kardia.md", label: "The Citadel Constitution" },
  { slug: "soul",   file: "docs/soul.md",   label: "SOUL" },
];

const nav = document.getElementById("sidebar-nav");
const contentEl = document.getElementById("doc-content");
const menuToggle = document.getElementById("menu-toggle");

// Build nav links
docs.forEach(doc => {
  const a = document.createElement("a");
  a.href = "#" + doc.slug;
  a.textContent = doc.label;
  a.dataset.slug = doc.slug;
  nav.appendChild(a);
});

// Mobile toggle
menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");
});

async function loadDoc(slug) {
  const doc = docs.find(d => d.slug === slug);
  const file = doc ? doc.file : "docs/welcome.md";

  // Update active nav
  nav.querySelectorAll("a").forEach(a => {
    a.classList.toggle("active", doc && a.dataset.slug === doc.slug);
  });

  nav.classList.remove("open");

  contentEl.innerHTML = '<p style="color:var(--color-dark-grey)">Loading…</p>';
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error("Not found");
    const md = await res.text();
    contentEl.innerHTML = marked.parse(md);
    styleFirstParagraph();
    interceptHashLinks();
  } catch (e) {
    contentEl.innerHTML = "<p>Could not load document.</p>";
  }

  document.title = doc ? "Kardia — " + doc.label : "Kardia";
  window.scrollTo(0, 0);
}

function styleFirstParagraph() {
  const h1 = contentEl.querySelector("h1");
  if (!h1) return;
  const next = h1.nextElementSibling;
  if (next && next.tagName === "P") {
    next.classList.add("doc-subtitle");
  }
}

// Make in-page #hash links work with our router
function interceptHashLinks() {
  contentEl.querySelectorAll("a[href^='#']").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      location.hash = a.getAttribute("href");
    });
  });
}

function route() {
  const slug = location.hash.replace("#", "");
  loadDoc(slug);
}

window.addEventListener("hashchange", route);
route();
