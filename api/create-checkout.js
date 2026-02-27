/* ============================================================
   FILE: api/create-checkout.js
   Vercel Serverless Function — creates Stripe checkout session
   
   Place this file in: /api/create-checkout.js
   
   REQUIRED ENVIRONMENT VARIABLES (set in Vercel Dashboard):
   - STRIPE_SECRET_KEY
   - FIREBASE_SERVICE_ACCOUNT (entire JSON service account as string)
   - NEXT_PUBLIC_BASE_URL (your domain, e.g., https://yourdomain.com)
   ============================================================ */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    // Get the checkout session doc from Firestore
    const docRef = db.collection('checkoutSessions').doc(sessionId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const data = docSnap.data();

    // Skip if already has Stripe session
    if (data.stripeSessionId) {
      return res.json({
        success: true,
        sessionId: data.stripeSessionId,
        message: 'Session already exists',
      });
    }

    // Build line items
    const lineItems = [];

    if (data.itemType === 'service') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: data.itemName || 'Service Activation',
            description: `One-time activation for ${data.itemName}`,
          },
          unit_amount: Math.round((data.price || 0) * 100), // cents
        },
        quantity: 1,
      });
    } else if (data.itemType === 'plan') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: data.itemName || 'Subscription Plan',
            description: `${data.itemName} - ${data.billing || 'monthly'} subscription`,
          },
          unit_amount: Math.round((data.price || 0) * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment', // or 'subscription' for recurring
      success_url: `${baseUrl}/app/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/app/portal-services.html?canceled=true`,
      customer_email: data.userEmail,
      client_reference_id: sessionId,
      metadata: {
        firestoreSessionId: sessionId,
        userId: data.userId,
        itemType: data.itemType,
        itemId: data.itemId,
      },
    });

    // Update Firestore with Stripe session ID
    await docRef.update({
      stripeSessionId: session.id,
      stripeSessionUrl: session.url,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Create checkout error:', error);

    // Mark as failed in Firestore
    if (sessionId) {
      await db.collection('checkoutSessions').doc(sessionId).update({
        status: 'failed',
        error: error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
