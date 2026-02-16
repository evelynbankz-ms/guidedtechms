// admin/tickets.js  — Zendesk-parity feature set
import { db } from "./firebase.js";
import {
  collection, query, where, getDocs,
  addDoc, updateDoc, deleteDoc, doc, getDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ── Cloud function placeholders ─────────────────────────── */
const SEND_REPLY_FUNCTION_URL = "PASTE_YOUR_sendAdminTicketEmail_FUNCTION_URL_HERE";
const ADMIN_SECRET            = "PASTE_THE_SAME_RANDOM_SECRET_HERE";

/* ── DOM refs ────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const ticketList       = $("ticketList");
const ticketEmpty      = $("ticketEmpty");
const tdContent        = $("tdContent");
const ticketSubject    = $("ticketSubject");
const ticketMeta       = $("ticketMeta");
const ticketStatus     = $("ticketStatus");
const ticketThread     = $("ticketThread");
const tdReply          = $("tdReply");
const sendReplyBtn     = $("sendReplyBtn");
const closeTicketBtn   = $("closeTicketBtn");
const statusFilter     = $("statusFilter");
const sortFilter       = $("sortFilter");
const searchInput      = $("searchInput");
const refreshBtn       = $("refreshBtn");
const mergeBtn         = $("mergeBtn");
const mergeTicketBtn   = $("mergeTicketBtn");
const mergeOverlay     = $("mergeOverlay");
const mergeClose       = $("mergeClose");
const mergeCancelBtn   = $("mergeCancelBtn");
const mergeConfirmBtn  = $("mergeConfirmBtn");
const mergeList        = $("mergeList");
const mergeSearch      = $("mergeSearch");
const replyStatusChg   = $("replyStatusChange");

/* sidebar refs */
const sidebarRequester   = $("sidebarRequester");
const sidebarEmail       = $("sidebarEmail");
const sidebarCategory    = $("sidebarCategory");
const sidebarSource      = $("sidebarSource");
const sidebarCreated     = $("sidebarCreated");
const sidebarUpdated     = $("sidebarUpdated");
const sidebarOther       = $("sidebarOtherTickets");
const mergedSection      = $("mergedSection");
const sidebarMerged      = $("sidebarMerged");
const propMerged         = $("propMerged");

/* ── State ───────────────────────────────────────────────── */
let allTickets        = [];
let currentTicketId   = null;
let currentTicketData = null;
let selectedForMerge  = new Set();   // ticket IDs checked in list
let mergeTargetId     = null;        // selected in merge modal

/* ── Helpers ─────────────────────────────────────────────── */
const esc = s => String(s||"").replace(/[&<>"']/g,m=>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

const stripHtml = s => String(s||"").replace(/<[^>]*>/g,"").trim();

function tsNum(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis==="function") return ts.toMillis();
  if (typeof ts==="number") return ts;
  return Date.parse(ts)||0;
}

function fmtDate(ts) {
  if (!ts) return "";
  try {
    const d = typeof ts.toMillis==="function" ? new Date(ts.toMillis())
            : typeof ts==="number"            ? new Date(ts)
            : new Date(ts);
    return d.toLocaleString();
  } catch { return ""; }
}

function fmtShort(ts) {
  if (!ts) return "";
  try {
    const d = typeof ts.toMillis==="function" ? new Date(ts.toMillis())
            : typeof ts==="number"            ? new Date(ts)
            : new Date(ts);
    const now = new Date();
    const isToday = d.toDateString()===now.toDateString();
    return isToday
      ? d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
      : d.toLocaleDateString([],{month:"short",day:"numeric"});
  } catch { return ""; }
}

function fmtDateLabel(ts) {
  if (!ts) return "";
  try {
    const d = typeof ts.toMillis==="function" ? new Date(ts.toMillis())
            : typeof ts==="number"            ? new Date(ts)
            : new Date(ts);
    const now = new Date();
    const diff = Math.floor((now-d)/86400000);
    if (diff===0) return "Today";
    if (diff===1) return "Yesterday";
    return d.toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"});
  } catch { return ""; }
}

function normStatus(raw) {
  const s=(raw||"open").toLowerCase();
  return s==="new"?"open":s;
}

function initials(name) {
  return String(name||"?").trim().split(/\s+/).slice(0,2)
    .map(w=>w[0]?.toUpperCase()||"").join("");
}

function isQuillEmpty(html) {
  const v=(html||"").trim();
  return !v||v==="<p><br></p>"||v==="<div><br></div>";
}

function showEmptyState() {
  if (ticketEmpty) ticketEmpty.style.display = "flex";
  if (tdContent)   tdContent.style.display   = "none";
  currentTicketId = null;
  currentTicketData = null;
}

/* ── Load all tickets ────────────────────────────────────── */
async function loadTickets() {
  const snap = await getDocs(collection(db,"tickets"));
  allTickets = snap.docs.map(d=>({id:d.id,...d.data()}));
  renderTicketList();
  updateStats();
}

function updateStats() {
  const stats = {total:0,open:0,pending:0,closed:0};
  allTickets.forEach(t=>{
    const s = normStatus(t.status);
    stats.total++;
    if (stats[s]!==undefined) stats[s]++;
  });
  $("statTotal").textContent   = stats.total;
  $("statOpen").textContent    = stats.open;
  $("statPending").textContent = stats.pending;
  $("statClosed").textContent  = stats.closed;
}

function renderTicketList() {
  const filterVal = statusFilter?.value || "";
  const sortVal   = sortFilter?.value   || "newest";
  const searchVal = (searchInput?.value || "").toLowerCase();

  let items = [...allTickets];

  // filter by status
  if (filterVal) items = items.filter(t=>normStatus(t.status)===normStatus(filterVal));

  // search
  if (searchVal) {
    items = items.filter(t=>{
      const hay = [t.name,t.email,t.subject,t.lastMessagePreview].join(" ").toLowerCase();
      return hay.includes(searchVal);
    });
  }

  // sort
  if (sortVal==="oldest") {
    items.sort((a,b)=>tsNum(a.createdAt)-tsNum(b.createdAt));
  } else if (sortVal==="name") {
    items.sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
  } else {
    items.sort((a,b)=>tsNum(b.lastMessageAt||b.createdAt)-tsNum(a.lastMessageAt||a.createdAt));
  }

  ticketList.innerHTML = "";

  if (!items.length) {
    ticketList.innerHTML = `<div style="padding:24px;text-align:center;color:#96a2b0;font-size:13px">No tickets found</div>`;
    return;
  }

  items.forEach(t=>{
    const status = normStatus(t.status);
    const item   = document.createElement("div");
    item.className = "ticket-item";
    item.dataset.id = t.id;

    if (t.id===currentTicketId) item.classList.add("active");
    if (selectedForMerge.has(t.id)) item.classList.add("selected-for-merge");

    // Primary display: sender name (bold) → subject → preview
    const displayName = t.name || t.email || "Unknown";
    const unread = t.unreadAdmin
      ? `<span class="unread-dot"></span>`:"";

    item.innerHTML = `
      <div class="ti-top">
        <span class="ti-name">${unread}${esc(displayName)}</span>
        <span class="ti-time">${fmtShort(t.lastMessageAt||t.createdAt)}</span>
      </div>
      <div class="ti-subject">${esc(t.subject||"No subject")}</div>
      <div class="ti-preview">${esc(t.lastMessagePreview||"")}</div>
      <div class="ti-bottom">
        <span class="badge ${status}">${status}</span>
        ${t.mergedInto?`<span class="badge" style="background:#e8f5e9;color:#2e7d32">🔗 merged</span>`:""}
        ${t.category?`<span style="font-size:11px;color:#96a2b0">${esc(t.category)}</span>`:""}
        <input class="merge-checkbox" type="checkbox" title="Select for merge"
          ${selectedForMerge.has(t.id)?"checked":""} style="margin-left:auto">
      </div>
    `;

    item.querySelector(".merge-checkbox").addEventListener("change",e=>{
      e.stopPropagation();
      if (e.target.checked) selectedForMerge.add(t.id);
      else selectedForMerge.delete(t.id);
      item.classList.toggle("selected-for-merge",e.target.checked);
      // enable toolbar merge button when 2+ selected
      if (mergeBtn) mergeBtn.disabled = selectedForMerge.size < 2;
    });

    item.addEventListener("click",e=>{
      if (e.target.classList.contains("merge-checkbox")) return;
      openTicket(t.id);
    });

    ticketList.appendChild(item);
  });
}

/* ── Load thread ─────────────────────────────────────────── */
async function loadThread(ticketId) {
  if (!ticketThread) return;
  ticketThread.innerHTML = "";

  const raw = await getDocs(
    query(collection(db,"ticket_messages"),where("ticketId","==",ticketId))
  );
  let messages = raw.docs.map(d=>({id:d.id,...d.data()}))
    .sort((a,b)=>tsNum(a.createdAt)-tsNum(b.createdAt));

  // fallback: ticket's own `message` field
  if (!messages.length && currentTicketData?.message) {
    messages.push({
      sender:    "user",
      senderName: currentTicketData.name||"Customer",
      bodyHtml:  `<p>${esc(currentTicketData.message)}</p>`,
      createdAt: currentTicketData.createdAt
    });
  }

  if (!messages.length) {
    ticketThread.innerHTML=`<div style="margin:auto;padding:40px;text-align:center;color:#96a2b0">No messages yet.</div>`;
    return;
  }

  // Group by date and render with date separators
  let lastDate = null;
  messages.forEach(m=>{
    const msgDate = fmtDateLabel(m.createdAt);
    if (msgDate && msgDate!==lastDate) {
      lastDate = msgDate;
      ticketThread.innerHTML += `<div class="thread-date-sep">${esc(msgDate)}</div>`;
    }

    const isAdmin  = m.sender==="admin";
    const isNote   = m.isNote===true;
    const cls      = isNote?"note":isAdmin?"admin":"user";
    const name     = m.senderName||(isAdmin?"Admin":"Customer");
    const pill     = initials(name);

    ticketThread.innerHTML += `
      <div class="thread-message ${cls}">
        <div class="meta">
          <span class="avatar-pill">${pill}</span>
          <strong>${esc(name)}</strong>
          <span>${fmtDate(m.createdAt)}</span>
          ${isNote?`<span class="badge note">Internal Note</span>`:""}
        </div>
        <div class="bubble">${m.bodyHtml||""}</div>
      </div>
    `;
  });

  ticketThread.scrollTop = ticketThread.scrollHeight;
}

/* ── Open ticket ─────────────────────────────────────────── */
async function openTicket(ticketId) {
  currentTicketId = ticketId;

  // highlight in list
  document.querySelectorAll(".ticket-item").forEach(el=>{
    el.classList.toggle("active", el.dataset.id===ticketId);
  });

  const snap = await getDoc(doc(db,"tickets",ticketId));
  if (!snap.exists()) { showEmptyState(); return; }
  currentTicketData = snap.data()||{};

  // show content
  if (ticketEmpty) ticketEmpty.style.display="none";
  if (tdContent)   tdContent.style.display="flex";

  if (window.initTicketQuill) window.initTicketQuill();

  // ── HEADER ─────────────────────────────────────────────
  // Title = sender name (not subject / "Website Contact")
  // Meta  = subject only + status badge — no email or date (those live in sidebar)
  if (ticketSubject)
    ticketSubject.textContent = currentTicketData.name || currentTicketData.email || "Unknown Sender";

  const st = normStatus(currentTicketData.status);
  if (ticketMeta) {
    ticketMeta.innerHTML = `
      <span style="color:var(--text-soft);font-weight:400">${esc(currentTicketData.subject||"No subject")}</span>
      <span class="badge ${st}" style="margin-left:8px">${st}</span>
    `;
  }

  if (ticketStatus) ticketStatus.value = st;

  // Props chips: category + source only (date is already in sidebar — no duplication)
  $("propCategory").textContent = currentTicketData.category||"General";
  $("propSource").textContent   = currentTicketData.source||"contact-form";
  const propCreatedEl = $("propCreated");
  if (propCreatedEl) propCreatedEl.style.display = "none";
  if (currentTicketData.mergedFrom?.length) {
    if (propMerged) propMerged.style.display="inline-flex";
  } else {
    if (propMerged) propMerged.style.display="none";
  }


  // sidebar
  if (sidebarRequester) sidebarRequester.textContent = currentTicketData.name||"—";
  if (sidebarEmail)
    sidebarEmail.innerHTML = currentTicketData.email
      ? `<a href="mailto:${esc(currentTicketData.email)}">${esc(currentTicketData.email)}</a>`
      : "—";
  if (sidebarCategory) sidebarCategory.textContent = currentTicketData.category||"General";
  if (sidebarSource)   sidebarSource.textContent   = currentTicketData.source||"contact-form";
  if (sidebarCreated)  sidebarCreated.textContent  = fmtDate(currentTicketData.createdAt);
  if (sidebarUpdated)  sidebarUpdated.textContent  = fmtDate(currentTicketData.updatedAt);

  if (currentTicketData.mergedFrom?.length && mergedSection) {
    mergedSection.style.display="block";
    if (sidebarMerged) sidebarMerged.textContent=`${currentTicketData.mergedFrom.length} ticket(s) merged in`;
  } else if (mergedSection) {
    mergedSection.style.display="none";
  }

  // other tickets by this requester
  await loadOtherTickets(currentTicketData.email, ticketId);

  // mark as read
  await updateDoc(doc(db,"tickets",ticketId),{unreadAdmin:false});

  await loadThread(ticketId);
  if (window.clearTicketReply) window.clearTicketReply();

  // refresh list silently
  loadTickets();
}

/* ── Other tickets by same requester ─────────────────────── */
async function loadOtherTickets(email, excludeId) {
  if (!sidebarOther) return;
  if (!email) { sidebarOther.textContent="—"; return; }

  const others = allTickets.filter(t=>t.email===email && t.id!==excludeId);
  if (!others.length) { sidebarOther.textContent="None"; return; }

  sidebarOther.innerHTML="";
  others.slice(0,5).forEach(t=>{
    const el = document.createElement("div");
    el.className="ts-other-ticket";
    el.textContent=`${t.subject||"Ticket"} — ${normStatus(t.status)}`;
    el.title = fmtDate(t.createdAt);
    el.addEventListener("click",()=>openTicket(t.id));
    sidebarOther.appendChild(el);
  });
}

/* ── Status change ───────────────────────────────────────── */
ticketStatus?.addEventListener("change", async()=>{
  if (!currentTicketId) return;
  await updateDoc(doc(db,"tickets",currentTicketId),{
    status:ticketStatus.value, updatedAt:Date.now()
  });
  loadTickets();
});

/* ── Send reply / internal note ──────────────────────────── */
sendReplyBtn?.addEventListener("click", async()=>{
  if (!currentTicketId) return;
  const html = window.getTicketReplyHTML?window.getTicketReplyHTML():"";
  if (isQuillEmpty(html)) return;

  const mode   = window.getReplyMode?window.getReplyMode():"reply";
  const isNote = mode==="note";
  const now    = Date.now();
  const newStatus = replyStatusChg?.value||"pending";

  // save to thread
  await addDoc(collection(db,"ticket_messages"),{
    ticketId:    currentTicketId,
    sender:      "admin",
    senderName:  "Admin",
    senderEmail: "info@guidedtechms.com",
    bodyHtml:    html,
    isNote:      isNote,
    createdAt:   now
  });

  // update ticket
  await updateDoc(doc(db,"tickets",currentTicketId),{
    status:             isNote ? (currentTicketData?.status||"open") : newStatus,
    updatedAt:          now,
    lastMessageAt:      now,
    lastMessagePreview: stripHtml(html).slice(0,120)
  });

  // email only for real replies (not internal notes)
  if (!isNote) {
    try {
      if (SEND_REPLY_FUNCTION_URL.startsWith("http") && ADMIN_SECRET.length>10) {
        const resp = await fetch(SEND_REPLY_FUNCTION_URL,{
          method:"POST",
          headers:{"Content-Type":"application/json","x-admin-secret":ADMIN_SECRET},
          body:JSON.stringify({ticketId:currentTicketId, bodyHtml:html})
        });
        if (!resp.ok) console.error("Email failed:",resp.status);
      }
    } catch(err) { console.error("Email error:",err); }
  }

  if (window.clearTicketReply) window.clearTicketReply();
  await loadTickets();
  await loadThread(currentTicketId);
});

/* ── Close ticket ────────────────────────────────────────── */
closeTicketBtn?.addEventListener("click", async()=>{
  if (!currentTicketId) return;
  await updateDoc(doc(db,"tickets",currentTicketId),{
    status:"closed", updatedAt:Date.now()
  });
  await loadTickets();
  showEmptyState();
});

/* ── Filters / search / sort ─────────────────────────────── */
statusFilter?.addEventListener("change", ()=>{
  selectedForMerge.clear();
  renderTicketList();
});
sortFilter?.addEventListener("change", renderTicketList);
searchInput?.addEventListener("input", renderTicketList);
refreshBtn?.addEventListener("click", loadTickets);

/* ── MERGE FEATURE ───────────────────────────────────────── */

// Open merge modal from ticket detail header
mergeTicketBtn?.addEventListener("click",()=>{
  if (!currentTicketId) return;
  openMergeModal(currentTicketId);
});

// Open merge modal from toolbar (when 2 tickets are checked)
mergeBtn?.addEventListener("click",()=>{
  if (selectedForMerge.size<2) return;
  const ids = [...selectedForMerge];
  openMergeModal(ids[0], ids);
});

function openMergeModal(sourceId, preselected=null) {
  mergeTargetId = null;
  if (mergeConfirmBtn) mergeConfirmBtn.disabled=true;
  if (mergeSearch)     mergeSearch.value="";

  // Populate merge list (all tickets except the source)
  renderMergeList(sourceId, "");

  if (mergeSearch) {
    mergeSearch.oninput = ()=>renderMergeList(sourceId, mergeSearch.value);
  }

  if (mergeOverlay) mergeOverlay.style.display="flex";
}

function renderMergeList(sourceId, searchVal) {
  if (!mergeList) return;
  mergeList.innerHTML="";
  const sv = searchVal.toLowerCase();
  const items = allTickets.filter(t=>{
    if (t.id===sourceId) return false;
    if (normStatus(t.status)==="closed") return false;
    if (!sv) return true;
    const hay=[t.name,t.email,t.subject].join(" ").toLowerCase();
    return hay.includes(sv);
  });

  if (!items.length) {
    mergeList.innerHTML=`<div style="padding:16px;text-align:center;color:#96a2b0;font-size:13px">No tickets to merge with</div>`;
    return;
  }

  items.forEach(t=>{
    const opt = document.createElement("div");
    opt.className="merge-option";
    opt.dataset.id=t.id;
    opt.innerHTML=`
      <input type="radio" name="mergeTarget" value="${esc(t.id)}">
      <div class="merge-opt-info">
        <div class="merge-opt-name">${esc(t.name||t.email||"Unknown")}
          <span class="badge ${normStatus(t.status)}" style="margin-left:6px">${normStatus(t.status)}</span>
        </div>
        <div class="merge-opt-subject">${esc(t.subject||"No subject")}</div>
      </div>
      <span style="font-size:11px;color:#96a2b0;flex-shrink:0">${fmtShort(t.createdAt)}</span>
    `;
    opt.addEventListener("click",()=>{
      document.querySelectorAll(".merge-option").forEach(o=>o.classList.remove("selected"));
      opt.classList.add("selected");
      opt.querySelector("input[type=radio]").checked=true;
      mergeTargetId=t.id;
      if (mergeConfirmBtn) mergeConfirmBtn.disabled=false;
    });
    mergeList.appendChild(opt);
  });
}

// Close modal
[mergeClose, mergeCancelBtn].forEach(btn=>{
  btn?.addEventListener("click",()=>{
    if (mergeOverlay) mergeOverlay.style.display="none";
    mergeTargetId=null;
  });
});

// Confirm merge
mergeConfirmBtn?.addEventListener("click", async()=>{
  if (!mergeTargetId || !currentTicketId) return;
  mergeConfirmBtn.disabled=true;
  mergeConfirmBtn.textContent="Merging…";

  await performMerge(currentTicketId, mergeTargetId);

  mergeConfirmBtn.textContent="Merge";
  if (mergeOverlay) mergeOverlay.style.display="none";
  mergeTargetId=null;
  selectedForMerge.clear();
  if (mergeBtn) mergeBtn.disabled=true;
  await loadTickets();
  await openTicket(currentTicketId);
});

/**
 * Merge strategy (Zendesk-style):
 *   - Move all messages from `fromId` into `intoId`
 *   - Add a system note in `intoId` thread announcing the merge
 *   - Close/mark `fromId` as merged
 *   - Record mergedFrom[] on `intoId`
 */
async function performMerge(intoId, fromId) {
  const now = Date.now();

  // 1) fetch messages of the source ticket
  const msgSnap = await getDocs(
    query(collection(db,"ticket_messages"), where("ticketId","==",fromId))
  );

  // 2) re-point them to the target ticket
  const batch = writeBatch(db);
  msgSnap.docs.forEach(d=>{
    batch.update(doc(db,"ticket_messages",d.id),{ticketId:intoId});
  });
  await batch.commit();

  // 3) get source ticket info for the system note
  const fromSnap = await getDoc(doc(db,"tickets",fromId));
  const fromData = fromSnap.exists()?fromSnap.data():{};

  // 4) add system note announcing the merge
  await addDoc(collection(db,"ticket_messages"),{
    ticketId:    intoId,
    sender:      "system",
    senderName:  "System",
    bodyHtml:    `<p>🔗 <strong>Ticket merged:</strong> Messages from ticket by
                  <em>${esc(fromData.name||fromData.email||"Unknown")}</em>
                  ("<em>${esc(fromData.subject||"No subject")}</em>")
                  were merged into this ticket.</p>`,
    isNote:      true,
    createdAt:   now
  });

  // 5) close the source ticket and mark as merged
  await updateDoc(doc(db,"tickets",fromId),{
    status:    "closed",
    mergedInto: intoId,
    updatedAt: now
  });

  // 6) record merge history on target ticket
  const intoSnap = await getDoc(doc(db,"tickets",intoId));
  const existing = intoSnap.exists()?intoSnap.data().mergedFrom||[]:[fromId];
  const mergedFrom = [...new Set([...existing, fromId])];

  await updateDoc(doc(db,"tickets",intoId),{
    updatedAt:          now,
    lastMessageAt:      now,
    lastMessagePreview: `[Merged ticket from ${esc(fromData.name||fromData.email||"Unknown")}]`,
    mergedFrom
  });
}

/* ══════════════════════════════════════════════════════════
   DRAGGABLE RESIZERS
   Three resizers:
     resizerLD  — col: list  ↔ detail
     resizerDS  — col: detail ↔ sidebar
     resizerTR  — row: thread ↔ reply (inside panel-detail)
══════════════════════════════════════════════════════════ */

function makeColResizer(resizerId, panelAId, panelBId) {
  const handle  = $(resizerId);
  const panelA  = $(panelAId);
  if (!handle || !panelA) return;

  let startX, startW;

  handle.addEventListener("mousedown", e=>{
    e.preventDefault();
    startX = e.clientX;
    startW = panelA.getBoundingClientRect().width;
    handle.classList.add("dragging");
    document.body.classList.add("resizing-col");

    function onMove(ev) {
      const delta = ev.clientX - startX;
      const newW  = Math.max(panelA.style.minWidth ? parseInt(panelA.style.minWidth) : 180,
                    Math.min(startW + delta, 600));
      panelA.style.width = newW + "px";
    }
    function onUp() {
      handle.classList.remove("dragging");
      document.body.classList.remove("resizing-col");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
  });
}

function makeRowResizer(resizerId, topElId, bottomElId) {
  const handle = $(resizerId);
  const topEl  = $(topElId);
  const botEl  = $(bottomElId);
  if (!handle || !topEl || !botEl) return;

  let startY, startTopH, startBotH;

  handle.addEventListener("mousedown", e=>{
    e.preventDefault();
    startY     = e.clientY;
    startTopH  = topEl.getBoundingClientRect().height;
    startBotH  = botEl.getBoundingClientRect().height;
    handle.classList.add("dragging");
    document.body.classList.add("resizing-row");

    function onMove(ev) {
      const delta = ev.clientY - startY;
      const newTopH = Math.max(60, startTopH + delta);
      const newBotH = Math.max(60, startBotH - delta);
      topEl.style.flex = "none";
      topEl.style.height = newTopH + "px";
      botEl.style.flex = "none";
      botEl.style.height = newBotH + "px";
    }
    function onUp() {
      handle.classList.remove("dragging");
      document.body.classList.remove("resizing-row");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
  });
}

/* ── Init ────────────────────────────────────────────────── */
/* ── Header height resizer ───────────────────────────────── */
function makeHeaderResizer(resizerId, headerId) {
  const handle = document.getElementById(resizerId);
  const header = document.getElementById(headerId);
  if (!handle || !header) return;

  let startY, startH;

  handle.addEventListener("mousedown", e => {
    e.preventDefault();
    startY = e.clientY;
    startH = header.getBoundingClientRect().height;
    handle.classList.add("dragging");
    document.body.classList.add("resizing-row");

    function onMove(ev) {
      const delta = ev.clientY - startY;
      const newH  = Math.max(70, Math.min(startH + delta, 240));
      header.style.minHeight = newH + "px";
      header.style.maxHeight = newH + "px";
    }
    function onUp() {
      handle.classList.remove("dragging");
      document.body.classList.remove("resizing-row");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  showEmptyState();
  loadTickets();

  // wire resizers
  makeColResizer("resizerLD", "panelList",    "panelDetail");
  makeColResizer("resizerDS", "panelSidebar", "panelDetail");
  makeRowResizer("resizerTR", "ticketThread", "tdReply");

  // header height resizer (drag the bottom edge of the ticket header)
  makeHeaderResizer("headerResizer", "tdHeader");
});
