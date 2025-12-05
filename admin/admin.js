/* ----------------------------------------------------
   IMPORT FIREBASE MODULES
---------------------------------------------------- */
import { db, storage } from "./firebase.js";

import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  ref, uploadString, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";


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
    // Upload image if attached
    if (data.imageData) {
      const path = `${col}/${Date.now()}-${data._imageName || "image"}`;
      const fileRef = ref(storage, path);

      await uploadString(fileRef, data.imageData, "data_url");
      const url = await getDownloadURL(fileRef);

      data.imageUrl = url;
      delete data.imageData;
      delete data._imageName;
    }

    const docRef = await addDoc(collection(db, col), data);
    return { id: docRef.id, ...data };
  },

  async update(col, id, data) {
    if (data.imageData) {
      const path = `${col}/${Date.now()}-${data._imageName || "image"}`;
      const fileRef = ref(storage, path);

      await uploadString(fileRef, data.imageData, "data_url");
      const url = await getDownloadURL(fileRef);

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
        preview.dataset.pending = data; // stored for Firestore upload
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

      const collection = form.dataset.collection;
      const fd = new FormData(form);
      const data = {};

      for (const [key, value] of fd.entries()) {
        data[key] = value;
      }

      // Attach preview image if present
      const preview = form.querySelector(".file-preview");
      if (preview?.dataset.pending) {
        data.imageData = preview.dataset.pending;
        const fileInput = form.querySelector("input[type=file]");
        if (fileInput?.files[0]) data._imageName = fileInput.files[0].name;
      }

      const editId = form.dataset.editId;

      if (editId) {
        await AdminStore.update(collection, editId, data);
        form.removeAttribute("data-edit-id");
      } else {
        await AdminStore.create(collection, data);
      }

      form.reset();
      if (preview) {
        preview.src = "";
        delete preview.dataset.pending;
      }

      if (window.onAdminDataChanged) window.onAdminDataChanged(collection);

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

      // Image preview
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
