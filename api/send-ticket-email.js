/* ============================================================
   FILE: api/send-ticket-email.js
   Vercel Serverless Function — Send ticket reply emails via SendGrid
   WITH TICKET ID IN SUBJECT FOR REPLY TRACKING
   
   REQUIRED ENVIRONMENT VARIABLES:
   - SENDGRID_API_KEY
   - ADMIN_SECRET (for authentication)
   - FROM_EMAIL (your verified sender email)
   ============================================================ */

const sgMail = require('@sendgrid/mail');

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin secret
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { ticketId, toEmail, toName, subject, bodyHtml } = req.body;

  if (!toEmail || !bodyHtml) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Initialize SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const fromEmail = process.env.FROM_EMAIL || 'info@guidedtechms.com';
  const fromName = 'Guided Tech Support';

  const msg = {
    to: {
      email: toEmail,
      name: toName || toEmail
    },
    from: {
      email: fromEmail,
      name: fromName
    },
    replyTo: fromEmail,
    subject: subject ? `Re: ${subject} [Ticket #${ticketId}]` : `Support Ticket Update [Ticket #${ticketId}]`,
    headers: {
      'X-Ticket-ID': ticketId || 'unknown'
    },
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #2E4053;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #071a24 0%, #0d2a3a 100%);
            padding: 30px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .logo {
            width: 50px;
            height: 50px;
            background: #1B4F72;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .header h1 {
            color: white;
            margin: 10px 0 0;
            font-size: 20px;
            font-weight: 600;
          }
          .content {
            background: white;
            padding: 30px 20px;
            border: 1px solid #E8ECF0;
            border-top: none;
          }
          .message-box {
            background: #F8F9FB;
            border-left: 4px solid #1B4F72;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .footer {
            background: #F8F9FB;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 12px 12px;
            font-size: 13px;
            color: #96A2B0;
          }
          .footer a {
            color: #1B4F72;
            text-decoration: none;
          }
          .btn {
            display: inline-block;
            background: #1B4F72;
            color: white !important;
            padding: 12px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 15px 0;
          }
          .ticket-id {
            background: #E8F4F8;
            border: 1px solid #1B4F72;
            padding: 8px 12px;
            border-radius: 6px;
            display: inline-block;
            font-size: 12px;
            font-weight: 600;
            color: #1B4F72;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">G</div>
          <h1>Guided Tech Support</h1>
        </div>
        
        <div class="content">
          <p>Hi ${toName || 'there'},</p>
          
          <div class="ticket-id">Ticket #${ticketId}</div>
          
          <p>We've received your support request and our team has responded:</p>
          
          <div class="message-box">
            ${bodyHtml}
          </div>
          
          <p><strong>To reply:</strong> Simply respond to this email and your message will be added to the ticket thread.</p>
          
          <p style="margin-top: 30px;">
            <a href="https://www.guidedtechms.com/contact" class="btn">Visit Support Portal</a>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Ticket ID:</strong> #${ticketId || 'N/A'}</p>
          <p>
            <a href="https://www.guidedtechms.com">Guided Tech Solutions</a><br>
            Empowering organizations with intelligent technology
          </p>
          <p style="margin-top: 15px; font-size: 11px;">
            You're receiving this email because you submitted a support request.<br>
            <a href="https://www.guidedtechms.com/contact">Contact us</a> if you need assistance.
          </p>
        </div>
      </body>
      </html>
    `,
    // Plain text fallback
    text: `
Hi ${toName || 'there'},

Ticket #${ticketId}

We've received your support request and our team has responded:

${bodyHtml.replace(/<[^>]*>/g, '')}

To reply: Simply respond to this email and your message will be added to the ticket thread.

---
Guided Tech Solutions
https://www.guidedtechms.com
    `.trim()
  };

  try {
    await sgMail.send(msg);
    
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('SendGrid error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
}
