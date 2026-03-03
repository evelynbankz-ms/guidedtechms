// scripts/form.js - Contact form submission with subject field

import { db } from "../admin/firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const form = document.getElementById('contactForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';

    try {
      // Get form data including subject
      const ticketData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim() || "",
        subject: form.subject.value.trim(),  // ✅ SUBJECT FIELD
        message: form.message.value.trim(),
        category: form.category?.value || "General",
        source: "contact-form",
        status: "open",
        unreadAdmin: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastMessagePreview: form.message.value.trim().slice(0, 120)
      };

      // Submit to Firestore
      await addDoc(collection(db, "tickets"), ticketData);

      // Success feedback
      submitBtn.innerHTML = '<span>✓ Sent!</span>';
      submitBtn.style.background = '#10b981';

      // Reset form
      form.reset();

      // Show success message (if you want to add one)
      alert('Thank you! Your ticket has been submitted. We\'ll get back to you soon.');

      // Reset button after 3 seconds
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);

    } catch (error) {
      console.error('Error submitting ticket:', error);
      
      // Error feedback
      submitBtn.innerHTML = '<span>✗ Failed</span>';
      submitBtn.style.background = '#ef4444';
      
      alert('Failed to submit ticket. Please try again or contact us directly at info@guidedtechms.com');

      // Reset button after 3 seconds
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    }
  });
}
