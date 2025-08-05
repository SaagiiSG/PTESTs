import { NextRequest, NextResponse } from 'next/server';
import { storePaymentStatus } from '@/lib/payment-storage';

export async function POST(req: NextRequest) {
  try {
    console.log('=== QPay Course Callback Received ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const callbackData = await req.json();
    console.log('QPay Course callback received:', JSON.stringify(callbackData, null, 2));

    // Extract payment information from callback
    const {
      payment_id,
      payment_status,
      payment_amount,
      payment_date,
      object_id, // This is the invoice ID
      ...otherData
    } = callbackData;

    console.log('Extracted course payment data:', {
      payment_id,
      payment_status,
      payment_amount,
      payment_date,
      object_id,
      otherDataKeys: Object.keys(otherData)
    });

    if (!payment_id || !payment_status || !object_id) {
      console.error('Invalid course callback data - missing required fields:', {
        has_payment_id: !!payment_id,
        has_payment_status: !!payment_status,
        has_object_id: !!object_id,
        full_data: callbackData
      });
      return NextResponse.json({ error: 'Invalid course callback data' }, { status: 400 });
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
      payment_wallet: 'QPay Course',
      paid_by: 'P2P',
      service_type: 'course', // Mark this as a course payment
      ...otherData
    };

    console.log('Storing course payment info:', paymentInfo);
    await storePaymentStatus(object_id, paymentInfo);

    // Handle different payment statuses
    switch (payment_status) {
      case 'PAID':
        console.log('Course payment completed successfully for invoice:', object_id);
        // Here you would typically update your database
        break;
      case 'FAILED':
        console.log('Course payment failed for invoice:', object_id);
        break;
      case 'REFUNDED':
        console.log('Course payment refunded for invoice:', object_id);
        break;
      default:
        console.log('Course payment status updated for invoice:', object_id, payment_status);
    }

    return NextResponse.json({ success: true, message: 'Course callback processed' });

  } catch (error: any) {
    console.error('QPay Course callback error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process course callback',
      success: false 
    }, { status: 500 });
  }
} 