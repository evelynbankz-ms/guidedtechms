/* ============================================================
   FILE: app/portal-services.js
   Page 1 — Services & Pricing with Stripe + Vercel integration
   ============================================================ */

import { db, auth } from "../admin/firebase.js";
import { authReady, currentUser, esc, fmtPrice } from "./portal-layout.js";
import {
  collection, getDocs, query, where, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
  signInWithPopup, GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const loadText = document.getElementById("loadText");

/* ══════════════════════════════
   STRIPE CHECKOUT INTEGRATION
══════════════════════════════ */

/* ── Stripe publishable key (PLACEHOLDER) ── */
const STRIPE_PUBLISHABLE_KEY = "pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE";

/* ── Load Stripe.js ── */
let stripe = null;
const stripeScript = document.createElement("script");
stripeScript.src = "https://js.stripe.com/v3/";
stripeScript.onload = () => {
  stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
};
document.head.appendChild(stripeScript);

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
        data-svc-price="${price}"
        data-svc-type="service">
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
        data-plan-price="${price}"
        data-plan-billing="${billing}"
        data-svc-type="plan">
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
   AUTH CHECK → STRIPE CHECKOUT
══════════════════════════════ */
async function initiateCheckout(itemData) {
  // 1. Ensure user is signed in
  if (!currentUser) {
    const confirmed = confirm("You need to sign in to continue. Sign in now?");
    if (!confirmed) return;

    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!currentUser) {
        alert("Sign-in failed. Please try again.");
        return;
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        alert("Sign-in failed. Please try again.");
      }
      return;
    }
  }

  // 2. Create checkout session document in Firestore
  const checkoutData = {
    userId:    currentUser.uid,
    userEmail: currentUser.email,
    itemType:  itemData.type,
    itemId:    itemData.id,
    itemName:  itemData.name,
    price:     itemData.price,
    billing:   itemData.billing || null,
    status:    "pending",
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "checkoutSessions"), checkoutData);

    // 3. Call Vercel API to create Stripe session
    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: docRef.id }),
    });

    const result = await response.json();

    if (!result.success || !result.sessionId) {
      alert("Failed to create checkout session. Please try again.");
      return;
    }

    // 4. Redirect to Stripe Checkout
    if (!stripe) {
      alert("Stripe is still loading. Please try again in a moment.");
      return;
    }

    const { error } = await stripe.redirectToCheckout({ sessionId: result.sessionId });
    if (error) {
      console.error("Stripe redirect error:", error);
      alert("Failed to redirect to checkout. Please try again.");
    }

  } catch (err) {
    console.error("Checkout error:", err);
    alert("Failed to start checkout. Please try again.");
  }
}

/* ══════════════════════════════
   BUTTON CLICK HANDLERS
══════════════════════════════ */
document.addEventListener("click", e => {
  // Service activation
  const svcBtn = e.target.closest("[data-activate-svc]");
  if (svcBtn) {
    e.preventDefault();
    svcBtn.disabled = true;
    svcBtn.textContent = "Processing…";

    initiateCheckout({
      type: "service",
      id:   svcBtn.dataset.activateSvc,
      name: svcBtn.dataset.svcName,
      price: parseFloat(svcBtn.dataset.svcPrice) || 0,
    }).finally(() => {
      svcBtn.disabled = false;
      svcBtn.textContent = "Subscribe to Activate";
    });
    return;
  }

  // Plan subscription
  const planBtn = e.target.closest("[data-subscribe-plan]");
  if (planBtn) {
    e.preventDefault();
    planBtn.disabled = true;
    planBtn.textContent = "Processing…";

    initiateCheckout({
      type:    "plan",
      id:      planBtn.dataset.subscribePlan,
      name:    planBtn.dataset.planName,
      price:   parseFloat(planBtn.dataset.planPrice) || 0,
      billing: planBtn.dataset.planBilling,
    }).finally(() => {
      planBtn.disabled = false;
      planBtn.textContent = "Get Started";
    });
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
