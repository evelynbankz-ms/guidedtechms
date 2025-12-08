/* ----------------------------------------------------
   CLOUDINARY CONFIG
---------------------------------------------------- */
const CLOUDINARY_CLOUD_NAME = "dst4a3fsd";
const CLOUDINARY_UPLOAD_PRESET = "guidedtechms";
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dst4a3fsd/image/upload";
const CLOUDINARY_FOLDER = "guided-tech";

/* ----------------------------------------------------
   IMPORT FIREBASE MODULES
---------------------------------------------------- */
import { db } from "./firebase.js";

import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ----------------------------------------------------
   GLOBAL ERROR HOOK (helps surface startup errors)
---------------------------------------------------- */
window.onerror = (msg, src, line, col, err) => {
  console.error("ADMIN JS ERROR:", { msg, src, line, col, err });
  // give visible feedback so you notice errors while testing
  try { alert("Admin script error: " + String(msg).slice(0, 200)); } catch(e){}
};

/* ----------------------------------------------------
   CLOUDINARY UPLOAD FUNCTION
   - accepts a dataURL (base64) or File-like value
   - if value is already an http(s) URL, returns it (no re-upload)
---------------------------------------------------- */
async function uploadToCloudinary(fileValue, fileName = "image") {
  // If it's already a URL, return as-is (no upload)
  if (typeof fileValue === "string" && /^https?:\/\//i.test(fileValue)) {
    return fileValue;
  }

  // Accept either a File object or a dataURL string
  const formData = new FormData();
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", CLOUDINARY_FOLDER);

  if (fileValue instanceof File) {
    formData.append("file", fileValue);
  } else {
    // fileValue expected to be data URL (data:<mime>;base64,...)
    formData.append("file", fileValue);
  }

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error("Cloudinary upload failed: " + txt);
  }

  const json = await res.json();
  if (!json || !json.secure_url) throw new Error("Cloudinary response missing secure_url");
  return json.secure_url;
}

/* ----------------------------------------------------
   SLUG HELPERS
---------------------------------------------------- */
function makeSlug(input = "") {
  return String(input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function ensureUniqueSlug(colName, baseSlug, excludeId = null) {
  const snap = await getDocs(collection(db, colName));
  const existing = new Set(snap.docs
    .map(d => d.data().slug)
    .filter(Boolean)
    .map(s => String(s)));

  if (excludeId) {
    const cur = snap.docs.find(d => d.id === excludeId);
    if (cur) {
      const curSlug = cur.data().slug;
      if (curSlug) existing.delete(String(curSlug));
    }
  }

  let candidate = baseSlug || String(Date.now());
  let i = 1;
  while (existing.has(candidate)) {
    candidate = `${baseSlug || Date.now()}-${i++}`;
  }
  return candidate;
}

/* ----------------------------------------------------
   REAL FIRESTORE DATA STORE (Cloudinary + Slugs + timestamps)
---------------------------------------------------- */
const AdminStore = {

  async all(col) {
    const snap = await getDocs(collection(db, col));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    items.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    return items;
  },

  async get(col, id) {
    const snap = await getDoc(doc(db, col, id));
    return snap.exists() ? { id, ...snap.data() } : null;
  },

  async create(col, data) {
    // shallow copy/sanitize
    const payload = { ...data };

    if (payload.title) payload.title = String(payload.title).trim();

    // slug
    const requestedSlug = (payload.slug || "").trim();
    const baseSlug = requestedSlug ? makeSlug(requestedSlug) : makeSlug(payload.title || "");
    payload.slug = await ensureUniqueSlug(col, baseSlug);

    // timestamps
    const now = Date.now();
    payload.createdAt = payload.createdAt || now;
    payload.updatedAt = now;

    // image handling: if imageData is present and is dataURL or File -> upload; if it's http URL, keep it
    if (payload.imageData) {
      try {
        const url = await uploadToCloudinary(payload.imageData, payload._imageName || "image");
        payload.imageUrl = url;
      } finally {
        delete payload.imageData;
        delete payload._imageName;
      }
    }

    const docRef = await addDoc(collection(db, col), payload);
    return { id: docRef.id, ...payload };
  },

  async update(col, id, data) {
    const existingSnap = await getDoc(doc(db, col, id));
    if (!existingSnap.exists()) throw new Error("Document not found");
    const existing = existingSnap.data();

    const payload = { ...data };

    if (payload.title) payload.title = String(payload.title).trim();

    // slug logic (only modify slug if slug field present in payload)
    if ("slug" in payload) {
      const provided = (payload.slug || "").trim();
      if (provided.length > 0) {
        const base = makeSlug(provided);
        payload.slug = await ensureUniqueSlug(col, base, id);
      } else {
        // admin cleared slug -> preserve existing slug (safer)
        const keep = existing.slug || makeSlug(payload.title || existing.title || "");
        payload.slug = await ensureUniqueSlug(col, keep, id);
      }
    }

    payload.updatedAt = Date.now();

    if (payload.imageData) {
      try {
        const url = await uploadToCloudinary(payload.imageData, payload._imageName || "image");
        payload.imageUrl = url;
      } finally {
        delete payload.imageData;
        delete payload._imageName;
      }
    }

    await updateDoc(doc(db, col, id), payload);
    return { id, ...existing, ...payload };
  },

  async remove(col, id) {
    await deleteDoc(doc(db, col, id));
  }
};

window.AdminStore = AdminStore;

/* ----------------------------------------------------
   UI UTILITIES
---------------------------------------------------- */
const UI = {
  el: sel => document.querySelector(sel),
  all: sel => Array.from(document.querySelectorAll(sel)),
  renderList(container, items, renderFn) {
    const el = document.querySelector(container);
    if (!el) return;
    el.innerHTML = "";
    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = renderFn(item);
      el.appendChild(card);
    });
  }
};

