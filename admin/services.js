/* ==============================
   FILE: admin/services.js
   Admin logic for Services & Plans
   ============================== */

import { AdminStore, UI } from "./admin.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ====================
   AUTH CHECK
==================== */
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
    return;
  }
  const adminEmailEl = document.getElementById("adminEmail");
  if (adminEmailEl) adminEmailEl.textContent = user.email || "";
});

/* ====================
   LOGOUT
==================== */
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    location.href = "login.html";
  } catch (err) {
    console.error("Logout failed", err);
  }
});

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
   TAB SWITCHING
==================== */
const tabBtns = document.querySelectorAll('.tab-btn');
const servicesTab = document.getElementById('servicesTab');
const plansTab = document.getElementById('plansTab');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    
    // Update buttons
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update content
    if (target === 'services') {
      servicesTab.style.display = 'block';
      plansTab.style.display = 'none';
    } else {
      servicesTab.style.display = 'none';
      plansTab.style.display = 'block';
    }
  });
});

/* ====================
   MODAL MANAGEMENT
==================== */
const serviceModal = document.getElementById('serviceModal');
const planModal = document.getElementById('planModal');
const serviceForm = document.getElementById('serviceForm');
const planForm = document.getElementById('planForm');

// Service Modal Controls
document.getElementById('newServiceBtn').addEventListener('click', () => {
  document.getElementById('serviceModalTitle').textContent = 'Add Service';
  serviceForm.reset();
  serviceForm.querySelector('[name="id"]').value = '';
  serviceModal.classList.add('show');
});

document.getElementById('serviceModalClose').addEventListener('click', () => {
  serviceModal.classList.remove('show');
});

document.getElementById('serviceCancelBtn').addEventListener('click', () => {
  serviceModal.classList.remove('show');
});

// Plan Modal Controls
document.getElementById('newPlanBtn').addEventListener('click', () => {
  document.getElementById('planModalTitle').textContent = 'Add Subscription Plan';
  planForm.reset();
  planForm.querySelector('[name="id"]').value = '';
  planModal.classList.add('show');
});

document.getElementById('planModalClose').addEventListener('click', () => {
  planModal.classList.remove('show');
});

document.getElementById('planCancelBtn').addEventListener('click', () => {
  planModal.classList.remove('show');
});

// Close modals on outside click
window.addEventListener('click', (e) => {
  if (e.target === serviceModal) {
    serviceModal.classList.remove('show');
  }
  if (e.target === planModal) {
    planModal.classList.remove('show');
  }
});

/* ====================
   LOAD SERVICES
==================== */
async function loadServices() {
  const services = await AdminStore.all("services");
  
  UI.renderList("#servicesList", services, service => {
    const statusClass = service.active ? 'status-active' : 'status-inactive';
    const statusText = service.active ? 'Active' : 'Inactive';
    
    return `
      <div class="meta">
        ${service.icon ? `<span class="service-icon">${escapeHtml(service.icon)}</span>` : ''}
        <div style="flex:1">
          <div class="title">${escapeHtml(service.name || "(no name)")}</div>
          <div class="small">${escapeHtml(service.description || "")}</div>
          <div class="service-meta">
            <span><strong>$${service.price || 0}</strong> ${escapeHtml(service.pricePeriod || '')}</span>
            ${service.category ? `<span>• ${escapeHtml(service.category)}</span>` : ''}
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn btn-ghost"
          data-edit-service="${service.id}">
          Edit
        </button>

        <button class="btn btn-danger"
          data-remove="services"
          data-id="${service.id}">
          Delete
        </button>
      </div>
    `;
  });
}

/* ====================
   LOAD PLANS
==================== */
async function loadPlans() {
  const plans = await AdminStore.all("plans");
  
  UI.renderList("#plansList", plans, plan => {
    const statusClass = plan.active ? 'status-active' : 'status-inactive';
    const statusText = plan.active ? 'Active' : 'Inactive';
    const popularBadge = plan.popular ? '<span class="status-badge" style="background:#fff3cd;color:#856404">Popular</span>' : '';
    
    const features = Array.isArray(plan.features) 
      ? plan.features.slice(0, 3).map(f => `<li>${escapeHtml(f)}</li>`).join('')
      : '';
    
    return `
      <div class="meta">
        ${plan.icon ? `<span class="service-icon">${escapeHtml(plan.icon)}</span>` : ''}
        <div style="flex:1">
          <div class="title">${escapeHtml(plan.name || "(no name)")}</div>
          <div class="small">${escapeHtml(plan.description || "")}</div>
          ${features ? `<ul style="margin:8px 0;padding-left:20px;font-size:13px">${features}</ul>` : ''}
          <div class="service-meta">
            <span><strong>$${plan.price || 0}/month</strong></span>
            ${plan.billingPeriod ? `<span>• ${escapeHtml(plan.billingPeriod)}</span>` : ''}
            <span class="status-badge ${statusClass}">${statusText}</span>
            ${popularBadge}
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn btn-ghost"
          data-edit-plan="${plan.id}">
          Edit
        </button>

        <button class="btn btn-danger"
          data-remove="plans"
          data-id="${plan.id}">
          Delete
        </button>
      </div>
    `;
  });
}

