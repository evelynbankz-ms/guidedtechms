import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ----------------------------------------------------
   DOM
---------------------------------------------------- */
const ticketList = document.getElementById("ticketList");
const ticketThread = document.getElementById("ticketThread");
const ticketDetail = document.getElementById("ticketDetail");
const replyForm = document.getElementById("ticketReplyForm");
const closeBtn = document.getElementById("closeTicketBtn");

const statusFilter = document.getElementById("statusFilter");
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
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[m]));
}

function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString();
}

/* ----------------------------------------------------
   LOAD TICKETS
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

  let stats = { total: 0, open: 0, pending: 0, closed: 0 };
  ticketList.innerHTML = "";

  snap.forEach(docu => {
    const t = docu.data();
    const status = t.status || "open";

    // Date filter (client-side)
    if (dateFilter?.value && t.createdAt) {
      const selected = new Date(dateFilter.value).setHours(0, 0, 0, 0);
      const created = new Date(t.createdAt).setHours(0, 0, 0, 0);
      if (created !== selected) return;
    }

    stats.total++;
    stats[status]++;

    const item = document.createElement("div");
    item.className = "ticket-item";
    item.innerHTML = `
      <div class="subject">${escapeHtml(t.subject || "Website Contact")}</div>
      <div class="small">${escapeHtml(t.email || "No email")}</div>
      <span class="badge ${status}">${status}</span>
    `;

    item.onclick = () => openTicket(docu.id, t);
    ticketList.appendChild(item);
  });

  statTotal.textContent = stats.total;
  statOpen.textContent = stats.open;
  statPending.textContent = stats.pending;
  statClosed.textContent = stats.closed;
}

/* ----------------------------------------------------
   OPEN TICKET
---------------------------------------------------- */
async function openTicket(id, t) {
  currentTicketId = id;
  currentTicketData = t;

  ticketThread.style.display = "block";
  replyForm.style.display = "block";
  ticketThread.innerHTML = "";

  // Init Quill (from tickets.html)
  if (window.initTicketReplyEditor) {
    window.initTicketReplyEditor();
  }

  /* USER MESSAGE */
  ticketThread.innerHTML += `
    <div class="thread-message user">
      <div class="meta">
        <strong>${escapeHtml(t.name || "Anonymous")}</strong>
        <span>${formatDate(t.createdAt)}</span>
      </div>
      <div class="bubble">
        ${t.message || ""}
      </div>
    </div>
  `;

  /* ADMIN REPLIES */
  const repliesSnap = await getDocs(
    query(
      collection(db, "ticket_replies"),
      where("ticketId", "==", id),
      orderBy("createdAt", "asc")
    )
  );

  repliesSnap.forEach(r => {
    const reply = r.data();
    ticketThread.innerHTML += `
      <div class="thread-message admin">
        <div class="meta">
          <strong>Admin</strong>
          <span>${formatDate(reply.createdAt)}</span>
        </div>
        <div class="bubble">
          ${reply.message}
        </div>
      </div>
    `;
  });

  ticketThread.scrollTop = ticketThread.scrollHeight;
}

/* ----------------------------------------------------
   SEND ADMIN REPLY
---------------------------------------------------- */
replyForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentTicketId) return;

  const html = document.getElementById("adminReplyInput").value;
  if (!html || html === "<p><br></p>") return;

  await addDoc(collection(db, "ticket_replies"), {
    ticketId: currentTicketId,
    message: html,
    sentBy: "admin",
    createdAt: Date.now()
  });

  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: "pending",
    updatedAt: Date.now()
  });

  replyForm.reset();
  loadTickets();
  openTicket(currentTicketId, currentTicketData);
});

/* ----------------------------------------------------
   CLOSE TICKET
---------------------------------------------------- */
closeBtn.addEventListener("click", async () => {
  if (!currentTicketId) return;

  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: "closed",
    updatedAt: Date.now()
  });

  replyForm.style.display = "none";
  loadTickets();
});

/* ----------------------------------------------------
   FILTER EVENTS
---------------------------------------------------- */
statusFilter?.addEventListener("change", loadTickets);
dateFilter?.addEventListener("change", loadTickets);

/* ----------------------------------------------------
   INIT
---------------------------------------------------- */
loadTickets();
