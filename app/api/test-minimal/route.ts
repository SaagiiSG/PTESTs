import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Minimal test starting...');
    
    // Test 1: Direct axios call to QPay
    try {
      const axios = await import('axios');
      
      const basicAuth = Buffer.from('PSYCHOMETRICS:iIxpGxUu').toString('base64');
      
      console.log('Making direct QPay call...');
      
      const response = await axios.default.post('https://merchant.qpay.mn/v2/auth/token', {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Direct QPay call successful:', response.data);
      
      // Test 2: Try to create invoice directly
      const accessToken = response.data.access_token;
      
      const invoiceResponse = await axios.default.post('https://merchant.qpay.mn/v2/invoice', {
        invoice_code: 'PSYCHOMETRICS_INVOICE',
        sender_invoice_no: `TEST_${Date.now()}`,
        invoice_receiver_code: 'PSYCHOMETRICS',
        invoice_description: 'Test Payment',
        amount: 10,
        callback_url: 'https://testcenter.mn/api/test-payment/callback',
        lines: [
          {
            line_description: 'Test Payment',
            line_quantity: 1,
            line_unit_price: 10,
            amount: 10
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Direct invoice creation successful:', invoiceResponse.data);
      
      return NextResponse.json({
        success: true,
        auth: response.data,
        invoice: invoiceResponse.data
      });
      
    } catch (error: any) {
      console.error('Direct QPay test failed:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
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

  } catch (error: any) {
    console.error('Minimal test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: typeof error
    }, { status: 500 });
  }
}
