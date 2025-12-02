/* Simple localStorage-backed admin helper
   - stores collections: "blogs", "team", "services", "testimonials"
   - provides CRUD operations and UI hooks used by pages
*/

const AdminStore = (function(){
  const prefix = "gts_admin_v1_";
  const defaultCollections = ["blogs","team","services","testimonials","settings"];

  function read(name){ 
    const raw = localStorage.getItem(prefix+name);
    if(!raw) return [];
    try{ return JSON.parse(raw) }catch(e){ return []; }
  }
  function write(name, data){ localStorage.setItem(prefix+name, JSON.stringify(data)); }
  function ensure(){
    defaultCollections.forEach(c=>{
      if(localStorage.getItem(prefix+c)===null) write(c, []);
    });
  }
  function all(name){ return read(name); }
  function create(name, item){
    const arr = read(name);
    item.id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    arr.unshift(item);
    write(name,arr);
    return item;
  }
  function update(name, id, patch){
    const arr = read(name).map(x => x.id===id ? {...x,...patch} : x);
    write(name,arr); return arr.find(x=>x.id===id);
  }
  function remove(name, id){
    const arr = read(name).filter(x=>x.id!==id); write(name,arr);
  }
  function get(name,id){ return read(name).find(x=>x.id===id) || null; }
  return {ensure,all,create,update,remove,get};
})();

/* Simple UI helpers used on pages */
const UI = (function(){
  function el(sel){ return document.querySelector(sel); }
  function on(sel,ev,fn){ const node = el(sel); if(node) node.addEventListener(ev,fn); }
  function renderList(containerSel, items, renderFn){
    const root = el(containerSel); if(!root) return;
    root.innerHTML = "";
    items.forEach(it=>{
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = renderFn(it);
      root.appendChild(card);
    });
  }
  return {el,on,renderList};
})();

/* Generic page wiring for create/list/edit/delete behavior */
document.addEventListener("DOMContentLoaded", () => {
  AdminStore.ensure();

  // hook navigation to set active
  document.querySelectorAll(".side-nav a").forEach(a=>{
    if(a.href === location.href || location.pathname.endsWith(a.getAttribute("data-page"))) a.classList.add("active");
    a.addEventListener("click", (e)=>{
      // allow normal link navigation
    });
  });

  // Generic listeners for forms that use data-collection attribute
  document.querySelectorAll("form[data-collection]").forEach(form=>{
    form.addEventListener("submit", async (ev)=>{
      ev.preventDefault();
      const col = form.dataset.collection;
      const fd = new FormData(form);
      const obj = {};
      for(const [k,v] of fd.entries()){
        obj[k] = v;
      }
      // handle file preview -> if file input present, store dataURL
      const fileInput = form.querySelector('input[type="file"]');
      if(fileInput && fileInput.files && fileInput.files[0]){
        obj._imageName = fileInput.files[0].name;
        obj.imageData = await readFileAsDataURL(fileInput.files[0]);
      }
      // if editing (data-edit-id)
      const editId = form.dataset.editId;
      if(editId){
        AdminStore.update(col, editId, obj);
        form.removeAttribute("data-edit-id");
      } else {
        AdminStore.create(col, obj);
      }
      form.reset();
      if(typeof window.onAdminDataChanged === "function") window.onAdminDataChanged(col);
      alert("Saved");
    });
  });

  // wire delete actions (buttons with data-remove)
  document.addEventListener("click", (e)=>{
    const rem = e.target.closest("[data-remove]");
    if(rem){
      const col = rem.dataset.remove;
      const id = rem.datasetId || rem.dataset.id || rem.getAttribute("data-id");
      if(!col||!id) return;
      if(!confirm("Delete this item?")) return;
      AdminStore.remove(col,id);
      if(typeof window.onAdminDataChanged === "function") window.onAdminDataChanged(col);
    }
  });

  // wire edit actions (buttons with data-edit)
  document.addEventListener("click",(e)=>{
    const edt = e.target.closest("[data-edit]");
    if(!edt) return;
    const col = edt.dataset.edit;
    const id = edt.dataset.id;
    const record = AdminStore.get(col,id);
    if(!record) return;
    const formSelector = edt.dataset.target || `form[data-collection="${col}"]`;
    const form = document.querySelector(formSelector);
    if(!form) return;
    // populate fields
    for(const k in record){
      const field = form.querySelector(`[name="${k}"]`);
      if(field){
        field.value = record[k];
      }
    }
    // set edit id attribute
    form.dataset.editId = id;
    window.scrollTo({top: form.getBoundingClientRect().top + window.scrollY - 80, behavior:"smooth"});
  });

  // utility for file read
  function readFileAsDataURL(file){
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
});