window.UI = UI;

/* ----------------------------------------------------
   FILE READER FOR PREVIEW
---------------------------------------------------- */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ----------------------------------------------------
   SIDEBAR ACTIVE STATE
---------------------------------------------------- */
function activateSidebar() {
  const page = location.pathname.split("/").pop();
  document.querySelectorAll(".side-nav a").forEach(a => {
    a.classList.toggle("active",
      (a.getAttribute("href") || "").includes(page)
    );
  });
}

/* ----------------------------------------------------
   IMAGE PREVIEW HANDLING
   - stores preview in dataset.pending (either dataURL or existing URL)
---------------------------------------------------- */
function wireFilePreviews() {
  document.querySelectorAll("input[type=file]").forEach(input => {
    // remove existing handler if any (defensive)
    input.onchange = null;

    input.onchange = async () => {
      try {
        const file = input.files?.[0];
        const form = input.closest("form");
        const preview = form?.querySelector(".file-preview");

        if (!preview) return;

        if (file) {
          // prefer to store the dataURL for preview and possible upload
          const data = await readFileAsDataURL(file);
          preview.src = data;
          preview.dataset.pending = data;
        } else {
          preview.src = "";
          delete preview.dataset.pending;
        }
      } catch (err) {
        console.error("File preview error", err);
        alert("Error reading file for preview.");
      }
    };
  });
}

/* ----------------------------------------------------
   Helper: set a form field value safely (handles inputs, textarea, checkbox)
---------------------------------------------------- */
function setFieldValue(form, name, value) {
  const field = form.querySelector(`[name="${name}"]`);
  if (!field) return;
  if (field.type === "checkbox") {
    field.checked = Boolean(value);
  } else {
    field.value = value ?? "";
  }
}

