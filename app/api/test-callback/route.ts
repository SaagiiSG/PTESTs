import { NextRequest, NextResponse } from 'next/server';
import { storePaymentStatus } from '@/lib/payment-storage';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, paymentId, status = 'PAID' } = await req.json();
    
    if (!invoiceId || !paymentId) {
      return NextResponse.json({ error: 'invoiceId and paymentId are required' }, { status: 400 });
    }

    console.log('=== Manual Callback Test ===');
    console.log('Invoice ID:', invoiceId);
    console.log('Payment ID:', paymentId);
    console.log('Status:', status);

    // Simulate QPay callback data
    const mockCallbackData = {
      payment_id: paymentId,
      payment_status: status,
      payment_amount: 1000,
      payment_date: new Date().toISOString(),
      object_id: invoiceId,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      paid_by: 'P2P'
    };

    console.log('Storing mock payment data:', mockCallbackData);
    await storePaymentStatus(invoiceId, mockCallbackData);

    return NextResponse.json({ 
      success: true, 
      message: 'Mock callback processed successfully',
      data: mockCallbackData
    });

  } catch (error: any) {
    console.error('Test callback error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process test callback',
      success: false 
    }, { status: 500 });
  }
} 