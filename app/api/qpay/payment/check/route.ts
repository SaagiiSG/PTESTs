import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus, storePaymentStatus } from '@/lib/payment-storage';
import { qpayService } from '@/lib/qpay';

export async function POST(req: NextRequest) {
  try {
    const { payment_id } = await req.json();
    
    if (!payment_id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    console.log('Checking payment status for invoice:', payment_id);

    // Check if we have payment status stored using the shared storage
    let paymentInfo = await getPaymentStatus(payment_id);
    
    if (paymentInfo) {
      console.log('Payment found in local storage:', paymentInfo);
      
      return NextResponse.json({
        success: true,
        payment: {
          count: 1,
          rows: [paymentInfo]
        }
      });
    }

    // Payment not found - rely on callback system
    console.log('Payment not found in local storage. This could be a timing issue.');
    console.log('Payment might still be processing or callback not received yet.');
    
    return NextResponse.json({
      success: true,
      payment: {
        count: 0,
        rows: []
      },
      message: 'Payment verification in progress. Please wait a moment and try again, or check if the payment was completed in your QPay app.',
      code: 'PAYMENT_PROCESSING'
    });

  } catch (error: any) {
    console.error('Payment check error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to check payment status',
      success: false 
    }, { status: 500 });
  }
} 