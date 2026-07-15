import { NextResponse } from 'next/server';
import { paymentService } from '@readixon/core';
import { adminDb as db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Pricing configuration
const PRICING = {
  rx_points: {
    start: { amount: 19.90, rxAmount: 100, name: 'Başlangıç Paketi (100 RX)' },
    adventure: { amount: 79.90, rxAmount: 500, name: 'Macera Paketi (500 RX)' },
    epic: { amount: 249.90, rxAmount: 2000, name: 'Destansı Paket (2000 RX)' },
  },
  premium_subscription: {
    monthly: { amount: 49.90, name: 'Premium Abonelik (Aylık)' }
  },
  pro_subscription: {
    monthly: { amount: 109.90, name: 'Pro Abonelik (Aylık)' }
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, packageId, type, email, userName } = body;

    if (!uid || !packageId || !type || !email || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine price and package details
    let packageDetails: any;
    if (type === 'rx_points') {
      packageDetails = PRICING.rx_points[packageId as keyof typeof PRICING.rx_points];
    } else if (type === 'premium_subscription') {
      packageDetails = PRICING.premium_subscription[packageId as keyof typeof PRICING.premium_subscription];
    } else if (type === 'pro_subscription') {
      packageDetails = PRICING.pro_subscription[packageId as keyof typeof PRICING.pro_subscription];
    }

    if (!packageDetails) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Generate unique order ID (Alphanumeric only for PayTR)
    const merchantOid = `RX${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create transaction in Firestore
    const transactionData: any = {
      id: merchantOid,
      userId: uid,
      type: type,
      status: 'pending',
      amount: packageDetails.amount,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (type === 'rx_points') {
      transactionData.rxAmount = packageDetails.rxAmount;
    }

    await db.collection('payment_transactions').doc(merchantOid).set(transactionData);

    // Get user IP and ensure it is a single IP address (Vercel uses comma-separated lists)
    const forwardedFor = req.headers.get('x-forwarded-for');
    let userIp = '85.105.1.1'; // Default fallback
    if (forwardedFor) {
      userIp = forwardedFor.split(',')[0].trim();
    }

    const basket: Array<[string, string, number]> = [
      [packageDetails.name, packageDetails.amount.toString(), 1]
    ];

    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Generate PayTR token
    const token = await paymentService.generatePayTRToken({
      merchantOid,
      email,
      paymentAmount: packageDetails.amount,
      userName,
      userIp,
      basket,
      merchantOkUrl: `${baseUrl}/payment/success`,
      merchantFailUrl: `${baseUrl}/payment/fail`,
    });

    return NextResponse.json({ token, merchantOid });

  } catch (error: any) {
    console.error('PayTR Token Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
