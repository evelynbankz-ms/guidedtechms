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
   DOM ELEMENTS
----------------------------- */
const ticketList = document.getElementById("ticketList");
const detail = document.getElementById("ticketDetail");

let currentTicketId = null;

/* -----------------------------
   LOAD ALL TICKETS
----------------------------- */
async function loadTickets() {
  const snap = await getDocs(
    query(collection(db, "tickets"), orderBy("createdAt", "desc"))
  );

  let stats = { total: 0, open: 0, pending: 0, closed: 0 };
  ticketList.innerHTML = "";

  snap.forEach(docu => {
    const t = docu.data();

    // ✅ DEFENSIVE DEFAULTS (CRITICAL)
    const status = t.status || "open";
    const subject = t.subject || "Website Contact";
    const email = t.email || "No email provided";

    stats.total++;
    stats[status] = (stats[status] || 0) + 1;

    const div = document.createElement("div");
    div.className = "ticket-item";
    div.innerHTML = `
      <div class="subject">${subject}</div>
      <div class="small">${email}</div>
    `;

    div.onclick = () =>
      openTicket(docu.id, {
        ...t,
        status,
        subject,
        email
      });

    ticketList.appendChild(div);
  });

  // UPDATE ANALYTICS
  document.getElementById("statTotal").textContent = stats.total;
  document.getElementById("statOpen").textContent = stats.open;
  document.getElementById("statPending").textContent = stats.pending;
  document.getElementById("statClosed").textContent = stats.closed;
}

/* -----------------------------
   OPEN SINGLE TICKET
----------------------------- */
async function openTicket(id, data) {
  currentTicketId = id;

  const name = data.name || "Anonymous";
  const email = data.email || "No email";
  const message = data.message || "";
  const subject = data.subject || "Website Contact";
  const status = data.status || "open";

  const repliesSnap = await getDocs(
    query(collection(db, "ticket_replies"), where("ticketId", "==", id))
  );

  detail.innerHTML = `
    <h3>${subject}</h3>
    <p><b>${name}</b> (${email})</p>
    <p>${message}</p>

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

  // SET STATUS
  const statusSelect = document.getElementById("statusUpdate");
  statusSelect.value = status;

  statusSelect.onchange = async e => {
    await updateDoc(doc(db, "tickets", id), {
      status: e.target.value,
      updatedAt: Date.now()
    });
    loadTickets();
  };

  // RENDER REPLIES
  const repliesDiv = document.getElementById("replies");
  repliesDiv.innerHTML = "";

  repliesSnap.forEach(r => {
    repliesDiv.innerHTML += `
      <p><b>Admin:</b> ${r.data().message}</p>
    `;
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

  // RELOAD CURRENT TICKET
  const ticketSnap = await getDocs(
    query(collection(db, "tickets"))
  );

  const docu = ticketSnap.docs.find(d => d.id === currentTicketId);
  if (docu) openTicket(currentTicketId, docu.data());
}

/* -----------------------------
   INIT
----------------------------- */
loadTickets();
