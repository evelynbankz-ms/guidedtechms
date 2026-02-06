// ===============================
// NAVBAR MOBILE MENU (BULLETPROOF)
// ===============================
(function initNavbarMenu() {
  // Make sure the script is actually executing
  console.log("✅ Navbar menu script loaded on:", window.location.pathname);

  const onReady = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };

  onReady(() => {
    // Prefer IDs, but fall back to class selectors
    const btn =
      document.getElementById("menuToggle") ||
      document.querySelector(".menu-toggle");

    const menu =
      document.getElementById("navbarMenu") ||
      document.querySelector(".navbar-menu");

    const overlay =
      document.getElementById("navOverlay") ||
      document.querySelector(".nav-overlay");

    const closeBtn =
      document.getElementById("mobileNavClose") ||
      document.querySelector(".mobile-nav-close");

    // Hard fail if missing
    if (!btn || !menu || !overlay || !closeBtn) {
      console.error("❌ Navbar elements missing:", {
        menuToggle: !!btn,
        navbarMenu: !!menu,
        navOverlay: !!overlay,
        mobileNavClose: !!closeBtn,
      });
      return;
    }

    // If something is blocking clicks on the button, this will tell us
    btn.addEventListener("click", () => console.log("🍔 hamburger clicked"));

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

    // Hamburger toggles menu
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.contains("open") ? closeMenu() : openMenu();
    });

    // Inside close button
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });

    // Only close if the actual overlay background is clicked
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeMenu();
    });

    // Clicking inside menu should not close
    menu.addEventListener("click", (e) => e.stopPropagation());

    // Dropdown toggles
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

        item.classList.toggle("open", !wasOpen);
      });
    });

    // Close when clicking normal links
    menu.querySelectorAll(".nav-link:not(.nav-parent)").forEach(link => {
      link.addEventListener("click", () => closeMenu());
    });

    // Escape closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
    });

    console.log("✅ Navbar menu initialized OK");
  });
})();






document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     ✅ DEFENSIVE HELPERS (MUST EXIST ON EVERY PAGE JS)
  ========================================================= */
  const safeQuery = (sel) => {
    try { return document.querySelector(sel); } catch { return null; }
  };
  const safeQueryAll = (sel) => {
    try { return Array.from(document.querySelectorAll(sel)); } catch { return []; }
  };

  const navbarEl = safeQuery(".navbar");

  /* =========================================================
     HERO PARALLAX (safe guard)
  ========================================================= */
  const hero = safeQuery(".about-hero-content");
  if (hero) {
    window.addEventListener("scroll", () => {
      const scroll = window.scrollY;
      hero.style.transform = `translateY(${scroll * 0.15}px)`;
      hero.style.opacity = `${1 - scroll / 400}`;
    });
  }

  /* =========================================================
     ✅ Scoped tabs initializer
     This prevents clicks in one section from hiding content in another section.
  ========================================================= */
  function initTabs(sectionSelector) {
    const section = safeQuery(sectionSelector);
    if (!section) return;

    const tabs = section.querySelectorAll(".tab-btn");
    const contents = section.querySelectorAll(".tab-content");
    if (!tabs.length || !contents.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");

        const targetId = tab.dataset.tab;
        const target = section.querySelector(`#${targetId}`);
        if (target) target.classList.add("active");
      });
    });
  }

  initTabs("#about-mission");
  initTabs(".who-we-serve");

  /* =========================================================
     WHY CHOOSE US
  ========================================================= */
  const buttons = safeQueryAll(".feature-item");
  const title = document.getElementById("chooseTitle");
  const text = document.getElementById("chooseText");

  if (buttons.length && title && text) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        title.textContent = btn.dataset.title || "";
        text.textContent = btn.dataset.text || "";
      });
    });

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
      if (target) target.scrollIntoView({ behavior: "smooth" });

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
     FEATURE SWITCHER (only runs if feature-content exists)
  ========================================================= */
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

  /* =========================================================
     FOOTER YEAR
  ========================================================= */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

 
