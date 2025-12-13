// scripts/post.js
import { db } from "../admin/firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* Get slug from querystring */
function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}

async function loadPost() {
  const slug = getSlug();
  const postArea = document.getElementById("postArea");

  if (!slug) {
    postArea.innerHTML = `<div class="empty">No post specified.</div>`;
    return;
  }

  try {
    const q = query(
      collection(db, "blogs"),
      where("slug", "==", slug)
    );

    const snap = await getDocs(q);

    if (!snap.docs.length) {
      postArea.innerHTML = `<div class="empty">Post not found.</div>`;
      return;
    }

    const data = snap.docs[0].data();

    document.title = `${data.title} — Guided Tech Solutions`;

    postArea.innerHTML = `
      <article style="max-width:860px;margin:0 auto">
        ${
          data.imageUrl
            ? `<img src="${data.imageUrl}"
                style="width:100%;border-radius:12px;margin-bottom:18px;object-fit:cover">`
            : ""
        }

        <h1 style="font-family:Poppins,serif;margin-bottom:8px">
          ${escapeHtml(data.title || "")}
        </h1>

        <div style="color:#6b7780;margin-bottom:12px">
          ${escapeHtml(data.category || "")}
          ${data.createdAt ? "• " + new Date(data.createdAt).toLocaleDateString() : ""}
        </div>

        ${
          data.excerpt
            ? `<div style="color:#344a56;margin-bottom:18px">
                ${escapeHtml(data.excerpt)}
              </div>`
            : ""
        }

        <div class="post-content">
          ${data.content || ""}
        </div>
      </article>
    `;
  } catch (err) {
    console.error(err);
    postArea.innerHTML = `<div class="empty">Error loading post.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadPost);
