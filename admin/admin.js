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
   CLOUDINARY UPLOAD FUNCTION
   - accepts a dataURL (base64) or File-like value
---------------------------------------------------- */
async function uploadToCloudinary(base64, fileName) {
  const formData = new FormData();
  formData.append("file", base64);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", CLOUDINARY_FOLDER);

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const txt = await res.text().catch(()=>"");
    throw new Error("Cloudinary upload failed: " + txt);
  }

  const json = await res.json();
  return json.secure_url; // The final image URL
}


/* ----------------------------------------------------
   SLUG HELPERS
---------------------------------------------------- */
function makeSlug(input = "") {
  return String(input || "")
    .toLowerCase()
    .normalize("NFKD")                 // normalize accents
    .replace(/[\u0300-\u036f]/g, "")   // remove diacritics
    .replace(/[^a-z0-9]+/g, "-")       // replace non-alphanum with -
    .replace(/^-+|-+$/g, "")           // trim leading/trailing hyphens
    .slice(0, 120);                    // reasonable length limit
}

async function ensureUniqueSlug(colName, baseSlug, excludeId = null) {
  // Fetch existing slugs once for this collection
  const snap = await getDocs(collection(db, colName));
  const existing = new Set(snap.docs.map(d => d.data().slug).filter(Boolean).map(s => String(s)));
  // If excludeId provided, remove that slug from consideration
  if (excludeId) {
    const curDoc = snap.docs.find(d => d.id === excludeId);
    if (curDoc) {
      const curSlug = curDoc.data().slug;
      if (curSlug) existing.delete(String(curSlug));
    }
  }

  let candidate = baseSlug;
  if (!candidate) candidate = String(Date.now()); // fallback
  let i = 1;
  while (existing.has(candidate)) {
    candidate = `${baseSlug}-${i++}`;
  }
  return candidate;
}


