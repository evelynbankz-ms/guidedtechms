// admin/tickets.js
import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ----------------------------------------------------
   🔧 REQUIRED PLACEHOLDERS (fill in after deploy)
---------------------------------------------------- */
const SEND_REPLY_FUNCTION_URL =
  "PASTE_YOUR_sendAdminTicketEmail_FUNCTION_URL_HERE";
const ADMIN_SECRET = "PASTE_THE_SAME_RANDOM_SECRET_HERE";

/* ----------------------------------------------------
   DOM
---------------------------------------------------- */
const ticketList     = document.getElementById("ticketList");
const ticketEmpty    = document.getElementById("ticketEmpty");
const ticketHeader   = document.getElementById("ticketHeader");
const ticketSubject  = document.getElementById("ticketSubject");
const ticketMeta     = document.getElementById("ticketMeta");
const ticketStatus   = document.getElementById("ticketStatus");
const ticketThread   = document.getElementById("ticketThread");
const ticketReplyBox = document.getElementById("ticketReplyBox");
const sendReplyBtn   = document.getElementById("sendReplyBtn");
const closeBtn       = document.getElementById("closeTicketBtn");
const statusFilter   = document.getElementById("statusFilter");
const statTotal      = document.getElementById("statTotal");
const statOpen       = document.getElementById("statOpen");
const statPending    = document.getElementById("statPending");
const statClosed     = document.getElementById("statClosed");

let currentTicketId   = null;
let currentTicketData = null;

/* ----------------------------------------------------
   HELPERS
---------------------------------------------------- */
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[m]));
}

function stripHtml(s) {
  return String(s || "").replace(/<[^>]*>/g, "").trim();
}

function formatDate(ts) {
  if (!ts) return "";
  try {
    if (typeof ts.toMillis === "function") return new Date(ts.toMillis()).toLocaleString();
    if (typeof ts === "number") return new Date(ts).toLocaleString();
    return new Date(ts).toLocaleString();
  } catch { return ""; }
}

// Short format: "3:42 PM" for today, "Feb 14" for older
function formatDateShort(ts) {
  if (!ts) return "";
  try {
    const d = typeof ts.toMillis === "function" ? new Date(ts.toMillis())
            : typeof ts === "number"            ? new Date(ts)
            : new Date(ts);
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

function tsToNumber(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts === "number") return ts;
  return Date.parse(ts) || 0;
}

function isQuillEmpty(html) {
  const v = (html || "").trim();
  return !v || v === "<p><br></p>" || v === "<div><br></div>";
}

// "new" (legacy) → "open"
function normalizeStatus(raw) {
  const s = (raw || "open").toLowerCase();
  return s === "new" ? "open" : s;
}

// "Evelyn Bankz" → "EB"
function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || "")
    .join("");
}

function showEmptyState() {
  if (ticketEmpty)    ticketEmpty.style.display    = "flex";
  if (ticketHeader)   ticketHeader.style.display   = "none";
  if (ticketThread)   ticketThread.style.display   = "none";
  if (ticketReplyBox) ticketReplyBox.style.display = "none";
}

/* ----------------------------------------------------
   LOAD TICKETS LIST + STATS
   Plain fetch → client-side sort (no index required,
   works on old docs missing lastMessageAt).
---------------------------------------------------- */
async function loadTickets() {
  const snap = await getDocs(collection(db, "tickets"));

  const docs = snap.docs.sort((a, b) => {
    const ad = a.data(), bd = b.data();
    return tsToNumber(bd.lastMessageAt || bd.createdAt)
         - tsToNumber(ad.lastMessageAt || ad.createdAt);
  });

  const filterValue = statusFilter?.value || "";
  if (ticketList) ticketList.innerHTML = "";
  const stats = { total: 0, open: 0, pending: 0, closed: 0 };

  docs.forEach((d) => {
    const t      = d.data() || {};
    const status = normalizeStatus(t.status);

    stats.total++;
    if (stats[status] !== undefined) stats[status]++;

    if (filterValue && status !== normalizeStatus(filterValue)) return;

    const item = document.createElement("div");
    item.className = "ticket-item";
    item.dataset.id = d.id;

    const unreadDot = t.unreadAdmin
      ? `<span style="width:7px;height:7px;background:#e67e22;border-radius:50%;display:inline-block;flex-shrink:0"></span>`
      : "";

    const timeStr = formatDateShort(t.lastMessageAt || t.createdAt);

    item.innerHTML = `
      <div class="subject">
        ${unreadDot}
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis">${escapeHtml(t.subject || "Support Ticket")}</span>
        <span style="font-size:11px;color:#8a96a3;font-weight:400;flex-shrink:0;margin-left:6px">${timeStr}</span>
      </div>
      <div class="small">${escapeHtml(t.name || "")} &nbsp;·&nbsp; ${escapeHtml(t.email || "No email")}</div>
      <div class="preview-text">${escapeHtml(t.lastMessagePreview || "")}</div>
      <div class="ticket-item-footer">
        <span class="badge ${status}">${escapeHtml(status)}</span>
        ${t.category ? `<span style="font-size:11px;color:#8a96a3">${escapeHtml(t.category)}</span>` : ""}
      </div>
    `;

    item.addEventListener("click", () => openTicket(d.id));
    ticketList?.appendChild(item);
  });

  if (statTotal)   statTotal.textContent   = stats.total;
  if (statOpen)    statOpen.textContent    = stats.open;
  if (statPending) statPending.textContent = stats.pending;
  if (statClosed)  statClosed.textContent  = stats.closed;

  if (!currentTicketId) showEmptyState();
}

