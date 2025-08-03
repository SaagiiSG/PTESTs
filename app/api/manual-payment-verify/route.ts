import { NextRequest, NextResponse } from 'next/server';
import { storePaymentStatus } from '@/lib/payment-storage';

export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { invoice_id, payment_status = 'PAID', payment_amount, payment_id } = await req.json();
    
    if (!invoice_id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    console.log('Manual payment verification for invoice:', invoice_id);

    // Create a mock payment record
    const paymentInfo = {
      payment_id: payment_id || `manual-${Date.now()}`,
      payment_status: payment_status,
      payment_amount: payment_amount || 1000,
      payment_date: new Date().toISOString(),
      object_id: invoice_id,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      paid_by: 'P2P'
    };

    // Store the payment
    await storePaymentStatus(invoice_id, paymentInfo);

    console.log('Manual payment stored successfully:', paymentInfo);

    return NextResponse.json({
      success: true,
      message: 'Payment manually verified and stored',
      payment: paymentInfo
    });

  } catch (error: any) {
    console.error('Manual payment verification error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to verify payment manually',
      success: false 
    }, { status: 500 });
  }
} 