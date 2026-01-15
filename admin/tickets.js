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
const ticketThread = document.getElementById("ticketThread");
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
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({
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
   LOAD TICKETS LIST
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
  let stats = { total: 0, open: 0, pending: 0, closed: 0 };

  snap.forEach(d => {
    const t = d.data();
    const status = t.status || "open";

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

    item.onclick = () => openTicket(d.id);
    ticketList.appendChild(item);
  });

  statTotal.textContent = stats.total;
  statOpen.textContent = stats.open;
  statPending.textContent = stats.pending;
  statClosed.textContent = stats.closed;
}

/* ----------------------------------------------------
   OPEN TICKET (THREAD VIEW)
---------------------------------------------------- */
async function openTicket(ticketId) {
  currentTicketId = ticketId;

  const ticketRef = doc(db, "tickets", ticketId);
  const ticketSnap = await getDoc(ticketRef);

  if (!ticketSnap.exists()) return;

  currentTicketData = ticketSnap.data();

  ticketThread.innerHTML = "";
  ticketThread.style.display = "block";
  replyForm.style.display = "block";

  if (window.initTicketReplyEditor) {
    window.initTicketReplyEditor();
  }

  /* USER ORIGINAL MESSAGE */
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

  /* ADMIN REPLIES */
  const repliesSnap = await getDocs(
    query(
      collection(db, "ticket_replies"),
      where("ticketId", "==", ticketId),
      orderBy("createdAt", "asc")
    )
  );

  repliesSnap.forEach(d => {
    const r = d.data();
    ticketThread.innerHTML += `
      <div class="thread-message admin">
        <div class="meta">
          <strong>Admin</strong>
          <span>${formatDate(r.createdAt)}</span>
        </div>
        <div class="bubble">
          ${r.message}
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
  await loadTickets();
  await openTicket(currentTicketId);
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
  await loadTickets();
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
