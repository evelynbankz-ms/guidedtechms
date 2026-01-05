import { db } from "./firebase.js";
import {
  collection, query, where, orderBy,
  getDocs, addDoc, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const ticketList = document.getElementById("ticketList");
const detail = document.getElementById("ticketDetail");

const statTotal = statOpen = statPending = statClosed = null;

let currentTicketId = null;

async function loadTickets() {
  const snap = await getDocs(
    query(collection(db,"tickets"), orderBy("createdAt","desc"))
  );

  let stats = { total:0, open:0, pending:0, closed:0 };
  ticketList.innerHTML = "";

  snap.forEach(docu=>{
    const t = docu.data();
    stats.total++;
    stats[t.status]++;

    const div = document.createElement("div");
    div.className = "ticket-item";
    div.innerHTML = `
      <div class="subject">${t.subject}</div>
      <div class="small">${t.email}</div>
    `;
    div.onclick = () => openTicket(docu.id, t);
    ticketList.appendChild(div);
  });

  document.getElementById("statTotal").textContent = stats.total;
  document.getElementById("statOpen").textContent = stats.open;
  document.getElementById("statPending").textContent = stats.pending;
  document.getElementById("statClosed").textContent = stats.closed;
}

async function openTicket(id, data) {
  currentTicketId = id;

  const repliesSnap = await getDocs(
    query(collection(db,"ticket_replies"), where("ticketId","==",id))
  );

  detail.innerHTML = `
    <h3>${data.subject}</h3>
    <p><b>${data.name}</b> (${data.email})</p>
    <p>${data.message}</p>

    <select id="statusUpdate">
      <option value="open">Open</option>
      <option value="pending">Pending</option>
      <option value="closed">Closed</option>
    </select>

    <div class="reply-box">
      <textarea id="replyText" placeholder="Reply to user..."></textarea>
      <button class="btn btn-primary" onclick="sendReply()">Send Reply</button>
    </div>

    <hr>
    <div id="replies"></div>
  `;

  document.getElementById("statusUpdate").value = data.status;

  document.getElementById("statusUpdate").onchange = async e=>{
    await updateDoc(doc(db,"tickets",id),{
      status:e.target.value,
      updatedAt:Date.now()
    });
    loadTickets();
  };

  const repliesDiv = document.getElementById("replies");
  repliesSnap.forEach(r=>{
    repliesDiv.innerHTML += `<p><b>Admin:</b> ${r.data().message}</p>`;
  });
}

window.sendReply = async function(){
  const msg = document.getElementById("replyText").value.trim();
  if(!msg) return;

  await addDoc(collection(db,"ticket_replies"),{
    ticketId: currentTicketId,
    message: msg,
    sentBy:"admin",
    createdAt: Date.now()
  });

  // 🔔 EMAIL SHOULD BE SENT VIA CLOUD FUNCTION (next section)

  document.getElementById("replyText").value="";
  openTicket(currentTicketId,(await getDocs(query(collection(db,"tickets")))).docs.find(d=>d.id===currentTicketId).data());
};

loadTickets();
