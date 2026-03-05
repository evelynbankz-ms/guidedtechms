/* ============================================================
   FILE: api/receive-ticket-reply.js
   FINAL VERSION - Shows ALL emails in admin ticket panel
   
   Categorizes emails automatically:
   - "Ticket Reply" - Customer replying to existing ticket
   - "New Inquiry" - New email from contact form
   - "General Email" - Any other email to info@guidedtechms.com
   
   ALL emails appear in admin panel with category badges!
   
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

// Disable body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Get raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

// Parse multipart form data
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

// Extract ticket ID from subject or headers
function extractTicketId(subject, headers) {
  const subjectMatch = subject?.match(/\[?Ticket #([A-Za-z0-9]+)\]?/i);
  if (subjectMatch) return subjectMatch[1];
  
  const headerMatch = headers?.match(/X-Ticket-ID:\s*([A-Za-z0-9]+)/i);
  if (headerMatch) return headerMatch[1];
  
  return null;
}

// Extract name from email address
function extractName(emailString) {
  // Try to get name from "John Doe <john@example.com>" format
  const nameMatch = emailString.match(/^(.+?)\s*</);
  if (nameMatch) return nameMatch[1].trim().replace(/"/g, '');
  
  // Otherwise use email before @
  const emailMatch = emailString.match(/<([^>]+)>/) || [null, emailString];
  const email = emailMatch[1];
  return email.split('@')[0].replace(/[._-]/g, ' ');
}

// Extract email address only
function extractEmail(emailString) {
  const match = emailString.match(/<([^>]+)>/);
  return match ? match[1] : emailString;
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
    const subject = fields.subject || 'No Subject';
    const text = fields.text || '';
    const html = fields.html || '';
    const headers = fields.headers || '';

    const senderEmail = extractEmail(from);
    const senderName = extractName(from);

    // Check if this is a ticket reply
    const ticketId = extractTicketId(subject, headers);

    // SCENARIO 1: Reply to existing ticket
    if (ticketId) {
      const ticketSnap = await db.collection('tickets').doc(ticketId).get();
      
      if (ticketSnap.exists) {
        // Add reply to existing ticket thread
        await db.collection('ticket_messages').add({
          ticketId: ticketId,
          sender: 'user',
          senderName: senderName,
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

        console.log(`✅ Reply added to ticket ${ticketId}`);

        return res.status(200).json({ 
          success: true,
          action: 'ticket_reply',
          category: 'Ticket Reply',
          ticketId
        });
      }
    }

    // SCENARIO 2 & 3: New email (no ticket ID or ticket not found)
    // Check if sender has existing tickets
    const existingTickets = await db.collection('tickets')
      .where('email', '==', senderEmail)
      .where('status', 'in', ['open', 'pending'])
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();

    let category = 'General Email';
    let source = 'direct-email';

    // If sender has open tickets, likely a follow-up
    if (!existingTickets.empty) {
      category = 'Follow-up Email';
      source = 'follow-up-email';
    }

    // Create new ticket for this email
    const now = admin.firestore.FieldValue.serverTimestamp();
    
    const newTicket = await db.collection('tickets').add({
      name: senderName,
      email: senderEmail,
      phone: '',
      subject: subject.replace(/^(Re:|Fwd?:)\s*/gi, '').trim(),
      message: text,
      category: category,  // "General Email" or "Follow-up Email"
      source: source,      // "direct-email" or "follow-up-email"
      status: 'open',
      unreadAdmin: true,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: text.slice(0, 120),
      emailSource: 'inbound-parse'  // Tag to identify it came from email
    });

    // Add initial message to thread
    await db.collection('ticket_messages').add({
      ticketId: newTicket.id,
      sender: 'user',
      senderName: senderName,
      senderEmail: senderEmail,
      bodyHtml: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
      isNote: false,
      createdAt: now,
    });

    console.log(`✅ New ticket created from email: ${newTicket.id} - Category: ${category}`);

    return res.status(200).json({ 
      success: true,
      action: 'new_ticket',
      category: category,
      ticketId: newTicket.id
    });

  } catch (error) {
    console.error('Error processing email:', error);
    return res.status(500).json({ 
      error: 'Failed to process email',
      detail: error.message 
    });
  }
}
