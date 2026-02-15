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
   🔧 REQUIRED PLACEHOLDERS (fill in after deploy)
---------------------------------------------------- */
const SEND_REPLY_FUNCTION_URL =
  "PASTE_YOUR_sendAdminTicketEmail_FUNCTION_URL_HERE";
const ADMIN_SECRET = "PASTE_THE_SAME_RANDOM_SECRET_HERE";

/* ----------------------------------------------------
   DOM
---------------------------------------------------- */
const ticketList    = document.getElementById("ticketList");
const ticketEmpty   = document.getElementById("ticketEmpty");
const ticketHeader  = document.getElementById("ticketHeader");
const ticketSubject = document.getElementById("ticketSubject");
const ticketMeta    = document.getElementById("ticketMeta");
const ticketStatus  = document.getElementById("ticketStatus");
const ticketThread  = document.getElementById("ticketThread");
const ticketReplyBox = document.getElementById("ticketReplyBox");
const sendReplyBtn  = document.getElementById("sendReplyBtn");
const closeBtn      = document.getElementById("closeTicketBtn");
const statusFilter  = document.getElementById("statusFilter");
const statTotal     = document.getElementById("statTotal");
const statOpen      = document.getElementById("statOpen");
const statPending   = document.getElementById("statPending");
const statClosed    = document.getElementById("statClosed");

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

/**
 * Safely format any timestamp Firestore might return:
 *   - Firestore Timestamp object  → .toMillis()
 *   - plain number (Date.now())   → use directly
 *   - ISO string                  → Date.parse()
 *   - serverTimestamp() sentinel  → null (not yet resolved)
 */
