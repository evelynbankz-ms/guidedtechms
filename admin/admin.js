import { db, storage } from "./firebase.js";

// Example: test Firestore connection
console.log("Firestore ready:", db);

// Example: test Storage connection
console.log("Storage ready:", storage);


/* admin.js
   - Local-only admin UI storage in localStorage (gts_admin_v2_)
   - Per-section uploads with immediate preview
   - Consistent sidebar activation across pages
*/

const AdminStore = (function(){
  const prefix = "gts_admin_v2_";
  const collections = ["blogs","team","services","faqs","settings"];
  function read(name){ try { return JSON.parse(localStorage.getItem(prefix+name)) || []; } catch(e){ return []; } }
  function write(name, data){ localStorage.setItem(prefix+name, JSON.stringify(data)); }
  function ensure(){ collections.forEach(c => { if(localStorage.getItem(prefix+c)===null) write(c, []); }); }
  function all(name){ return read(name); }
  function create(name, item){ const arr = read(name); item.id = Date.now().toString(36) + Math.random().toString(36).slice(2,8); arr.unshift(item); write(name,arr); return item; }
  function update(name, id, patch){ const arr = read(name).map(x => x.id===id ? {...x,...patch} : x); write(name,arr); return arr.find(x=>x.id===id) || null; }
  function remove(name, id){ const arr = read(name).filter(x=>x.id!==id); write(name,arr); }
  function get(name,id){ return read(name).find(x=>x.id===id) || null; }
  return {ensure,all,create,update,remove,get};
})();

/* UI helpers */
const UI = {
  el: (s)=>document.querySelector(s),
  all: (s)=>Array.from(document.querySelectorAll(s)),
  on: (s,e,fn)=>{ const n = document.querySelector(s); if(n) n.addEventListener(e,fn); },
  renderList: function(containerSel, items, renderFn){
    const root = document.querySelector(containerSel); if(!root) return;
    root.innerHTML = "";
    items.forEach(it=>{
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = renderFn(it);
      root.appendChild(card);
    });
  }
};

/* read file helper */
function readFileAsDataURL(file){ return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); }); }

/* sidebar activation (run on DOMContentLoaded) */
function activateSidebar(){
  const path = location.pathname.split("/").pop() || "admin-dashboard.html";
  document.querySelectorAll(".side-nav a").forEach(a=>{
    a.classList.toggle("active", (a.getAttribute("data-page")||a.getAttribute("href")) === path);
  });
}

/* wire file inputs for immediate preview (per-section) */
function wireFilePreviews(){
  document.querySelectorAll('input[type="file"]').forEach(inp=>{
    inp.removeEventListener('change', inp._filePreviewHandler);
    const handler = async (e)=>{
      const f = inp.files && inp.files[0];
      const previewImg = inp.closest('form')?.querySelector('.file-preview') || inp.parentElement.querySelector('.file-preview');
      if(f && previewImg){
        const data = await readFileAsDataURL(f);
        previewImg.src = data;
        previewImg.dataset.pending = data; // store temporary preview until save
      } else if(previewImg){
        previewImg.src = "";
        delete previewImg.dataset.pending;
      }
    };
    inp._filePreviewHandler = handler;
    inp.addEventListener('change', handler);
  });
}

/* generic form handling: forms must have data-collection attr */
function wireForms(){
  document.querySelectorAll('form[data-collection]').forEach(form=>{
    form.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      const col = form.dataset.collection;
      const fd = new FormData(form);
      const obj = {};
      for(const [k,v] of fd.entries()) obj[k]=v;
      // attach pending preview image if present (preview element stores data in dataset.pending)
      const preview = form.querySelector('.file-preview');
      if(preview && preview.dataset && preview.dataset.pending){
        obj.imageData = preview.dataset.pending;
        // optional: store original filename if input exists
        const finput = form.querySelector('input[type="file"]');
        if(finput && finput.files && finput.files[0]) obj._imageName = finput.files[0].name;
      }
      // editing?
      const editId = form.dataset.editId;
      if(editId){
        AdminStore.update(col, editId, obj);
        form.removeAttribute('data-edit-id');
      } else {
        AdminStore.create(col, obj);
      }
      form.reset();
      // clear previews
      if(preview){ preview.src=""; delete preview.dataset.pending; }
      if(typeof window.onAdminDataChanged === "function") window.onAdminDataChanged(col);
      // small visual feedback
      const saveBtn = form.querySelector('button[type="submit"]');
      if(saveBtn){ const old = saveBtn.textContent; saveBtn.textContent="Saved"; setTimeout(()=>saveBtn.textContent=old,900); }
    });
  });
}

/* wire edit & delete buttons using data-edit / data-remove attributes */
function wireActions(){
  document.addEventListener('click', (e)=>{
    const editBtn = e.target.closest('[data-edit]');
    if(editBtn){
      const col = editBtn.dataset.edit;
      const id = editBtn.dataset.id;
      const record = AdminStore.get(col,id);
      if(!record) return;
      const formSelector = editBtn.dataset.target || `form[data-collection="${col}"]`;
      const form = document.querySelector(formSelector);
      if(!form) return;
      // populate fields
      for(const k in record){
        const field = form.querySelector(`[name="${k}"]`);
        if(field) field.value = record[k];
      }
      // show preview if imageData exists
      const preview = form.querySelector('.file-preview');
      if(preview){ if(record.imageData) preview.src = record.imageData; else preview.src=""; preview.dataset.pending = record.imageData || ""; }
      form.dataset.editId = id;
      window.scrollTo({top: form.getBoundingClientRect().top + window.scrollY - 80, behavior:"smooth"});
      return;
    }

    const rem = e.target.closest('[data-remove]');
    if(rem){
      const col = rem.dataset.remove;
      const id = rem.dataset.id;
      if(!confirm("Delete this item?")) return;
      AdminStore.remove(col,id);
      if(typeof window.onAdminDataChanged === "function") window.onAdminDataChanged(col);
    }
  });
}

/* expose helper to other pages */
window.AdminStore = AdminStore;
window.UI = UI;

/* initialization */
document.addEventListener('DOMContentLoaded', ()=>{
  AdminStore.ensure();
  activateSidebar();
  wireFilePreviews();
  wireForms();
  wireActions();
  // call page-specific renderers if present
  if(typeof window.onAdminReady === "function") window.onAdminReady();
});

/* convenience: re-wire previews after dynamic DOM changes */
window.rewireFilePreviews = wireFilePreviews;
