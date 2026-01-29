/* =========================================================
   DEFENSIVE HELPERS (keep at top)
========================================================= */
const safeQuery = (sel) => {
  try { return document.querySelector(sel); } catch { return null; }
};
const safeQueryAll = (sel) => {
  try { return Array.from(document.querySelectorAll(sel)); } catch { return []; }
};

/* =========================================================
   COMMON DOM REFS (prevents "not defined" errors)
========================================================= */
const navbarEl = safeQuery(".navbar");

/* =========================================================
   FIREBASE INITIALIZATION (SAFE)
   - Prevents your whole JS file from crashing if firebase isn't loaded
========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyBGrI8TxZcXvAUQZK-neEmxs35qF0bxW_4",
  authDomain: "guided-tech-website.firebaseapp.com",
  projectId: "guided-tech-website",
  storageBucket: "guided-tech-website.firebasestorage.app",
  messagingSenderId: "1052298913208",
  appId: "1:1052298913208:web:81b09ad4bc38ddfe3f5b4d",
  measurementId: "G-YCVR31S6ME"
};

let db = null;

try {
  if (window.firebase) {
    // avoid double-init
    if (firebase.apps && !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    if (firebase.firestore) {
      db = firebase.firestore();
    }
  }
} catch (err) {
  console.warn("Firebase init failed (site UI will still work):", err);
}

/* =========================================================
   DOM READY
========================================================= */
document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     HERO FADE-IN
  ========================================================= */
  const fadeEls = safeQueryAll(".fade-in");
  if (fadeEls.length) {
    const fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add("visible"));
    }, { threshold: 0.25 });

    fadeEls.forEach(el => fadeObserver.observe(el));
  }

  /* =========================================================
     STICKY NAVBAR SHADOW
  ========================================================= */
  if (navbarEl) {
    window.addEventListener("scroll", () => {
      navbarEl.classList.toggle("scrolled", window.scrollY > 30);
    });
  }

  /* =========================================================
     TESTIMONIALS – BLOCK 1
  ========================================================= */
  const testimonialSlider = safeQuery(".testimonials-slider");
  const testimonialItems = safeQueryAll(".testimonial-item");

  if (testimonialSlider && testimonialItems.length) {
    let tIndex = 0;
    testimonialItems.forEach((el, i) => el.classList.toggle("active", i === 0));

    const nextTestimonial = () => {
      testimonialItems[tIndex].classList.remove("active");
      tIndex = (tIndex + 1) % testimonialItems.length;
      testimonialItems[tIndex].classList.add("active");
    };

    let tInterval = setInterval(nextTestimonial, 5000);
    testimonialSlider.addEventListener("mouseenter", () => clearInterval(tInterval));
    testimonialSlider.addEventListener("mouseleave", () => tInterval = setInterval(nextTestimonial, 5000));
  }

  /* =========================================================
     BLOG SLIDER (UI)
  ========================================================= */
  const blogsSlider = safeQuery(".blogs-slider");
  const prevBlogBtn = safeQuery(".slider-arrow.prev");
  const nextBlogBtn = safeQuery(".slider-arrow.next");

  if (blogsSlider) {
    let scrollAmount = 0;
    const step = Math.min(320, Math.round(blogsSlider.clientWidth * 0.8));

    prevBlogBtn?.addEventListener("click", () => {
      scrollAmount = Math.max(0, scrollAmount - step);
      blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
    });

    nextBlogBtn?.addEventListener("click", () => {
      scrollAmount = Math.min(
        blogsSlider.scrollWidth - blogsSlider.clientWidth,
        scrollAmount + step
      );
      blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
    });

    let auto = setInterval(() => {
      scrollAmount += step;
      if (scrollAmount > blogsSlider.scrollWidth - blogsSlider.clientWidth) {
        scrollAmount = 0;
      }
      blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }, 5000);

    blogsSlider.addEventListener("mouseenter", () => clearInterval(auto));
    blogsSlider.addEventListener("mouseleave", () => {
      auto = setInterval(() => {
        scrollAmount += step;
        if (scrollAmount > blogsSlider.scrollWidth - blogsSlider.clientWidth) scrollAmount = 0;
        blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
      }, 5000);
    });
  }

  /* =========================================================
     FIRESTORE BLOG LOADER (HOME PAGE)
  ========================================================= */
  (async function loadBlogsFromFirestore() {
    if (!blogsSlider || !db) return;

    try {
      const snap = await db
        .collection("blogs")
        .orderBy("createdAt", "desc")
        .limit(4)
        .get();

      if (snap.empty) return;

      blogsSlider.innerHTML = "";

      snap.forEach(doc => {
        const b = doc.data();
        const card = document.createElement("div");
        card.className = "blog-card";
        card.innerHTML = `
          <img src="${b.image || ""}" alt="">
          <div class="blog-content">
            <h3>${b.title || ""}</h3>
            <p>${b.excerpt || ""}</p>
            <a href="/blog/${doc.id}">Read more</a>
          </div>
        `;
        blogsSlider.appendChild(card);
      });

    } catch (e) {
      console.error("Firestore blog error:", e);
    }
  })();

  /* =========================================================
     SMOOTH SCROLL (only for # links)
     - FIXED: Exclude nav-parent dropdown triggers
  ========================================================= */
  const navbarMenuEl = safeQuery(".navbar-menu");

  safeQueryAll(".nav-link:not(.nav-parent)").forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      e.preventDefault();
      const target = safeQuery(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }

      // close mobile menu if open
      navbarMenuEl?.classList.remove("open");
      document.getElementById("navOverlay")?.classList.remove("show");
      document.body.style.overflow = "";
    });
  });

  /* =========================================================
     SCROLL REVEAL
  ========================================================= */
  const revealEls = safeQueryAll(".scroll-reveal");
  if (revealEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add("visible"));
    }, { threshold: 0.18 });

    revealEls.forEach(el => obs.observe(el));
  }

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
     TESTIMONIALS – BLOCK 2
  ========================================================= */
  const testimonials2 = safeQueryAll(".testimonial-item");
  const navPrevBtn = safeQuery(".nav-btn.prev");
  const navNextBtn = safeQuery(".nav-btn.next");

  let index2 = 0;
  let interval2;

  function showTestimonial2(i) {
    testimonials2.forEach((el, idx) => el.classList.toggle("active", idx === i));
  }

  function startAuto2() {
    if (!testimonials2.length) return;
    interval2 = setInterval(() => {
      index2 = (index2 + 1) % testimonials2.length;
      showTestimonial2(index2);
    }, 6000);
  }

  navNextBtn?.addEventListener("click", () => {
    if (!testimonials2.length) return;
    index2 = (index2 + 1) % testimonials2.length;
    showTestimonial2(index2);
  });

  navPrevBtn?.addEventListener("click", () => {
    if (!testimonials2.length) return;
    index2 = (index2 - 1 + testimonials2.length) % testimonials2.length;
    showTestimonial2(index2);
  });

  if (testimonials2.length) {
    showTestimonial2(index2);
    startAuto2();
  }

  /* =========================================================
     FOOTER YEAR
  ========================================================= */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

   