/* ----------------------------------------------------
   LOAD THREAD — Zendesk-style chat bubbles
---------------------------------------------------- */
async function loadThread(ticketId) {
  if (!ticketThread) return;
  ticketThread.innerHTML = "";

  const raw = await getDocs(
    query(collection(db, "ticket_messages"), where("ticketId", "==", ticketId))
  );
  const messages = raw.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => tsToNumber(a.createdAt) - tsToNumber(b.createdAt));

  // Fallback for old-style tickets that stored message directly in ticket doc
  if (!messages.length && currentTicketData?.message) {
    messages.push({
      sender:     "user",
      senderName: currentTicketData.name || "Customer",
      bodyHtml:   `<p>${escapeHtml(currentTicketData.message)}</p>`,
      createdAt:  currentTicketData.createdAt
    });
  }

  if (!messages.length) {
    ticketThread.innerHTML = `<div class="empty">No messages yet.</div>`;
    return;
  }

  messages.forEach((m) => {
    const isAdmin   = m.sender === "admin";
    const sideClass = isAdmin ? "admin" : "user";
    const name      = m.senderName || (isAdmin ? "Admin" : "Customer");
    const pill      = initials(name);
    const time      = formatDate(m.createdAt);

    ticketThread.innerHTML += `
      <div class="thread-message ${sideClass}">
        <div class="meta">
          <span class="avatar-pill">${pill}</span>
          <strong>${escapeHtml(name)}</strong>
          <span>${time}</span>
        </div>
        <div class="bubble">${m.bodyHtml || ""}</div>
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

  const snap = await getDoc(doc(db, "tickets", ticketId));
  if (!snap.exists()) { showEmptyState(); return; }

  currentTicketData = snap.data() || {};

  if (ticketEmpty)    ticketEmpty.style.display    = "none";
  if (ticketHeader)   ticketHeader.style.display   = "block";
  if (ticketThread)   ticketThread.style.display   = "flex";
  if (ticketReplyBox) ticketReplyBox.style.display = "block";

  if (window.initTicketQuill) window.initTicketQuill();

  if (ticketSubject)
    ticketSubject.textContent = currentTicketData.subject || "Support Ticket";

  if (ticketMeta) {
    const st = normalizeStatus(currentTicketData.status);
    ticketMeta.innerHTML = `
      ${escapeHtml(currentTicketData.name || "Anonymous")}
      &nbsp;·&nbsp;
      <a href="mailto:${escapeHtml(currentTicketData.email || "")}"
         style="color:inherit;text-decoration:underline">
        ${escapeHtml(currentTicketData.email || "No email")}
      </a>
      &nbsp;·&nbsp;
      ${formatDate(currentTicketData.createdAt)}
      <span class="badge ${st}" style="margin-left:6px">${st}</span>
    `;
  }

  if (ticketStatus)
    ticketStatus.value = normalizeStatus(currentTicketData.status);

  // Mark as read in admin
  await updateDoc(doc(db, "tickets", ticketId), { unreadAdmin: false });

  await loadThread(ticketId);
  if (window.clearTicketReply) window.clearTicketReply();
  await loadTickets();
}

/* ----------------------------------------------------
   STATUS CHANGE
---------------------------------------------------- */
ticketStatus?.addEventListener("change", async () => {
  if (!currentTicketId) return;
  await updateDoc(doc(db, "tickets", currentTicketId), {
    status: ticketStatus.value, updatedAt: Date.now()
  });
  await loadTickets();
});

/* ----------------------------------------------------
   SEND ADMIN REPLY
---------------------------------------------------- */
sendReplyBtn?.addEventListener("click", async () => {
  if (!currentTicketId) return;
  const html = window.getTicketReplyHTML ? window.getTicketReplyHTML() : "";
  if (isQuillEmpty(html)) return;

  const now = Date.now();

  await addDoc(collection(db, "ticket_messages"), {
    ticketId:    currentTicketId,
    sender:      "admin",
    senderName:  "Admin",
    senderEmail: "info@guidedtechms.com",
    bodyHtml:    html,
    createdAt:   now
  });

  await updateDoc(doc(db, "tickets", currentTicketId), {
    status:             "pending",
    updatedAt:          now,
    lastMessageAt:      now,
    lastMessagePreview: stripHtml(html).slice(0, 120)
  });

  try {
    if (SEND_REPLY_FUNCTION_URL.startsWith("http") && ADMIN_SECRET.length > 10) {
      const resp = await fetch(SEND_REPLY_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_SECRET },
        body: JSON.stringify({ ticketId: currentTicketId, bodyHtml: html })
      });
      if (!resp.ok)
        console.error("Email send failed:", resp.status, await resp.text().catch(() => ""));
    } else {
      console.warn("Email send skipped — fill in SEND_REPLY_FUNCTION_URL and ADMIN_SECRET.");
    }
  } catch (err) { console.error("Email send exception:", err); }

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
    status: "closed", updatedAt: Date.now()
  });
  await loadTickets();
  showEmptyState();
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
