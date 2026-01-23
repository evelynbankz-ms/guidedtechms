// admin/tickets.js
import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ----------------------------------------------------
   🔧 REQUIRED PLACEHOLDERS (FILL THESE IN)
---------------------------------------------------- */
/**
 * After you deploy Firebase Functions, you’ll get a URL like:
 * https://us-central1-YOUR_PROJECT.cloudfunctions.net/sendAdminTicketEmail
 */
const SEND_REPLY_FUNCTION_URL =
  "PASTE_YOUR_sendAdminTicketEmail_FUNCTION_URL_HERE";

/**
 * Must match: firebase functions:config:set sendgrid.inbound_secret="..."
 * This protects the function from random public calls.
 */
const ADMIN_SECRET = "PASTE_THE_SAME_RANDOM_SECRET_HERE";

/* ----------------------------------------------------
   DOM
---------------------------------------------------- */
const ticketList = document.getElementById("ticketList");

const ticketEmpty = document.getElementById("ticketEmpty");
const ticketHeader = document.getElementById("ticketHeader");
const ticketSubject = document.getElementById("ticketSubject");
const ticketMeta = document.getElementById("ticketMeta");
const ticketStatus = document.getElementById("ticketStatus");

const ticketThread = document.getElementById("ticketThread");
const ticketReplyBox = document.getElementById("ticketReplyBox");

const sendReplyBtn = document.getElementById("sendReplyBtn");
const closeBtn = document.getElementById("closeTicketBtn");

const statusFilter = document.getElementById("statusFilter");

const statTotal = document.getElementById("statTotal");
const statOpen = document.getElementById("statOpen");
const statPending = document.getElementById("statPending");
const statClosed = document.getElementById("statClosed");

let currentTicketId = null;
let currentTicketData = null;

/* ----------------------------------------------------
   HELPERS
---------------------------------------------------- */
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

function stripHtml(s) {
  return String(s || "").replace(/<[^>]*>/g, "").trim();
}

function formatDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function isQuillEmpty(html) {
  const v = (html || "").trim();
  return !v || v === "<p><br></p>" || v === "<div><br></div>";
}

function showEmptyState() {
  if (ticketEmpty) ticketEmpty.style.display = "block";
  if (ticketHeader) ticketHeader.style.display = "none";
  if (ticketThread) ticketThread.style.display = "none";
  if (ticketReplyBox) ticketReplyBox.style.display = "none";
}

/* ----------------------------------------------------
   LOAD TICKETS LIST + STATS
---------------------------------------------------- */
async function loadTickets() {
  let q = query(collection(db, "tickets"), orderBy("lastMessageAt", "desc"));

  if (statusFilter?.value) {
    q = query(
      collection(db, "tickets"),
      where("status", "==", statusFilter.value),
      orderBy("lastMessageAt", "desc")
    );
  }

  const snap = await getDocs(q);

  if (ticketList) ticketList.innerHTML = "";
  const stats = { total: 0, open: 0, pending: 0, closed: 0 };

  snap.forEach((d) => {
    const t = d.data() || {};
    const status = (t.status || "open").toLowerCase();

    stats.total++;
    if (stats[status] !== undefined) stats[status]++;

    const item = document.createElement("div");
    item.className = "ticket-item";
    item.dataset.id = d.id;

    const unreadDot = t.unreadAdmin
      ? `<span style="width:8px;height:8px;background:#e67e22;border-radius:50%;display:inline-block;margin-right:8px"></span>`
      : "";

    item.innerHTML = `
      <div class="subject">${unreadDot}${escapeHtml(t.subject || "Support Ticket")}</div>
      <div class="small">${escapeHtml(t.email || "No email")}</div>
      <div class="small" style="opacity:0.8">${escapeHtml(t.lastMessagePreview || "")}</div>
      <span class="badge ${status}">${escapeHtml(status)}</span>
    `;

    item.addEventListener("click", () => openTicket(d.id));
    ticketList?.appendChild(item);
  });

  if (statTotal) statTotal.textContent = stats.total;
  if (statOpen) statOpen.textContent = stats.open;
  if (statPending) statPending.textContent = stats.pending;
  if (statClosed) statClosed.textContent = stats.closed;

  if (!currentTicketId) showEmptyState();
}

/* ----------------------------------------------------
   LOAD THREAD (Zendesk-style: unified messages)
---------------------------------------------------- */
async function loadThread(ticketId) {
  if (!ticketThread) return;
  ticketThread.innerHTML = "";

  const snap = await getDocs(
    query(
      collection(db, "ticket_messages"),
      where("ticketId", "==", ticketId),
      orderBy("createdAt", "asc")
    )
  );

  if (!snap.docs.length) {
    ticketThread.innerHTML = `<div class="empty">No messages yet.</div>`;
    return;
  }

  snap.forEach((d) => {
    const m = d.data() || {};
    const sender = m.sender === "admin" ? "admin" : "user";

    ticketThread.innerHTML += `
      <div class="thread-message ${sender}">
        <div class="meta">
          <strong>${escapeHtml(m.senderName || (sender === "admin" ? "Admin" : "Customer"))}</strong>
          <span>${formatDate(m.createdAt)}</span>
        </div>
        <div class="bubble">
          ${m.bodyHtml || ""}
        </div>
      </div>
    `;
  });

  ticketThread.scrollTop = ticketThread.scrollHeight;
}

