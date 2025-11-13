document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".about-hero-content");
  window.addEventListener("scroll", () => {
    const scroll = window.scrollY;
    hero.style.transform = `translateY(${scroll * 0.15}px)`;
    hero.style.opacity = `${1 - scroll / 400}`;
  });
});
