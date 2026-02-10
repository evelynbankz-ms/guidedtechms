/* ==============================
   FILE: admin/services.js
   Manages two Firestore collections:
     • "services"  — standalone offerings
     • "plans"     — subscription tiers (Basic / Starter / Expert …)
   ============================== */

import { AdminStore, UI } from "./admin.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ══════════════════════════════
   AUTH
══════════════════════════════ */
onAuthStateChanged(auth, user => {
  if (!user) { location.href = "login.html"; return; }
  const el = document.getElementById("adminEmail");
  if (el) el.textContent = user.email || "";
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth).catch(console.error);
  location.href = "login.html";
});

/* ══════════════════════════════
   HELPERS
══════════════════════════════ */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])
  );
}

function fmtPrice(price, period) {
  const p = Number(price) || 0;
  const amount = p % 1 === 0 ? p : p.toFixed(2);
  return `$${amount}${period ? " " + period : ""}`;
}

/* ══════════════════════════════
   TABS
   Swaps pane visibility + the action button label
══════════════════════════════ */
let activeTab = "services";

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    activeTab = btn.dataset.tab;

    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.getElementById("servicesPane").classList.toggle("active", activeTab === "services");
    document.getElementById("plansPane").classList.toggle("active",    activeTab === "plans");

    // Update the single action button
    document.getElementById("newItemBtn").textContent =
      activeTab === "services" ? "+ New Service" : "+ New Plan";
  });
});

document.getElementById("newItemBtn").addEventListener("click", () => {
  if (activeTab === "services") openSvcModal();
  else                          openPlanModal();
});

/* ══════════════════════════════════════════
   ── SERVICES ──────────────────────────────
══════════════════════════════════════════ */

const svcModal  = document.getElementById("svcModal");
const svcForm   = document.getElementById("svcForm");

/* Open / close */
function openSvcModal(title = "Add Service") {
  document.getElementById("svcModalTitle").textContent = title;
  svcModal.classList.add("show");
}
function closeSvcModal() {
  svcModal.classList.remove("show");
  svcForm.reset();
  svcForm.querySelector("[name=docId]").value = "";
}

document.getElementById("svcModalClose").addEventListener("click", closeSvcModal);
document.getElementById("svcCancelBtn").addEventListener("click", closeSvcModal);
svcModal.addEventListener("click", e => { if (e.target === svcModal) closeSvcModal(); });

/* Load & render services list */
async function loadServices() {
  const items = await AdminStore.all("services");
  const el = document.getElementById("svcCount");
  if (el) el.textContent = `(${items.length})`;

  UI.renderList("#servicesList", items, svc => {
    const on = svc.active !== false;
    return `
      <div class="meta">
        ${svc.icon ? `<span class="item-icon">${esc(svc.icon)}</span>` : ""}
        <div style="flex:1">
          <div class="title">${esc(svc.name || "(unnamed)")}</div>
          <div class="small">${esc(svc.description || "")}</div>
          <div class="item-meta">
            <strong>${fmtPrice(svc.price, svc.pricePeriod)}</strong>
            ${svc.category ? `<span>· ${esc(svc.category)}</span>` : ""}
            <span class="badge ${on ? "badge-on" : "badge-off"}">${on ? "Active" : "Inactive"}</span>
          </div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-ghost" data-edit-svc="${esc(svc.id)}">Edit</button>
        <button class="btn btn-danger" data-remove="services" data-id="${esc(svc.id)}">Delete</button>
      </div>`;
  });
}

/* Edit service — delegated click */
document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-edit-svc]");
  if (!btn) return;
  const svc = await AdminStore.get("services", btn.dataset.editSvc);
  if (!svc) { alert("Service not found."); return; }

  svcForm.querySelector("[name=docId]").value      = svc.id;
  svcForm.querySelector("[name=name]").value        = svc.name        || "";
  svcForm.querySelector("[name=icon]").value        = svc.icon        || "";
  svcForm.querySelector("[name=description]").value = svc.description || "";
  svcForm.querySelector("[name=price]").value       = svc.price       ?? "";
  svcForm.querySelector("[name=pricePeriod]").value = svc.pricePeriod || "one-time";
  svcForm.querySelector("[name=category]").value    = svc.category    || "";
  svcForm.querySelector("[name=active]").value      = svc.active !== false ? "true" : "false";

  openSvcModal("Edit Service");
});

