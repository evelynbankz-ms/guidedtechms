// Defensive helper
const safeQuery = (sel) => {
  try { return document.querySelector(sel); } catch(e){ return null; }
};
const safeQueryAll = (sel) => {
  try { return Array.from(document.querySelectorAll(sel)); } catch(e){ return []; }
};


// MOBILE MENU TOGGLE
const menuToggle = safeQuery(".menu-toggle");
const navbarMenu = safeQuery(".navbar-menu");
const navbar = safeQuery(".navbar");

if (menuToggle && navbarMenu) {
  menuToggle.addEventListener("click", () => {
    navbarMenu.classList.toggle("active");
    menuToggle.classList.toggle("open");

    if (navbarMenu.classList.contains("active")) {
      navbarMenu.style.display = "flex";
      navbarMenu.style.flexDirection = "column";
      navbarMenu.style.position = "absolute";
      navbarMenu.style.top = "78px";
      navbarMenu.style.left = "0";
      navbarMenu.style.right = "0";
      navbarMenu.style.background = "#fff";
      navbarMenu.style.padding = "18px 24px";
      navbarMenu.style.boxShadow = "var(--shadow-1)";
    } else {
      navbarMenu.style.display = "";
      navbarMenu.style.position = "";
      navbarMenu.style.top = "";
      navbarMenu.style.left = "";
      navbarMenu.style.right = "";
      navbarMenu.style.padding = "";
      navbarMenu.style.boxShadow = "";
      navbarMenu.style.flexDirection = "";
      navbarMenu.style.background = "";
    }
  });
}


// HERO FADE-IN
const fadeEls = safeQueryAll(".fade-in");
if (fadeEls.length) {
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.25 });
  fadeEls.forEach(el => fadeInObserver.observe(el));
}


// STICKY NAVBAR SHADOW
if (navbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
}


// TESTIMONIALS (FIRST BLOCK)
const testimonialSlider = safeQuery(".testimonials-slider");
const testimonialItems = safeQueryAll(".testimonial-item");

if (testimonialSlider && testimonialItems.length) {
  let tIndex = 0;

  testimonialItems.forEach((it, i) => {
    it.classList.toggle("active", i === 0);
  });

  const nextTestimonial = () => {
    testimonialItems[tIndex].classList.remove("active");
    tIndex = (tIndex + 1) % testimonialItems.length;
    testimonialItems[tIndex].classList.add("active");
  };

  let tInterval = setInterval(nextTestimonial, 5000);

  testimonialSlider.addEventListener("mouseenter", () => clearInterval(tInterval));
  testimonialSlider.addEventListener("mouseleave", () => tInterval = setInterval(nextTestimonial, 5000));
}


// BLOG SLIDER
const blogsSlider = safeQuery(".blogs-slider");
const prevBlogBtn = safeQuery(".slider-arrow.prev");
const nextBlogBtn = safeQuery(".slider-arrow.next");

if (blogsSlider && (prevBlogBtn || nextBlogBtn)) {
  let scrollAmount = 0;
  const step = Math.min(320, Math.round(blogsSlider.clientWidth * 0.8));

  if (prevBlogBtn) prevBlogBtn.addEventListener("click", () => {
    scrollAmount = Math.max(0, scrollAmount - step);
    blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });

  if (nextBlogBtn) nextBlogBtn.addEventListener("click", () => {
    scrollAmount = Math.min(blogsSlider.scrollWidth - blogsSlider.clientWidth, scrollAmount + step);
    blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });

  let auto = setInterval(() => {
    scrollAmount += step;
    if (scrollAmount > blogsSlider.scrollWidth - blogsSlider.clientWidth) scrollAmount = 0;
    blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
  }, 5000);

  blogsSlider.addEventListener("mouseenter", () => clearInterval(auto));
  blogsSlider.addEventListener("mouseleave", () =>
    auto = setInterval(() => {
      scrollAmount += step;
      if (scrollAmount > blogsSlider.scrollWidth - blogsSlider.clientWidth) scrollAmount = 0;
      blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }, 5000)
  );
}


