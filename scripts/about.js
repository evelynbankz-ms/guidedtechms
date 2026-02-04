document.addEventListener("DOMContentLoaded", () => {
  // HERO PARALLAX (safe guard)
  const hero = document.querySelector(".about-hero-content");
  if (hero) {
    window.addEventListener("scroll", () => {
      const scroll = window.scrollY;
      hero.style.transform = `translateY(${scroll * 0.15}px)`;
      hero.style.opacity = `${1 - scroll / 400}`;
    });
  }

  /**
   * ✅ Scoped tabs initializer
   * This prevents clicks in one section from hiding content in another section.
   */
  function initTabs(sectionSelector) {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    const tabs = section.querySelectorAll(".tab-btn");
    const contents = section.querySelectorAll(".tab-content");
    if (!tabs.length || !contents.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Only remove active INSIDE this section
        tabs.forEach((t) => t.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");

        const targetId = tab.dataset.tab;
        const target = section.querySelector(`#${targetId}`);
        if (target) target.classList.add("active");
      });
    });
  }

  // ✅ Initialize tabs separately for both sections
  initTabs("#about-mission");     // WHAT WE ARE section
  initTabs(".who-we-serve");      // WHO WE SERVE section

  // WHY CHOOSE US section (your existing logic, wrapped safely)
  const buttons = document.querySelectorAll(".feature-item");
  const title = document.getElementById("chooseTitle");
  const text = document.getElementById("chooseText");

  if (buttons.length && title && text) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        title.textContent = btn.dataset.title;
        text.textContent = btn.dataset.text;
      });
    });

    // activate first by default
    buttons[0].classList.add("active");
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
     SMOOTH SCROLL (only for # links)
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
     FOOTER YEAR
  ========================================================= */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  

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
  
});
