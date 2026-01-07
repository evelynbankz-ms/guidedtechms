import { db } from "../admin/firebase.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const form = document.getElementById("contactForm");

if (!form) {
  console.error("Contact form not found");
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ticket = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    message: form.message.value.trim(),
    status: "open",
    source: "contact-form",
    createdAt: Date.now()
  };

  try {
    await addDoc(collection(db, "tickets"), ticket);
    alert("Your message has been sent successfully.");
    form.reset();
  } catch (err) {
    console.error("Error saving ticket:", err);
    alert("Failed to submit message. Please try again.");
  }
});