// SMOOTH SCROLL (EXCLUDES DROPDOWNS)
const navLinks = safeQueryAll(".nav-link:not(.dropdown-toggle)");
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior:"smooth", block:"start" });

      if (navbarMenu && navbarMenu.classList.contains("active")) {
        navbarMenu.classList.remove("active");
        navbarMenu.style.display = "";
        navbarMenu.style.position = "";
      }
    }
  });
});


// SCROLL REVEAL
const scrollEls = safeQueryAll(".scroll-reveal");
if (scrollEls.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) en.target.classList.add("visible");
    });
  }, { threshold: 0.18 });
  scrollEls.forEach(el => obs.observe(el));
}

// FEATURE SWITCHER
document.querySelectorAll('.feature-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.feature-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.feature-content').forEach(c => c.classList.remove('active'));

    item.classList.add('active');
    const id = item.dataset.feature;
    document.getElementById(id).classList.add('active');
  });
});


// TESTIMONIALS 2nd BLOCK (renamed vars to avoid conflicts!)
const testimonials2 = document.querySelectorAll(".testimonial-item");
const navPrevBtn = document.querySelector(".nav-btn.prev");
const navNextBtn = document.querySelector(".nav-btn.next");
let index2 = 0;
let interval2;

function showTestimonial2(i) {
  testimonials2.forEach((item, idx) => {
    item.classList.toggle("active", idx === i);
  });
}

function nextSlide2() {
  index2 = (index2 + 1) % testimonials2.length;
  showTestimonial2(index2);
}

function prevSlide2() {
  index2 = (index2 - 1 + testimonials2.length) % testimonials2.length;
  showTestimonial2(index2);
}

function startAutoSlide2() {
  interval2 = setInterval(nextSlide2, 6000);
}

function stopAutoSlide2() {
  clearInterval(interval2);
}

if (navNextBtn) {
  navNextBtn.addEventListener("click", () => {
    nextSlide2();
    stopAutoSlide2();
    startAutoSlide2();
  });
}
if (navPrevBtn) {
  navPrevBtn.addEventListener("click", () => {
    prevSlide2();
    stopAutoSlide2();
    startAutoSlide2();
  });
}

showTestimonial2(index2);
startAutoSlide2();

// AUTO YEAR
document.getElementById("year").textContent = new Date().getFullYear();

// BLOG ARROWS
document.querySelector('.slider-arrow.next')?.addEventListener('click', () => {
  document.querySelector('.blogs-slider').scrollBy({ left: 350, behavior: 'smooth' });
});
document.querySelector('.slider-arrow.prev')?.addEventListener('click', () => {
  document.querySelector('.blogs-slider').scrollBy({ left: -350, behavior: 'smooth' });
});

// BLOG LOADER
(async function pullFromBlogPage() {
  const slider = document.querySelector('.blogs-slider');
  if (!slider) return;

  try {
    const res = await fetch('/blog');
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const blogCards = Array.from(doc.querySelectorAll('.blog-card')).slice(0, 4);

    if (blogCards.length) {
      slider.innerHTML = '';
      blogCards.forEach(card => slider.appendChild(card.cloneNode(true)));
    }
  } catch (err) {
    console.warn('No blog page found — using default posts.');
  }
})();


// ---------------------------
// FINAL FIXED DROPDOWN LOGIC
// ---------------------------
document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const parent = toggle.closest(".nav-item");

    document.querySelectorAll(".nav-item.open").forEach(item => {
      if (item !== parent) item.classList.remove("open");
    });

    parent.classList.toggle("open");
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-item")) {
    document.querySelectorAll(".nav-item.open").forEach(item =>
      item.classList.remove("open")
    );
  }
});


const menuToggle = document.getElementById("menuToggle");
const navbarMenu = document.getElementById("navbarMenu");

menuToggle.addEventListener("click", () => {
  navbarMenu.classList.toggle("open");
});

document.querySelectorAll(".nav-item > .nav-link").forEach(link => {
  link.addEventListener("click", () => {
    link.parentElement.classList.toggle("open");
  });
});

