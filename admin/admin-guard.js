/* ============================================================
   FILE: admin/admin-guard.js
   Protect admin pages - add this to ALL admin pages
   Place BEFORE any other scripts
   ============================================================ */

import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Show loading screen while checking auth
document.body.style.opacity = '0.5';
document.body.style.pointerEvents = 'none';

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Not signed in - redirect to login
    window.location.href = '/admin/login.html';
    return;
  }
  
  try {
    // Check if user is in admins collection
    const adminDoc = await getDoc(doc(db, "admins", user.email));
    
    if (!adminDoc.exists()) {
      // Not an admin - sign out and redirect
      await auth.signOut();
      alert('Access denied. You do not have admin privileges.');
      window.location.href = '/admin/login.html';
      return;
    }
    
    // User is admin - allow access
    document.body.style.opacity = '1';
    document.body.style.pointerEvents = 'auto';
    
  } catch (error) {
    console.error('Admin check error:', error);
    await auth.signOut();
    window.location.href = '/admin/login.html';
  }
});
