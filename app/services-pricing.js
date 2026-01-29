// =========================
// SERVICES & PRICING (JS)
// Firebase Auth + Firestore
// =========================

// IMPORTANT: This file uses Firebase v10+ modular SDK from CDN.
// If your site already bundles Firebase via your build system,
// replace these imports with your installed Firebase imports.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================
   1) CONFIG
   ========================= */

// TODO: INSERT YOUR FIREBASE CONFIG HERE (FROM FIREBASE CONSOLE)
const firebaseConfig = {
  // apiKey: "....",
  // authDomain: "....",
  // projectId: "....",
  // storageBucket: "....",
  // messagingSenderId: "....",
  // appId: "...."
};

/* =========================
   2) INIT
   ========================= */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   3) ELEMENTS
   ========================= */

const servicesGrid = document.getElementById("servicesGrid");
const plansGrid = document.getElementById("plansGrid");
const servicesEmpty = document.getElementById("servicesEmpty");
const plansEmpty = document.getElementById("plansEmpty");

const btnLogin = document.getElementById("btnLogin");
const btnGetStarted = document.getElementById("btnGetStarted");
const btnLogout = document.getElementById("btnLogout");

const authDot = document.getElementById("authDot");
const authStatusText = document.getElementById("authStatusText");
const loadingText = document.getElementById("loadingText");

const userPill = document.getElementById("userPill");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const authHint = document.getElementById("authHint");

const navMySubscriptions = document.getElementById("navMySubscriptions");
const navDashboard = document.getElementById("navDashboard");

/* =========================
   4) UTILITIES
   ========================= */

function setLoading(isLoading, label = "Loading…") {
  loadingText.textContent = isLoading ? label : "";
}

function setAuthUI(user) {
  if (user) {
    authDot.style.background = "#16a34a"; // green
    authStatusText.textContent = "Signed in";
    btnLogin.hidden = true;

    userPill.hidden = false;
    authHint.hidden = true;

    const displayName = user.displayName || "Account";
    const email = user.email || "";
    userName.textContent = displayName;
    userEmail.textContent = email;

    const initial = (displayName || email || "U").trim().charAt(0).toUpperCase();
    userAvatar.textContent = initial;
  } else {
    authDot.style.background = "#d1d5db"; // gray
    authStatusText.textContent = "Not signed in";
    btnLogin.hidden = false;

    userPill.hidden = true;
    authHint.hidden = false;
  }
}

function money(amountCents) {
  if (typeof amountCents !== "number") return "$—";
  const dollars = amountCents / 100;
  return dollars.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function safeText(str) {
  return String(str ?? "").replace(/[<>&"]/g, (ch) => {
    const map = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" };
    return map[ch] || ch;
  });
}

/* =========================
   5) RENDER
   ========================= */

function renderServiceCard(service, user) {
  const title = safeText(service.name || "Service");
  const desc = safeText(service.description || "Brief description of the service.");
  const fromPrice = money(service.fromPriceCents ?? null);
  const icon = safeText(service.icon || "🛠️");

  const disabled = !user ? "disabled" : "";
  const ctaText = user ? "Subscribe to Activate" : "Log in to Subscribe";

  return `
    <article class="card">
      <div class="card__icon" aria-hidden="true">${icon}</div>
      <div class="card__title">${title}</div>
      <div class="card__desc">${desc}</div>

      <div class="card__pricebox">
        <div>
          <div class="mini">From</div>
          <div class="price">${fromPrice}</div>
        </div>
        <button class="btn btn--accent js-subscribe-service" data-service-id="${safeText(service.id)}" ${disabled}>
          ${ctaText}
        </button>
      </div>
    </article>
  `;
}

function renderPlanCard(plan, user) {
  const name = safeText(plan.name || "Plan");
  const price = money(plan.priceCents ?? null);
  const interval = safeText(plan.interval || "month");
  const icon = safeText(plan.icon || "📦");

  const features = Array.isArray(plan.features) ? plan.features : [];
  const featuresHtml = features.slice(0, 4).map((f) => `
    <div class="feature">
      <div class="feature__check" aria-hidden="true">✓</div>
      <div>${safeText(f)}</div>
    </div>
  `).join("");

  const disabled = !user ? "disabled" : "";
  const ctaText = user ? "Get Started" : "Log in to Get Started";

  return `
    <article class="card">
      <div class="card__icon" aria-hidden="true">${icon}</div>
      <div class="card__title plan__name">${name}</div>
      <div>
        <span class="plan__price">${price}</span>
        <span class="plan__interval"> / ${interval}</span>
      </div>

      <div class="card__desc">Plan description</div>
      ${featuresHtml || `<div class="badge">Add features in Firestore</div>`}

      <div style="margin-top:auto;">
        <button class="btn btn--primary js-subscribe-plan" data-plan-id="${safeText(plan.id)}" ${disabled}>
          ${ctaText}
        </button>
      </div>
    </article>
  `;
}

/* =========================
   6) DATA LOADERS
   ========================= */

async function loadServices(user) {
  servicesGrid.setAttribute("aria-busy", "true");
  servicesGrid.innerHTML = "";
  servicesEmpty.hidden = true;

  try {
    const snap = await getDocs(collection(db, "services"));
    const items = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

    if (!items.length) {
      servicesEmpty.hidden = false;
      return;
    }

    servicesGrid.innerHTML = items.map((s) => renderServiceCard(s, user)).join("");
  } catch (err) {
    console.error("Failed to load services:", err);
    servicesGrid.innerHTML = `
      <div class="empty">
        Could not load services. Check Firestore rules and collection name <code>services</code>.
      </div>
    `;
  } finally {
    servicesGrid.setAttribute("aria-busy", "false");
  }
}

async function loadPlans(user) {
  plansGrid.setAttribute("aria-busy", "true");
  plansGrid.innerHTML = "";
  plansEmpty.hidden = true;

  try {
    const snap = await getDocs(collection(db, "plans"));
    const items = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

    if (!items.length) {
      plansEmpty.hidden = false;
      return;
    }

    // Optional: highlight one plan if you want, e.g. "Professional"
    plansGrid.innerHTML = items.map((p) => renderPlanCard(p, user)).join("");
  } catch (err) {
    console.error("Failed to load plans:", err);
    plansGrid.innerHTML = `
      <div class="empty">
        Could not load plans. Check Firestore rules and collection name <code>plans</code>.
      </div>
    `;
  } finally {
    plansGrid.setAttribute("aria-busy", "false");
  }
}

/* =========================
   7) SUBSCRIPTION ACTIONS
   ========================= */

/**
 * This creates a "checkout session request" doc in Firestore.
 * Your backend (Cloud Function) should watch this collection and create the real checkout URL.
 */
async function createCheckoutRequest({ type, refId }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  // IMPORTANT: You need Firestore security rules to allow:
  // - Authenticated users can create docs in "checkoutSessions" with their uid
  // - Users can only read their own docs
  // - Cloud Function can update the doc with the checkout URL
  const docRef = await addDoc(collection(db, "checkoutSessions"), {
    uid: user.uid,
    type, // "service" or "plan"
    refId, // serviceId or planId
    status: "created",
    createdAt: serverTimestamp(),

    // TODO: IF YOU USE STRIPE, YOU MAY ADD: successUrl, cancelUrl, priceId, etc.
    // successUrl: window.location.origin + "/app/dashboard",
    // cancelUrl: window.location.href
  });

  // PLACEHOLDER: Redirect flow
  // YOU NEED A CLOUD FUNCTION TO TURN THIS DOC INTO A REAL CHECKOUT SESSION (E.G., STRIPE) AND WRITE BACK A URL.
  // THEN YOU CAN LISTEN TO THAT DOC CHANGES AND REDIRECT TO docData.url
  alert(
    `Checkout request created (${docRef.id}).\n` +
    `NEXT: ADD CLOUD FUNCTION TO CREATE CHECKOUT URL AND REDIRECT.`
  );
}

/* =========================
   8) EVENTS
   ========================= */

btnLogin.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Login failed:", err);
    alert("Login failed. Check Firebase Auth settings and allowed domains.");
  }
});

