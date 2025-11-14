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
    // simple open/close: show/hide nav on mobile
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

// HERO FADE-IN (IntersectionObserver)
const fadeEls = safeQueryAll(".fade-in");
if (fadeEls.length) {
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.25 });
  fadeEls.forEach(el => fadeInObserver.observe(el));
}

// STICKY NAVBAR SHADOW ON SCROLL
if (navbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
}

// TESTIMONIALS SLIDER (simple fade carousel)
const testimonialSlider = safeQuery(".testimonials-slider");
const testimonialItems = safeQueryAll(".testimonial-item");
if (testimonialSlider && testimonialItems.length) {
  let tIndex = 0;
  // initialize
  testimonialItems.forEach((it, i) => {
    if (i === 0) it.classList.add("active");
    else it.classList.remove("active");
  });
  const nextTestimonial = () => {
    testimonialItems[tIndex].classList.remove("active");
    tIndex = (tIndex + 1) % testimonialItems.length;
    testimonialItems[tIndex].classList.add("active");
  };
  let tInterval = setInterval(nextTestimonial, 5000);
  // pause on hover
  testimonialSlider.addEventListener("mouseenter", () => clearInterval(tInterval));
  testimonialSlider.addEventListener("mouseleave", () => tInterval = setInterval(nextTestimonial, 5000));
}

// BLOG SLIDER (scroll container with arrows)
const blogsSlider = safeQuery(".blogs-slider");
const prevBtn = safeQuery(".slider-arrow.prev");
const nextBtn = safeQuery(".slider-arrow.next");
if (blogsSlider && (prevBtn || nextBtn)) {
  let scrollAmount = 0;
  const step = Math.min(320, Math.round(blogsSlider.clientWidth * 0.8));
  if (prevBtn) prevBtn.addEventListener("click", () => {
    scrollAmount = Math.max(0, scrollAmount - step);
    blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });
  if (nextBtn) nextBtn.addEventListener("click", () => {
    scrollAmount = Math.min(blogsSlider.scrollWidth - blogsSlider.clientWidth, scrollAmount + step);
    blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });

  // Optional auto-scroll (pausable)
  let auto = setInterval(() => {
    scrollAmount += step;
    if (scrollAmount > blogsSlider.scrollWidth - blogsSlider.clientWidth) scrollAmount = 0;
    blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
  }, 5000);
  blogsSlider.addEventListener("mouseenter", () => clearInterval(auto));
  blogsSlider.addEventListener("mouseleave", () => auto = setInterval(() => {
    scrollAmount += step;
    if (scrollAmount > blogsSlider.scrollWidth - blogsSlider.clientWidth) scrollAmount = 0;
    blogsSlider.scrollTo({ left: scrollAmount, behavior: "smooth" });
  }, 5000));
}

// SMOOTH SCROLL FOR HASH LINKS (nav)
const navLinks = safeQueryAll(".nav-link");
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      // close mobile menu if open
      if (navbarMenu && navbarMenu.classList.contains("active")) {
        navbarMenu.classList.remove("active");
        // reset styles applied earlier
        navbarMenu.style.display = "";
        navbarMenu.style.position = "";
      }
    }
  });
});

// Scroll reveal for .scroll-reveal
const scrollEls = safeQueryAll(".scroll-reveal");
if (scrollEls.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add("visible"); });
  }, { threshold: 0.18 });
  scrollEls.forEach(el => obs.observe(el));
}

document.querySelectorAll('.feature-item').forEach(item => {
  item.addEventListener('click', () => {
    // Remove old active
    document.querySelectorAll('.feature-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.feature-content').forEach(c => c.classList.remove('active'));

    // Activate clicked
    item.classList.add('active');
    const id = item.dataset.feature;
    document.getElementById(id).classList.add('active');
  });
});


  const testimonials = document.querySelectorAll(".testimonial-item");
  const prevBtn = document.querySelector(".nav-btn.prev");
  const nextBtn = document.querySelector(".nav-btn.next");
  let index = 0;
  let interval;

  function showTestimonial(i) {
    testimonials.forEach((item, idx) => {
      item.classList.toggle("active", idx === i);
    });
  }

  function nextSlide() {
    index = (index + 1) % testimonials.length;
    showTestimonial(index);
  }

  function prevSlide() {
    index = (index - 1 + testimonials.length) % testimonials.length;
    showTestimonial(index);
  }

  function startAutoSlide() {
    interval = setInterval(nextSlide, 6000);
  }

  function stopAutoSlide() {
    clearInterval(interval);
  }

  nextBtn.addEventListener("click", () => {
    nextSlide();
    stopAutoSlide();
    startAutoSlide();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    stopAutoSlide();
    startAutoSlide();
  });

  showTestimonial(index);
  startAutoSlide();


// Auto year
document.getElementById("year").textContent = new Date().getFullYear();

// Blog scroll arrows
document.querySelector('.slider-arrow.next')?.addEventListener('click', () => {
  document.querySelector('.blogs-slider').scrollBy({ left: 350, behavior: 'smooth' });
});
document.querySelector('.slider-arrow.prev')?.addEventListener('click', () => {
  document.querySelector('.blogs-slider').scrollBy({ left: -350, behavior: 'smooth' });
});

// Placeholder for auto-loading future blog posts from /blog page
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
    console.warn('No blog page found yet — using default posts.');
  }
})();

document.querySelectorAll(".feature-item").forEach(item => {
  item.addEventListener("mouseenter", () => {
    item.querySelector(".arrow").style.transform = "translateX(4px)";
  });
  item.addEventListener("mouseleave", () => {
    item.querySelector(".arrow").style.transform = "translateX(0)";
  });
});

