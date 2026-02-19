// api/send-ticket-email.js
const sgMail = require('@sendgrid/mail');

// Vercel automatically makes environment variables available
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check secret for security
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { ticketId, toEmail, toName, subject, bodyHtml } = req.body;

  if (!toEmail || !bodyHtml) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <div style="padding-bottom:16px;border-bottom:2px solid #1B4F72;margin-bottom:20px;">
    <h2 style="color:#1B4F72;margin:0;">Guided Tech Solutions</h2>
  </div>
  <p>Hi <strong>${toName || 'Customer'}</strong>,</p>
  <p>Our support team has responded:</p>
  <div style="background:#f8f9fb;border-left:4px solid #1B4F72;padding:16px;margin:20px 0;">
    ${bodyHtml}
  </div>
  <p>Reply directly to this email with questions.</p>
  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e0e0e0;font-size:12px;color:#888;">
    <p>© Guided Tech Solutions · info@guidedtechms.com</p>
  </div>
</body>
</html>`;

    await sgMail.send({
      to: { email: toEmail, name: toName || 'Customer' },
      from: { email: 'info@guidedtechms.com', name: 'Guided Tech Solutions' },
      replyTo: 'info@guidedtechms.com',
      subject: `Re: ${subject || 'Your Support Request'}`,
      html: emailHtml
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('SendGrid error:', error);
    return res.status(500).json({ error: 'Email failed', detail: error.message });
  }
}