btnLogout.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout failed:", err);
  }
});

btnGetStarted.addEventListener("click", () => {
  // If signed in, you may scroll to plans, else prompt login
  if (!auth.currentUser) {
    alert("Please log in to get started.");
    btnLogin.click();
    return;
  }
  document.getElementById("plansGrid").scrollIntoView({ behavior: "smooth", block: "start" });
});

navMySubscriptions.addEventListener("click", (e) => {
  e.preventDefault();
  // PLACEHOLDER: LINK TO YOUR ROUTE
  // INSERT YOUR REAL URL PATH FOR SUBSCRIPTIONS PAGE HERE.
  alert("NAV PLACEHOLDER: LINK THIS TO /app/subscriptions");
});

navDashboard.addEventListener("click", (e) => {
  e.preventDefault();
  // PLACEHOLDER: LINK TO YOUR ROUTE
  // INSERT YOUR REAL URL PATH FOR DASHBOARD PAGE HERE.
  alert("NAV PLACEHOLDER: LINK THIS TO /app/dashboard");
});

// Delegate clicks for dynamic buttons
document.addEventListener("click", async (e) => {
  const serviceBtn = e.target.closest(".js-subscribe-service");
  const planBtn = e.target.closest(".js-subscribe-plan");

  try {
    if (serviceBtn) {
      const serviceId = serviceBtn.getAttribute("data-service-id");
      if (!auth.currentUser) {
        alert("Please log in to subscribe.");
        btnLogin.click();
        return;
      }
      serviceBtn.disabled = true;
      await createCheckoutRequest({ type: "service", refId: serviceId });
      serviceBtn.disabled = false;
    }

    if (planBtn) {
      const planId = planBtn.getAttribute("data-plan-id");
      if (!auth.currentUser) {
        alert("Please log in to subscribe.");
        btnLogin.click();
        return;
      }
      planBtn.disabled = true;
      await createCheckoutRequest({ type: "plan", refId: planId });
      planBtn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Something went wrong.");
    if (serviceBtn) serviceBtn.disabled = false;
    if (planBtn) planBtn.disabled = false;
  }
});

/* =========================
   9) AUTH STATE + INITIAL LOAD
   ========================= */

async function initialLoad(user) {
  setLoading(true, "Loading services and plans…");
  await Promise.all([loadServices(user), loadPlans(user)]);
  setLoading(false);
}

onAuthStateChanged(auth, async (user) => {
  setAuthUI(user);
  await initialLoad(user);
});

// First paint (if auth takes time)
setAuthUI(null);
setLoading(true, "Initializing…");

/* =========================
   10) FIRESTORE DATA SHAPE (REFERENCE)
   =========================

  Collection: services
    Doc fields:
      name: "Lead Generation"
      description: "Generates leads through multi-channel campaigns"
      fromPriceCents: 19900
      icon: "🎯"

  Collection: plans
    Doc fields:
      name: "Basic"
      priceCents: 9900
      interval: "month"
      icon: "📦"
      features: ["Plan description", "Feature 2", "Feature 3"]

  Collection: checkoutSessions (created by this page)
    Doc fields:
      uid, type, refId, status, createdAt
      // Cloud Function should update:
      // status: "ready"
      // url: "https://checkout.stripe.com/..."

*/
