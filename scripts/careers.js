import { db } from "../admin/firebase.js";
import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const grid = document.getElementById("careersGrid");

function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g,
    m => ({"&":"&amp;","<":"&lt;","&gt;":"&gt;","\"":"&quot;","'":"&#39;"}[m])
  );
}

async function loadCareers(){
  const q = query(collection(db, "careers"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  if(!snap.docs.length){
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

document.addEventListener("DOMContentLoaded", loadCareers);

// mobile menu 
const btn = document.getElementById("menuToggle");
const menu = document.getElementById("navbarMenu");
const overlay = document.getElementById("navOverlay");
const closeBtn = document.getElementById("mobileNavClose");

if (btn && menu && overlay) {

  const closeMenu = () => {
    menu.classList.remove("open");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    document.querySelectorAll(".nav-item.open").forEach(i => i.classList.remove("open"));
    btn.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    menu.classList.add("open");
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
    btn.setAttribute("aria-expanded", "true");
  };

  // Hamburger toggles open/close
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = menu.classList.contains("open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Close button closes
  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });

  // ✅ FIX: only close if the actual overlay backdrop was clicked
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });

  // Clicking inside menu should NOT close overlay
  menu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Dropdown toggles for nav parents
  menu.querySelectorAll(".nav-parent").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();

      const item = this.closest(".nav-item");
      if (!item) return;

      const wasOpen = item.classList.contains("open");

      menu.querySelectorAll(".nav-item.open").forEach(i => {
        if (i !== item) i.classList.remove("open");
      });

      if (wasOpen) item.classList.remove("open");
      else item.classList.add("open");
    });
  });

  // Close when clicking normal links
  menu.querySelectorAll(".nav-link:not(.nav-parent)").forEach(link => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  // Escape key closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      closeMenu();
    }
  });
}
