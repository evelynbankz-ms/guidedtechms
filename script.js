// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.navbar-menu');

menuToggle && menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  menuToggle.classList.toggle('open');
});

// Scroll reveal animations
const revealEls = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-main-img, .impact-heading, .about-title, .features-header, .pricing-title');
const revealOnScroll = () => {
  const triggerPoint = window.innerHeight * 0.85;
  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      el.classList.add('is-visible');
    }
  });
};
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Testimonial slider (auto)
const testimonialItems = document.querySelectorAll('.testimonial-item');
let testIndex = 0;
const showTestimonial = idx => {
  testimonialItems.forEach((item,i) => item.style.display = i === idx ? 'block' : 'none');
};
if (testimonialItems.length) {
  showTestimonial(testIndex);
  setInterval(() => {
    testIndex = (testIndex + 1) % testimonialItems.length;
    showTestimonial(testIndex);
  }, 5000);
}

// Blog slider nav
const track = document.querySelector('.slider-track');
const prevBtn = document.querySelector('.slider-arrow.prev');
const nextBtn = document.querySelector('.slider-arrow.next');
if (track && prevBtn && nextBtn) {
  const slideWidth = track.querySelector('.blog-card').offsetWidth + 24;
  let position = 0;
  nextBtn.addEventListener('click', () => {
    position = Math.max(position - slideWidth, -(track.scrollWidth - track.clientWidth));
    track.style.transform = `translateX(${position}px)`;
  });
  prevBtn.addEventListener('click', () => {
    position = Math.min(position + slideWidth, 0);
    track.style.transform = `translateX(${position}px)`;
  });
  let startX = null;
  track.addEventListener('touchstart', e => startX = e.touches[0].clientX);
  track.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) nextBtn.click();
    if (endX - startX > 50) prevBtn.click();
  });
}

// Footer year update
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
