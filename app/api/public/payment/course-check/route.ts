import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();
    
    console.log('Course payment check request for invoice:', invoiceId);
    
    // Check if this is a test invoice
    if (invoiceId && invoiceId.startsWith('TEST_INV_')) {
      console.log('Test course invoice detected, returning mock payment status');
      
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
              payment_id: `TEST_COURSE_PAY_${Date.now()}`,
              payment_date: new Date().toISOString(),
              payment_status: 'PAID',
              payment_fee: 0,
              payment_amount: 1000,
              payment_currency: 'MNT',
              payment_wallet: 'TEST_COURSE_WALLET',
              payment_name: 'Test Course Payment',
              payment_description: 'Test course payment for development',
              qr_code: invoiceId,
              paid_by: 'P2P',
              object_type: 'INVOICE',
              object_id: invoiceId,
              service_type: 'course'
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
    
    // For real course invoices, check with QPay Course service and our stored payment data
    try {
      console.log('Checking real QPay Course payment for invoice:', invoiceId);
      
      // First check our stored payment data (from callback)
      const { getPaymentStatus } = await import('@/lib/payment-storage');
      const storedPayment = await getPaymentStatus(invoiceId);
      
      if (storedPayment && storedPayment.payment_status === 'PAID' && storedPayment.service_type === 'course') {
        console.log('Found stored course payment data:', storedPayment);
        return NextResponse.json({
          success: true,
          payment: {
            count: 1,
            rows: [storedPayment]
          }
        });
      }
      
      // If no stored payment, check with QPay Course API
      const { getQPayCourseService } = await import('@/lib/qpay-course');
      const qpayCourseService = getQPayCourseService();
      
      // Check payment status with QPay Course
      const paymentResult = await qpayCourseService.checkPayment(invoiceId);
      
      console.log('QPay Course payment check result:', paymentResult);
      
      return NextResponse.json({
        success: true,
        payment: paymentResult
      });
      
    } catch (qpayError: any) {
      console.error('QPay Course payment check failed:', qpayError);
      
      // Return empty result if QPay Course check fails
      return NextResponse.json({
        success: true,
        payment: {
          count: 0,
          rows: []
        }
      });
    }
    
  } catch (error: any) {
    console.error('Course payment check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check course payment status'
    }, { status: 500 });
  }
} 