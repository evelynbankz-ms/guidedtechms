/* ============================================================
   FILE: admin/login.js
   Admin login with email/password AND admin verification
   ============================================================ */

import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  
  if (!email || !password) {
    errorMsg.textContent = "Please enter both email and password";
    return;
  }
  
  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";
  errorMsg.textContent = "";
  
  try {
    // 1. Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Check if user is in admins collection
    const adminDoc = await getDoc(doc(db, "admins", user.email));
    
    if (!adminDoc.exists()) {
      // User is NOT an admin - sign them out
      await auth.signOut();
      errorMsg.textContent = "Access denied. You do not have admin privileges.";
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
      return;
    }
    
    // 3. User IS an admin - redirect to dashboard
    window.location.href = "dashboard.html";
    
  } catch (err) {
    console.error("Login error:", err);
    
    let errorMessage = "Failed to login";
    if (err.code === 'auth/user-not-found') {
      errorMessage = "No account found with this email";
    } else if (err.code === 'auth/wrong-password') {
      errorMessage = "Incorrect password";
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address";
    } else if (err.code === 'auth/invalid-credential') {
      errorMessage = "Invalid email or password";
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    errorMsg.textContent = errorMessage;
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});

// Allow Enter key to submit
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loginBtn.click();
  }
});
