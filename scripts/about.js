// document.addEventListener("DOMContentLoaded", () => {
//   const hero = document.querySelector(".about-hero-content");
//   window.addEventListener("scroll", () => {
//     const scroll = window.scrollY;
//     hero.style.transform = `translateY(${scroll * 0.15}px)`;
//     hero.style.opacity = `${1 - scroll / 400}`;
//   });
// });

// const tabs = document.querySelectorAll(".tab-btn");
// const contents = document.querySelectorAll(".tab-content");

// tabs.forEach(tab => {
//   tab.addEventListener("click", () => {
//     // deactivate all tabs
//     tabs.forEach(t => t.classList.remove("active"));
//     contents.forEach(c => c.classList.remove("active"));

//     // activate clicked tab
//     tab.classList.add("active");
//     document.getElementById(tab.dataset.tab).classList.add("active");
//   });
// });



// // why choose us section
//   const buttons = document.querySelectorAll(".feature-item");
//   const title = document.getElementById("chooseTitle");
//   const text = document.getElementById("chooseText");

//   buttons.forEach(btn => {
//     btn.addEventListener("click", () => {
//       buttons.forEach(b => b.classList.remove("active"));
//       btn.classList.add("active");

//       title.textContent = btn.dataset.title;
//       text.textContent = btn.dataset.text;
//     });
//   });

//   // activate first by default
//   buttons[0].classList.add("active");



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
});
