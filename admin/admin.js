/* ----------------------------------------------------
   CLOUDINARY CONFIG
---------------------------------------------------- */
const CLOUDINARY_CLOUD_NAME = "dst4a3fsd";
const CLOUDINARY_UPLOAD_PRESET = "guidedtechms";
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dst4a3fsd/image/upload";
const CLOUDINARY_FOLDER = "guided-tech";


/* ----------------------------------------------------
   FIREBASE MODULES
---------------------------------------------------- */
import { db } from "./firebase.js";

import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


/* ----------------------------------------------------
   CLOUDINARY UPLOAD
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
    const txt = await res.text().catch(() => "");
    throw new Error("Cloudinary upload failed: " + txt);
  }

  const json = await res.json();
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

  const existing = new Set(
    snap.docs
      .map(d => d.data().slug)
      .filter(Boolean)
      .map(s => String(s))
  );

  if (excludeId) {
    const curDoc = snap.docs.find(d => d.id === excludeId);
    if (curDoc?.data()?.slug) {
      existing.delete(String(curDoc.data().slug));
    }
  }

  let candidate = baseSlug || String(Date.now());
  let i = 1;

  while (existing.has(candidate)) {
    candidate = `${baseSlug}-${i++}`;
  }

  return candidate;
}


/* ----------------------------------------------------
   FIRESTORE DATA STORE
---------------------------------------------------- */
const AdminStore = {

  async all(col) {
    const snap = await getDocs(collection(db, col));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return items;
  },

  async get(col, id) {
    const snap = await getDoc(doc(db, col, id));
    return snap.exists() ? { id, ...snap.data() } : null;
  },

  async create(col, data) {
    if (data.title) data.title = String(data.title).trim();

    const baseSlug = makeSlug(data.slug || data.title || "");
    data.slug = await ensureUniqueSlug(col, baseSlug);

    const now = Date.now();
    data.createdAt = now;
    data.updatedAt = now;

    if (data.imageData) {
      data.imageUrl = await uploadToCloudinary(
        data.imageData,
        data._imageName || "image"
      );

      delete data.imageData;
      delete data._imageName;
    }

    const ref = await addDoc(collection(db, col), data);
    return { id: ref.id, ...data };
  },

  async update(col, id, data) {
    const existingSnap = await getDoc(doc(db, col, id));
    if (!existingSnap.exists()) throw new Error("Document not found");
    const existing = existingSnap.data();

    if (data.title) data.title = String(data.title).trim();

    if ("slug" in data) {
      const provided = (data.slug || "").trim();
      const base = provided ? makeSlug(provided) : existing.slug || makeSlug(existing.title);
      data.slug = await ensureUniqueSlug(col, base, id);
    }

    data.updatedAt = Date.now();

    if (data.imageData) {
      data.imageUrl = await uploadToCloudinary(
        data.imageData,
        data._imageName || "image"
      );

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
  el: s => document.querySelector(s),
  all: s => Array.from(document.querySelectorAll(s)),
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
   FILE READER
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
   SIDEBAR ACTIVE
---------------------------------------------------- */
function activateSidebar() {
  const page = location.pathname.split("/").pop();
  document.querySelectorAll(".side-nav a").forEach(a => {
    a.classList.toggle("active", (a.getAttribute("href") || "").includes(page));
  });
}


/* ----------------------------------------------------
   IMAGE PREVIEW
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
   FORM HANDLING (WITH FILE FIX)
---------------------------------------------------- */
function wireForms() {
  document.querySelectorAll("form[data-collection]").forEach(form => {

    const titleField = form.querySelector('[name="title"]');
    const slugField = form.querySelector('[name="slug"]');

    if (titleField && slugField) {
      titleField.addEventListener("input", () => {
        if (!slugField.value.trim()) slugField.value = makeSlug(titleField.value);
      });
    }

    form.addEventListener("submit", async evt => {
      evt.preventDefault();

      const col = form.dataset.collection;

      const fd = new FormData(form);
      const data = {};

      /* 🔥 FIX: Remove raw File objects */
      for (const [key, value] of fd.entries()) {
        if (value instanceof File) continue;
        data[key] = value;
      }

      const preview = form.querySelector(".file-preview");
      if (preview?.dataset.pending) {
        data.imageData = preview.dataset.pending;
        const f = form.querySelector("input[type=file]");
        if (f?.files[0]) data._imageName = f.files[0].name;
      }

      const editId = form.dataset.editId;

      if (editId) {
        await AdminStore.update(col, editId, data);
        form.removeAttribute("data-edit-id");
      } else {
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
        setTimeout(() => (btn.textContent = old), 900);
      }
    });
  });
}


/* ----------------------------------------------------
   EDIT / DELETE
---------------------------------------------------- */
function wireActions() {
  document.addEventListener("click", async evt => {

    const editBtn = evt.target.closest("[data-edit]");
    if (editBtn) {
      const col = editBtn.dataset.edit;
      const id = editBtn.dataset.id;

      const record = await AdminStore.get(col, id);
      if (!record) return;

      const form = document.querySelector(editBtn.dataset.target);
      if (!form) return;

      for (const key in record) {
        if (key === "imageUrl") continue;
        const field = form.querySelector(`[name="${key}"]`);
        if (field) field.value = record[key];
      }

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
  });
}


/* ----------------------------------------------------
   INIT
---------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  activateSidebar();
  wireFilePreviews();
  wireForms();
  wireActions();

  if (window.onAdminReady) window.onAdminReady();
});


export { AdminStore, UI };
