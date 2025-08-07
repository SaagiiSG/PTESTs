import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService } from '@/lib/qpay-service';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing QPay service directly...');
    
    // Check environment variables
    console.log('Environment variables:');
    console.log('QPAY_TEST_CLIENT_ID:', process.env.QPAY_TEST_CLIENT_ID);
    console.log('QPAY_TEST_CLIENT_SECRET:', process.env.QPAY_TEST_CLIENT_SECRET ? '***' : 'NOT_SET');
    console.log('QPAY_TEST_INVOICE_CODE:', process.env.QPAY_TEST_INVOICE_CODE);
    console.log('QPAY_CALLBACK_URL:', process.env.QPAY_CALLBACK_URL);
    
    const qpayService = getTestQPayService();
    
    // Test authentication first
    console.log('Testing authentication...');
    try {
      const token = await qpayService['getAccessToken']();
      console.log('Authentication successful, token:', token ? 'RECEIVED' : 'NOT_RECEIVED');
    } catch (authError: any) {
      console.error('Authentication failed:', authError.message);
      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${authError.message}`,
        authError: authError.message
      }, { status: 500 });
    }
    
    // Test invoice creation
    console.log('Testing invoice creation...');
    const invoiceData = {
      sender_invoice_no: `TEST_${Date.now()}`,
      invoice_receiver_code: 'PSYCHOMETRICS',
      invoice_description: 'Test Payment',
      amount: 10,
      lines: [
        {
          line_description: 'Test Payment',
          qty: 1,
          unit_price: 10,
          amount: 10
        }
      ]
    };
    
    const result = await qpayService.createInvoice(invoiceData);
    
    return NextResponse.json({
      success: true,
      result
    });

  } catch (error: any) {
    console.error('Direct QPay test failed:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: typeof error,
      hasResponse: !!error.response,
      responseStatus: error.response?.status,
      responseData: error.response?.data
    }, { status: 500 });
  }
}
