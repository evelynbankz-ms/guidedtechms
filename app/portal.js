/* ============================================================
   FILE: app/portal.js
   Client portal — Services & Pricing page
   Frontend only. Backend subscription hooks marked with TODO.
   ============================================================ */

import { db, auth } from "../admin/firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ══════════════════════════════
   HELPERS
══════════════════════════════ */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])
  );
}

function fmtPrice(price) {
  const p = Number(price) || 0;
  return p % 1 === 0 ? String(p) : p.toFixed(2);
}

/* ══════════════════════════════
   DOM REFS
══════════════════════════════ */
const authDot     = document.getElementById("authDot");
const authText    = document.getElementById("authText");
const loadText    = document.getElementById("loadText");
const btnLogin    = document.getElementById("btnLogin");
const btnLogout   = document.getElementById("btnLogout");
const sidebarAvatar = document.getElementById("sidebarAvatar");
const sidebarName   = document.getElementById("sidebarName");
const sidebarEmail  = document.getElementById("sidebarEmail");

/* ══════════════════════════════
   AUTH
══════════════════════════════ */
let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;

  if (user) {
    authDot.style.background = "#10b981";
    authText.textContent     = `Signed in as ${user.email}`;

    btnLogin.style.display  = "none";
    btnLogout.style.display = "inline-block";

    const initials = (user.displayName || user.email || "?")
      .split(/[\s@]/).slice(0, 2)
      .map(s => s[0]?.toUpperCase() || "")
      .join("") || "U";

    sidebarAvatar.textContent = initials;
    sidebarName.textContent   = user.displayName || user.email.split("@")[0];
    sidebarEmail.textContent  = user.email;
  } else {
    authDot.style.background = "#ef4444";
    authText.textContent     = "Not signed in — sign in to activate services";

    btnLogin.style.display  = "inline-block";
    btnLogout.style.display = "none";

    sidebarAvatar.textContent = "?";
    sidebarName.textContent   = "Not signed in";
    sidebarEmail.textContent  = "—";
  }

  // Refresh button disabled states after auth change
  refreshActionButtons();
});

btnLogin?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (err) {
    if (err.code !== "auth/popup-closed-by-user") {
      alert("Sign-in failed. Please try again.");
    }
  }
});

btnLogout?.addEventListener("click", () => signOut(auth).catch(console.error));

function refreshActionButtons() {
  document.querySelectorAll(".btn-subscribe, .btn-get-started").forEach(btn => {
    if (btn.classList.contains("activated") || btn.classList.contains("subscribed")) return;
    btn.disabled = !currentUser;
  });
}

