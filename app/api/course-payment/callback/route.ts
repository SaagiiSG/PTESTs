import { NextRequest, NextResponse } from 'next/server';
import { storePaymentStatus } from '@/lib/payment-storage';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Course Payment Callback Received ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Callback URL from env:', process.env.QPAY_COURSE_CALLBACK_URL);

    const callbackData = await req.json();
    console.log('Course payment callback received:', callbackData);

    // Extract payment data
    const paymentData = {
      payment_id: callbackData.payment_id,
      payment_status: callbackData.payment_status,
      payment_amount: callbackData.payment_amount,
      payment_date: callbackData.payment_date,
      object_id: callbackData.object_id,
      object_type: callbackData.object_type,
      payment_currency: callbackData.payment_currency,
      payment_wallet: callbackData.payment_wallet,
      paid_by: callbackData.paid_by,
      service_type: 'course' // Mark as course payment
    };

    console.log('Extracted payment data:', paymentData);

    // Store payment information
    console.log('Storing payment info:', paymentData);
    await storePaymentStatus(callbackData.object_id, paymentData);
    console.log('Payment stored in database for invoice:', callbackData.object_id);

    // Process the payment based on status
    if (callbackData.payment_status === 'PAID') {
      console.log('Course payment completed successfully for invoice:', callbackData.object_id);
      
      // Here you can add logic to:
      // - Update user's course access
      // - Send confirmation email
      // - Update database records
      // - Trigger any post-payment actions
      // - Enroll user in the course
      
    } else if (callbackData.payment_status === 'FAILED') {
      console.log('Course payment failed for invoice:', callbackData.object_id);
      
      // Here you can add logic to:
      // - Notify user of payment failure
      // - Update payment status
      // - Handle failed payment scenarios
      
    }

    return NextResponse.json({
      success: true,
      message: 'Course payment callback processed successfully'
    });

  } catch (error: any) {
    console.error('Course payment callback processing error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process course payment callback'
    }, { status: 500 });
  }
} 