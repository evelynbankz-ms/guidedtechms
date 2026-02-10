/* ============================================================
   FILE: app/portal-services.js
   Page 1 — Services & Pricing
   ============================================================ */

import { db } from "../admin/firebase.js";
import { authReady, currentUser, esc, fmtPrice } from "./portal-layout.js";
import {
  collection, getDocs, query, where, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const loadText = document.getElementById("loadText");

/* ══════════════════════════════
   RENDER HELPERS
══════════════════════════════ */
function renderServiceCard(svc, signedIn) {
  const price  = Number(svc.price) || 0;
  const period = svc.pricePeriod || "";
  return `
    <div class="svc-card" data-svc-id="${esc(svc.id)}">
      <div class="svc-icon-ring">${esc(svc.icon || "⚙️")}</div>
      <div class="svc-name">${esc(svc.name || "Service")}</div>
      <div class="svc-desc">${esc(svc.description || "")}</div>
      <div class="svc-price-box">
        <div class="svc-from">From</div>
        <div class="svc-amount">
          $${esc(fmtPrice(price))}
          ${period ? `<span>${esc(period)}</span>` : ""}
        </div>
      </div>
      <button class="btn-subscribe"
        data-activate-svc="${esc(svc.id)}"
        data-svc-name="${esc(svc.name || "")}"
        ${!signedIn ? "disabled" : ""}>
        Subscribe to Activate
      </button>
    </div>`;
}

function renderPlanCard(plan, signedIn) {
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
    <div class="plan-card${popular ? " is-popular" : ""}" data-plan-id="${esc(plan.id)}">
      ${popular ? `<div class="plan-popular-badge">⭐ Most Popular</div>` : ""}
      ${plan.icon ? `<div class="plan-icon">${esc(plan.icon)}</div>` : ""}
      <div class="plan-name">${esc(plan.name || "Plan")}</div>
      <div class="plan-pricing">
        <span class="plan-price">$${esc(fmtPrice(price))}</span>
        <span class="plan-period">/ ${esc(billing)}</span>
      </div>
      ${plan.description ? `<div class="plan-desc">${esc(plan.description)}</div>` : ""}
      ${featHTML ? `<div class="plan-divider"></div><div class="plan-features">${featHTML}</div>` : ""}
      <button class="btn-get-started"
        data-subscribe-plan="${esc(plan.id)}"
        data-plan-name="${esc(plan.name || "")}"
        ${!signedIn ? "disabled" : ""}>
        Get Started
      </button>
    </div>`;
}

/* ══════════════════════════════
   LOAD DATA
══════════════════════════════ */
async function loadServices(signedIn) {
  const flow  = document.getElementById("servicesFlow");
  const empty = document.getElementById("servicesEmpty");
  if (!flow) return;

  try {
    const snap = await getDocs(query(collection(db, "services"), where("active", "==", true)));
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));

    if (!items.length) {
      flow.innerHTML = "";
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
      flow.innerHTML = items.map(s => renderServiceCard(s, signedIn)).join("");
    }
  } catch (err) {
    console.error("Load services:", err);
    flow.innerHTML = `<p style="color:var(--muted);font-size:13px;padding:20px 0">Failed to load services.</p>`;
  } finally {
    flow.removeAttribute("aria-busy");
  }
}

async function loadPlans(signedIn) {
  const grid  = document.getElementById("plansGrid");
  const empty = document.getElementById("plansEmpty");
  if (!grid) return;

  try {
    const snap = await getDocs(query(collection(db, "plans"), where("active", "==", true)));
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));

    if (!items.length) {
      grid.innerHTML = "";
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
      grid.innerHTML = items.map(p => renderPlanCard(p, signedIn)).join("");
    }
  } catch (err) {
    console.error("Load plans:", err);
    grid.innerHTML = `<p style="color:var(--muted);font-size:13px;padding:20px 0">Failed to load plans.</p>`;
  } finally {
    grid.removeAttribute("aria-busy");
  }
}

/* ══════════════════════════════
   ACTIVATE SERVICE click
══════════════════════════════ */
document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-activate-svc]");
  if (!btn || !currentUser) return;

  btn.disabled = true;
  btn.textContent = "Requesting…";

  try {
    await addDoc(collection(db, "serviceActivations"), {
      userId:    currentUser.uid,
      userEmail: currentUser.email,
      serviceId: btn.dataset.activateSvc,
      serviceName: btn.dataset.svcName,
      status:    "pending",
      createdAt: serverTimestamp(),
    });
    btn.textContent = "✓ Requested";
    btn.classList.add("activated");
    btn.closest(".svc-card")?.classList.add("is-active");
  } catch (err) {
    console.error("Activate service:", err);
    btn.disabled = false;
    btn.textContent = "Subscribe to Activate";
    alert("Failed to send request. Please try again.");
  }
});

/* ══════════════════════════════
   SUBSCRIBE TO PLAN click
══════════════════════════════ */
document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-subscribe-plan]");
  if (!btn || !currentUser) return;

  btn.disabled = true;
  btn.textContent = "Processing…";

  try {
    await addDoc(collection(db, "checkoutSessions"), {
      userId:    currentUser.uid,
      userEmail: currentUser.email,
      planId:    btn.dataset.subscribePlan,
      planName:  btn.dataset.planName,
      status:    "pending",
      createdAt: serverTimestamp(),
    });
    btn.textContent = "✓ Pending Review";
    btn.classList.add("subscribed");
  } catch (err) {
    console.error("Subscribe plan:", err);
    btn.disabled = false;
    btn.textContent = "Get Started";
    alert("Failed to start subscription. Please try again.");
  }
});

/* ══════════════════════════════
   BOOT
══════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
  loadText.textContent = "Loading…";
  const user = await authReady;

  loadText.textContent = "Loading services…";
  await loadServices(!!user);

  loadText.textContent = "Loading plans…";
  await loadPlans(!!user);

  loadText.textContent = "Ready";
});
