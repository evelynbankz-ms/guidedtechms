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
    throw new Error("Cloudinary upload failed");
  }

  const json = await res.json();
  return json.secure_url; // The final image URL
}



/* ----------------------------------------------------
   REAL FIRESTORE DATA STORE
---------------------------------------------------- */
const AdminStore = {

  async all(col) {
    const snap = await getDocs(collection(db, col));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async get(col, id) {
    const snap = await getDoc(doc(db, col, id));
    return snap.exists() ? { id, ...snap.data() } : null;
  },

  async create(col, data) {

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

    // If image was changed → upload to Cloudinary again
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
    return { id, ...data };
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
      a.getAttribute("href").includes(page)
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
---------------------------------------------------- */
function wireForms() {
  document.querySelectorAll("form[data-collection]").forEach(form => {

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
          // Add timestamp for ordering newest-first
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
