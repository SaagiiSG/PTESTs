import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Check if QPay credentials are properly configured FIRST
    const qpayClientSecret = process.env.QPAY_CLIENT_SECRET;
    const isTestMode = !qpayClientSecret || qpayClientSecret === 'SET' || qpayClientSecret === 'NOT_SET';

    console.log('Test invoice endpoint - QPay client secret:', qpayClientSecret ? 'SET' : 'NOT_SET');
    console.log('Test mode enabled:', isTestMode);

    if (isTestMode) {
      console.log('QPay credentials not properly configured, using test mode');
      
      const { amount, description, receiverCode } = await req.json();
      
      console.log('Test invoice request received:', {
        amount,
        description,
        receiverCode
      });

      // Handle free courses (amount = 0)
      if (amount === 0) {
        return NextResponse.json({
          success: true,
          message: 'Free course - no payment required',
          isFree: true,
          amount: 0,
          description
        });
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }

      if (!receiverCode) {
        return NextResponse.json({ error: 'Receiver code is required' }, { status: 400 });
      }
      
      // Return a mock invoice for testing
      const mockInvoiceId = `TEST_INV_${Date.now()}`;
      const mockQrText = `https://test.qpay.mn/pay/${mockInvoiceId}`;
      
      return NextResponse.json({
        success: true,
        message: 'Test mode - QPay credentials not configured',
        isTestMode: true,
        invoice_id: mockInvoiceId,
        qr_image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRFU1QgUVJDb2RlPC90ZXh0Pjwvc3ZnPg==',
        qr_text: mockQrText,
        deeplink: mockQrText,
        web_url: mockQrText,
        deeplink_url: mockQrText,
        amount: amount,
        testMode: true,
        note: 'This is a test invoice. QPay credentials need to be configured for real payments.'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'QPay credentials are configured, use /api/create-invoice instead'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Test invoice error:', error);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to create test invoice',
      success: false,
      details: error.message
    }, { status: 500 });
  }
} 