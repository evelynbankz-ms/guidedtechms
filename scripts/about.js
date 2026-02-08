// =====================================================
// ✅ FULL PAGE JS (COPY + PASTE ALL)
// - Navbar mobile menu works
// - Dropdowns open
// - Overlay click closes ONLY when clicking outside menu
// - Links work
// - Your About page logic included
// =====================================================

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
  // HERO PARALLAX (safe guard)
  // =========================================================
  const hero = safeQuery(".about-hero-content");
  if (hero) {
    window.addEventListener("scroll", () => {
      const scroll = window.scrollY;
      hero.style.transform = `translateY(${scroll * 0.15}px)`;
      hero.style.opacity = `${1 - scroll / 400}`;
    });
  }

  // =========================================================
  // ✅ Scoped tabs initializer
  // =========================================================
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

  // =========================================================
  // WHY CHOOSE US
  // =========================================================
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

  // =========================================================
  // FOOTER YEAR
  // =========================================================
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
