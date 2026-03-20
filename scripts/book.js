/* ============================================================
   book.js
   JavaScript for book.html — mobile navbar only.
   Save this file as: scripts/book.js
============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ── Year ── */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ── Mobile navbar ── */
  const menuToggle     = document.getElementById("menuToggle");
  const navbarMenu     = document.getElementById("navbarMenu");
  const navOverlay     = document.getElementById("navOverlay");
  const mobileNavClose = document.getElementById("mobileNavClose");

  function openMenu() {
    navbarMenu.classList.add("open");
    navOverlay.classList.add("show");
    document.body.classList.add("no-scroll");
    menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    navbarMenu.classList.remove("open");
    navOverlay.classList.remove("show");
    document.body.classList.remove("no-scroll");
    menuToggle.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("open"));
  }

  menuToggle.addEventListener("click", () =>
    navbarMenu.classList.contains("open") ? closeMenu() : openMenu()
  );

  mobileNavClose.addEventListener("click", closeMenu);
  navOverlay.addEventListener("click", closeMenu);

  /* ── Mobile dropdown accordions ── */
  document.querySelectorAll(".nav-parent").forEach(link => {
    link.addEventListener("click", function (e) {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const navItem = this.closest(".nav-item");
        const wasOpen = navItem.classList.contains("open");
        document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("open"));
        if (!wasOpen) navItem.classList.add("open");
      }
    });
  });

});
