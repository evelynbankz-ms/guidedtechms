// blog.js

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
let prevSnapshots = [];

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
  } catch {
    return "";
  }
}

/* ==========================================
   CARD RENDERER (Homepage Layout)
========================================== */
function renderCard(post) {
  const img = post.imageUrl
    ? `background-image:url('${post.imageUrl}')`
    : "";

  const tagsHtml = post.category
    ? `<span class="blog-tag">${escapeHtml(post.category)}</span>`
    : "";

  const excerpt = post.excerpt
    ? escapeHtml(post.excerpt).slice(0, 150)
    : "";

  const url = `post.html?slug=${encodeURIComponent(post.slug || "")}`;

  return `
    <article class="blog-card">

      <div class="blog-image" style="${img}"></div>

      <div class="card-body">

        <div class="blog-tags">${tagsHtml}</div>

        <div class="title">${escapeHtml(post.title || "")}</div>

        <div class="excerpt">${excerpt}</div>

        <a class="read-more" href="${url}">Read →</a>

      </div>
    </article>
  `;
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
   FIRESTORE QUERY BUILDER (CASE-INSENSITIVE)
========================================== */
function buildQuery(startAfterSnapshot = null) {
  const colRef = collection(db, "blogs");
  let constraints = [];

  /* Category filter */
  if (activeCategory) {
    constraints.push(where("category", "==", activeCategory));
  }

  /* Case-insensitive title search */
if (activeSearch) {
    const term = activeSearch.trim().toLowerCase();
    const end = term + "\uf8ff";

    constraints.push(where("titleLower", ">=", term));
    constraints.push(where("titleLower", "<=", end));

    // Only one orderBy allowed for this type of range search
    constraints.push(orderBy("titleLower"));
} else {
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
  postsGrid.innerHTML = `<div class="empty">Loading…</div>`;

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
    postsGrid.innerHTML = `<div class="empty">No posts found.</div>`;
    return;
  }

  lastVisible = snap.docs[snap.docs.length - 1];

  postsGrid.innerHTML = snap.docs
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

  categoryFilter.addEventListener("change", () => {
    activeCategory = categoryFilter.value;
    resetPagination();
  });

  document.getElementById("clearFilters").addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    activeSearch = "";
    activeCategory = "";
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
async function init() {
  await loadCategories();
  wireControls();
  await loadPage(true);
}

document.addEventListener("DOMContentLoaded", init);



document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Page JS loaded:", window.location.pathname);

  // =====================================================
  // NAVBAR MENU — SCOPED PER NAVBAR (FIXES WRONG-ELEMENT BINDING)
  // =====================================================
  const navbars = Array.from(document.querySelectorAll(".navbar"));

  if (!navbars.length) {
    console.warn("⚠️ No .navbar found on this page");
    return;
  }

  navbars.forEach((navbar, index) => {
    // find elements INSIDE this navbar only
    const btn = navbar.querySelector("#menuToggle, .menu-toggle");
    const menu = navbar.querySelector("#navbarMenu, .navbar-menu");

    // overlay is usually OUTSIDE navbar, so find it by id first:
    const overlay =
      document.getElementById("navOverlay") ||
      document.querySelector(".nav-overlay");

    const closeBtn =
      menu?.querySelector("#mobileNavClose, .mobile-nav-close") || null;

    if (!btn || !menu || !overlay || !closeBtn) {
      console.error(`❌ Navbar[${index}] missing parts:`, {
        menuToggle: !!btn,
        navbarMenu: !!menu,
        navOverlay: !!overlay,
        mobileNavClose: !!closeBtn,
      });
      return;
    }

    // --- helpers
    const closeMenu = () => {
      menu.classList.remove("open");
      overlay.classList.remove("show");
      document.body.style.overflow = "";
      menu.querySelectorAll(".nav-item.open").forEach((i) => i.classList.remove("open"));
      btn.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      menu.classList.add("open");
      overlay.classList.add("show");
      document.body.style.overflow = "hidden";
      btn.setAttribute("aria-expanded", "true");
    };

    // --- IMPORTANT: ensure button click always works (even if something tries to block)
    btn.style.pointerEvents = "auto";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🍔 hamburger clicked (navbar index):", index);

      menu.classList.contains("open") ? closeMenu() : openMenu();
    });

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });

    // clicking outside menu closes
    overlay.addEventListener("click", (e) => {
      // if user clicked overlay itself (not menu)
      if (e.target === overlay) closeMenu();
    });

    // clicking inside menu shouldn't close
    menu.addEventListener("click", (e) => e.stopPropagation());

    // dropdown parents toggle
    menu.querySelectorAll(".nav-parent").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const item = this.closest(".nav-item");
        if (!item) return;

        const wasOpen = item.classList.contains("open");

        // close others
        menu.querySelectorAll(".nav-item.open").forEach((i) => {
          if (i !== item) i.classList.remove("open");
        });

        item.classList.toggle("open", !wasOpen);
      });
    });

    // normal links close menu
    menu.querySelectorAll(".nav-link:not(.nav-parent)").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    // escape closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
    });

    console.log(`✅ Navbar[${index}] initialized OK`);
  });



  // =========================================================
  // ✅ DEFENSIVE HELPERS (YOUR PAGE LOGIC)
  // =========================================================
  const safeQuery = (sel) => {
    try {
      return document.querySelector(sel);
    } catch {
      return null;
    }
  };

  const safeQueryAll = (sel) => {
    try {
      return Array.from(document.querySelectorAll(sel));
    } catch {
      return [];
    }
  };

  const navbarEl = safeQuery(".navbar");


  // =========================================================
  // STICKY NAVBAR SHADOW
  // =========================================================
  if (navbarEl) {
    window.addEventListener("scroll", () => {
      navbarEl.classList.toggle("scrolled", window.scrollY > 30);
    });
  }

  // =========================================================
  // SMOOTH SCROLL (only for # links)
  // =========================================================
  const navbarMenuEl = safeQuery(".navbar-menu");

  safeQueryAll(".nav-link:not(.nav-parent)").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      e.preventDefault();
      const target = safeQuery(href);
      if (target) target.scrollIntoView({ behavior: "smooth" });

      navbarMenuEl?.classList.remove("open");
      document.getElementById("navOverlay")?.classList.remove("show");
      document.body.style.overflow = "";
    });
  });

  // =========================================================
  // SCROLL REVEAL
  // =========================================================
  const revealEls = safeQueryAll(".scroll-reveal");
  if (revealEls.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible"));
      },
      { threshold: 0.18 }
    );

    revealEls.forEach((el) => obs.observe(el));
  }

   // =========================================================
  // FEATURE SWITCHER (only runs if feature-content exists)
  // =========================================================
  const featureContents = safeQueryAll(".feature-content");
  if (featureContents.length) {
    safeQueryAll(".feature-item").forEach((item) => {
      item.addEventListener("click", () => {
        safeQueryAll(".feature-item").forEach((i) => i.classList.remove("active"));
        featureContents.forEach((c) => c.classList.remove("active"));

        item.classList.add("active");
        const target = document.getElementById(item.dataset.feature);
        if (target) target.classList.add("active");
      });
    });
  }

  
