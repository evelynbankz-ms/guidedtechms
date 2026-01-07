// scripts/contact.js
import { db } from "../admin/firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");

  if (!form) {
    console.error("❌ contactForm not found in DOM");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("✅ Contact form submit triggered");

    const btn = form.querySelector("button[type=submit]");
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = "Submitting…";

    try {
      const ticket = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        category: form.category?.value || "General",
        message: form.message.value.trim(),

        status: "new",
        source: "contact-form",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log("📨 Saving ticket:", ticket);

      await addDoc(collection(db, "tickets"), ticket);

      alert("Your message has been sent. Our team will get back to you shortly.");
      form.reset();

    } catch (err) {
      console.error("❌ Ticket submission failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});
