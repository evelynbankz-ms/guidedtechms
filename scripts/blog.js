// blog.js
import { db } from "./firebase.js";
import {
  collection, query, where, orderBy, limit, startAfter,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* Configuration */
const PAGE_SIZE = 20; // posts per page
const postsGrid = document.getElementById("postsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
let lastVisible = null;      // Firestore document snapshot used for next page
let prevStack = [];          // stack of lastVisible snapshots to support Prev
let activeCategory = "";
let activeSearch = "";

/* Helper: format date */
function fmtDate(ms){
  try { const d = new Date(ms); return d.toLocaleDateString(); } catch(e){ return ""; }
}

/* Render a single post card */
function renderCard(post){
  const image = post.imageUrl ? `<img src="${post.imageUrl}" class="blog-image" loading="lazy" alt="${escapeHtml(post.title||'')}" />` : `<div class="blog-image"></div>`;
  const excerpt = post.excerpt ? escapeHtml(post.excerpt).slice(0,160) : "";
  const category = post.category ? `<div class="category">${escapeHtml(post.category)}</div>` : "";
  const slug = post.slug || "";
  const url = `/blog/post.html?slug=${encodeURIComponent(slug)}`;

  return `
    <article class="blog-card">
      ${image}
      <div class="card-body">
        <div class="meta">
          <div>
            <div class="title">${escapeHtml(post.title || "(no title)")}</div>
            <div class="excerpt">${excerpt}</div>
          </div>
        </div>

        <div class="meta-bottom">
          <div>${category}</div>
          <div style="font-size:13px;color:#6f7a84">${fmtDate(post.createdAt)}</div>
        </div>

        <div style="margin-top:10px">
          <a class="read-more" href="${url}">Read →</a>
        </div>
      </div>
    </article>
  `;
}

/* Safe escape */
function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* Fetch categories (unique) — small helper to populate select */
async function loadCategories(){
  const snap = await getDocs(collection(db, "blogs"));
  const set = new Set();
  snap.docs.forEach(d=>{
    const c = d.data().category;
    if(c) set.add(c);
  });
  // sort and add
  const arr = Array.from(set).sort();
  arr.forEach(c=>{
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
}

/* Build Firestore query */
function buildQuery(pageSize = PAGE_SIZE, directionSnapshot = null){
  const colRef = collection(db, "blogs");
  const clauses = [];

  // category filter
  if(activeCategory){
    clauses.push(where("category", "==", activeCategory));
  }

  // search: prefix search on title using >= and <= (case-sensitive to Firestore collation)
  if(activeSearch){
    const term = activeSearch.trim();
    const end = term + '\uf8ff';
    clauses.push(where("title", ">=", term));
    clauses.push(where("title", "<=", end));
  }

  // base query
  // Firestore requires orderBy on same field when using range filters; we always order by createdAt desc
  // If using title range filters, Firestore requires orderBy('title') first — but mixing order can complicate.
  // To keep predictable results: if searching by title we order by title then createdAt.
  if(activeSearch){
    const q = query(colRef, ...clauses, orderBy("title"), orderBy("createdAt", "desc"), limit(pageSize));
    if(directionSnapshot) return query(q, startAfter(directionSnapshot));
    return q;
  } else {
    const q = query(colRef, ...clauses, orderBy("createdAt", "desc"), limit(pageSize));
    if(directionSnapshot) return query(q, startAfter(directionSnapshot));
    return q;
  }
}

/* Load a page */
async function loadPage(next = true){
  // When going forward, use current lastVisible as startAfter; when backward, use last entry from prevStack
  try {
    postsGrid.innerHTML = `<div class="empty">Loading…</div>`;
    const directionSnapshot = next ? lastVisible : (prevStack.length ? prevStack.pop() : null);

    const q = buildQuery(PAGE_SIZE, directionSnapshot);
    const snap = await getDocs(q);

    // update prevStack for Back navigation: if moving forward we push the previous lastVisible
    if(next){
      if(lastVisible) prevStack.push(lastVisible);
    }

    // update lastVisible with last document of this batch
    lastVisible = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;

    // Render
    if(!snap.docs.length){
      postsGrid.innerHTML = `<div class="empty">No posts found.</div>`;
    } else {
      postsGrid.innerHTML = snap.docs.map(d => renderCard({ id: d.id, ...d.data() })).join("");
    }

    // update pagination UI
    prevBtn.disabled = prevStack.length === 0;
    nextBtn.disabled = snap.docs.length < PAGE_SIZE;
    pageInfo.textContent = `Page ${currentPage}`;
  } catch (err) {
    console.error(err);
    postsGrid.innerHTML = `<div class="empty">Error loading posts.</div>`;
  }
}

/* Wire controls */
function wireControls(){
  // search (debounced)
  let debounce;
  searchInput.addEventListener("input", e => {
    clearTimeout(debounce);
    debounce = setTimeout(()=>{
      activeSearch = searchInput.value.trim();
      // reset paging
      currentPage = 1;
      lastVisible = null;
      prevStack = [];
      loadPage(true);
    }, 350);
  });

  categoryFilter.addEventListener("change", () => {
    activeCategory = categoryFilter.value;
    currentPage = 1;
    lastVisible = null;
    prevStack = [];
    loadPage(true);
  });

  document.getElementById("clearFilters").addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    activeSearch = "";
    activeCategory = "";
    currentPage = 1;
    lastVisible = null;
    prevStack = [];
    loadPage(true);
  });

  nextBtn.addEventListener("click", () => {
    // advance
    if(nextBtn.disabled) return;
    currentPage++;
    loadPage(true);
  });

  prevBtn.addEventListener("click", async () => {
    if(prevBtn.disabled) return;
    // going back: we popped one snapshot earlier in loadPage() when next=false, but here we will:
    // set lastVisible to the snapshot at top of prevStack (we already use prevStack in loadPage when next=false)
    currentPage = Math.max(1, currentPage - 1);
    // To fetch previous page we need to create a query that starts after the snapshot before current page.
    // Simpler approach: reset and fetch pages up to (currentPage) repeatedly.
    // We'll implement a safe method: fetch pages from start up to desired page (costly but simple).
    // Reset and fetch pages up to currentPage.
    lastVisible = null;
    prevStack = [];
    for (let i = 1; i < currentPage; i++){
      // advance through pages to set lastVisible
      const q = buildQuery(PAGE_SIZE, null);
      const snap = await getDocs(q);
      if (!snap.docs.length) break;
      lastVisible = snap.docs[snap.docs.length - 1];
      // set startAfter for next iteration
      // create a query starting after lastVisible
      const q2 = buildQuery(PAGE_SIZE, lastVisible);
      // use q2 next loop
    }
    // now load the target page
    await loadPage(true);
  });
}

/* Init */
async function init(){
  await loadCategories();
  wireControls();
  // initial load
  await loadPage(true);
}

document.addEventListener("DOMContentLoaded", init);