/* ----------------------------------------------------
   OPEN TICKET
---------------------------------------------------- */
async function openTicket(ticketId) {
  currentTicketId = ticketId;

  // Highlight selected ticket
  document.querySelectorAll(".ticket-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === ticketId);
  });

  const ticketRef = doc(db, "tickets", ticketId);
  const snap = await getDoc(ticketRef);

  if (!snap.exists()) {
    showEmptyState();
    return;
  }

  currentTicketData = snap.data() || {};

  // Show ticket UI
  if (ticketEmpty) ticketEmpty.style.display = "none";
  if (ticketHeader) ticketHeader.style.display = "block";
  if (ticketThread) ticketThread.style.display = "block";
  if (ticketReplyBox) ticketReplyBox.style.display = "block";

  // Init Quill editor (your tickets.html defines window.initTicketQuill)
  if (window.initTicketQuill) window.initTicketQuill();

  // Fill header
  if (ticketSubject) ticketSubject.textContent = currentTicketData.subject || "Support Ticket";
  if (ticketMeta) {
    ticketMeta.textContent = `${currentTicketData.name || "Anonymous"} • ${
      currentTicketData.email || "No email"
    } • ${formatDate(currentTicketData.createdAt)}`;
  }

  if (ticketStatus) ticketStatus.value = (currentTicketData.status || "open").toLowerCase();

  // Mark as read in admin
  await updateDoc(doc(db, "tickets", ticketId), {
    unreadAdmin: false
  });

  // Load full thread
  await loadThread(ticketId);

  // Clear editor
  if (window.clearTicketReply) window.clearTicketReply();

  // Refresh list (unread dot disappears)
  await loadTickets();
}

/* ----------------------------------------------------
   STATUS CHANGE (manual status update)
---------------------------------------------------- */
ticketStatus?.addEventListener("change", async () => {
  if (!currentTicketId) return;

  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: ticketStatus.value,
    updatedAt: Date.now()
  });

  await loadTickets();
});

/* ----------------------------------------------------
   SEND ADMIN REPLY:
   ✅ Save to Firestore thread (ticket_messages)
   ✅ Update ticket metadata (tickets)
   ✅ Call Cloud Function to send EMAIL only
---------------------------------------------------- */
sendReplyBtn?.addEventListener("click", async () => {
  if (!currentTicketId) return;

  const html = window.getTicketReplyHTML ? window.getTicketReplyHTML() : "";
  if (isQuillEmpty(html)) return;

  const now = Date.now();

  // 1) Save admin message into unified thread
  await addDoc(collection(db, "ticket_messages"), {
    ticketId: currentTicketId,
    sender: "admin",
    senderName: "Admin",
    senderEmail: "info@guidedtechms.com", // the actual sending happens in the function
    bodyHtml: html,
    createdAt: now
  });

  // 2) Update ticket metadata (Zendesk-like)
  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: "pending",
    updatedAt: now,
    lastMessageAt: now,
    lastMessagePreview: stripHtml(html).slice(0, 120)
  });

  // 3) Send email via Cloud Function (ONLY EMAIL)
  // If placeholders aren't filled yet, it will skip safely.
  try {
    if (SEND_REPLY_FUNCTION_URL.startsWith("http") && ADMIN_SECRET.length > 10) {
      const resp = await fetch(SEND_REPLY_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": ADMIN_SECRET
        },
        body: JSON.stringify({
          ticketId: currentTicketId,
          bodyHtml: html
        })
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        console.error("Email send failed:", resp.status, txt);
      }
    } else {
      console.warn(
        "Email send skipped: set SEND_REPLY_FUNCTION_URL and ADMIN_SECRET in admin/tickets.js"
      );
    }
  } catch (err) {
    console.error("Email send exception:", err);
  }

  // 4) Clear editor + refresh UI
  if (window.clearTicketReply) window.clearTicketReply();

  await loadTickets();
  await loadThread(currentTicketId);
});

/* ----------------------------------------------------
   CLOSE TICKET
---------------------------------------------------- */
closeBtn?.addEventListener("click", async () => {
  if (!currentTicketId) return;

  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: "closed",
    updatedAt: Date.now()
  });

  await loadTickets();
});

/* ----------------------------------------------------
   FILTER
---------------------------------------------------- */
statusFilter?.addEventListener("change", () => {
  currentTicketId = null;
  currentTicketData = null;
  loadTickets();
});

/* ----------------------------------------------------
   INIT
---------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  showEmptyState();
  loadTickets();
});
