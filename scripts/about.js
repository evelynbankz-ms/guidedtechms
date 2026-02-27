// =====================================================
// ✅ FULL PAGE JS — ABOUT PAGE
// - Navbar mobile menu works
// - Dropdowns open
// - Overlay click closes ONLY when clicking outside menu
// - Links work
// - Scroll behind overlay is LOCKED (mobile-safe, iOS-safe)
// - Sticky navbar shadow (desktop + mobile)
// - About page logic included
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Page JS loaded:", window.location.pathname);

  // =====================================================
  // ✅ SCROLL LOCK (ROBUST: works on iOS + Android)
  // =====================================================
  let savedScrollY = 0;

  const lockScroll = () => {
    if (document.body.classList.contains("no-scroll")) return;
    savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add("no-scroll");
    document.body.style.top = `-${savedScrollY}px`;
  };

  const unlockScroll = () => {
    if (!document.body.classList.contains("no-scroll")) return;
    document.body.classList.remove("no-scroll");
    document.body.style.top = "";
    window.scrollTo(0, savedScrollY);
  };

  // =====================================================
  // NAVBAR MENU — SCOPED PER NAVBAR
  // =====================================================
  const navbars = Array.from(document.querySelectorAll(".navbar"));

  if (!navbars.length) {
    console.warn("⚠️ No .navbar found on this page");
    return;
  }

  // Escape closes (attach ONCE, not per-navbar)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    document.querySelectorAll(".navbar-menu.open").forEach((menuEl) => {
      menuEl.classList.remove("open");
    });
    document.querySelectorAll(".nav-overlay.show").forEach((ov) => {
      ov.classList.remove("show");
    });
    document.querySelectorAll(".navbar-menu .nav-item.open").forEach((i) => i.classList.remove("open"));

    unlockScroll();

    document.querySelectorAll("#menuToggle[aria-expanded='true'], .menu-toggle[aria-expanded='true']").forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
    });
  });

  navbars.forEach((navbar, index) => {
    const btn = navbar.querySelector("#menuToggle, .menu-toggle");
    const menu = navbar.querySelector("#navbarMenu, .navbar-menu");

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

    const closeMenu = () => {
      menu.classList.remove("open");
      overlay.classList.remove("show");
      unlockScroll();
      menu.querySelectorAll(".nav-item.open").forEach((i) => i.classList.remove("open"));
      btn.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      menu.classList.add("open");
      overlay.classList.add("show");
      lockScroll();
      btn.setAttribute("aria-expanded", "true");
    };

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

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeMenu();
    });

    menu.addEventListener("click", (e) => e.stopPropagation());

    menu.querySelectorAll(".nav-parent").forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const item = this.closest(".nav-item");
        if (!item) return;

        const wasOpen = item.classList.contains("open");

        menu.querySelectorAll(".nav-item.open").forEach((i) => {
          if (i !== item) i.classList.remove("open");
        });

        item.classList.toggle("open", !wasOpen);
      });
    });

    menu.querySelectorAll(".nav-link:not(.nav-parent)").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    console.log(`✅ Navbar[${index}] initialized OK`);
  });

  // =========================================================
  // ✅ DEFENSIVE HELPERS
  // =========================================================
  const safeQuery = (sel) => {
    try { return document.querySelector(sel); } catch { return null; }
  };

  const safeQueryAll = (sel) => {
    try { return Array.from(document.querySelectorAll(sel)); } catch { return []; }
  };

  // =========================================================
  // STICKY NAVBAR SHADOW (desktop + mobile)
  // =========================================================
  const navbarEl = safeQuery(".navbar");

  if (navbarEl) {
    window.addEventListener("scroll", () => {
      navbarEl.classList.toggle("scrolled", window.scrollY > 30);
    });
  }

  // =========================================================
  // HERO PARALLAX
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
  // SCOPED TABS INITIALIZER
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
  const chooseButtons = safeQueryAll(".feature-item");
  const title = document.getElementById("chooseTitle");
  const text = document.getElementById("chooseText");

  if (chooseButtons.length && title && text) {
    chooseButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        chooseButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        title.textContent = btn.dataset.title || "";
        text.textContent = btn.dataset.text || "";
      });
    });

    chooseButtons[0].classList.add("active");
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

      unlockScroll();
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

  // =====================================================
  // MOBILE HISTORY SECTION REORDERING
  // =====================================================
  function reorderHistoryOnMobile() {
    const historyGrid = document.querySelector(".history-grid");
    const historyLeft = document.querySelector(".history-left");
    const historyRight = document.querySelector(".history-right");

    if (!historyGrid || !historyLeft || !historyRight) return;

    if (window.innerWidth <= 767) {
      const imageClone = historyRight.cloneNode(true);

      if (historyRight.parentNode === historyGrid) {
        historyRight.style.display = "none";
      }

      const existingClone = historyLeft.querySelector(".history-right");
      if (!existingClone) {
        historyLeft.insertBefore(imageClone, historyLeft.firstChild);
        console.log("✅ History image inserted beside text (mobile)");
      }
    } else {
      const clonedImage = historyLeft.querySelector(".history-right");
      if (clonedImage) clonedImage.remove();
      if (historyRight) historyRight.style.display = "";
      console.log("✅ History restored to desktop layout");
    }
  }

  reorderHistoryOnMobile();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reorderHistoryOnMobile, 250);
  });

  // =========================================================
  // FOOTER YEAR
  // =========================================================
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
