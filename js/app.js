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
  const doc = docs.find(d => d.slug === slug) || docs[0];

  // Update active link
  nav.querySelectorAll("a").forEach(a => {
    a.classList.toggle("active", a.dataset.slug === doc.slug);
  });

  // Close mobile nav
  nav.classList.remove("open");

  // Fetch and render
  contentEl.innerHTML = '<p style="color:var(--color-dark-grey)">Loading…</p>';
  try {
    const res = await fetch(doc.file);
    if (!res.ok) throw new Error("Not found");
    const md = await res.text();
    contentEl.innerHTML = marked.parse(md);
    // Wrap first p after h1 as subtitle if it's bold-only
    styleFirstLine();
  } catch (e) {
    contentEl.innerHTML = "<p>Could not load document.</p>";
  }

  document.title = "Kardia — " + doc.label;
  window.scrollTo(0, 0);
}

function styleFirstLine() {
  const h1 = contentEl.querySelector("h1");
  if (!h1) return;
  const next = h1.nextElementSibling;
  if (next && next.tagName === "P") {
    next.classList.add("doc-subtitle");
  }
}

// Route on hash change
function route() {
  const slug = location.hash.replace("#", "") || docs[0].slug;
  loadDoc(slug);
}

window.addEventListener("hashchange", route);
route();
