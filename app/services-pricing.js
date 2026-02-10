/* ==============================
   FILE: app/services-pricing.js
   Frontend logic for Services & Pricing page
   ============================== */

import { db, auth } from "../admin/firebase.js";
import { 
  collection, 
  getDocs, 
  query, 
  where,
  addDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ====================
   ESCAPE HTML
==================== */
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

/* ====================
   AUTH STATE
==================== */
let currentUser = null;

const authDot = document.getElementById("authDot");
const authText = document.getElementById("authText");
const loadText = document.getElementById("loadText");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  
  if (user) {
    // Signed in
    authDot.style.background = "#10b981";
    authText.textContent = `Signed in as ${user.email}`;
    
    if (btnLogin) btnLogin.style.display = "none";
    if (btnLogout) btnLogout.style.display = "inline-block";
  } else {
    // Not signed in
    authDot.style.background = "#ef4444";
    authText.textContent = "Not signed in";
    
    if (btnLogin) btnLogin.style.display = "inline-block";
    if (btnLogout) btnLogout.style.display = "none";
  }
});

/* ====================
   LOGIN/LOGOUT
==================== */
btnLogin?.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed. Please try again.");
  }
});

btnLogout?.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout error:", err);
  }
});

/* ====================
   LOAD SERVICES
==================== */
async function loadServices() {
  const servicesGrid = document.getElementById("servicesGrid");
  const servicesEmpty = document.getElementById("servicesEmpty");
  
  try {
    const q = query(
      collection(db, "services"),
      where("active", "==", true)
    );
    const snapshot = await getDocs(q);
    
    const services = [];
    snapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });
    
    if (services.length === 0) {
      servicesGrid.innerHTML = "";
      servicesEmpty.style.display = "block";
      return;
    }
    
    servicesEmpty.style.display = "none";
    servicesGrid.innerHTML = services.map(service => `
      <div class="sp-card">
        ${service.icon ? `<div class="sp-icon">${escapeHtml(service.icon)}</div>` : ''}
        
        <div class="sp-card-title">${escapeHtml(service.name || "Untitled")}</div>
        <div class="sp-card-desc">${escapeHtml(service.description || "")}</div>
        
        <div class="sp-pricebox">
          <div>
            <div class="sp-mini">Price</div>
            <div class="sp-price">$${service.price || 0}</div>
          </div>
          <div>
            <div class="sp-mini">${escapeHtml(service.pricePeriod || "")}</div>
          </div>
        </div>
        
        <button 
          class="sp-action" 
          data-activate-service="${service.id}"
          ${!currentUser ? 'disabled title="Please sign in to activate"' : ''}>
          ${currentUser ? 'Activate' : 'Sign in to activate'}
        </button>
      </div>
    `).join('');
    
  } catch (err) {
    console.error("Error loading services:", err);
    servicesGrid.innerHTML = `<div class="sp-empty">Error loading services. Please refresh.</div>`;
  } finally {
    servicesGrid.removeAttribute("aria-busy");
  }
}

/* ====================
   LOAD PLANS
==================== */
async function loadPlans() {
  const plansGrid = document.getElementById("plansGrid");
  const plansEmpty = document.getElementById("plansEmpty");
  
  try {
    const q = query(
      collection(db, "plans"),
      where("active", "==", true)
    );
    const snapshot = await getDocs(q);
    
    const plans = [];
    snapshot.forEach(doc => {
      plans.push({ id: doc.id, ...doc.data() });
    });
    
    if (plans.length === 0) {
      plansGrid.innerHTML = "";
      plansEmpty.style.display = "block";
      return;
    }
    
    plansEmpty.style.display = "none";
    plansGrid.innerHTML = plans.map(plan => {
      const features = Array.isArray(plan.features) 
        ? plan.features.map(f => `
            <div class="sp-feature">
              <div class="sp-check">✓</div>
              <span>${escapeHtml(f)}</span>
            </div>
          `).join('')
        : '';
      
      return `
        <div class="sp-card">
          ${plan.icon ? `<div class="sp-icon">${escapeHtml(plan.icon)}</div>` : ''}
          
          <div class="sp-card-title">${escapeHtml(plan.name || "Untitled")}</div>
          <div class="sp-card-desc">${escapeHtml(plan.description || "")}</div>
          
          ${features ? `<div class="sp-features">${features}</div>` : ''}
          
          <div class="sp-pricebox">
            <div>
              <div class="sp-mini">Monthly price</div>
              <div class="sp-price">$${plan.price || 0}</div>
            </div>
            <div>
              <div class="sp-mini">${escapeHtml(plan.billingPeriod || "monthly")}</div>
            </div>
          </div>
          
          <button 
            class="sp-action sp-plan-btn" 
            data-subscribe-plan="${plan.id}"
            ${!currentUser ? 'disabled title="Please sign in to subscribe"' : ''}>
            ${currentUser ? 'Subscribe' : 'Sign in to subscribe'}
          </button>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error("Error loading plans:", err);
    plansGrid.innerHTML = `<div class="sp-empty">Error loading plans. Please refresh.</div>`;
  } finally {
    plansGrid.removeAttribute("aria-busy");
  }
}

/* ====================
   ACTIVATE SERVICE
==================== */
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-activate-service]");
  if (!btn || !currentUser) return;
  
  const serviceId = btn.dataset.activateService;
  btn.disabled = true;
  btn.textContent = "Processing...";
  
  try {
    // Create a service activation record
    await addDoc(collection(db, "serviceActivations"), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      serviceId: serviceId,
      status: "pending",
      createdAt: serverTimestamp()
    });
    
    alert("Service activation request submitted! We'll contact you shortly.");
    btn.textContent = "Requested";
    
  } catch (err) {
    console.error("Activation error:", err);
    alert("Failed to activate service. Please try again.");
    btn.disabled = false;
    btn.textContent = "Activate";
  }
});

/* ====================
   SUBSCRIBE TO PLAN
==================== */
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-subscribe-plan]");
  if (!btn || !currentUser) return;
  
  const planId = btn.dataset.subscribePlan;
  btn.disabled = true;
  btn.textContent = "Processing...";
  
  try {
    // Create a checkout session document
    // Note: You need a backend function to process this
    await addDoc(collection(db, "checkoutSessions"), {
      userId: currentUser.uid,
      userEmail: currentUser.email,
      planId: planId,
      status: "pending",
      createdAt: serverTimestamp()
    });
    
    alert("Subscription request submitted! Redirecting to payment...\n\nNote: You need to set up a payment processor (Stripe, etc.) to complete this flow.");
    btn.textContent = "Pending";
    
  } catch (err) {
    console.error("Subscription error:", err);
    alert("Failed to start subscription. Please try again.");
    btn.disabled = false;
    btn.textContent = "Subscribe";
  }
});

/* ====================
   INITIAL LOAD
==================== */
document.addEventListener("DOMContentLoaded", async () => {
  loadText.textContent = "Loading services...";
  await loadServices();
  
  loadText.textContent = "Loading plans...";
  await loadPlans();
  
  loadText.textContent = "Ready";
});
