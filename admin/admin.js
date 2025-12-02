/* -------------------------
   SIDEBAR TOGGLE (mobile)
------------------------- */
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");

if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    sidebar.style.display =
      getComputedStyle(sidebar).display === "none" ? "block" : "none";
  });
}

/* -------------------------
   FEATURE LIST → RIGHT CARD
------------------------- */
const featureButtons = document.querySelectorAll(".feature-item");
const featureContents = document.querySelectorAll(".feature-content");

featureButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    /* toggle active button */
    featureButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    /* show matched content */
    const id = btn.dataset.feature;
    featureContents.forEach((content) => {
      content.style.display = content.dataset.id === id ? "block" : "none";
    });
  });
});

/* -------------------------
   REFRESH BUTTON
------------------------- */
const refreshBtn = document.getElementById("refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    refreshBtn.textContent = "Refreshing…";
    setTimeout(() => (refreshBtn.textContent = "Refresh"), 700);
  });
}
