/* ============================================================
   FILE: api/receive-ticket-reply.js
   Vercel Serverless Function — Handle incoming email replies
   
   SETUP:
   1. Deploy this function
   2. Configure SendGrid Inbound Parse:
      - Go to https://app.sendgrid.com/settings/parse
      - Click "Add Host & URL"
      - Hostname: reply.guidedtechms.com (or subdomain you own)
      - URL: https://yourdomain.vercel.app/api/receive-ticket-reply
      - Check "POST the raw, full MIME message"
   3. Add MX records to your DNS for the subdomain
   
   REQUIRED ENV VARS:
   - FIREBASE_SERVICE_ACCOUNT
   ============================================================ */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Disable body parsing (we need raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse email body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

// Parse multipart form data (simple parser for email body)
function parseMultipart(body, boundary) {
  const parts = body.split(`--${boundary}`);
  const fields = {};
  
  parts.forEach(part => {
    const headerMatch = part.match(/Content-Disposition: form-data; name="([^"]+)"/);
    if (headerMatch) {
      const name = headerMatch[1];
      const contentStart = part.indexOf('\r\n\r\n') + 4;
      const content = part.substring(contentStart).trim();
      fields[name] = content;
    }
  });
  
  return fields;
}

// Extract ticket ID from subject or email headers
function extractTicketId(subject, headers) {
  // Look for ticket ID in subject: "Re: [Ticket #ABC123]"
  const subjectMatch = subject?.match(/Ticket #([A-Za-z0-9]+)/i);
  if (subjectMatch) return subjectMatch[1];
  
  // Look in custom headers
  const headerMatch = headers?.match(/X-Ticket-ID:\s*([A-Za-z0-9]+)/i);
  if (headerMatch) return headerMatch[1];
  
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    const boundary = boundaryMatch[1];
    const fields = parseMultipart(rawBody, boundary);

    const from = fields.from || '';
    const to = fields.to || '';
    const subject = fields.subject || '';
    const text = fields.text || '';
    const html = fields.html || '';
    const headers = fields.headers || '';

    // Extract email address from "Name <email@domain.com>" format
    const emailMatch = from.match(/<([^>]+)>/);
    const senderEmail = emailMatch ? emailMatch[1] : from;

    // Try to find the ticket
    let ticketId = extractTicketId(subject, headers);
    let ticket = null;

    // If no ticket ID in subject, try to find by email
    if (!ticketId) {
      const ticketsSnap = await db.collection('tickets')
        .where('email', '==', senderEmail)
        .where('status', 'in', ['open', 'pending'])
        .orderBy('updatedAt', 'desc')
        .limit(1)
        .get();

      if (!ticketsSnap.empty) {
        ticket = ticketsSnap.docs[0];
        ticketId = ticket.id;
      }
    } else {
      const ticketSnap = await db.collection('tickets').doc(ticketId).get();
      if (ticketSnap.exists) {
        ticket = ticketSnap;
      }
    }

    if (!ticket || !ticketId) {
      console.log('No matching ticket found for email from:', senderEmail);
      return res.status(200).json({ 
        message: 'Email received but no matching ticket found',
        from: senderEmail 
      });
    }

    const ticketData = ticket.data();

    // Add message to ticket thread
    await db.collection('ticket_messages').add({
      ticketId: ticketId,
      sender: 'user',
      senderName: ticketData.name || 'Customer',
      senderEmail: senderEmail,
      bodyHtml: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
      isNote: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update ticket
    await db.collection('tickets').doc(ticketId).update({
      status: 'open',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessagePreview: text.slice(0, 120),
      unreadAdmin: true,
    });

    console.log(`✅ Reply added to ticket ${ticketId} from ${senderEmail}`);

    return res.status(200).json({ 
      success: true, 
      ticketId,
      message: 'Reply added to ticket' 
    });

  } catch (error) {
    console.error('Error processing email reply:', error);
    return res.status(500).json({ 
      error: 'Failed to process email',
      detail: error.message 
    });
  }
}
