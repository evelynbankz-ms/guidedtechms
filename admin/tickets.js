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
   DOM
---------------------------------------------------- */
const ticketList = document.getElementById("ticketList");

const ticketDetail = document.getElementById("ticketDetail");
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

// (optional - your JS referenced dateFilter but HTML doesn’t have it)
const dateFilter = document.getElementById("dateFilter");

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
  let q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));

  if (statusFilter?.value) {
    q = query(
      collection(db, "tickets"),
      where("status", "==", statusFilter.value),
      orderBy("createdAt", "desc")
    );
  }

  const snap = await getDocs(q);

  ticketList.innerHTML = "";
  const stats = { total: 0, open: 0, pending: 0, closed: 0 };

  snap.forEach((d) => {
    const t = d.data();
    const status = (t.status || "open").toLowerCase();

    // Optional date filter if you later add it to HTML
    if (dateFilter?.value && t.createdAt) {
      const selected = new Date(dateFilter.value).setHours(0, 0, 0, 0);
      const created = new Date(t.createdAt).setHours(0, 0, 0, 0);
      if (created !== selected) return;
    }

    stats.total++;
    if (stats[status] !== undefined) stats[status]++;

    const item = document.createElement("div");
    item.className = "ticket-item";
    item.dataset.id = d.id;

    item.innerHTML = `
      <div class="subject">${escapeHtml(t.subject || "Website Contact")}</div>
      <div class="small">${escapeHtml(t.email || "No email")}</div>
      <span class="badge ${status}">${escapeHtml(status)}</span>
    `;

    item.addEventListener("click", () => openTicket(d.id));
    ticketList.appendChild(item);
  });

  statTotal.textContent = stats.total;
  statOpen.textContent = stats.open;
  statPending.textContent = stats.pending;
  statClosed.textContent = stats.closed;

  // If nothing selected, show empty panel
  if (!currentTicketId) showEmptyState();
}

/* ----------------------------------------------------
   OPEN TICKET (DETAIL VIEW)
---------------------------------------------------- */
async function openTicket(ticketId) {
  currentTicketId = ticketId;

  // Highlight active ticket in list (optional)
  document.querySelectorAll(".ticket-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.id === ticketId);
  });

  const ticketRef = doc(db, "tickets", ticketId);
  const ticketSnap = await getDoc(ticketRef);
  if (!ticketSnap.exists()) {
    showEmptyState();
    return;
  }

  currentTicketData = ticketSnap.data();

  // Show sections
  ticketEmpty.style.display = "none";
  ticketHeader.style.display = "block";
  ticketThread.style.display = "block";
  ticketReplyBox.style.display = "block";

  // Init Quill (use the function your HTML actually defines)
  if (window.initTicketQuill) window.initTicketQuill();

  // Fill header
  const status = (currentTicketData.status || "open").toLowerCase();
  ticketSubject.textContent = currentTicketData.subject || "Website Contact";
  ticketMeta.textContent = `${currentTicketData.name || "Anonymous"} • ${currentTicketData.email || "No email"} • ${formatDate(currentTicketData.createdAt)}`;
  ticketStatus.value = status;

  // Render thread
  ticketThread.innerHTML = "";

  // Customer message
  ticketThread.innerHTML += `
    <div class="thread-message user">
      <div class="meta">
        <strong>${escapeHtml(currentTicketData.name || "Anonymous")}</strong>
        <span>${formatDate(currentTicketData.createdAt)}</span>
      </div>
      <div class="bubble">
        ${currentTicketData.message || ""}
      </div>
    </div>
  `;

  // Replies
  const repliesSnap = await getDocs(
    query(
      collection(db, "ticket_replies"),
      where("ticketId", "==", ticketId),
      orderBy("createdAt", "asc")
    )
  );

  repliesSnap.forEach((d) => {
    const r = d.data();
    ticketThread.innerHTML += `
      <div class="thread-message admin">
        <div class="meta">
          <strong>Admin</strong>
          <span>${formatDate(r.createdAt)}</span>
        </div>
        <div class="bubble">
          ${r.message || ""}
        </div>
      </div>
    `;
  });

  // Scroll thread to bottom
  ticketThread.scrollTop = ticketThread.scrollHeight;

  // Clear editor each time you open
  if (window.clearTicketReply) window.clearTicketReply();
}

/* ----------------------------------------------------
   UPDATE STATUS (dropdown)
---------------------------------------------------- */
ticketStatus?.addEventListener("change", async () => {
  if (!currentTicketId) return;

  const newStatus = ticketStatus.value;

  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: newStatus,
    updatedAt: Date.now()
  });

  await loadTickets();
});

/* ----------------------------------------------------
   SEND ADMIN REPLY (button)
---------------------------------------------------- */
sendReplyBtn?.addEventListener("click", async () => {
  if (!currentTicketId) return;

  const html = window.getTicketReplyHTML ? window.getTicketReplyHTML() : "";

  if (isQuillEmpty(html)) return;

  await addDoc(collection(db, "ticket_replies"), {
    ticketId: currentTicketId,
    message: html,
    sentBy: "admin",
    createdAt: Date.now()
  });

  // Mark ticket pending
  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: "pending",
    updatedAt: Date.now()
  });

  // Clear editor
  if (window.clearTicketReply) window.clearTicketReply();

  await loadTickets();
  await openTicket(currentTicketId);
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
  await openTicket(currentTicketId);
});

/* ----------------------------------------------------
   FILTER EVENTS
---------------------------------------------------- */
statusFilter?.addEventListener("change", () => {
  currentTicketId = null;
  currentTicketData = null;
  loadTickets();
});

dateFilter?.addEventListener("change", () => {
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
