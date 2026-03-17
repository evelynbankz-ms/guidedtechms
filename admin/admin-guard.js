/* ============================================================
   FILE: admin/admin-guard.js
   Protect admin pages - add this to ALL admin pages
   Place BEFORE any other scripts
   ============================================================ */

import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Not signed in - redirect to login
    window.location.replace('/admin/login.html');
    return;
  }
  
  try {
    // Check if user is in admins collection
    const adminDoc = await getDoc(doc(db, "admins", user.email));
    
    if (!adminDoc.exists()) {
      // Not an admin - sign out and redirect
      await auth.signOut();
      alert('Access denied. You do not have admin privileges.');
      window.location.replace('/admin/login.html');
      return;
    }
    
    // User is admin - allow access (no visual changes needed)
    
  } catch (error) {
    console.error('Admin check error:', error);
    await auth.signOut();
    window.location.replace('/admin/login.html');
  }
});