/* Save service */
svcForm.addEventListener("submit", async e => {
  e.preventDefault();
  const fd  = new FormData(svcForm);
  const id  = fd.get("docId");
  const btn = svcForm.querySelector("[type=submit]");
  btn.disabled = true;
  btn.textContent = "Saving…";

  const data = {
    name:        fd.get("name"),
    icon:        fd.get("icon")        || "",
    description: fd.get("description"),
    price:       parseFloat(fd.get("price")) || 0,
    pricePeriod: fd.get("pricePeriod"),
    category:    fd.get("category")    || "",
    active:      fd.get("active") === "true",
  };

  try {
    if (id) await AdminStore.update("services", id, data);
    else    await AdminStore.create("services", data);
    closeSvcModal();
    await loadServices();
  } catch (err) {
    console.error("Save service:", err);
    alert("Failed to save service. See console.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Service";
  }
});


/* ══════════════════════════════════════════
   ── SUBSCRIPTION PLANS ────────────────────
   Firestore collection: "plans"
   Examples: Basic, Starter, Expert, Pro, Enterprise …
══════════════════════════════════════════ */

const planModal = document.getElementById("planModal");
const planForm  = document.getElementById("planForm");
const featList  = document.getElementById("featList");

/* ── Feature row builder ── */
function makeFeatRow(value = "") {
  const row = document.createElement("div");
  row.className = "feat-row";
  row.innerHTML = `
    <input type="text" class="input" name="feature[]"
      placeholder="e.g., Unlimited AI queries"
      value="${esc(value)}">
    <button type="button" class="btn-rm" title="Remove">×</button>`;
  row.querySelector(".btn-rm").addEventListener("click", () => row.remove());
  return row;
}

function clearFeatRows() {
  featList.innerHTML = "";
}

function addFeatRow(value = "") {
  featList.appendChild(makeFeatRow(value));
}

function getFeatValues() {
  return [...featList.querySelectorAll("[name='feature[]']")]
    .map(i => i.value.trim())
    .filter(Boolean);
}

document.getElementById("addFeatBtn").addEventListener("click", () => addFeatRow());

/* Open / close plan modal */
function openPlanModal(title = "Add Subscription Plan") {
  document.getElementById("planModalTitle").textContent = title;
  planModal.classList.add("show");
}

function closePlanModal() {
  planModal.classList.remove("show");
  planForm.reset();
  planForm.querySelector("[name=docId]").value = "";
  clearFeatRows();
  // Always start with one blank feature row
  addFeatRow();
}

document.getElementById("planModalClose").addEventListener("click", closePlanModal);
document.getElementById("planCancelBtn").addEventListener("click", closePlanModal);
planModal.addEventListener("click", e => { if (e.target === planModal) closePlanModal(); });

/* Load & render plans list */
async function loadPlans() {
  const items = await AdminStore.all("plans");
  const el = document.getElementById("planCount");
  if (el) el.textContent = `(${items.length})`;

  UI.renderList("#plansList", items, plan => {
    const on      = plan.active !== false;
    const popular = !!plan.popular;
    const feats   = Array.isArray(plan.features) ? plan.features : [];

    const chips = feats.slice(0, 4).map(f =>
      `<span class="feat-chip">${esc(f)}</span>`).join("");

    const more = feats.length > 4
      ? `<span class="feat-chip" style="background:#eee;color:#666">+${feats.length - 4} more</span>`
      : "";

    return `
      <div class="meta">
        ${plan.icon ? `<span class="item-icon">${esc(plan.icon)}</span>` : ""}
        <div style="flex:1">
          <div class="title">${esc(plan.name || "(unnamed)")}</div>
          <div class="small">${esc(plan.description || "")}</div>
          <div class="feat-chips">${chips}${more}</div>
          <div class="item-meta" style="margin-top:8px">
            <strong>${fmtPrice(plan.price, "/" + (plan.billingPeriod || "month"))}</strong>
            <span class="badge ${on ? "badge-on" : "badge-off"}">${on ? "Active" : "Inactive"}</span>
            ${popular ? `<span class="badge badge-pop">⭐ Popular</span>` : ""}
          </div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-ghost" data-edit-plan="${esc(plan.id)}">Edit</button>
        <button class="btn btn-danger" data-remove="plans" data-id="${esc(plan.id)}">Delete</button>
      </div>`;
  });
}

/* Edit plan — delegated click */
document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-edit-plan]");
  if (!btn) return;
  const plan = await AdminStore.get("plans", btn.dataset.editPlan);
  if (!plan) { alert("Plan not found."); return; }

  // Clear & repopulate feature rows before opening modal
  clearFeatRows();
  const feats = Array.isArray(plan.features) && plan.features.length
    ? plan.features
    : [""];
  feats.forEach(f => addFeatRow(f));

  openPlanModal("Edit Plan");

  planForm.querySelector("[name=docId]").value        = plan.id;
  planForm.querySelector("[name=name]").value          = plan.name          || "";
  planForm.querySelector("[name=icon]").value          = plan.icon          || "";
  planForm.querySelector("[name=description]").value   = plan.description   || "";
  planForm.querySelector("[name=price]").value         = plan.price         ?? "";
  planForm.querySelector("[name=billingPeriod]").value = plan.billingPeriod || "month";
  planForm.querySelector("[name=popular]").value       = plan.popular ? "true" : "false";
  planForm.querySelector("[name=active]").value        = plan.active !== false ? "true" : "false";
});

/* Save plan */
planForm.addEventListener("submit", async e => {
  e.preventDefault();
  const fd  = new FormData(planForm);
  const id  = fd.get("docId");
  const btn = planForm.querySelector("[type=submit]");
  btn.disabled = true;
  btn.textContent = "Saving…";

  const features = getFeatValues();

  if (features.length === 0) {
    alert("Please add at least one feature for this plan.");
    btn.disabled = false;
    btn.textContent = "Save Plan";
    return;
  }

  const data = {
    name:          fd.get("name"),
    icon:          fd.get("icon")          || "",
    description:   fd.get("description"),
    price:         parseFloat(fd.get("price")) || 0,
    billingPeriod: fd.get("billingPeriod"),
    features:      features,                        // string[]
    popular:       fd.get("popular")  === "true",
    active:        fd.get("active")   === "true",
  };

  try {
    if (id) await AdminStore.update("plans", id, data);
    else    await AdminStore.create("plans", data);
    closePlanModal();
    await loadPlans();
  } catch (err) {
    console.error("Save plan:", err);
    alert("Failed to save plan. See console.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Plan";
  }
});


/* ══════════════════════════════
   BOOT
══════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
  // Seed one blank feature row so the plan modal is ready
  addFeatRow();

  await Promise.all([loadServices(), loadPlans()]);
});

window.onAdminDataChanged = async () => {
  await Promise.all([loadServices(), loadPlans()]);
};
