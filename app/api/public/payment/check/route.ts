import { NextRequest, NextResponse } from 'next/server';
import { getQPayService } from '../../../../../lib/qpay';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();
    
    console.log('Public payment check request for invoice:', invoiceId);
    
    // Check if this is a test invoice - but first check if we have real payment data
    if (invoiceId && invoiceId.startsWith('TEST_INV_')) {
      console.log('Test invoice detected, checking for real payment data first');
      
      // First check our stored payment data (from callback) even for test invoices
      const { getPaymentStatus } = await import('../../../../../lib/payment-storage');
      const storedPayment = await getPaymentStatus(invoiceId);
      
      if (storedPayment && storedPayment.payment_status === 'PAID') {
        console.log('Found stored payment data for test invoice:', storedPayment);
        return NextResponse.json({
          success: true,
          payment: {
            count: 1,
            rows: [storedPayment]
          }
        });
      }
      
      // If no real payment data, simulate test payment after delay
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
    
    // For real invoices, prioritize callback data over API checks
    try {
      console.log('Checking payment for invoice:', invoiceId);
      
      // First check our stored payment data (from callback) - this is the primary source
      const { getPaymentStatus } = await import('../../../../../lib/payment-storage');
      const storedPayment = await getPaymentStatus(invoiceId);
      
      if (storedPayment) {
        console.log('Found stored payment data from callback:', storedPayment);
        
        // If we have stored payment data, return it regardless of status
        return NextResponse.json({
          success: true,
          payment: {
            count: 1,
            rows: [storedPayment]
          }
        });
      }
      
      // QPay API is unreliable (returns HTML instead of JSON), so we rely on callbacks only
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
      
      // No payment found
      console.log('No payment found for invoice:', invoiceId);
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