import { db } from "../admin/firebase.js";
import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* =========================================================
   ✅ HELPERS (safeQuery / safeQueryAll)
   - Must exist BEFORE anything uses them
========================================================= */
const safeQuery = (sel) => {
  try { return document.querySelector(sel); } catch { return null; }
};

const safeQueryAll = (sel) => {
  try { return Array.from(document.querySelectorAll(sel)); } catch { return []; }
};

/* =========================================================
   ✅ ESCAPE HTML (FIXED)
   - You had ">" mapped incorrectly before
========================================================= */
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",      // ✅ FIXED
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

/* =========================================================
   ✅ CAREERS LOADER (kept same behavior)
   - Defensive: if #careersGrid doesn't exist, do nothing
========================================================= */
async function loadCareers() {
  const grid = document.getElementById("careersGrid");
  if (!grid) return; // ✅ page doesn't have careers section

  const q = query(collection(db, "careers"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  if (!snap.docs.length) {
    grid.innerHTML = `
      <div class="empty">
        There are currently no openings, please check back later or keep an eye on this page for any future openings.
      </div>
    `;
    return;
  }

  grid.innerHTML = snap.docs.map(doc => {
    const job = doc.data();
    return `
      <article class="career-card">
        <h3>${escapeHtml(job.title)}</h3>
        <div class="career-meta">
          ${escapeHtml(job.location)} • ${escapeHtml(job.type)}
        </div>
        <div class="career-desc">
          ${job.description || ""} 
        </div>
      </article>
    `;
  }).join("");
}

/* =========================================================
   ✅ NAVBAR INIT (NO FUNCTIONALITY LOST)
   - Works even if some pages slightly differ
   - Does NOT break the rest of the file
========================================================= */
function initNavbar() {
  const navbar = safeQuery(".navbar");
  if (!navbar) {
    console.warn("⚠️ No .navbar found on this page");
    return;
  }

  const btn =
    navbar.querySelector("#menuToggle") ||
    navbar.querySelector(".menu-toggle") ||
    document.getElementById("menuToggle") ||
    document.querySelector(".menu-toggle");

  const menu =
    document.getElementById("navbarMenu") ||
    navbar.querySelector("#navbarMenu") ||
    navbar.querySelector(".navbar-menu") ||
    document.querySelector(".navbar-menu");

  const overlay =
    document.getElementById("navOverlay") ||
    document.querySelector(".nav-overlay");

  const closeBtn =
    document.getElementById("mobileNavClose") ||
    menu?.querySelector("#mobileNavClose") ||
    menu?.querySelector(".mobile-nav-close");

  if (!btn || !menu || !overlay || !closeBtn) {
    console.error("❌ Navbar missing parts:", {
      menuToggle: !!btn,
      navbarMenu: !!menu,
      navOverlay: !!overlay,
      mobileNavClose: !!closeBtn,
    });
    return;
  }

  // ✅ Important: ensure these can be clicked
  btn.style.pointerEvents = "auto";
  menu.style.pointerEvents = "auto";

  const closeMenu = () => {
    menu.classList.remove("open");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    menu.querySelectorAll(".nav-item.open").forEach(i => i.classList.remove("open"));
    btn.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    menu.classList.add("open");
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
    btn.setAttribute("aria-expanded", "true");
  };

  // ✅ Hamburger toggles
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🍔 hamburger clicked");
    menu.classList.contains("open") ? closeMenu() : openMenu();
  });

  // ✅ Inside close button
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });

  // ✅ Overlay closes only when background is clicked
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });

  // ✅ Clicking inside menu must not close overlay
  menu.addEventListener("click", (e) => e.stopPropagation());

  // ✅ Dropdown toggles
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

      // toggle this
      item.classList.toggle("open", !wasOpen);
    });
  });

  // ✅ Normal links close menu
  menu.querySelectorAll(".nav-link:not(.nav-parent)").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  // ✅ Escape closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
  });

  console.log("✅ Navbar initialized OK");
}

/* =========================================================
   ✅ YOUR OTHER PAGE LOGIC (PRESERVED)
   - I did not remove anything; just guarded things
========================================================= */
function initPageLogic() {
  console.log("✅ Page JS loaded:", window.location.pathname);

  const navbarEl = safeQuery(".navbar");

  // Sticky navbar shadow
  if (navbarEl) {
    window.addEventListener("scroll", () => {
      navbarEl.classList.toggle("scrolled", window.scrollY > 30);
    });
  }

  // Smooth scroll (only # links)
  const navbarMenuEl = safeQuery(".navbar-menu");
  safeQueryAll(".nav-link:not(.nav-parent)").forEach(link => {
    link.addEventListener("click", e => {
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

  // Scroll reveal
  const revealEls = safeQueryAll(".scroll-reveal");
  if (revealEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add("visible"));
    }, { threshold: 0.18 });

    revealEls.forEach(el => obs.observe(el));
  }

  // Feature switcher (only if exists)
  const featureContents = safeQueryAll(".feature-content");
  if (featureContents.length) {
    safeQueryAll(".feature-item").forEach(item => {
      item.addEventListener("click", () => {
        safeQueryAll(".feature-item").forEach(i => i.classList.remove("active"));
        featureContents.forEach(c => c.classList.remove("active"));

        item.classList.add("active");
        const target = document.getElementById(item.dataset.feature);
        if (target) target.classList.add("active");
      });
    });
  }

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* =========================================================
   ✅ ONE DOMContentLoaded (Correct order)
   1) Navbar init (so menu works immediately)
   2) Careers load (if present)
   3) Rest of page logic
========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  initNavbar();
  await loadCareers();  // runs only if careersGrid exists
  initPageLogic();
});