function formatDate(ts) {
  if (!ts) return "";
  try {
    // Firestore Timestamp object
    if (typeof ts.toMillis === "function") return new Date(ts.toMillis()).toLocaleString();
    // plain number
    if (typeof ts === "number") return new Date(ts).toLocaleString();
    // string
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

/** Same normalisation but returns a sortable number for comparisons */
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

/** FIX: treat "new" (old contact.js) as "open" so tickets always show */
function normalizeStatus(raw) {
  const s = (raw || "open").toLowerCase();
  return s === "new" ? "open" : s;
}

function showEmptyState() {
  if (ticketEmpty)   ticketEmpty.style.display   = "block";
  if (ticketHeader)  ticketHeader.style.display  = "none";
  if (ticketThread)  ticketThread.style.display  = "none";
  if (ticketReplyBox) ticketReplyBox.style.display = "none";
}

/* ----------------------------------------------------
   LOAD TICKETS LIST + STATS
   FIX: "new" status used by old contact.js submissions is
   included by querying without a status filter first, then
   filtering client-side when a status is selected.
   This avoids Firestore composite-index issues and catches
   legacy "new" documents automatically.
---------------------------------------------------- */
async function loadTickets() {
  // Always fetch all tickets ordered by lastMessageAt desc.
  // We filter client-side so we never miss legacy "new" tickets
  // and never hit a missing Firestore composite index.
  let q = query(
    collection(db, "tickets"),
    orderBy("lastMessageAt", "desc")
  );

  // If Firestore throws (missing index on a fresh project), fall back
  // to a simple collection fetch and sort manually.
  let docs;
  try {
    const snap = await getDocs(q);
    docs = snap.docs;
  } catch (err) {
    console.warn("Ordered query failed, falling back to unordered fetch:", err);
    const snap = await getDocs(collection(db, "tickets"));
    docs = snap.docs.sort(
      (a, b) => tsToNumber(b.data().lastMessageAt) - tsToNumber(a.data().lastMessageAt)
    );
  }

  const filterValue = statusFilter?.value || "";

  if (ticketList) ticketList.innerHTML = "";
  const stats = { total: 0, open: 0, pending: 0, closed: 0 };

  docs.forEach((d) => {
    const t      = d.data() || {};
    const status = normalizeStatus(t.status); // "new" → "open"

    stats.total++;
    if (stats[status] !== undefined) stats[status]++;

    // Client-side filter: if a status is selected, skip non-matches.
    // "new" tickets always show under "open".
    if (filterValue) {
      const normalizedFilter = normalizeStatus(filterValue);
      if (status !== normalizedFilter) return;
    }

    const item = document.createElement("div");
    item.className = "ticket-item";
    item.dataset.id = d.id;

    const unreadDot = t.unreadAdmin
      ? `<span style="width:8px;height:8px;background:#e67e22;border-radius:50%;display:inline-block;margin-right:8px;flex-shrink:0"></span>`
      : "";

    item.innerHTML = `
      <div class="subject" style="display:flex;align-items:center">
        ${unreadDot}${escapeHtml(t.subject || "Support Ticket")}
      </div>
      <div class="small">${escapeHtml(t.email || "No email")}</div>
      <div class="small" style="opacity:0.8">${escapeHtml(t.lastMessagePreview || "")}</div>
      <span class="badge ${status}">${escapeHtml(status)}</span>
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
   LOAD THREAD
   FIX: Also checks the ticket doc's own `message` field
   as a fallback for tickets submitted before the
   ticket_messages collection was in use.
---------------------------------------------------- */
async function loadThread(ticketId) {
  if (!ticketThread) return;
  ticketThread.innerHTML = "";

  let snap;
  try {
    snap = await getDocs(
      query(
        collection(db, "ticket_messages"),
        where("ticketId", "==", ticketId),
        orderBy("createdAt", "asc")
      )
    );
  } catch (err) {
    console.warn("ticket_messages ordered query failed, falling back:", err);
    const raw = await getDocs(
      query(collection(db, "ticket_messages"), where("ticketId", "==", ticketId))
    );
    snap = {
      docs: raw.docs.sort(
        (a, b) => tsToNumber(a.data().createdAt) - tsToNumber(b.data().createdAt)
      )
    };
  }

  // ── Fallback: show ticket's own `message` field if no thread messages found
  // This handles tickets submitted before ticket_messages was implemented.
  if (!snap.docs.length && currentTicketData?.message) {
    ticketThread.innerHTML = `
      <div class="thread-message user">
        <div class="meta">
          <strong>${escapeHtml(currentTicketData.name || "Customer")}</strong>
          <span>${formatDate(currentTicketData.createdAt)}</span>
        </div>
        <div class="bubble">
          <p>${escapeHtml(currentTicketData.message)}</p>
        </div>
      </div>
    `;
    return;
  }

  if (!snap.docs.length) {
    ticketThread.innerHTML = `<div class="empty">No messages yet.</div>`;
    return;
  }

  snap.docs.forEach((d) => {
    const m      = d.data() || {};
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
  const snap      = await getDoc(ticketRef);

  if (!snap.exists()) {
    showEmptyState();
    return;
  }

  currentTicketData = snap.data() || {};

  if (ticketEmpty)    ticketEmpty.style.display    = "none";
  if (ticketHeader)   ticketHeader.style.display   = "block";
  if (ticketThread)   ticketThread.style.display   = "block";
  if (ticketReplyBox) ticketReplyBox.style.display = "block";

  if (window.initTicketQuill) window.initTicketQuill();

  if (ticketSubject) ticketSubject.textContent = currentTicketData.subject || "Support Ticket";
  if (ticketMeta) {
    ticketMeta.textContent = `${currentTicketData.name || "Anonymous"} • ${
      currentTicketData.email || "No email"
    } • ${formatDate(currentTicketData.createdAt)}`;
  }

  // Show normalised status (so "new" renders as "open" in the dropdown)
  if (ticketStatus) ticketStatus.value = normalizeStatus(currentTicketData.status);

  // Mark as read
  await updateDoc(doc(db, "tickets", ticketId), { unreadAdmin: false });

  await loadThread(ticketId);

  if (window.clearTicketReply) window.clearTicketReply();

  // Refresh list (removes unread dot)
  await loadTickets();
}

/* ----------------------------------------------------
   STATUS CHANGE
---------------------------------------------------- */
ticketStatus?.addEventListener("change", async () => {
  if (!currentTicketId) return;
  await updateDoc(doc(db, "tickets", currentTicketId), {
    status:    ticketStatus.value,
    updatedAt: Date.now()
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

  // 1) Save admin message to thread
  await addDoc(collection(db, "ticket_messages"), {
    ticketId:    currentTicketId,
    sender:      "admin",
    senderName:  "Admin",
    senderEmail: "info@guidedtechms.com",
    bodyHtml:    html,
    createdAt:   now
  });

  // 2) Update ticket metadata
  await updateDoc(doc(db, "tickets", currentTicketId), {
    status:             "pending",
    updatedAt:          now,
    lastMessageAt:      now,
    lastMessagePreview: stripHtml(html).slice(0, 120)
  });

  // 3) Send email via Cloud Function
  try {
    if (
      SEND_REPLY_FUNCTION_URL.startsWith("http") &&
      ADMIN_SECRET.length > 10
    ) {
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
        "Email send skipped — set SEND_REPLY_FUNCTION_URL and ADMIN_SECRET in tickets.js"
      );
    }
  } catch (err) {
    console.error("Email send exception:", err);
  }

  // 4) Refresh UI
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
    status:    "closed",
    updatedAt: Date.now()
  });
  await loadTickets();
  showEmptyState();
});

/* ----------------------------------------------------
   FILTER
---------------------------------------------------- */
statusFilter?.addEventListener("change", () => {
  currentTicketId   = null;
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
