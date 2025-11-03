/* ------------------- NAVBAR TOGGLE ------------------- */
const menuToggle = document.querySelector('.menu-toggle');
const navbarMenu = document.querySelector('.navbar-menu');

menuToggle.addEventListener('click', () => {
  navbarMenu.classList.toggle('active');
  menuToggle.classList.toggle('active');
});

/* ------------------- FADE-IN ON SCROLL ------------------- */
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
  threshold: 0.2,
  rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('appear');
    appearOnScroll.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach(fader => {
  appearOnScroll.observe(fader);
});

/* ------------------- SLIDERS ------------------- */

// Helper function for slider navigation
function sliderNav(sliderContainer, prevBtn, nextBtn) {
  const slider = document.querySelector(sliderContainer);
  const prev = document.querySelector(prevBtn);
  const next = document.querySelector(nextBtn);

  if (!slider) return;

  let scrollAmount = 0;
  const slideWidth = slider.querySelector(':first-child').offsetWidth + 20; // 20px gap

  next.addEventListener('click', () => {
    slider.scrollBy({ left: slideWidth, behavior: 'smooth' });
  });

  prev.addEventListener('click', () => {
    slider.scrollBy({ left: -slideWidth, behavior: 'smooth' });
  });
}

// Initialize sliders
sliderNav('.testimonials-slider', '.testimonials-slider .prev', '.testimonials-slider .next');
sliderNav('.blogs-slider', '.blogs-slider .prev', '.blogs-slider .next');

/* ------------------- FLOATING HERO IMAGES ------------------- */
const heroMain = document.querySelector('.hero-main-img');
const heroSecondary = document.querySelector('.hero-secondary-img');

let angle = 0;
function floatingAnimation() {
  angle += 0.01;
  if (heroMain) heroMain.style.transform = `translateY(${Math.sin(angle) * 10}px)`;
  if (heroSecondary) heroSecondary.style.transform = `translateY(${Math.cos(angle) * 10}px)`;
  requestAnimationFrame(floatingAnimation);
}
floatingAnimation();

/* ------------------- AUTO UPDATE YEAR ------------------- */
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ------------------- OPTIONAL: SMOOTH SCROLL FOR NAV LINKS ------------------- */
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').replace('#', '');
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
