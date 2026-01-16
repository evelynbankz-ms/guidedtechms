/* =========================================================
   FIREBASE INITIALIZATION (OFFICIAL v9 MODULE SDK)
========================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* -------------------------------
   YOUR FIREBASE CONFIG (AS PROVIDED)
-------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBGrI8TxZcXvAUQZK-neEmxs35qF0bxW_4",
  authDomain: "guided-tech-website.firebaseapp.com",
  projectId: "guided-tech-website",
  storageBucket: "guided-tech-website.firebasestorage.app",
  messagingSenderId: "1052298913208",
  appId: "1:1052298913208:web:81b09ad4bc38ddfe3f5b4d",
  measurementId: "G-YCVR31S6ME"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================================================
   SAFE QUERY HELPERS (PREVENT CRASHES)
========================================================= */
const safeQuery = (sel) => {
  try { return document.querySelector(sel); } catch { return null; }
};
const safeQueryAll = (sel) => {
  try { return Array.from(document.querySelectorAll(sel)); } catch { return []; }
};

/* =========================================================
   MOBILE MENU TOGGLE
========================================================= */
const menuToggle = safeQuery(".menu-toggle");
const navbarMenu = safeQuery(".navbar-menu");
const navbar = safeQuery(".navbar");

if (menuToggle && navbarMenu) {
  menuToggle.addEventListener("click", () => {
    navbarMenu.classList.toggle("active");
    menuToggle.classList.toggle("open");
  });
}

/* =========================================================
   HERO FADE-IN
========================================================= */
safeQueryAll(".fade-in").forEach(el => {
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) el.classList.add("visible");
  }, { threshold: 0.25 }).observe(el);
});

/* =========================================================
   STICKY NAVBAR SHADOW
========================================================= */
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  });
}

/* =========================================================
   TESTIMONIALS (FIRST BLOCK)
========================================================= */
const testimonialItems = safeQueryAll(".testimonial-item");
let testimonialIndex = 0;

if (testimonialItems.length) {
  testimonialItems[0].classList.add("active");

  setInterval(() => {
    testimonialItems[testimonialIndex].classList.remove("active");
    testimonialIndex = (testimonialIndex + 1) % testimonialItems.length;
    testimonialItems[testimonialIndex].classList.add("active");
  }, 5000);
}

/* =========================================================
   BLOG SLIDER CONTROLS
========================================================= */
const blogsSlider = safeQuery(".blogs-slider");
const prevBlogBtn = safeQuery(".slider-arrow.prev");
const nextBlogBtn = safeQuery(".slider-arrow.next");

if (blogsSlider && prevBlogBtn && nextBlogBtn) {
  prevBlogBtn.addEventListener("click", () => {
    blogsSlider.scrollBy({ left: -350, behavior: "smooth" });
  });
  nextBlogBtn.addEventListener("click", () => {
    blogsSlider.scrollBy({ left: 350, behavior: "smooth" });
  });
}

/* =========================================================
   LOAD LATEST BLOG POSTS FROM FIRESTORE
   Collection: blog
========================================================= */
async function loadLatestBlogs() {
  if (!blogsSlider) return;

  try {
    const q = query(
      collection(db, "blog"),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const snap = await getDocs(q);
    if (snap.empty) return;

    blogsSlider.innerHTML = "";

    snap.forEach(doc => {
      const post = doc.data();

      const card = document.createElement("article");
      card.className = "blog-card";

      card.innerHTML = `
        <div class="blog-image" style="background-image:url('${post.coverImage || ""}')"></div>
        <div class="blog-content">
          <div class="blog-tags">
            ${(post.tags || []).map(tag => `<span>${tag}</span>`).join("")}
          </div>
          <h3>${post.title || ""}</h3>
          <p>${post.excerpt || ""}</p>
        </div>
      `;

      blogsSlider.appendChild(card);
    });

  } catch (err) {
    console.warn("Failed to load blogs:", err);
  }
}

loadLatestBlogs();

/* =========================================================
   FEATURE SWITCHER
========================================================= */
safeQueryAll(".feature-item").forEach(item => {
  item.addEventListener("click", () => {
    safeQueryAll(".feature-item").forEach(i => i.classList.remove("active"));
    safeQueryAll(".feature-content").forEach(c => c.classList.remove("active"));

    item.classList.add("active");
    document.getElementById(item.dataset.feature)?.classList.add("active");
  });
});

/* =========================================================
   SMOOTH SCROLL (NON-DROPDOWN LINKS)
========================================================= */
safeQueryAll(".nav-link:not(.dropdown-toggle)").forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* =========================================================
   DROPDOWN NAV FIX
========================================================= */
safeQueryAll(".dropdown-toggle").forEach(toggle => {
  toggle.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    toggle.closest(".nav-item")?.classList.toggle("open");
  });
});

document.addEventListener("click", e => {
  if (!e.target.closest(".nav-item")) {
    safeQueryAll(".nav-item.open").forEach(item => item.classList.remove("open"));
  }
});

/* =========================================================
   AUTO YEAR
========================================================= */
const yearEl = safeQuery("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
