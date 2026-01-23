import { db } from "../admin/firebase.js";
import {
  collection,
  query,
  where,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const wrap = document.getElementById("caseWrap");

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}

function getSlug() {
  return new URLSearchParams(location.search).get("slug") || "";
}

function render(cs) {
  const hero = cs.imageUrl
    ? `<img src="${cs.imageUrl}" alt="${escapeHtml(cs.title)}"
        style="width:100%;max-height:420px;object-fit:cover;border-radius:16px;margin:22px 0;">`
    : "";

  const meta = [];
  if (cs.client) meta.push(`Client: ${escapeHtml(cs.client)}`);
  if (cs.industry) meta.push(`Industry/Services: ${escapeHtml(cs.industry)}`);

  return `
    <h1>${escapeHtml(cs.title || "")}</h1>
    ${meta.length ? `<div class="post-meta">${meta.join(" • ")}</div>` : ""}
    ${cs.excerpt ? `<div class="post-excerpt">${escapeHtml(cs.excerpt)}</div>` : ""}
    ${hero}
    <div class="post-content">
      ${cs.content || ""}
    </div>
  `;
}

async function load() {
  const slug = getSlug();

  if (!slug) {
    wrap.innerHTML = `<div class="empty">Missing case study slug.</div>`;
    return;
  }

  const q = query(
    collection(db, "caseStudies"),
    where("slug", "==", slug),
    limit(1)
  );

  const snap = await getDocs(q);

  if (!snap.docs.length) {
    wrap.innerHTML = `<div class="empty">Case study not found.</div>`;
    return;
  }

  const cs = snap.docs[0].data();
  document.title = cs.title ? `${cs.title} — Case Study` : "Case Study";

  wrap.innerHTML = render(cs);
}

document.addEventListener("DOMContentLoaded", load);
