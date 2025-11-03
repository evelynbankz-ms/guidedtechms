// -------------------- MOBILE MENU TOGGLE --------------------
const menuToggle = document.querySelector(".menu-toggle");
const navbarMenu = document.querySelector(".navbar-menu");

menuToggle.addEventListener("click", () => {
  navbarMenu.classList.toggle("active");
  menuToggle.classList.toggle("open");
});

// -------------------- HERO FADE-IN & FLOATING --------------------
const fadeEls = document.querySelectorAll(".fade-in");

const fadeInObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.3 }
);

fadeEls.forEach((el) => fadeInObserver.observe(el));

// Floating effect already handled via CSS animation keyframes on .floating

// -------------------- STICKY NAVBAR SHADOW --------------------
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// -------------------- TESTIMONIALS SLIDER --------------------
const testimonialSlider = document.querySelector(".testimonials-slider");
const testimonialItems = document.querySelectorAll(".testimonial-item");
let testimonialIndex = 0;

// Create dots
const testimonialDotsContainer = document.createElement("div");
testimonialDotsContainer.className = "testimonial-dots";
testimonialSlider.appendChild(testimonialDotsContainer);

testimonialItems.forEach((item, i) => {
  const dot = document.createElement("span");
  dot.className = "dot";
  if (i === 0) dot.classList.add("active");
  dot.addEventListener("click", () => {
    testimonialIndex = i;
    updateTestimonials();
    resetTestimonialInterval();
  });
  testimonialDotsContainer.appendChild(dot);
});

function updateTestimonials() {
  testimonialItems.forEach((item, i) => {
    item.style.opacity = i === testimonialIndex ? "1" : "0";
    item.style.transform = i === testimonialIndex ? "translateX(0)" : "translateX(100%)";
  });
  document.querySelectorAll(".testimonial-dots .dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === testimonialIndex);
  });
}

function nextTestimonial() {
  testimonialIndex = (testimonialIndex + 1) % testimonialItems.length;
  updateTestimonials();
}

let testimonialInterval = setInterval(nextTestimonial, 5000);
function resetTestimonialInterval() {
  clearInterval(testimonialInterval);
  testimonialInterval = setInterval(nextTestimonial, 5000);
}

updateTestimonials();

// -------------------- BLOG SLIDER --------------------
const blogsSlider = document.querySelector(".blogs-slider");
const prevBtn = document.querySelector(".slider-arrow.prev");
const nextBtn = document.querySelector(".slider-arrow.next");

let scrollAmount = 0;
const scrollStep = 320; // Adjust per card width

prevBtn.addEventListener("click", () => {
  scrollAmount = Math.max(scrollAmount - scrollStep, 0);
  blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
});

nextBtn.addEventListener("click", () => {
  scrollAmount = Math.min(scrollAmount + scrollStep, blogsSlider.scrollWidth - blogsSlider.clientWidth);
  blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
});

// Optional auto-scroll
let autoScrollInterval = setInterval(() => {
  scrollAmount += scrollStep;
  if (scrollAmount > blogsSlider.scrollWidth - blogsSlider.clientWidth) scrollAmount = 0;
  blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
}, 5000);

// Pause on hover
blogsSlider.addEventListener("mouseenter", () => clearInterval(autoScrollInterval));
blogsSlider.addEventListener("mouseleave", () => {
  autoScrollInterval = setInterval(() => {
    scrollAmount += scrollStep;
    if (scrollAmount > blogsSlider.scrollWidth - blogsSlider.clientWidth) scrollAmount = 0;
    blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
  }, 5000);
});

// -------------------- SMOOTH SCROLL FOR NAV LINKS --------------------
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const href = link.getAttribute("href");
    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// -------------------- SCROLL REVEAL FOR OTHER ELEMENTS --------------------
const scrollElements = document.querySelectorAll(".scroll-reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.2 }
);

scrollElements.forEach((el) => revealObserver.observe(el));
