import { db } from "../admin/firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button[type=submit]");
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = "Submitting…";

    try {
      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        category: form.category?.value || "General",
        message: form.message.value.trim(),

        status: "new",              // new | open | resolved
        source: "contact-form",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, "tickets"), data);

      form.reset();

      alert("Your message has been sent. Our team will get back to you shortly.");

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});
