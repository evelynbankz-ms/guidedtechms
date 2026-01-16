import { db } from "/firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ====================================================
   DEFENSIVE HELPERS
==================================================== */
const safeQuery = (sel) => {
  try { return document.querySelector(sel); } catch { return null; }
};
const safeQueryAll = (sel) => {
  try { return Array.from(document.querySelectorAll(sel)); } catch { return []; }
};

/* ====================================================
   MOBILE MENU
==================================================== */
const menuToggle = safeQuery(".menu-toggle");
const navbarMenu = safeQuery(".navbar-menu");
const navbar = safeQuery(".navbar");

if (menuToggle && navbarMenu) {
  menuToggle.addEventListener("click", () => {
    navbarMenu.classList.toggle("active");
    menuToggle.classList.toggle("open");

    if (navbarMenu.classList.contains("active")) {
      Object.assign(navbarMenu.style, {
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        top: "78px",
        left: "0",
        right: "0",
        background: "#fff",
        padding: "18px 24px",
        boxShadow: "var(--shadow-1)"
      });
    } else {
      navbarMenu.removeAttribute("style");
    }
  });
}

/* ====================================================
   HERO FADE-IN
==================================================== */
const fadeEls = safeQueryAll(".fade-in");
if (fadeEls.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add("visible"));
  }, { threshold: 0.25 });

  fadeEls.forEach(el => obs.observe(el));
}

/* ====================================================
   STICKY NAV SHADOW
==================================================== */
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  });
}

/* ====================================================
   TESTIMONIALS (BLOCK 1)
==================================================== */
const testimonialSlider = safeQuery(".testimonials-slider");
const testimonialItems = safeQueryAll(".testimonial-item");

if (testimonialSlider && testimonialItems.length) {
  let i = 0;
  testimonialItems[0].classList.add("active");

  const next = () => {
    testimonialItems[i].classList.remove("active");
    i = (i + 1) % testimonialItems.length;
    testimonialItems[i].classList.add("active");
  };

  let auto = setInterval(next, 5000);
  testimonialSlider.onmouseenter = () => clearInterval(auto);
  testimonialSlider.onmouseleave = () => auto = setInterval(next, 5000);
}

/* ====================================================
   BLOG SLIDER CONTROLS
==================================================== */
const blogsSlider = safeQuery(".blogs-slider");
const prevBlogBtn = safeQuery(".slider-arrow.prev");
const nextBlogBtn = safeQuery(".slider-arrow.next");

if (blogsSlider) {
  let scrollX = 0;
  const step = Math.min(320, Math.round(blogsSlider.clientWidth * 0.8));

  prevBlogBtn?.addEventListener("click", () => {
    scrollX = Math.max(0, scrollX - step);
    blogsSlider.scrollTo({ left: scrollX, behavior: "smooth" });
  });

  nextBlogBtn?.addEventListener("click", () => {
    scrollX = Math.min(
      blogsSlider.scrollWidth - blogsSlider.clientWidth,
      scrollX + step
    );
    blogsSlider.scrollTo({ left: scrollX, behavior: "smooth" });
  });
}

/* ====================================================
   ✅ FIRESTORE BLOG LOADER (FIXED)
==================================================== */
(async function loadLatestBlogs() {
  const slider = safeQuery(".blogs-slider");
  if (!slider) return;

  try {
    const q = query(
      collection(db, "blog"),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const snap = await getDocs(q);
    if (snap.empty) return;

    slider.innerHTML = "";

    snap.forEach(d => {
      const b = d.data();

      const card = document.createElement("article");
      card.className = "blog-card";

      card.innerHTML = `
        <div class="blog-image"
             style="background-image:url('${b.imageUrl || ""}')"></div>
        <div class="blog-content">
          <div class="blog-tags">
            ${(b.tags || []).map(t => `<span>${t}</span>`).join("")}
          </div>
          <h3>${b.title}</h3>
          <p>${b.excerpt || ""}</p>
          <a href="/blog/${b.slug}" class="read-more">Read more</a>
        </div>
      `;

      slider.appendChild(card);
    });

  } catch (err) {
    console.warn("Blog load failed:", err);
  }
})();

/* ====================================================
   SMOOTH SCROLL
==================================================== */
safeQueryAll(".nav-link:not(.dropdown-toggle)").forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (!href?.startsWith("#")) return;

    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    navbarMenu?.classList.remove("active");
  });
});

/* ====================================================
   SCROLL REVEAL
==================================================== */
const revealEls = safeQueryAll(".scroll-reveal");
if (revealEls.length) {
  const obs = new IntersectionObserver(e =>
    e.forEach(x => x.isIntersecting && x.target.classList.add("visible")),
    { threshold: 0.18 }
  );
  revealEls.forEach(el => obs.observe(el));
}

/* ====================================================
   FEATURE SWITCHER
==================================================== */
document.querySelectorAll(".feature-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".feature-item, .feature-content")
      .forEach(el => el.classList.remove("active"));

    item.classList.add("active");
    document.getElementById(item.dataset.feature)?.classList.add("active");
  });
});

/* ====================================================
   TESTIMONIALS (BLOCK 2)
==================================================== */
const t2 = document.querySelectorAll(".testimonial-item");
let t2i = 0;
setInterval(() => {
  t2.forEach((el, i) => el.classList.toggle("active", i === t2i));
  t2i = (t2i + 1) % t2.length;
}, 6000);

/* ====================================================
   FOOTER YEAR
==================================================== */
safeQuery("#year").textContent = new Date().getFullYear();

/* ====================================================
   DROPDOWNS
==================================================== */
document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
  toggle.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    toggle.closest(".nav-item")?.classList.toggle("open");
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".nav-item.open")
    .forEach(i => i.classList.remove("open"));
});
