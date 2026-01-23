import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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
  ticketEmpty.style.display = "block";
  ticketHeader.style.display = "none";
  ticketThread.style.display = "none";
  ticketReplyBox.style.display = "none";
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

  ticketList.innerHTML = "";
  const stats = { total: 0, open: 0, pending: 0, closed: 0 };

  snap.forEach((d) => {
    const t = d.data();
    const status = (t.status || "open").toLowerCase();

    stats.total++;
    if (stats[status] !== undefined) stats[status]++;

    const item = document.createElement("div");
    item.className = "ticket-item";
    item.dataset.id = d.id;

    const unreadDot = t.unreadAdmin
      ? `<span style="width:8px;height:8px;background:#e67e22;border-radius:50%;display:inline-block"></span>`
      : "";

    item.innerHTML = `
      <div class="subject">
        ${unreadDot}
        ${escapeHtml(t.subject || "Support Ticket")}
      </div>
      <div class="small">${escapeHtml(t.email || "No email")}</div>
      <div class="small" style="opacity:0.8">
        ${escapeHtml(t.lastMessagePreview || "")}
      </div>
      <span class="badge ${status}">${escapeHtml(status)}</span>
    `;

    item.addEventListener("click", () => openTicket(d.id));
    ticketList.appendChild(item);
  });

  statTotal.textContent = stats.total;
  statOpen.textContent = stats.open;
  statPending.textContent = stats.pending;
  statClosed.textContent = stats.closed;

  if (!currentTicketId) showEmptyState();
}

/* ----------------------------------------------------
   LOAD THREAD MESSAGES (Zendesk style)
---------------------------------------------------- */
async function loadThread(ticketId) {
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
    const m = d.data();
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

  document.querySelectorAll(".ticket-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === ticketId);
  });

  const ticketRef = doc(db, "tickets", ticketId);
  const snap = await getDoc(ticketRef);

  if (!snap.exists()) {
    showEmptyState();
    return;
  }

  currentTicketData = snap.data();

  // Show UI
  ticketEmpty.style.display = "none";
  ticketHeader.style.display = "block";
  ticketThread.style.display = "block";
  ticketReplyBox.style.display = "block";

  // Init Quill (matches your HTML)
  if (window.initTicketQuill) window.initTicketQuill();

  // Header
  ticketSubject.textContent = currentTicketData.subject || "Support Ticket";
  ticketMeta.textContent = `${currentTicketData.name || "Anonymous"} • ${currentTicketData.email || "No email"} • ${formatDate(currentTicketData.createdAt)}`;

  ticketStatus.value = (currentTicketData.status || "open").toLowerCase();

  // Mark as read in admin
  await updateDoc(doc(db, "tickets", ticketId), {
    unreadAdmin: false
  });

  // Load thread
  await loadThread(ticketId);

  // Clear editor
  if (window.clearTicketReply) window.clearTicketReply();

  // Refresh list (so unread dot disappears)
  await loadTickets();
}

/* ----------------------------------------------------
   STATUS CHANGE
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
   SEND ADMIN REPLY (Zendesk style)
---------------------------------------------------- */
sendReplyBtn?.addEventListener("click", async () => {
  if (!currentTicketId) return;

  const html = window.getTicketReplyHTML ? window.getTicketReplyHTML() : "";
  if (isQuillEmpty(html)) return;

  const now = Date.now();

  // Add message to thread
  await addDoc(collection(db, "ticket_messages"), {
    ticketId: currentTicketId,
    sender: "admin",
    senderName: "Admin",
    senderEmail: "admin@guidedtechms.com",
    bodyHtml: html,
    createdAt: now
  });

  // Update ticket metadata (Zendesk style)
  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: "pending",
    updatedAt: now,
    lastMessageAt: now,
    lastMessagePreview: html.replace(/<[^>]*>/g, "").slice(0, 120)
  });

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
   FILTER EVENTS
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
