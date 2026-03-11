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
    m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])
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

// Mobile Menu — scoped with different variable names to avoid conflict with about.js
const careersMenuBtn = document.getElementById("menuToggle");
const careersMenu = document.getElementById("navbarMenu");
const careersOverlay = document.getElementById("navOverlay");
const careersCloseBtn = document.getElementById("mobileNavClose");

if (careersMenuBtn && careersMenu && careersOverlay) {

  const closeCareersMenu = () => {
    careersMenu.classList.remove("open");
    careersOverlay.classList.remove("show");
    document.body.style.overflow = "";
    document.querySelectorAll(".nav-item.open").forEach(i => i.classList.remove("open"));
    careersMenuBtn.setAttribute("aria-expanded", "false");
  };

  const openCareersMenu = () => {
    careersMenu.classList.add("open");
    careersOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
    careersMenuBtn.setAttribute("aria-expanded", "true");
  };

  careersMenuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = careersMenu.classList.contains("open");
    if (isOpen) closeCareersMenu();
    else openCareersMenu();
  });

  careersCloseBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeCareersMenu();
  });

  careersOverlay.addEventListener("click", (e) => {
    if (e.target === careersOverlay) closeCareersMenu();
  });

  careersMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  careersMenu.querySelectorAll(".nav-parent").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();

      const item = this.closest(".nav-item");
      if (!item) return;

      const wasOpen = item.classList.contains("open");

      careersMenu.querySelectorAll(".nav-item.open").forEach(i => {
        if (i !== item) i.classList.remove("open");
      });

      if (wasOpen) item.classList.remove("open");
      else item.classList.add("open");
    });
  });

  careersMenu.querySelectorAll(".nav-link:not(.nav-parent)").forEach(link => {
    link.addEventListener("click", () => {
      closeCareersMenu();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && careersMenu.classList.contains("open")) {
      closeCareersMenu();
    }
  });
}
