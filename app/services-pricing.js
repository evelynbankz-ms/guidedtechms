/* ==============================
   FILE: app/services-pricing.js
   ============================== */

import { db, auth } from "../admin/firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ------------------------------
   Defensive helpers (like your homepage)
-------------------------------- */
const safeQuery = (sel) => {
  try { return document.querySelector(sel); } catch { return null; }
};

/* ------------------------------
   DOM Refs
-------------------------------- */
const servicesGrid = safeQuery("#servicesGrid");
const plansGrid = safeQuery("#plansGrid");
const servicesEmpty = safeQuery("#servicesEmpty");
const plansEmpty = safeQuery("#plansEmpty");

const authDot = safeQuery("#authDot");
const authText = safeQuery("#authText");
const loadText = safeQuery("#loadText");

const btnLogin = safeQuery("#btnLogin");
const btnLogout = safeQuery("#btnLogout");

/* ------------------------------
   Utils
-------------------------------- */
function setLoading(msg) {
  if (loadText) loadText.textContent = msg || "";
}

function money(cents) {
  if (typeof cents !== "number") return "$—";
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function esc(str) {
  return String(str ?? "").replace(/[<>&"]/g, (ch) => {
    const map = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" };
    return map[ch] || ch;
  });
}

function setAuthUI(user) {
  if (user) {
    if (authDot) authDot.style.background = "#16a34a";
    if (authText) authText.textContent = `Signed in as ${user.email || "user"}`;
    if (btnLogin) btnLogin.style.display = "none";
    if (btnLogout) btnLogout.style.display = "inline-flex";
  } else {
    if (authDot) authDot.style.background = "#d1d5db";
    if (authText) authText.textContent = "Not signed in";
    if (btnLogin) btnLogin.style.display = "inline-flex";
    if (btnLogout) btnLogout.style.display = "none";
  }
}

/* ------------------------------
   Render
-------------------------------- */
function renderServiceCard(service, user) {
  const icon = esc(service.icon || "🛠️");
  const title = esc(service.name || "Service");
  const desc = esc(service.description || "Brief service description.");
  const price = money(service.fromPriceCents);

  const disabled = user ? "" : "disabled";
  const label = user ? "Subscribe to Activate" : "Log in to Subscribe";

  return `
    <article class="sp-card">
      <div class="sp-icon" aria-hidden="true">${icon}</div>
      <div class="sp-card-title">${title}</div>
      <div class="sp-card-desc">${desc}</div>

      <div class="sp-pricebox">
        <div>
          <div class="sp-mini">From</div>
          <div class="sp-price">${price}</div>
        </div>
        <button class="sp-action js-subscribe-service" data-id="${esc(service.id)}" ${disabled}>
          ${label}
        </button>
      </div>
    </article>
  `;
}

function renderPlanCard(plan, user) {
  const icon = esc(plan.icon || "📦");
  const name = esc(plan.name || "Plan");
  const price = money(plan.priceCents);
  const interval = esc(plan.interval || "month");

  const features = Array.isArray(plan.features) ? plan.features : [];
  const featuresHtml = features.slice(0, 6).map(f => `
    <div class="sp-feature">
      <div class="sp-check" aria-hidden="true">✓</div>
      <div>${esc(f)}</div>
    </div>
  `).join("");

  const disabled = user ? "" : "disabled";
  const label = user ? "Get Started" : "Log in to Get Started";

  return `
    <article class="sp-card">
      <div class="sp-icon" aria-hidden="true">${icon}</div>
      <div class="sp-card-title">${name}</div>

      <div>
        <span class="sp-plan-price">${price}</span>
        <span class="sp-plan-interval"> / ${interval}</span>
      </div>

      <div class="sp-card-desc">${esc(plan.description || "Plan description")}</div>

      <div class="sp-features">
        ${featuresHtml || `<div class="sp-mini">Add features[] in Firestore</div>`}
      </div>

      <div style="margin-top:auto;">
        <button class="sp-action sp-plan-btn js-subscribe-plan" data-id="${esc(plan.id)}" ${disabled}>
          ${label}
        </button>
      </div>
    </article>
  `;
}

/* ------------------------------
   Firestore loaders
-------------------------------- */
async function loadServices(user) {
  if (!servicesGrid) return;

  servicesGrid.setAttribute("aria-busy", "true");
  servicesGrid.innerHTML = "";
  if (servicesEmpty) servicesEmpty.style.display = "none";

  const snap = await getDocs(collection(db, "services"));
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (!items.length) {
    if (servicesEmpty) servicesEmpty.style.display = "block";
  } else {
    servicesGrid.innerHTML = items.map(s => renderServiceCard(s, user)).join("");
  }

  servicesGrid.setAttribute("aria-busy", "false");
}

async function loadPlans(user) {
  if (!plansGrid) return;

  plansGrid.setAttribute("aria-busy", "true");
  plansGrid.innerHTML = "";
  if (plansEmpty) plansEmpty.style.display = "none";

  const snap = await getDocs(collection(db, "plans"));
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (!items.length) {
    if (plansEmpty) plansEmpty.style.display = "block";
  } else {
    plansGrid.innerHTML = items.map(p => renderPlanCard(p, user)).join("");
  }

  plansGrid.setAttribute("aria-busy", "false");
}

/* ------------------------------
   Subscription request
-------------------------------- */
async function createCheckoutRequest({ type, refId }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please log in first.");

  await addDoc(collection(db, "checkoutSessions"), {
    uid: user.uid,
    email: user.email || "",
    type,      // "service" or "plan"
    refId,     // doc id from services/plans
    status: "created",
    createdAt: serverTimestamp(),

    // PLACEHOLDER (CAPS):
    // IF YOU USE STRIPE OR ANY PAYMENT PROVIDER, ADD PRICE IDS + SUCCESS/CANCEL URLS HERE,
    // THEN USE A CLOUD FUNCTION TO CREATE A REAL CHECKOUT SESSION URL.
    // priceId: "STRIPE_PRICE_ID_HERE",
    // successUrl: window.location.origin + "/app/dashboard.html",
    // cancelUrl: window.location.href
  });

  alert("Subscription request created. NEXT: Connect a checkout system (e.g., Stripe + Cloud Function).");
}

/* ------------------------------
   Events
-------------------------------- */
btnLogin?.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error(e);
    alert("Login failed. Check Firebase Auth provider + allowed domains.");
  }
});

