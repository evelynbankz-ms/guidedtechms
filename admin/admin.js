/* =========================================================
   FIREBASE INITIALIZATION
   ----------------------------------------------------------
   REPLACE THE BELOW PLACEHOLDER WITH YOUR FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // Add the remaining fields
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  
  const loginScreen = document.getElementById("loginScreen");
  const adminPanel = document.getElementById("adminPanel");

  // Check login state
  auth.onAuthStateChanged(user => {
    if (user) {
      loginScreen.style.display = "none";
      adminPanel.style.display = "flex";
    } else {
      adminPanel.style.display = "none";
      loginScreen.style.display = "block";
    }
  });

  // Login function
  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("loginEmail").value;
    const pass  = document.getElementById("loginPassword").value;

    try {
      await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) {
      document.getElementById("loginError").innerText = err.message;
    }
  };

  // Logout
  document.getElementById("logoutBtn").onclick = () => auth.signOut();

  // Sidebar switching
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.onclick = () => {
      const section = btn.dataset.section;
      document.querySelectorAll(".panel-section").forEach(p => p.classList.remove("active"));
      document.getElementById(section).classList.add("active");
    };
  });

  /* =========================================================
     CLOUDINARY UPLOAD HELPERS
     ========================================================= */

  function uploadImage(callback) {
    cloudinary.openUploadWidget(
      {
        cloudName: "YOUR_CLOUD_NAME_HERE",     // <--- replace
        uploadPreset: "YOUR_UPLOAD_PRESET",    // <--- replace
        folder: "guidedtech",
        multiple: false
      },
      (err, info) => {
        if (!err && info && info.event === "success") {
          callback(info.info.secure_url);
        }
      }
    );
  }

  /* =========================================================
     BLOG POST IMAGE UPLOAD
     ========================================================= */
  document.getElementById("uploadBlogImage").onclick = () => {
    uploadImage(url => {
      document.getElementById("blogImgUrl").innerText = url;
    });
  };

  /* =========================================================
     TEAM IMAGE UPLOAD
     ========================================================= */
  document.getElementById("uploadTeamImage").onclick = () => {
    uploadImage(url => {
      document.getElementById("teamImgUrl").innerText = url;
    });
  };

  /* =========================================================
     LEADER IMAGE UPLOAD
     ========================================================= */
  document.getElementById("uploadLeaderImage").onclick = () => {
    uploadImage(url => {
      document.getElementById("leaderImgUrl").innerText = url;
    });
  };

  /* =========================================================
     SAVE BLOG POST (FireStore placeholder)
     ========================================================= */
  document.getElementById("saveBlogPost").onclick = async () => {
    const title = document.getElementById("blogTitle").value;
    const content = document.getElementById("blogContent").value;
    const thumbnail = document.getElementById("blogImgUrl").innerText;

    // TODO: Write data to Firestore
    // db.collection("blogPosts").add({...})

    alert("Blog post saved (placeholder)");
  };

  /* =========================================================
     SAVE TEAM MEMBER (FireStore placeholder)
     ========================================================= */
  document.getElementById("saveTeamMember").onclick = async () => {
    alert("Team member saved (placeholder)");
  };

  /* =========================================================
     SAVE LEADER (FireStore placeholder)
     ========================================================= */
  document.getElementById("saveLeader").onclick = async () => {
    alert("Leader saved (placeholder)");
  };

  /* =========================================================
     SAVE SETTINGS (FireStore placeholder)
     ========================================================= */
  document.getElementById("saveSettings").onclick = async () => {
    alert("Settings saved (placeholder)");
  };

});
