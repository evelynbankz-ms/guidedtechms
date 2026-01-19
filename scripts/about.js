
document.addEventListener("DOMContentLoaded", () => {

  // HERO PARALLAX (safe-guard so it doesn't crash if not present)
  const hero = document.querySelector(".about-hero-content");
  if (hero) {
    window.addEventListener("scroll", () => {
      const scroll = window.scrollY;
      hero.style.transform = `translateY(${scroll * 0.15}px)`;
      hero.style.opacity = `${1 - scroll / 400}`;
    });
  }

  // ✅ Scoped Tabs: each .tabs-block works independently
  document.querySelectorAll(".tabs-block").forEach((block) => {
    const tabs = block.querySelectorAll(".tab-btn");
    const contents = block.querySelectorAll(".tab-content");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");

        const targetId = tab.dataset.tab;
        const targetEl = block.querySelector(`#${targetId}`);
        if (targetEl) targetEl.classList.add("active");
      });
    });
  });

  // WHY CHOOSE US section
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
