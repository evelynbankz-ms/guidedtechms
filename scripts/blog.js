// blog.jsimport { db } from "../admin/firebase.js";

import { db } from "../admin/firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ==========================================
   CONFIG
========================================== */
const PAGE_SIZE = 20;

const postsGrid = document.getElementById("postsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
let lastVisible = null;
let prevSnapshots = []; // stack of previous-page cursors

let activeCategory = "";
let activeSearch = "";

/* ==========================================
   HELPERS
========================================== */
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}

function fmtDate(ms) {
  try {
    return new Date(ms).toLocaleDateString();
  } catch (e) {
    return "";
  }
}

/* ==========================================
   CARD RENDERER
========================================== */
function renderCard(post) {
  const image = post.imageUrl
    ? `<img src="${post.imageUrl}" class="blog-image" loading="lazy" alt="${escapeHtml(post.title)}">`
    : `<div class="blog-image"></div>`;

  const excerpt = post.excerpt
    ? escapeHtml(post.excerpt).slice(0, 140)
    : "";

  const slug = post.slug || "";
  const url = `/blog/post.html?slug=${encodeURIComponent(slug)}`;

  return `
  <article class="blog-card">
      ${image}
      <div class="card-body">
          <div class="title">${escapeHtml(post.title)}</div>
          <div class="excerpt">${excerpt}</div>

          <div class="meta-bottom">
              ${post.category ? `<div class="category">${escapeHtml(post.category)}</div>` : ""}
              <div style="font-size:13px;color:#6f7a84">${fmtDate(post.createdAt)}</div>
          </div>

          <a class="read-more" href="${url}">Read →</a>
      </div>
  </article>`;
}

/* ==========================================
   CATEGORY LOADER
========================================== */
async function loadCategories() {
  const snap = await getDocs(collection(db, "blogs"));
  const unique = new Set();

  snap.forEach((d) => {
    const c = d.data().category;
    if (c) unique.add(c);
  });

  Array.from(unique)
    .sort()
    .forEach((category) => {
      const opt = document.createElement("option");
      opt.value = category;
      opt.textContent = category;
      categoryFilter.appendChild(opt);
    });
}

/* ==========================================
   FIRESTORE QUERY BUILDER
========================================== */
function buildQuery(startAfterSnapshot = null) {
  const colRef = collection(db, "blogs");
  let constraints = [];

  /* Category filter */
  if (activeCategory) {
    constraints.push(where("category", "==", activeCategory));
  }

  /* Title search */
  if (activeSearch) {
    const term = activeSearch.trim();
    const end = term + "\uf8ff";
    constraints.push(where("title", ">=", term));
    constraints.push(where("title", "<=", end));

    // Required ordering when using range queries on 'title'
    constraints.push(orderBy("title"));
    constraints.push(orderBy("createdAt", "desc"));
  } else {
    // Default: newest first
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
   LOAD PAGE (FORWARD OR RESET)
========================================== */
async function loadPage(isNext = true) {
  postsGrid.innerHTML = `<div class="empty">Loading…</div>`;

  let startCursor = null;

  if (isNext) {
    if (lastVisible) prevSnapshots.push(lastVisible);
    startCursor = lastVisible;
  } else {
    prevSnapshots.pop(); // drop current page
    startCursor = prevSnapshots.length ? prevSnapshots[prevSnapshots.length - 1] : null;
  }

  const q = buildQuery(startCursor);
  const snap = await getDocs(q);

  if (!snap.docs.length) {
    postsGrid.innerHTML = `<div class="empty">No posts found.</div>`;
    return;
  }

  // Update cursor for next page
  lastVisible = snap.docs[snap.docs.length - 1];

  // Render posts
  postsGrid.innerHTML = snap.docs
    .map((doc) => renderCard({ id: doc.id, ...doc.data() }))
    .join("");

  // Update pagination buttons
  prevBtn.disabled = prevSnapshots.length === 0;
  nextBtn.disabled = snap.docs.length < PAGE_SIZE;

  pageInfo.textContent = `Page ${currentPage}`;
}

/* ==========================================
   RESET + RELOAD FIRST PAGE
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
  /* Search (debounced) */
  let debounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      activeSearch = searchInput.value.trim();
      resetPagination();
    }, 300);
  });

  /* Category filter */
  categoryFilter.addEventListener("change", () => {
    activeCategory = categoryFilter.value;
    resetPagination();
  });

  /* Clear filters */
  document.getElementById("clearFilters").addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    activeSearch = "";
    activeCategory = "";
    resetPagination();
  });

  /* Next page */
  nextBtn.addEventListener("click", () => {
    if (!nextBtn.disabled) {
      currentPage++;
      loadPage(true);
    }
  });

  /* Previous page */
  prevBtn.addEventListener("click", () => {
    if (!prevBtn.disabled && prevSnapshots.length > 0) {
      currentPage = Math.max(1, currentPage - 1);
      loadPage(false);
    }
  });
}

/* ==========================================
   INIT
========================================== */
async function init() {
  await loadCategories();
  wireControls();
  await loadPage(true);
}

document.addEventListener("DOMContentLoaded", init);