/* ----------------------------------------------------
   FORM HANDLING (CREATE / EDIT)
---------------------------------------------------- */
function wireForms() {
  document.querySelectorAll("form[data-collection]").forEach(form => {
    // slug auto-fill helper if slug input exists
    const titleField = form.querySelector('[name="title"]');
    const slugField = form.querySelector('[name="slug"]');
    if (titleField && slugField) {
      titleField.addEventListener("input", () => {
        if (!slugField.value.trim()) slugField.value = makeSlug(titleField.value);
      });
    }

    form.addEventListener("submit", async evt => {
      evt.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');

      try {
        const col = form.dataset.collection;
        const fd = new FormData(form);
        const data = {};

        for (const [key, value] of fd.entries()) {
          // allow multiple values if needed (basic)
          if (data[key] !== undefined) {
            if (!Array.isArray(data[key])) data[key] = [data[key]];
            data[key].push(value);
          } else {
            data[key] = value;
          }
        }

        // attach image preview (if any)
        const preview = form.querySelector(".file-preview");
        if (preview?.dataset.pending) {
          data.imageData = preview.dataset.pending;
          const fileInput = form.querySelector("input[type=file]");
          if (fileInput?.files?.[0]) data._imageName = fileInput.files[0].name;
        }

        // determine create vs update
        const editId = form.dataset.editId;

        // visual feedback
        if (submitBtn) {
          var oldTxt = submitBtn.textContent;
          submitBtn.textContent = "Saving...";
          submitBtn.disabled = true;
        }

        if (editId) {
          await AdminStore.update(col, editId, data);
          form.removeAttribute("data-edit-id");
        } else {
          // Add basic createdAt (AdminStore will set too)
          data.createdAt = Date.now();
          await AdminStore.create(col, data);
        }

        form.reset();
        if (preview) {
          preview.src = "";
          delete preview.dataset.pending;
        }

        if (window.onAdminDataChanged) window.onAdminDataChanged(col);

        if (submitBtn) {
          submitBtn.textContent = "Saved";
          setTimeout(()=>{ submitBtn.textContent = oldTxt; submitBtn.disabled = false; }, 900);
        }

      } catch (err) {
        console.error("Form submit error:", err);
        try { alert("Save failed: " + (err.message || err)); } catch(e){}
        if (submitBtn) { submitBtn.textContent = "Save"; submitBtn.disabled = false; }
      }
    });
  });
}

/* ----------------------------------------------------
   EDIT / DELETE ACTIONS
---------------------------------------------------- */
function wireActions() {
  document.addEventListener("click", async evt => {
    try {
      const editBtn = evt.target.closest("[data-edit]");
      if (editBtn) {
        const col = editBtn.dataset.edit;
        const id = editBtn.dataset.id;
        const record = await AdminStore.get(col, id);
        if (!record) { alert("Record not found"); return; }
        const form = document.querySelector(editBtn.dataset.target || `form[data-collection="${col}"]`);
        if (!form) { console.warn("Form not found for edit:", editBtn.dataset); return; }

        // populate fields, handle textarea & checkboxes
        Object.keys(record).forEach(key => {
          if (key === "imageUrl") return;
          setFieldValue(form, key, record[key]);
        });

        // show image preview if present (could be dataURL or http url)
        const preview = form.querySelector(".file-preview");
        if (preview) {
          preview.src = record.imageUrl || "";
          preview.dataset.pending = record.imageUrl || "";
        }

        form.dataset.editId = id;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const delBtn = evt.target.closest("[data-remove]");
      if (delBtn) {
        const col = delBtn.dataset.remove;
        const id = delBtn.dataset.id;
        if (!confirm("Delete this?")) return;
        await AdminStore.remove(col, id);
        if (window.onAdminDataChanged) window.onAdminDataChanged(col);
      }
    } catch (err) {
      console.error("Action handler error:", err);
      try { alert("Action error: " + (err.message || err)); } catch(e){}
    }
  });
}

/* ----------------------------------------------------
   INITIALIZE EVERYTHING
---------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  try {
    activateSidebar();
    wireFilePreviews();
    wireForms();
    wireActions();
    if (window.onAdminReady) window.onAdminReady();
  } catch (err) {
    console.error("Initialization error:", err);
    try { alert("Admin init error: " + (err.message || err)); } catch(e){}
  }
});

/* ----------------------------------------------------
   Exports for module imports used across pages
---------------------------------------------------- */
export { AdminStore, UI };
