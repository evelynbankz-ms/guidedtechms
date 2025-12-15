// scripts/faq.js
import { db } from "../admin/firebase.js";
import {
  collection,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const faqList = document.getElementById("faqList");

async function loadFaqs() {
  try {
    const q = query(
      collection(db, "faqs"),
      orderBy("createdAt", "asc")
    );

    const snap = await getDocs(q);

    if (!snap.docs.length) {
      faqList.innerHTML = "No FAQs available.";
      return;
    }

    faqList.innerHTML = snap.docs.map(doc => {
      const f = doc.data();
      return `
        <div class="faq-item">
          <button class="faq-question">
            ${f.question}
            <span>+</span>
          </button>
          <div class="faq-answer">
            ${f.answer}
          </div>
        </div>
      `;
    }).join("");

    wireAccordion();
  } catch (err) {
    console.error(err);
    faqList.innerHTML = "Failed to load FAQs.";
  }
}

function wireAccordion() {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("open");
    });
  });
}

document.addEventListener("DOMContentLoaded", loadFaqs);
