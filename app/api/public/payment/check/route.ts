import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();
    
    console.log('Public payment check request for invoice:', invoiceId);
    
    // Check if this is a test invoice
    if (invoiceId && invoiceId.startsWith('TEST_INV_')) {
      console.log('Test invoice detected, returning mock payment status');
      
      // For test invoices, simulate a successful payment after a delay
      const invoiceTimestamp = parseInt(invoiceId.replace('TEST_INV_', ''));
      const timeSinceCreation = Date.now() - invoiceTimestamp;
      
      // Simulate payment completion after 30 seconds
      if (timeSinceCreation > 30000) {
        return NextResponse.json({
          success: true,
          payment: {
            count: 1,
            rows: [{
              payment_id: `TEST_PAY_${Date.now()}`,
              payment_date: new Date().toISOString(),
              payment_status: 'PAID',
              payment_fee: 0,
              payment_amount: 1000,
              payment_currency: 'MNT',
              payment_wallet: 'TEST_WALLET',
              payment_name: 'Test Payment',
              payment_description: 'Test payment for development',
              qr_code: invoiceId,
              paid_by: 'P2P',
              object_type: 'INVOICE',
              object_id: invoiceId
            }]
          }
        });
      } else {
        // Payment still pending
        return NextResponse.json({
          success: true,
          payment: {
            count: 0,
            rows: []
          }
        });
      }
    }
    
    // For real invoices, check with QPay and our stored payment data
    try {
      console.log('Checking real QPay payment for invoice:', invoiceId);
      
      // First check our stored payment data (from callback)
      const { getPaymentStatus } = await import('@/lib/payment-storage');
      const storedPayment = await getPaymentStatus(invoiceId);
      
      if (storedPayment && storedPayment.payment_status === 'PAID') {
        console.log('Found stored payment data:', storedPayment);
        return NextResponse.json({
          success: true,
          payment: {
            count: 1,
            rows: [storedPayment]
          }
        });
      }
      
      // If no stored payment, return empty result (rely on callbacks as per QPay docs)
      console.log('No stored payment data found, relying on callbacks as per QPay documentation');
      
      return NextResponse.json({
        success: true,
        payment: {
          count: 0,
          rows: []
        }
      });
      
    } catch (qpayError: any) {
      console.error('QPay payment check failed:', qpayError);
      
      // Return empty result if QPay check fails
      return NextResponse.json({
        success: true,
        payment: {
          count: 0,
          rows: []
        }
      });
    }
    
  } catch (error: any) {
    console.error('Public payment check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check payment status'
    }, { status: 500 });
  }
} 