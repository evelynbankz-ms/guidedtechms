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

/* -----------------------------
   DOM
----------------------------- */
const ticketList = document.getElementById("ticketList");
const detail = document.getElementById("ticketDetail");

const statusFilter = document.getElementById("statusFilter");
const dateFilter = document.getElementById("dateFilter");

let currentTicketId = null;

/* -----------------------------
   LOAD TICKETS
----------------------------- */
async function loadTickets() {
  let q = query(
    collection(db, "tickets"),
    orderBy("createdAt", "desc")
  );

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
    const subject = t.subject || "Website Contact";
    const email = t.email || "No email";

    // DATE FILTER (CLIENT SIDE)
    if (dateFilter?.value) {
      const selected = new Date(dateFilter.value).setHours(0, 0, 0, 0);
      const created = new Date(t.createdAt).setHours(0, 0, 0, 0);
      if (created !== selected) return;
    }

    stats.total++;
    stats[status]++;

    const item = document.createElement("div");
    item.className = "ticket-item";
    item.innerHTML = `
      <div class="subject">${subject}</div>
      <div class="small">${email}</div>
    `;

    item.onclick = () => openTicket(docu.id, t);
    ticketList.appendChild(item);
  });

  document.getElementById("statTotal").textContent = stats.total;
  document.getElementById("statOpen").textContent = stats.open;
  document.getElementById("statPending").textContent = stats.pending;
  document.getElementById("statClosed").textContent = stats.closed;
}

/* -----------------------------
   OPEN TICKET
----------------------------- */
async function openTicket(id, t) {
  currentTicketId = id;

  const repliesSnap = await getDocs(
    query(collection(db, "ticket_replies"), where("ticketId", "==", id))
  );

  detail.innerHTML = `
    <h3>Website Contact</h3>
    <p><b>${t.name || "Anonymous"}</b> (${t.email || "No email"})</p>
    <p>${t.message || ""}</p>

    <label>Status</label>
    <select id="statusUpdate">
      <option value="open">Open</option>
      <option value="pending">Pending</option>
      <option value="closed">Closed</option>
    </select>

    <div class="reply-box">
      <textarea id="replyText" placeholder="Reply to user..."></textarea>
      <button class="btn btn-primary" id="replyBtn">Send Reply</button>
    </div>

    <hr>
    <div id="replies"></div>
  `;

  const statusSelect = document.getElementById("statusUpdate");
  statusSelect.value = t.status || "open";

  statusSelect.onchange = async e => {
    await updateDoc(doc(db, "tickets", id), {
      status: e.target.value,
      updatedAt: Date.now()
    });
    loadTickets();
  };

  const repliesDiv = document.getElementById("replies");
  repliesDiv.innerHTML = "";

  repliesSnap.forEach(r => {
    repliesDiv.innerHTML += `<p><b>Admin:</b> ${r.data().message}</p>`;
  });

  document.getElementById("replyBtn").onclick = sendReply;
}

/* -----------------------------
   SEND REPLY
----------------------------- */
async function sendReply() {
  const textarea = document.getElementById("replyText");
  const msg = textarea.value.trim();
  if (!msg || !currentTicketId) return;

  await addDoc(collection(db, "ticket_replies"), {
    ticketId: currentTicketId,
    message: msg,
    sentBy: "admin",
    createdAt: Date.now()
  });

  textarea.value = "";
  loadTickets();
}

/* -----------------------------
   FILTER EVENTS
----------------------------- */
statusFilter?.addEventListener("change", loadTickets);
dateFilter?.addEventListener("change", loadTickets);

/* -----------------------------
   INIT
----------------------------- */
loadTickets();
