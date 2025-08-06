import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;
    
    console.log('Course invoice fetch request for invoice:', invoiceId);
    
    // Check if this is a test invoice
    if (invoiceId.startsWith('TEST_INV_')) {
      console.log('Test course invoice detected, returning mock data');
      return NextResponse.json({
        success: true,
        invoice: {
          invoice_id: invoiceId,
          qr_image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNVUlNFIFFSQ29kZTwvdGV4dD48L3N2Zz4=',
          qr_text: `https://test.qpay.mn/pay/${invoiceId}`,
          deeplink: `https://test.qpay.mn/pay/${invoiceId}`,
          web_url: `https://test.qpay.mn/pay/${invoiceId}`,
          deeplink_url: `https://test.qpay.mn/pay/${invoiceId}`,
          amount: 1000,
          testMode: true
        }
      });
    }
    
    // For real course invoices, fetch with course credentials
    try {
      console.log('Fetching real course invoice with course credentials for invoice:', invoiceId);
      
      // Use course credentials for API check
      const qpayCourseClientSecret = process.env.QPAY_COURSE_CLIENT_SECRET;
      const qpayCourseClientId = process.env.QPAY_COURSE_CLIENT_ID;
      
      if (!qpayCourseClientId || !qpayCourseClientSecret) {
        console.log('Course credentials not available, returning error');
        return NextResponse.json({
          success: false,
          error: 'Course QPay credentials not configured'
        }, { status: 500 });
      }
      
      // Authenticate with course credentials
      const baseUrl = process.env.QPAY_COURSE_BASE_URL || 'https://merchant.qpay.mn/v2';
      const cleanBaseUrl = baseUrl.includes('/auth/token') ? baseUrl.replace('/auth/token', '') : baseUrl;
      const basicAuth = Buffer.from(`${qpayCourseClientId}:${qpayCourseClientSecret}`).toString('base64');
      
      const authResponse = await fetch(`${cleanBaseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
        }),
      });

      if (!authResponse.ok) {
        console.log('Course QPay authentication failed');
        return NextResponse.json({
          success: false,
          error: 'Course QPay authentication failed'
        }, { status: 401 });
      }

      const authData = await authResponse.json();
      
      // Fetch invoice details with course credentials
      const invoiceResponse = await fetch(`${cleanBaseUrl}/invoice/${invoiceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.access_token}`,
        },
      });

      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        console.log('Course invoice fetched successfully with course credentials');
        
        return NextResponse.json({
          success: true,
          invoice: invoiceData
        });
      } else {
        console.log('Course QPay invoice fetch failed with course credentials');
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch course invoice details'
        }, { status: 404 });
      }
      
    } catch (qpayError: any) {
      console.error('Course QPay invoice fetch with course credentials failed:', qpayError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch course invoice details'
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Course invoice fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch course invoice details'
    }, { status: 500 });
  }
} 