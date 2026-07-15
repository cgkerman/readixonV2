import { NextResponse } from 'next/server';
import { paymentService } from '@readixon/core';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const postData = Object.fromEntries(formData.entries());
    
    // Verify hash
    const isValid = paymentService.verifyPayTRWebhook(postData);
    if (!isValid) {
      console.error('PayTR Webhook verification failed!', postData);
      return new NextResponse('HASH VERIFICATION FAILED', { status: 400 });
    }

    const { merchant_oid, status, total_amount, payment_amount } = postData;

    // Get the transaction
    const transactionRef = db.collection('payment_transactions').doc(merchant_oid as string);
    const transactionSnap = await transactionRef.get();

    if (!transactionSnap.exists) {
      console.error('Transaction not found:', merchant_oid);
      return new NextResponse('TRANSACTION NOT FOUND', { status: 400 });
    }

    const transactionData = transactionSnap.data();

    // If already processed, just return OK so PayTR stops sending webhooks
    if (transactionData?.status === 'completed' || transactionData?.status === 'failed') {
      return new NextResponse('OK', { status: 200 });
    }

    if (status === 'success') {
      // Process successful payment
      const batch = db.batch();
      
      // Update transaction status
      batch.update(transactionRef, {
        status: 'completed',
        paytrResponse: postData,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Update user based on package type
      const userRef = db.collection('users').doc(transactionData?.userId);
      const userSnap = await userRef.get();

      if (userSnap.exists) {
        if (transactionData?.type === 'rx_points') {
          // Add RX Points
          batch.update(userRef, {
            rxPoints: FieldValue.increment(transactionData.rxAmount || 0),
          });
        } else if (transactionData?.type === 'premium_subscription') {
          // Update status to premium and give monthly RX gift
          batch.update(userRef, {
            status: 'premium',
            rxPoints: FieldValue.increment(250),
          });
        } else if (transactionData?.type === 'pro_subscription') {
          // Update status to pro
          batch.update(userRef, {
            status: 'pro',
          });
        }
      }

      await batch.commit();
      console.log(`Payment processed successfully for order ${merchant_oid}`);
      return new NextResponse('OK', { status: 200 });
      
    } else {
      // Payment failed
      await transactionRef.update({
        status: 'failed',
        paytrResponse: postData,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`Payment failed for order ${merchant_oid}`, postData);
      return new NextResponse('OK', { status: 200 }); // Return OK to PayTR even if payment failed so it stops retrying
    }
  } catch (error: any) {
    console.error('PayTR Webhook error:', error);
    return new NextResponse('INTERNAL SERVER ERROR', { status: 500 });
  }
}
