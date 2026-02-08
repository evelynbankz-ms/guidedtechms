import { db } from "../admin/firebase.js";
import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const grid = document.getElementById("careersGrid");

function escapeHtml(s){
  return String(s||'').replace(/[&<>"']/g,
    m => ({"&":"&amp;","<":"&lt;","&gt;":"&gt;","\"":"&quot;","'":"&#39;"}[m])
  );
}

async function loadCareers(){
  const q = query(collection(db, "careers"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  if(!snap.docs.length){
    grid.innerHTML = `
      <div class="empty">
        There are currently no openings, please check back later or keep an eye on this page for any future openings.
      </div>
    `;
    return;
  }

  grid.innerHTML = snap.docs.map(doc => {
    const job = doc.data();
    return `
      <article class="career-card">
        <h3>${escapeHtml(job.title)}</h3>
        <div class="career-meta">
          ${escapeHtml(job.location)} • ${escapeHtml(job.type)}
        </div>
        <div class="career-desc">
          ${job.description || ""}
        </div>
      </article>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", loadCareers);
