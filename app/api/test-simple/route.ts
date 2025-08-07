import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Simple test starting...');
    
    // Test 1: Basic error handling
    try {
      throw new Error('Test error message');
    } catch (error: any) {
      console.log('Test 1 - Error message:', error.message);
    }
    
    // Test 2: Object error
    try {
      const obj = { test: 'value' };
      throw obj;
    } catch (error: any) {
      console.log('Test 2 - Error type:', typeof error);
      console.log('Test 2 - Error message:', error.message);
      console.log('Test 2 - Error toString:', error.toString());
    }
    
    // Test 3: QPay service import and authentication
    try {
      const { getTestQPayService } = await import('@/lib/qpay-service');
      console.log('QPay service import successful');
      
      const service = getTestQPayService();
      console.log('QPay service instance created');
      
      // Test the private method
      const token = await service['getAccessToken']();
      console.log('Token received:', token ? 'YES' : 'NO');
      
      // Test 4: Invoice creation
      console.log('Testing invoice creation...');
      const invoiceData = {
        sender_invoice_no: `TEST_${Date.now()}`,
        invoice_receiver_code: 'PSYCHOMETRICS',
        invoice_description: 'Test Payment',
        amount: 10,
        lines: [
          {
            line_description: 'Test Payment',
            line_quantity: 1,
            line_unit_price: 10,
            amount: 10
          }
        ]
      };
      
      console.log('Invoice data:', JSON.stringify(invoiceData, null, 2));
      
      const result = await service.createInvoice(invoiceData);
      console.log('Invoice creation successful:', result);
      
    } catch (error: any) {
      console.log('Test 3/4 - QPay service error:', error.message);
      console.log('Error type:', typeof error);
      console.log('Error stack:', error.stack);
      
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
      
      return NextResponse.json({
        success: false,
        error: `QPay service error: ${error.message}`,
        errorType: typeof error,
        hasResponse: !!error.response,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed'
    });

  } catch (error: any) {
    console.error('Simple test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: typeof error
    }, { status: 500 });
  }
}

export async function POST(req: any) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: 'POST API is working',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to parse JSON',
      details: error
    }, { status: 400 });
  }
} 