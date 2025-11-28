/* ================================
   ADMIN NAVIGATION LOGIC
================================ */

const menuItems = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".admin-section");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    
    // remove active from menu
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    // show right section
    const target = item.dataset.section;
    sections.forEach(sec => {
      sec.classList.remove("active");
      if (sec.id === target) sec.classList.add("active");
    });

  });
});


/* ============================================
   FIREBASE INITIALIZATION (DISABLED FOR NOW)
============================================ */
/*
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",         // ← replace
  authDomain: "YOUR_DOMAIN_HERE",      // ← replace
  projectId: "YOUR_PROJECT_ID_HERE",   // ← replace
  storageBucket: "YOUR_BUCKET_HERE",   // ← replace
  messagingSenderId: "YOUR_MSG_ID",    // ← replace
  appId: "YOUR_APP_ID"                 // ← replace
};

// UNCOMMENT these after Firebase setup
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
*/


/* ============================================
   CLOUDINARY UPLOAD WIDGET (DISABLED FOR NOW)
============================================ */
/*
const cloudinaryWidget = cloudinary.createUploadWidget(
  {
    cloudName: "YOUR_CLOUD_NAME",    // ← replace
    uploadPreset: "YOUR_PRESET"      // ← replace
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      console.log("Uploaded:", result.info.secure_url);
    }
  }
);

// Usage:
document.querySelector("#uploadBtn").addEventListener("click", () => {
  cloudinaryWidget.open();
});
*/
