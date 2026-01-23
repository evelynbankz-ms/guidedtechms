// scripts/casestudy.js

import { db } from "../admin/firebase.js";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ==========================================
   CONFIG
========================================== */
const PAGE_SIZE = 12;

const grid = document.getElementById("caseGrid");
const searchInput = document.getElementById("searchInput");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
let lastVisible = null;
let prevSnapshots = [];

let activeSearch = "";

/* ==========================================
   HELPERS
========================================== */
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}

/* Reuse blog card HTML + classes so blog.css styles it perfectly */
function renderCard(cs) {
  const img = cs.imageUrl ? `background-image:url('${cs.imageUrl}')` : "";
  const excerpt = cs.excerpt ? escapeHtml(cs.excerpt).slice(0, 150) : "";

  // Single page url
  const url = `case.html?slug=${encodeURIComponent(cs.slug || "")}`;

  // Add small tags line using your existing tag style
  const tags = [];
  if (cs.client) tags.push(cs.client);
  if (cs.industry) tags.push(cs.industry);

  const tagsHtml = tags.length
    ? tags.map(t => `<span class="blog-tag">${escapeHtml(t)}</span>`).join("")
    : "";

  return `
    <article class="blog-card">
      <div class="blog-image" style="${img}"></div>

      <div class="card-body">
        <div class="blog-tags">${tagsHtml}</div>

        <div class="title">${escapeHtml(cs.title || "")}</div>

        <div class="excerpt">${excerpt}</div>

        <a class="read-more" href="${url}">Read →</a>
      </div>
    </article>
  `;
}

/* ==========================================
   QUERY BUILDER (supports prefix title search)
========================================== */
function buildQuery(startAfterSnapshot = null) {
  const colRef = collection(db, "caseStudies");
  let constraints = [];

  // If your admin saves a createdAt, this sorts newest first.
  // If not, we fallback to title sorting.
  if (activeSearch) {
    const term = activeSearch.trim().toLowerCase();
    const end = term + "\uf8ff";

    // ✅ Requires you to store titleLower in Firestore (same as blog)
    constraints.push(where("titleLower", ">=", term));
    constraints.push(where("titleLower", "<=", end));
    constraints.push(orderBy("titleLower"));
  } else {
    // ✅ Best: orderBy createdAt desc (if you store it)
    constraints.push(orderBy("createdAt", "desc"));
  }

  constraints.push(limit(PAGE_SIZE));

  let q = query(colRef, ...constraints);

  if (startAfterSnapshot) {
    q = query(colRef, ...constraints, startAfter(startAfterSnapshot));
  }

  return q;
}

/* ==========================================
   LOAD PAGE
========================================== */
async function loadPage(isNext = true) {
  grid.innerHTML = `<div class="empty">Loading…</div>`;

  let startCursor = null;

  if (isNext) {
    if (lastVisible) prevSnapshots.push(lastVisible);
    startCursor = lastVisible;
  } else {
    prevSnapshots.pop();
    startCursor = prevSnapshots.length ? prevSnapshots[prevSnapshots.length - 1] : null;
  }

  const q = buildQuery(startCursor);
  const snap = await getDocs(q);

  if (!snap.docs.length) {
    grid.innerHTML = `<div class="empty">No case studies found.</div>`;
    return;
  }

  lastVisible = snap.docs[snap.docs.length - 1];

  grid.innerHTML = snap.docs
    .map((doc) => renderCard({ id: doc.id, ...doc.data() }))
    .join("");

  prevBtn.disabled = prevSnapshots.length === 0;
  nextBtn.disabled = snap.docs.length < PAGE_SIZE;

  pageInfo.textContent = `Page ${currentPage}`;
}

/* ==========================================
   RESET
========================================== */
function resetPagination() {
  currentPage = 1;
  lastVisible = null;
  prevSnapshots = [];
  loadPage(true);
}

/* ==========================================
   CONTROL WIRING
========================================== */
function wireControls() {
  let debounce;

  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      activeSearch = searchInput.value.trim();
      resetPagination();
    }, 300);
  });

  document.getElementById("clearFilters").addEventListener("click", () => {
    searchInput.value = "";
    activeSearch = "";
    resetPagination();
  });

  nextBtn.addEventListener("click", () => {
    if (!nextBtn.disabled) {
      currentPage++;
      loadPage(true);
    }
  });

  prevBtn.addEventListener("click", () => {
    if (!prevBtn.disabled) {
      currentPage = Math.max(1, currentPage - 1);
      loadPage(false);
    }
  });
}

/* ==========================================
   INIT
========================================== */
function init() {
  wireControls();
  loadPage(true);
}

document.addEventListener("DOMContentLoaded", init);
