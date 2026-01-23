const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * ================================
 * 🔧 REQUIRED CONFIG (placeholders)
 * ================================
 * Set these with:
 *
 * firebase functions:config:set \
 *   sendgrid.key="SENDGRID_API_KEY" \
 *   sendgrid.from="info@guidedtechms.com" \
 *   sendgrid.inbound_domain="inbound.guidedtechms.com" \
 *   sendgrid.inbound_secret="PUT_A_RANDOM_LONG_SECRET_HERE"
 *
 * Then deploy:
 * firebase deploy --only functions
 */
function cfg(path, fallback = "") {
  const parts = path.split(".");
  let cur = functions.config();
  for (const p of parts) cur = cur?.[p];
  return cur ?? fallback;
}

/* ----------------------------
   Helpers
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

/**
 * ======================================
 * ✅ 1) Outbound Email Sender (ONLY EMAIL)
 * ======================================
 * Called by admin portal after it already saved the message to Firestore.
 *
 * This function ONLY sends the email via SendGrid Web API.
 * It does NOT create Firestore documents (no duplicates).
 *
 * Security:
 * - Uses a shared secret in header: x-admin-secret
 */
exports.sendAdminTicketEmail = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    // ✅ Protect endpoint (simple shared secret)
    const expected = cfg("sendgrid.inbound_secret");
    const got = req.get("x-admin-secret") || "";
    if (!expected || got !== expected) return res.status(401).send("Unauthorized");

    const { ticketId, bodyHtml } = req.body || {};
    if (!ticketId || !bodyHtml) {
      return res.status(400).json({ ok: false, error: "Missing ticketId/bodyHtml" });
    }

    const SENDGRID_API_KEY = cfg("sendgrid.key");
    const FROM_EMAIL = cfg("sendgrid.from"); // info@guidedtechms.com
    const INBOUND_DOMAIN = cfg("sendgrid.inbound_domain");

    if (!SENDGRID_API_KEY || !FROM_EMAIL || !INBOUND_DOMAIN) {
      return res.status(500).json({
        ok: false,
        error: "Missing SendGrid config. Set sendgrid.key / sendgrid.from / sendgrid.inbound_domain"
      });
    }

    const db = admin.firestore();

    // Load ticket so we can email the correct user
    const ticketRef = db.collection("tickets").doc(ticketId);
    const snap = await ticketRef.get();
    if (!snap.exists) return res.status(404).json({ ok: false, error: "Ticket not found" });

    const ticket = snap.data() || {};
    const toEmail = ticket.email;
    if (!toEmail) return res.status(400).json({ ok: false, error: "Ticket has no email" });

    // ✅ Zendesk-style: Reply-To contains the ticketId
    // User replies → SendGrid inbound parse receives → we extract ticketId
    const replyTo = `ticket+${ticketId}@${INBOUND_DOMAIN}`;

    const subject = `Re: ${ticket.subject || "Support Ticket"} [Ticket #${ticketId}]`;

    // SendGrid v3 payload
    const payload = {
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: FROM_EMAIL, name: "Guided Tech Support" }, // you can change name later
      reply_to: { email: replyTo, name: "Guided Tech Support" },
      subject,
      content: [{ type: "text/html", value: bodyHtml }]
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
 * ======================================
 * ✅ 2) Inbound Parse Webhook (EMAIL → THREAD)
 * ======================================
 * SendGrid Inbound Parse posts here when user replies by email.
 *
 * Protect with:
 * /inboundEmail?secret=YOUR_SECRET
 *
 * We extract ticketId from recipient:
 * ticket+<ticketId>@inbound.guidedtechms.com
 *
 * Then we write it into Firestore:
 * - ticket_messages (sender=user)
 * - update tickets (status=open, unreadAdmin=true)
 */
exports.inboundEmail = functions.https.onRequest(async (req, res) => {
  try {
    const secret = String(req.query.secret || "");
    const expected = cfg("sendgrid.inbound_secret");
    if (!expected || secret !== expected) return res.status(401).send("Unauthorized");

    // SendGrid inbound parse posts form fields
    const to = String(req.body.to || "");
    const from = String(req.body.from || "");
    const html = String(req.body.html || "");
    const text = String(req.body.text || "");

    // Extract ticketId from: ticket+<ticketId>@...
    const match = to.match(/ticket\+([A-Za-z0-9_-]+)/);
    const ticketId = match?.[1];

    if (!ticketId) {
      console.warn("Inbound email missing ticket token. to=", to);
      return res.status(200).send("No ticket token");
    }

    // Extract sender email from "Name <email@domain.com>"
    const emailMatch = from.match(/<([^>]+)>/) || from.match(/([^\s]+@[^\s]+)/);
    const senderEmail = (emailMatch && emailMatch[1]) ? emailMatch[1] : from;

    const bodyHtml = html ? html : `<p>${escapeTextToHtml(text)}</p>`;
    const now = Date.now();

    const db = admin.firestore();
    const ticketRef = db.collection("tickets").doc(ticketId);
    const ticketSnap = await ticketRef.get();

    if (!ticketSnap.exists) {
      console.warn("Inbound email for missing ticket:", ticketId);
      return res.status(200).send("Ticket not found");
    }

    const ticket = ticketSnap.data() || {};
    const senderName = ticket.name || "Customer";

    // ✅ Save customer reply into thread
    await db.collection("ticket_messages").add({
      ticketId,
      sender: "user",
      senderName,
      senderEmail,
      bodyHtml,
      createdAt: now
    });

    // ✅ Update ticket metadata (Zendesk-like)
    await ticketRef.update({
      status: "open",
      updatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: stripHtml(bodyHtml).slice(0, 120),
      unreadAdmin: true
    });

    // SendGrid expects quick 2xx
    return res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    // still return 200 to avoid retries storms
    return res.status(200).send("OK");
  }
});
