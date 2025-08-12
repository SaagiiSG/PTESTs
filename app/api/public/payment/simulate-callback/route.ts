import { NextRequest, NextResponse } from 'next/server';
import { storePaymentStatus } from '@/lib/payment-storage';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invoice ID is required' 
      }, { status: 400 });
    }

    console.log('Simulating payment callback for invoice:', invoiceId);

    // Simulate a successful payment callback with the same structure as real QPay
    const simulatedPaymentData = {
      payment_id: `SIM_${Date.now()}`,
      payment_status: 'PAID',
      payment_amount: 1000, // This would be the actual paid amount
      payment_date: new Date().toISOString(),
      object_id: invoiceId,
      object_type: 'INVOICE',
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      paid_by: 'P2P',
      service_type: 'test', // Assuming this is a test payment
      invoice_code: 'PSYCHOMETRICS_INVOICE',
      callback_type: 'simulated'
    };

    console.log('Simulated payment data:', simulatedPaymentData);

    // Actually store the payment status like the real callback does
    await storePaymentStatus(invoiceId, simulatedPaymentData);

    console.log('Payment status stored successfully for invoice:', invoiceId);

    return NextResponse.json({
      success: true,
      message: 'Payment callback simulated and stored successfully',
      data: simulatedPaymentData
    });

  } catch (error: any) {
    console.error('Error simulating payment callback:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to simulate payment callback' 
    }, { status: 500 });
  }
}