/* ====================
   EDIT SERVICE
==================== */
document.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('[data-edit-service]');
  if (!editBtn) return;
  
  const id = editBtn.dataset.editService;
  const service = await AdminStore.get("services", id);
  
  if (!service) {
    alert("Service not found");
    return;
  }
  
  document.getElementById('serviceModalTitle').textContent = 'Edit Service';
  serviceForm.querySelector('[name="id"]').value = service.id;
  serviceForm.querySelector('[name="name"]').value = service.name || '';
  serviceForm.querySelector('[name="icon"]').value = service.icon || '';
  serviceForm.querySelector('[name="description"]').value = service.description || '';
  serviceForm.querySelector('[name="price"]').value = service.price || '';
  serviceForm.querySelector('[name="pricePeriod"]').value = service.pricePeriod || 'one-time';
  serviceForm.querySelector('[name="category"]').value = service.category || '';
  serviceForm.querySelector('[name="active"]').value = service.active ? 'true' : 'false';
  
  serviceModal.classList.add('show');
});

/* ====================
   EDIT PLAN
==================== */
document.addEventListener('click', async (e) => {
  const editBtn = e.target.closest('[data-edit-plan]');
  if (!editBtn) return;
  
  const id = editBtn.dataset.editPlan;
  const plan = await AdminStore.get("plans", id);
  
  if (!plan) {
    alert("Plan not found");
    return;
  }
  
  document.getElementById('planModalTitle').textContent = 'Edit Plan';
  planForm.querySelector('[name="id"]').value = plan.id;
  planForm.querySelector('[name="name"]').value = plan.name || '';
  planForm.querySelector('[name="icon"]').value = plan.icon || '';
  planForm.querySelector('[name="description"]').value = plan.description || '';
  planForm.querySelector('[name="price"]').value = plan.price || '';
  planForm.querySelector('[name="billingPeriod"]').value = plan.billingPeriod || 'monthly';
  
  // Convert features array to text
  const featuresText = Array.isArray(plan.features) 
    ? plan.features.join('\n') 
    : '';
  planForm.querySelector('[name="features"]').value = featuresText;
  
  planForm.querySelector('[name="popular"]').value = plan.popular ? 'true' : 'false';
  planForm.querySelector('[name="active"]').value = plan.active ? 'true' : 'false';
  
  planModal.classList.add('show');
});

/* ====================
   SAVE SERVICE
==================== */
serviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(serviceForm);
  const id = formData.get('id');
  
  const data = {
    name: formData.get('name'),
    icon: formData.get('icon') || '',
    description: formData.get('description'),
    price: parseFloat(formData.get('price')) || 0,
    pricePeriod: formData.get('pricePeriod'),
    category: formData.get('category') || '',
    active: formData.get('active') === 'true'
  };
  
  try {
    if (id) {
      await AdminStore.update("services", id, data);
    } else {
      await AdminStore.create("services", data);
    }
    
    serviceModal.classList.remove('show');
    await loadServices();
  } catch (err) {
    console.error("Error saving service:", err);
    alert("Failed to save service. Check console for details.");
  }
});

/* ====================
   SAVE PLAN
==================== */
planForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(planForm);
  const id = formData.get('id');
  
  // Convert features from text to array
  const featuresText = formData.get('features') || '';
  const features = featuresText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const data = {
    name: formData.get('name'),
    icon: formData.get('icon') || '',
    description: formData.get('description'),
    price: parseFloat(formData.get('price')) || 0,
    billingPeriod: formData.get('billingPeriod'),
    features: features,
    popular: formData.get('popular') === 'true',
    active: formData.get('active') === 'true'
  };
  
  try {
    if (id) {
      await AdminStore.update("plans", id, data);
    } else {
      await AdminStore.create("plans", data);
    }
    
    planModal.classList.remove('show');
    await loadPlans();
  } catch (err) {
    console.error("Error saving plan:", err);
    alert("Failed to save plan. Check console for details.");
  }
});

/* ====================
   INITIAL LOAD
==================== */
document.addEventListener("DOMContentLoaded", async () => {
  await loadServices();
  await loadPlans();
});

/* ====================
   RELOAD ON DATA CHANGE
==================== */
window.onAdminDataChanged = async () => {
  await loadServices();
  await loadPlans();
};