btnLogout?.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error(e);
    alert("Logout failed.");
  }
});

document.addEventListener("click", async (e) => {
  const serviceBtn = e.target.closest?.(".js-subscribe-service");
  const planBtn = e.target.closest?.(".js-subscribe-plan");

  try {
    if (serviceBtn) {
      const id = serviceBtn.getAttribute("data-id");
      serviceBtn.disabled = true;
      await createCheckoutRequest({ type: "service", refId: id });
      serviceBtn.disabled = false;
    }

    if (planBtn) {
      const id = planBtn.getAttribute("data-id");
      planBtn.disabled = true;
      await createCheckoutRequest({ type: "plan", refId: id });
      planBtn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Something went wrong.");
    if (serviceBtn) serviceBtn.disabled = false;
    if (planBtn) planBtn.disabled = false;
  }
});

/* ------------------------------
   Init
-------------------------------- */
async function refresh(user) {
  setLoading("Loading services and plans…");
  try {
    await Promise.all([loadServices(user), loadPlans(user)]);
    setLoading("");
  } catch (e) {
    console.error(e);
    setLoading("Failed to load data. Check Firestore rules.");
  }
}

onAuthStateChanged(auth, (user) => {
  setAuthUI(user);
  refresh(user);
});

// First paint
setAuthUI(null);
setLoading("Loading…");

// SAFETY: Prevent clicks inside the menu from bubbling to the overlay
menu.addEventListener("click", (e) => {
  e.stopPropagation();
});

// SAFETY: Only close when clicking directly on overlay (not children)
overlay.addEventListener("click", (e) => {
  if (e.target !== overlay) return;
  menu.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
  document.querySelectorAll(".nav-item.open").forEach(i => i.classList.remove("open"));
});