/* ══════════════════════════════
   SIDEBAR SMOOTH SCROLL
══════════════════════════════ */
document.querySelectorAll(".sidebar-link[data-section]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    // Active state
    document.querySelectorAll(".sidebar-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const target = document.getElementById(link.dataset.section);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ══════════════════════════════
   LOAD SERVICES FROM FIRESTORE
══════════════════════════════ */
async function loadServices() {
  const flow  = document.getElementById("servicesFlow");
  const empty = document.getElementById("servicesEmpty");

  try {
    const snap = await getDocs(
      query(collection(db, "services"), where("active", "==", true))
    );

    const services = [];
    snap.forEach(doc => services.push({ id: doc.id, ...doc.data() }));

    if (!services.length) {
      flow.innerHTML        = "";
      empty.style.display   = "block";
      flow.removeAttribute("aria-busy");
      return;
    }

    empty.style.display = "none";

    flow.innerHTML = services.map(svc => {
      const price  = Number(svc.price) || 0;
      const period = svc.pricePeriod || "";

      return `
        <div class="svc-card" data-svc-id="${esc(svc.id)}">
          <div class="svc-icon-ring">
            ${esc(svc.icon || "⚙️")}
          </div>
          <div class="svc-name">${esc(svc.name || "Service")}</div>
          <div class="svc-desc">${esc(svc.description || "")}</div>
          <div class="svc-price-box">
            <div class="svc-from">From</div>
            <div class="svc-amount">
              $${esc(fmtPrice(price))}
              ${period ? `<span>${esc(period)}</span>` : ""}
            </div>
          </div>
          <button
            class="btn-subscribe"
            data-activate-svc="${esc(svc.id)}"
            data-svc-name="${esc(svc.name || "")}"
            ${!currentUser ? "disabled" : ""}>
            Subscribe to Activate
          </button>
        </div>`;
    }).join("");

  } catch (err) {
    console.error("Load services:", err);
    flow.innerHTML = `<div class="portal-empty" style="grid-column:1/-1">
      <span class="portal-empty-icon">⚠️</span>
      Failed to load services. Please refresh.
    </div>`;
  } finally {
    flow.removeAttribute("aria-busy");
  }
}

/* ══════════════════════════════
   LOAD PLANS FROM FIRESTORE
══════════════════════════════ */
async function loadPlans() {
  const grid  = document.getElementById("plansGrid");
  const empty = document.getElementById("plansEmpty");

  try {
    const snap = await getDocs(
      query(collection(db, "plans"), where("active", "==", true))
    );

    const plans = [];
    snap.forEach(doc => plans.push({ id: doc.id, ...doc.data() }));

    if (!plans.length) {
      grid.innerHTML      = "";
      empty.style.display = "block";
      grid.removeAttribute("aria-busy");
      return;
    }

    empty.style.display = "none";

    grid.innerHTML = plans.map(plan => {
      const price    = Number(plan.price) || 0;
      const billing  = plan.billingPeriod || "month";
      const features = Array.isArray(plan.features) ? plan.features : [];
      const popular  = !!plan.popular;

      const featHTML = features.map(f => `
        <div class="plan-feat">
          <div class="plan-feat-check">✓</div>
          <span>${esc(f)}</span>
        </div>`).join("");

      return `
        <div class="plan-card${popular ? " is-popular" : ""}"
             data-plan-id="${esc(plan.id)}">

          ${popular ? `<div class="plan-popular-badge">⭐ Most Popular</div>` : ""}

          ${plan.icon ? `<div class="plan-icon">${esc(plan.icon)}</div>` : ""}

          <div class="plan-name">${esc(plan.name || "Plan")}</div>

          <div class="plan-pricing">
            <span class="plan-price">$${esc(fmtPrice(price))}</span>
            <span class="plan-period">/ ${esc(billing)}</span>
          </div>

          ${plan.description
            ? `<div class="plan-desc">${esc(plan.description)}</div>`
            : ""}

          ${featHTML ? `
            <div class="plan-divider"></div>
            <div class="plan-features">${featHTML}</div>
          ` : ""}

          <button
            class="btn-get-started"
            data-subscribe-plan="${esc(plan.id)}"
            data-plan-name="${esc(plan.name || "")}"
            ${!currentUser ? "disabled" : ""}>
            Get Started
          </button>
        </div>`;
    }).join("");

  } catch (err) {
    console.error("Load plans:", err);
    grid.innerHTML = `<div class="portal-empty" style="grid-column:1/-1">
      <span class="portal-empty-icon">⚠️</span>
      Failed to load plans. Please refresh.
    </div>`;
  } finally {
    grid.removeAttribute("aria-busy");
  }
}

/* ══════════════════════════════
   SERVICE ACTIVATION  (frontend only)
   TODO: wire to backend — addDoc("serviceActivations", …)
══════════════════════════════ */
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-activate-svc]");
  if (!btn) return;

  if (!currentUser) {
    authText.textContent     = "Please sign in first to activate a service.";
    authDot.style.background = "#f59e0b";
    return;
  }

  const svcId   = btn.dataset.activateSvc;
  const svcName = btn.dataset.svcName;

  // TODO: await addDoc(collection(db, "serviceActivations"), { userId, svcId, … })
  console.log("[TODO] Activate service:", svcId, svcName);

  btn.textContent = "✓ Requested";
  btn.classList.add("activated");
  btn.disabled = true;
  btn.closest(".svc-card")?.classList.add("is-active");
});

/* ══════════════════════════════
   PLAN SUBSCRIPTION  (frontend only)
   TODO: wire to backend — addDoc("checkoutSessions", …)
══════════════════════════════ */
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-subscribe-plan]");
  if (!btn) return;

  if (!currentUser) {
    authText.textContent     = "Please sign in first to subscribe to a plan.";
    authDot.style.background = "#f59e0b";
    return;
  }

  const planId   = btn.dataset.subscribePlan;
  const planName = btn.dataset.planName;

  // TODO: await addDoc(collection(db, "checkoutSessions"), { userId, planId, … })
  console.log("[TODO] Subscribe to plan:", planId, planName);

  btn.textContent = "✓ Processing…";
  btn.classList.add("subscribed");
  btn.disabled = true;

  unlockDashboard(planName);
});

/* ══════════════════════════════
   DASHBOARD REVEAL
   Called after subscription confirmed
══════════════════════════════ */
function unlockDashboard(planName = "—", since = null) {
  const locked = document.getElementById("dashLocked");
  const active = document.getElementById("dashActive");

  if (locked) locked.style.display = "none";
  if (active) active.style.display = "block";

  const kpiPlan = document.getElementById("kpiPlan");
  if (kpiPlan) kpiPlan.textContent = planName;

  const kpiSince = document.getElementById("kpiSince");
  if (kpiSince) {
    const d = since ? new Date(since) : new Date();
    kpiSince.textContent = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  document.getElementById("dashboard-section")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ══════════════════════════════
   BOOTSTRAP
══════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
  loadText.textContent = "Loading services…";
  await loadServices();

  loadText.textContent = "Loading plans…";
  await loadPlans();

  loadText.textContent = "Ready";

  // TODO: Once backend is wired, check existing subscription here:
  // const sub = await getUserSubscription(currentUser?.uid);
  // if (sub) unlockDashboard(sub.planName, sub.createdAt?.toDate());
});
