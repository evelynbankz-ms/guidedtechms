import { db } from "../admin/firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const form = document.getElementById("contactForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const now = Date.now();

    // ✅ 1) Create Ticket (container)
    const ticketRef = await addDoc(collection(db, "tickets"), {
      subject: "Website Contact", // TODO: optionally add subject input on the form
      name,
      email,
      phone,
      status: "open",
      source: "contact-form",
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: message.slice(0, 120),
      unreadAdmin: true
    });

    // ✅ 2) Add first message into the thread
    await addDoc(collection(db, "ticket_messages"), {
      ticketId: ticketRef.id,
      sender: "user",
      senderName: name,
      senderEmail: email,
      bodyHtml: `<p>${message.replace(/\n/g, "<br>")}</p>`,
      createdAt: now
    });

    alert("Your message has been sent successfully.");
    form.reset();
  } catch (err) {
    console.error("Error saving ticket:", err);
    alert("Failed to submit message. Please try again.");
  }
});
