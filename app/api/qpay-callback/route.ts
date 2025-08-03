import { NextRequest, NextResponse } from 'next/server';
import { storePaymentStatus } from '@/lib/payment-storage';

export async function POST(req: NextRequest) {
  try {
    console.log('=== QPay Callback Received ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const callbackData = await req.json();
    console.log('QPay callback received:', JSON.stringify(callbackData, null, 2));

    // Extract payment information from callback
    const {
      payment_id,
      payment_status,
      payment_amount,
      payment_date,
      object_id, // This is the invoice ID
      ...otherData
    } = callbackData;

    console.log('Extracted payment data:', {
      payment_id,
      payment_status,
      payment_amount,
      payment_date,
      object_id,
      otherDataKeys: Object.keys(otherData)
    });

    if (!payment_id || !payment_status || !object_id) {
      console.error('Invalid callback data - missing required fields:', {
        has_payment_id: !!payment_id,
        has_payment_status: !!payment_status,
        has_object_id: !!object_id,
        full_data: callbackData
      });
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    // Store payment status in memory and database
    const paymentInfo = {
      payment_id,
      payment_status,
      payment_amount,
      payment_date,
      object_id,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      paid_by: 'P2P',
      ...otherData
    };

    console.log('Storing payment info:', paymentInfo);
    await storePaymentStatus(object_id, paymentInfo);

    // Handle different payment statuses
    switch (payment_status) {
      case 'PAID':
        console.log('Payment completed successfully for invoice:', object_id);
        // Here you would typically update your database
        break;
      case 'FAILED':
        console.log('Payment failed for invoice:', object_id);
        break;
      case 'REFUNDED':
        console.log('Payment refunded for invoice:', object_id);
        break;
      default:
        console.log('Payment status updated for invoice:', object_id, payment_status);
    }

    return NextResponse.json({ success: true, message: 'Callback processed' });

  } catch (error: any) {
    console.error('QPay callback error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process callback',
      success: false 
    }, { status: 500 });
  }
} 