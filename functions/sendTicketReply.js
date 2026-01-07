/**
 * Cloud Function: sendTicketReply
 * Triggered when a new admin reply is added to ticket_replies
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
const db = admin.firestore();

/* ---------------------------------
   SENDGRID CONFIG
---------------------------------- */

// 🔧 SET THIS IN ENV VARIABLES LATER
// firebase functions:config:set sendgrid.key="YOUR_API_KEY"
sgMail.setApiKey(functions.config().sendgrid.key);

/* ---------------------------------
   FUNCTION
---------------------------------- */
exports.sendTicketReply = functions.firestore
  .document("ticket_replies/{replyId}")
  .onCreate(async (snap, context) => {

    const reply = snap.data();

    // Only send emails for admin replies
    if (reply.sentBy !== "admin") return null;

    const ticketId = reply.ticketId;
    if (!ticketId) return null;

    // Fetch ticket
    const ticketRef = db.collection("tickets").doc(ticketId);
    const ticketSnap = await ticketRef.get();

    if (!ticketSnap.exists) return null;

    const ticket = ticketSnap.data();

    /* ---------------------------------
       EMAIL CONTENT
    ---------------------------------- */

    const userEmail = ticket.email;
    if (!userEmail) return null;

    const subject = `Re: Support Ticket`;
    const messageBody = reply.message;

    const msg = {
      to: userEmail,

      // 🔧 CHANGE THIS LATER
      from: {
        email: "support@yourdomain.com", // <-- UPDATE LATER
        name: "Guided Tech Support"
      },

      subject: subject,

      text: messageBody,

      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#333">
          <p>Hello ${ticket.name || "there"},</p>

          <p>${messageBody}</p>

          <hr>

          <p style="font-size:12px;color:#666">
            You can reply directly to this email to continue the conversation.
          </p>
        </div>
      `,

      // 📨 Allows users to reply via email
      replyTo: {
        email: "support@yourdomain.com", // <-- SAME EMAIL
        name: "Guided Tech Support"
      }
    };

    /* ---------------------------------
       SEND EMAIL
    ---------------------------------- */
    try {
      await sgMail.send(msg);

      // Update ticket metadata
      await ticketRef.update({
        lastReplyAt: Date.now(),
        updatedAt: Date.now()
      });

      return null;

    } catch (err) {
      console.error("SendGrid error:", err);
      return null;
    }
  });