/* =========================================================
     MOBILE MENU - FINAL WORKING VERSION
  ========================================================= */
  const btn = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".navbar-menu");
  const overlay = document.getElementById("navOverlay");

  if (btn && menu && overlay) {

    // Toggle menu
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains("open");
      
      if (isOpen) {
        menu.classList.remove("open");
        overlay.classList.remove("show");
        document.body.style.overflow = "";
      } else {
        menu.classList.add("open");
        overlay.classList.add("show");
        document.body.style.overflow = "hidden";
      }
    });

    // Close on overlay click
    overlay.addEventListener("click", () => {
      menu.classList.remove("open");
      overlay.classList.remove("show");
      document.body.style.overflow = "";
      document.querySelectorAll(".nav-item.open").forEach(i => i.classList.remove("open"));
    });

    // Close button (click on ::after pseudo-element area)
    menu.addEventListener("click", (e) => {
      const rect = menu.getBoundingClientRect();
      const clickX = e.clientX;
      const clickY = e.clientY;
      
      // Top-right corner detection (where ::after button is)
      const isCloseButton = clickX > rect.right - 80 && clickY < rect.top + 80;
      
      if (isCloseButton) {
        menu.classList.remove("open");
        overlay.classList.remove("show");
        document.body.style.overflow = "";
        e.stopPropagation();
      }
    });

    // Dropdown toggles
    menu.querySelectorAll(".nav-parent").forEach(link => {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const item = this.closest(".nav-item");
        const wasOpen = item.classList.contains("open");
        
        // Close all others
        menu.querySelectorAll(".nav-item.open").forEach(i => {
          if (i !== item) i.classList.remove("open");
        });
        
        // Toggle this one
        if (wasOpen) {
          item.classList.remove("open");
        } else {
          item.classList.add("open");
        }
      });
    });

    // Regular links close menu
    menu.querySelectorAll(".nav-link:not(.nav-parent)").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        overlay.classList.remove("show");
        document.body.style.overflow = "";
      });
    });

    // ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        overlay.classList.remove("show");
        document.body.style.overflow = "";
      }
    });
  }
