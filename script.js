// -------------------- MOBILE MENU TOGGLE --------------------
const menuToggle = document.querySelector(".menu-toggle");
const navbarMenu = document.querySelector(".navbar-menu");

menuToggle.addEventListener("click", () => {
  navbarMenu.classList.toggle("active");
  menuToggle.classList.toggle("open");
});

// -------------------- HERO FADE-IN ANIMATION --------------------
const fadeEls = document.querySelectorAll(".fade-in");

const fadeInObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.3 }
);

fadeEls.forEach((el) => fadeInObserver.observe(el));

// -------------------- FLOATING HERO IMAGE ANIMATION --------------------
// Already handled via CSS `.floating` class with keyframes

// -------------------- TESTIMONIALS SLIDER --------------------
const testimonialSlider = document.querySelector(".testimonials-slider");
let testimonialIndex = 0;
const testimonialItems = document.querySelectorAll(".testimonial-item");

function showTestimonial(index) {
  testimonialItems.forEach((item, i) => {
    item.style.display = i === index ? "block" : "none";
  });
}

showTestimonial(testimonialIndex);

setInterval(() => {
  testimonialIndex++;
  if (testimonialIndex >= testimonialItems.length) testimonialIndex = 0;
  showTestimonial(testimonialIndex);
}, 5000); // change every 5s

// -------------------- BLOG SLIDER --------------------
const blogsSlider = document.querySelector(".blogs-slider");
const prevBtn = document.querySelector(".slider-arrow.prev");
const nextBtn = document.querySelector(".slider-arrow.next");

prevBtn.addEventListener("click", () => {
  blogsSlider.scrollBy({
    left: -300,
    behavior: "smooth",
  });
});

nextBtn.addEventListener("click", () => {
  blogsSlider.scrollBy({
    left: 300,
    behavior: "smooth",
  });
});

// -------------------- SMOOTH SCROLL FOR NAV LINKS --------------------
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const href = link.getAttribute("href");
    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});

// -------------------- STICKY NAVBAR SHADOW ON SCROLL --------------------
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// -------------------- ADD VISIBLE CLASS FOR ELEMENTS ON SCROLL --------------------
const scrollElements = document.querySelectorAll(".scroll-reveal");

const elementObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.2 }
);

scrollElements.forEach((el) => elementObserver.observe(el));
