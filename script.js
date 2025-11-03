// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.navbar-menu');

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Testimonials slider (basic)
const testimonialItems = document.querySelectorAll('.testimonial-item');
let currentTestimonial = 0;

function showTestimonial(index) {
  testimonialItems.forEach((item, i) => {
    item.style.display = i === index ? 'block' : 'none';
  });
}
showTestimonial(currentTestimonial);
setInterval(() => {
  currentTestimonial = (currentTestimonial + 1) % testimonialItems.length;
  showTestimonial(currentTestimonial);
}, 5000);

// Blog slider
const prevBtn = document.querySelector('.slider-arrow.prev');
const nextBtn = document.querySelector('.slider-arrow.next');
const sliderTrack = document.querySelector('.slider-track');

prevBtn.addEventListener('click', () => {
  sliderTrack.scrollBy({ left: -300, behavior: 'smooth' });
});
nextBtn.addEventListener('click', () => {
  sliderTrack.scrollBy({ left: 300, behavior: 'smooth' });
});
