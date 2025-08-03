import { NextRequest, NextResponse } from 'next/server';
import { storePaymentStatus } from '@/lib/payment-storage';

export async function POST(req: NextRequest) {
  try {
    const { invoice_id, amount } = await req.json();
    
    if (!invoice_id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Simulate a successful payment
    const mockPayment = {
      payment_id: `payment_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: amount || 1000,
      payment_date: new Date().toISOString(),
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      payment_name: 'Test Payment',
      payment_description: 'Test payment completion',
      object_id: invoice_id
    };

    // Store the payment
    await storePaymentStatus(invoice_id, mockPayment);

    console.log('Test payment stored for invoice:', invoice_id);

    return NextResponse.json({
      success: true,
      message: 'Test payment stored successfully',
      payment: mockPayment
    });

  } catch (error: any) {
    console.error('Test payment error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to store test payment',
      success: false 
    }, { status: 500 });
  }
} 