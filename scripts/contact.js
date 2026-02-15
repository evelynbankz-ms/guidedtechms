// scripts/contact.js
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
      const name     = form.name.value.trim();
      const email    = form.email.value.trim();
      const subject  = form.subject.value.trim();
      const category = form.category?.value || "General";
      const message  = form.message.value.trim();
      const now      = Date.now(); // plain number — matches tickets.js expectations

      // ── 1. Create the ticket document ─────────────────────────────────────
      // Fields aligned exactly with what tickets.js reads:
      //   status        → "open"  (tickets.js filters: open | pending | closed)
      //   lastMessageAt → number  (tickets.js orderBy uses this)
      //   lastMessagePreview → shown in ticket list
      //   unreadAdmin   → true   (shows orange dot in admin)
      //   createdAt     → number  (consistent; avoids Firestore Timestamp vs Date.now() type mismatch)
      const ticketRef = await addDoc(collection(db, "tickets"), {
        name,
        email,
        subject,
        category,
        status:              "open",
        source:              "contact-form",
        createdAt:           now,
        updatedAt:           now,
        lastMessageAt:       now,
        lastMessagePreview:  message.slice(0, 120),
        unreadAdmin:         true
      });

      // ── 2. Seed the customer's first message into ticket_messages ──────────
      // tickets.js#loadThread() queries this collection — without this entry
      // the thread always shows empty even though the ticket exists.
      await addDoc(collection(db, "ticket_messages"), {
        ticketId:    ticketRef.id,
        sender:      "user",
        senderName:  name,
        senderEmail: email,
        // Store as plain HTML so the admin bubble renders correctly
        bodyHtml:    `<p>${escapeHtml(message)}</p>`,
        createdAt:   now
      });

      form.reset();
      alert("Your message has been sent. Our team will get back to you shortly.");
    } catch (err) {
      console.error("Ticket submission error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});

// ── Utility: escape HTML so plain text is safe inside bodyHtml ─────────────
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}
