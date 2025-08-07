import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService } from '@/lib/qpay-service';
import { getPaymentStatus, storePaymentStatus } from '@/lib/payment-storage';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();
    
    if (!invoiceId) {
      return NextResponse.json({
        success: false,
        error: 'Invoice ID is required'
      }, { status: 400 });
    }

    console.log('Checking test payment for invoice:', invoiceId);

    // First check our stored payment data (from callback)
    const storedPayment = await getPaymentStatus(invoiceId);
    
    if (storedPayment && storedPayment.payment_status === 'PAID') {
      console.log('Found stored payment data for test payment:', storedPayment);
      return NextResponse.json({
        success: true,
        payment: {
          count: 1,
          rows: [storedPayment]
        }
      });
    }

    // If no stored data, check with QPay API
    try {
      const qpayService = getTestQPayService();
      const qpayResult = await qpayService.checkPayment(invoiceId);
      
      console.log('QPay API check result for test payment:', qpayResult);
      
      if (qpayResult && qpayResult.rows && qpayResult.rows.length > 0) {
        const payment = qpayResult.rows[0];
        console.log('Found test payment via QPay API:', payment);
        
        // Store the payment data for future use
        await storePaymentStatus(invoiceId, payment);
        
        return NextResponse.json({
          success: true,
          payment: qpayResult
        });
      }
      
      // No payment found
      console.log('No test payment found for invoice:', invoiceId);
      return NextResponse.json({
        success: true,
        payment: {
          count: 0,
          rows: []
        }
      });
      
    } catch (qpayError: any) {
      console.error('QPay API check failed for test payment:', qpayError);
      
      // Return empty result if QPay check fails
      return NextResponse.json({
        success: true,
        payment: {
          count: 0,
          rows: []
        },
        message: 'Payment processing. Status will be available once callback is received.'
      });
    }

  } catch (error: any) {
    console.error('Test payment check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check test payment status'
    }, { status: 500 });
  }
} 