document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".about-hero-content");
  window.addEventListener("scroll", () => {
    const scroll = window.scrollY;
    hero.style.transform = `translateY(${scroll * 0.15}px)`;
    hero.style.opacity = `${1 - scroll / 400}`;
  });
});

const tabs = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // deactivate all tabs
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    // activate clicked tab
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});



// why choose us section
  const buttons = document.querySelectorAll(".feature-item");
  const title = document.getElementById("chooseTitle");
  const text = document.getElementById("chooseText");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      title.textContent = btn.dataset.title;
      text.textContent = btn.dataset.text;
    });
  });

  // activate first by default
  buttons[0].classList.add("active");
