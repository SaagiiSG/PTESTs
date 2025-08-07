import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/payment-storage';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();
    
    if (!invoiceId) {
      return NextResponse.json({
        success: false,
        error: 'Invoice ID is required'
      }, { status: 400 });
    }
    
    console.log('Course payment check V2 request for invoice:', invoiceId);
    
    // First check our stored payment data (from callback) - this is the primary source
    const storedPayment = await getPaymentStatus(invoiceId);
    
    console.log('Course payment check - stored payment data:', storedPayment);
    
    if (storedPayment && storedPayment.payment_status === 'PAID') {
      console.log('Found stored payment data for course:', storedPayment);
      return NextResponse.json({
        success: true,
        payment: {
          count: 1,
          rows: [storedPayment]
        }
      });
    }
    
    // QPay API is unreliable (always returns SYSTEM_BUSY), so we rely on callbacks only
    console.log('No callback data found. QPay API is unreliable, payment may still be processing.');
    console.log('Payment status will be available once QPay sends the callback.');
    
    return NextResponse.json({
      success: true,
      payment: {
        count: 0,
        rows: []
      },
      message: 'Payment processing. Status will be available once callback is received.'
    });
    
  } catch (error: any) {
    console.error('Course payment check V2 error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check course payment status'
    }, { status: 500 });
  }
} 