/* ----------------------------------------------------
   REAL FIRESTORE DATA STORE (Cloudinary + Slugs + timestamps)
---------------------------------------------------- */
const AdminStore = {

  // Return all documents in collection, newest-first by createdAt when present
  async all(col) {
    const snap = await getDocs(collection(db, col));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // sort by createdAt desc if present, otherwise keep order from server
    items.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    return items;
  },

  async get(col, id) {
    const snap = await getDoc(doc(db, col, id));
    return snap.exists() ? { id, ...snap.data() } : null;
  },

  async create(col, data) {
    // Sanitize simple fields
    if (data.title) data.title = String(data.title).trim();

    // Handle slug (Option 3: admin-visible slug; auto-generate if blank)
    const requestedSlug = (data.slug || "").trim();
    const baseSlug = requestedSlug ? makeSlug(requestedSlug) : makeSlug(data.title || "");
    data.slug = await ensureUniqueSlug(col, baseSlug);

    // timestamps
    const now = Date.now();
    data.createdAt = data.createdAt || now;
    data.updatedAt = now;

    // If there is image data → upload to Cloudinary first
    if (data.imageData) {
      const url = await uploadToCloudinary(
        data.imageData,
        data._imageName || "image"
      );

      data.imageUrl = url;
      delete data.imageData;
      delete data._imageName;
    }

    const docRef = await addDoc(collection(db, col), data);
    return { id: docRef.id, ...data };
  },

  async update(col, id, data) {
    // Fetch existing record
    const existingSnap = await getDoc(doc(db, col, id));
    if (!existingSnap.exists()) throw new Error("Document not found");

    const existing = existingSnap.data();

    // Title sanitization
    if (data.title) data.title = String(data.title).trim();

    // Slug logic:
    // - If admin provided a slug (non-empty) -> use sanitized version and ensure uniqueness (exclude current doc)
    // - If admin left slug field blank in the form -> keep existing.slug (do not overwrite)
    // - If no existing.slug and no provided slug -> generate from title
    let newSlug;
    if ("slug" in data) {
      const provided = (data.slug || "").trim();
      if (provided.length > 0) {
        const base = makeSlug(provided);
        newSlug = await ensureUniqueSlug(col, base, id);
      } else {
        // admin cleared slug input; keep existing slug (safer) — do not auto-change
        newSlug = existing.slug || makeSlug(data.title || existing.title || "");
        newSlug = await ensureUniqueSlug(col, newSlug, id);
      }
      data.slug = newSlug;
    } else {
      // slug not present in update payload -> preserve existing slug
      // do nothing
    }

    // updatedAt
    data.updatedAt = Date.now();

    // Image upload handling (if new preview was attached)
    if (data.imageData) {
      const url = await uploadToCloudinary(
        data.imageData,
        data._imageName || "image"
      );
      data.imageUrl = url;
      delete data.imageData;
      delete data._imageName;
    }

    await updateDoc(doc(db, col, id), data);
    return { id, ...existing, ...data };
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
---------------------------------------------------- */
function wireFilePreviews() {
  document.querySelectorAll("input[type=file]").forEach(input => {

    input.onchange = async () => {
      const file = input.files?.[0];
      const preview = input.closest("form")?.querySelector(".file-preview");

      if (!preview) return;

      if (file) {
        const data = await readFileAsDataURL(file);
        preview.src = data;
        preview.dataset.pending = data;
      } else {
        preview.src = "";
        delete preview.dataset.pending;
      }
    };

  });
}


/* ----------------------------------------------------
   FORM HANDLING (CREATE / EDIT)
   - Supports an editable slug input (Option 3)
---------------------------------------------------- */
function wireForms() {
  document.querySelectorAll("form[data-collection]").forEach(form => {

    // Auto-fill slug input when title changes (only if slug input is empty)
    const titleField = form.querySelector('[name="title"]');
    const slugField = form.querySelector('[name="slug"]');
    if (titleField && slugField) {
      titleField.addEventListener("input", () => {
        if (!slugField.value.trim()) {
          slugField.value = makeSlug(titleField.value);
        }
      });
    }

    form.addEventListener("submit", async evt => {
      evt.preventDefault();

      const col = form.dataset.collection;
      const fd = new FormData(form);
      const data = {};

      for (const [key, value] of fd.entries()) {
        data[key] = value;
      }

      // Attach uploaded image preview if exists
      const preview = form.querySelector(".file-preview");
      if (preview?.dataset.pending) {
        data.imageData = preview.dataset.pending;
        const fileInput = form.querySelector("input[type=file]");
        if (fileInput?.files[0]) data._imageName = fileInput.files[0].name;
      }

      const editId = form.dataset.editId;

      if (editId) {
        await AdminStore.update(col, editId, data);
        form.removeAttribute("data-edit-id");
      } else {
        // Add timestamp for ordering newest-first (create will also set createdAt)
        data.createdAt = Date.now();
        await AdminStore.create(col, data);
      }

      form.reset();
      if (preview) {
        preview.src = "";
        delete preview.dataset.pending;
      }

      if (window.onAdminDataChanged) window.onAdminDataChanged(col);

      const btn = form.querySelector("button[type=submit]");
      if (btn) {
        const old = btn.textContent;
        btn.textContent = "Saved";
        setTimeout(() => btn.textContent = old, 900);
      }
    });

  });
}


/* ----------------------------------------------------
   EDIT / DELETE ACTIONS
---------------------------------------------------- */
function wireActions() {
  document.addEventListener("click", async evt => {

    /* ---------- EDIT ---------- */
    const editBtn = evt.target.closest("[data-edit]");
    if (editBtn) {
      const col = editBtn.dataset.edit;
      const id = editBtn.dataset.id;

      const record = await AdminStore.get(col, id);
      if (!record) return;

      const form = document.querySelector(editBtn.dataset.target);
      if (!form) return;

      // Populate fields
      for (const key in record) {
        // Skip imageUrl (we use preview)
        if (key === "imageUrl") continue;
        const field = form.querySelector(`[name="${key}"]`);
        if (field) field.value = record[key];
      }

      // Show image preview
      const preview = form.querySelector(".file-preview");
      if (preview) {
        preview.src = record.imageUrl || "";
        preview.dataset.pending = record.imageUrl || "";
      }

      form.dataset.editId = id;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }


    /* ---------- DELETE ---------- */
    const delBtn = evt.target.closest("[data-remove]");
    if (delBtn) {
      const col = delBtn.dataset.remove;
      const id = delBtn.dataset.id;

      if (!confirm("Delete this?")) return;

      await AdminStore.remove(col, id);

      if (window.onAdminDataChanged) window.onAdminDataChanged(col);
    }

  });
}


/* ----------------------------------------------------
   INITIALIZE EVERYTHING
---------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  activateSidebar();
  wireFilePreviews();
  wireForms();
  wireActions();

  if (window.onAdminReady) window.onAdminReady();
});


/* ----------------------------------------------------
   Exports for module imports used across pages
---------------------------------------------------- */
export { AdminStore, UI };
