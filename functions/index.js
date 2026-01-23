const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * ================================
 * 🔧 PLACEHOLDERS YOU MUST SET
 * ================================
 *
 * 1) SENDGRID_API_KEY:
 *    - Create in SendGrid
 *    - Put it in Firebase Functions config (or environment variables).
 *
 * 2) FROM_EMAIL:
 *    - Your verified sender like: support@guidedtechms.com
 *
 * 3) INBOUND_DOMAIN:
 *    - A domain configured for SendGrid Inbound Parse
 *    - Example: inbound.guidedtechms.com
 *
 * 4) INBOUND_SECRET:
 *    - A random secret string used to protect your inbound webhook
 *    - We'll check it on inbound endpoint
 *
 * ✅ You will set these using:
 * firebase functions:config:set sendgrid.key="..." sendgrid.from="..." sendgrid.inbound_domain="..." sendgrid.inbound_secret="..."
 */

// Helper: read function config safely
function cfg(path, fallback = "") {
  const parts = path.split(".");
  let cur = functions.config();
  for (const p of parts) cur = cur?.[p];
  return cur ?? fallback;
}

/**
 * ================================
 * ✅ 1) SEND OUTBOUND EMAIL
 * ================================
 * Called by your admin portal when admin replies.
 * - Saves message to Firestore (admin thread)
 * - Sends email to customer via SendGrid Web API
 * - Sets Reply-To to ticket+<ticketId>@<INBOUND_DOMAIN>
 */
exports.sendAdminTicketReply = functions.https.onRequest(async (req, res) => {
  try {
    // ✅ Allow only POST
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    // ✅ Basic security: shared secret header (you will set it in admin portal request)
    const expected = cfg("sendgrid.inbound_secret");
    const got = req.get("x-admin-secret") || "";
    if (!expected || got !== expected) return res.status(401).send("Unauthorized");

    const { ticketId, bodyHtml } = req.body || {};

    if (!ticketId || !bodyHtml) {
      return res.status(400).json({ ok: false, error: "Missing ticketId/bodyHtml" });
    }

    const db = admin.firestore();

    // Load ticket
    const ticketRef = db.collection("tickets").doc(ticketId);
    const snap = await ticketRef.get();
    if (!snap.exists) return res.status(404).json({ ok: false, error: "Ticket not found" });

    const ticket = snap.data();
    const toEmail = ticket.email;

    if (!toEmail) return res.status(400).json({ ok: false, error: "Ticket has no email" });

    const now = Date.now();

    // 1) Save admin message into thread
    await db.collection("ticket_messages").add({
      ticketId,
      sender: "admin",
      senderName: "Admin",
      senderEmail: cfg("sendgrid.from") || "support@example.com", // placeholder
      bodyHtml,
      createdAt: now
    });

    // 2) Update ticket metadata
    const preview = String(bodyHtml).replace(/<[^>]*>/g, "").trim().slice(0, 120);

    await ticketRef.update({
      status: "pending",
      updatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: preview,
      // user should have unread? optional field if you later build user portal
      // unreadUser: true
    });

    // 3) Send email to customer (SendGrid Web API)
    const SENDGRID_API_KEY = cfg("sendgrid.key");
    const FROM_EMAIL = cfg("sendgrid.from");
    const INBOUND_DOMAIN = cfg("sendgrid.inbound_domain");

    if (!SENDGRID_API_KEY || !FROM_EMAIL || !INBOUND_DOMAIN) {
      return res.status(500).json({
        ok: false,
        error: "Missing SendGrid config. Set sendgrid.key / sendgrid.from / sendgrid.inbound_domain"
      });
    }

    // ✅ Zendesk-style reply tracking via Reply-To tokenized address:
    // Example: ticket+AbC123@inbound.guidedtechms.com
    const replyTo = `ticket+${ticketId}@${INBOUND_DOMAIN}`;

    const subject = `Re: ${ticket.subject || "Support Ticket"} [Ticket #${ticketId}]`;

    const payload = {
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: FROM_EMAIL, name: "Guided Tech Support" }, // placeholder name
      reply_to: { email: replyTo, name: "Guided Tech Support" },
      subject,
      content: [
        { type: "text/html", value: bodyHtml }
      ]
    };

    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!sgRes.ok) {
      const txt = await sgRes.text().catch(() => "");
      console.error("SendGrid send failed:", sgRes.status, txt);
      return res.status(500).json({ ok: false, error: "SendGrid send failed", details: txt });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});


/**
 * ================================
 * ✅ 2) INBOUND EMAIL WEBHOOK
 * ================================
 * This endpoint is called by SendGrid Inbound Parse when a customer replies by email.
 *
 * We expect:
 *  - to: contains "ticket+<ticketId>@<INBOUND_DOMAIN>"
 *  - from: customer email address
 *  - subject: email subject
 *  - html or text: email body (SendGrid provides these)
 *
 * ✅ Protect with a secret query param:
 *  /inboundEmail?secret=YOUR_SECRET
 *
 * NOTE:
 * - SendGrid inbound can include a lot of extra fields.
 * - We'll use html if provided else convert text to simple HTML.
 */
exports.inboundEmail = functions.https.onRequest(async (req, res) => {
  try {
    // SendGrid posts form-encoded fields
    // Make sure Firebase Functions is able to parse it (it is for typical cases)
    const secret = req.query.secret || "";
    const expected = cfg("sendgrid.inbound_secret");

    if (!expected || secret !== expected) return res.status(401).send("Unauthorized");

    const to = String(req.body.to || "");
    const from = String(req.body.from || "");
    const subject = String(req.body.subject || "");
    const html = String(req.body.html || "");
    const text = String(req.body.text || "");

    // Extract ticketId from the inbound address: ticket+<ticketId>@domain
    const match = to.match(/ticket\+([A-Za-z0-9_-]+)/);
    const ticketId = match?.[1];

    if (!ticketId) {
      console.warn("Inbound email missing ticket token. to=", to);
      return res.status(200).send("No ticket token");
    }

    // Extract sender email from "from"
    // Often "Name <email@domain.com>"
    const emailMatch = from.match(/<([^>]+)>/) || from.match(/([^\s]+@[^\s]+)/);
    const senderEmail = (emailMatch && emailMatch[1]) ? emailMatch[1] : from;

    const bodyHtml = html
      ? html
      : `<p>${escapeTextToHtml(text)}</p>`;

    const now = Date.now();
    const db = admin.firestore();

    // Ensure ticket exists
    const ticketRef = db.collection("tickets").doc(ticketId);
    const snap = await ticketRef.get();
    if (!snap.exists) {
      console.warn("Inbound email for missing ticket:", ticketId);
      return res.status(200).send("Ticket not found");
    }

    const ticket = snap.data() || {};
    const senderName = ticket.name || "Customer";

    // Save user message into thread
    await db.collection("ticket_messages").add({
      ticketId,
      sender: "user",
      senderName,
      senderEmail,
      bodyHtml,
      createdAt: now
    });

    // Update ticket to open + unread for admin
    const preview = stripHtml(bodyHtml).slice(0, 120);

    await ticketRef.update({
      status: "open",
      updatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: preview,
      unreadAdmin: true
    });

    // ✅ SendGrid expects 2xx quickly
    return res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    // Still return 2xx to avoid retries storms (optional)
    return res.status(200).send("OK");
  }
});

/* ----------------------------
   Small helpers
---------------------------- */
function escapeTextToHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function stripHtml(s) {
  return String(s || "").replace(/<[^>]*>/g, "").trim();
}
