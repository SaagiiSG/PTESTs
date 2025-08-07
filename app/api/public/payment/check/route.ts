import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService } from '@/lib/qpay-service';

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
      
      // Only if no callback data exists, then check with QPay API as fallback
      console.log('No callback data found, checking with QPay API as fallback');
      const qpayService = getTestQPayService();
      const qpayResult = await qpayService.checkPayment(invoiceId);
      
      console.log('QPay API fallback check result:', qpayResult);
      
      if (qpayResult && qpayResult.rows && qpayResult.rows.length > 0) {
        console.log('Found payment via QPay API fallback:', qpayResult.rows[0]);
        
        // Store the payment data from API check for future use
        const { storePaymentStatus } = await import('../../../../../lib/payment-storage');
        await storePaymentStatus(invoiceId, qpayResult.rows[0]);
        
        return NextResponse.json({
          success: true,
          payment: qpayResult
        });
      }
      
      // No payment found
      console.log('No payment found for invoice:', invoiceId);
      return NextResponse.json({
        success: true,
        payment: {
          count: 0,
          rows: []
        }
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