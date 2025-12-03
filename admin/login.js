import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html"; 
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});
