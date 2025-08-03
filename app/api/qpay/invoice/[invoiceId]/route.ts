import { NextRequest, NextResponse } from 'next/server';
import { getQPayService } from '@/lib/qpay';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    console.log('Getting invoice details for:', invoiceId);

    // Check if this is a test invoice
    if (invoiceId.startsWith('TEST_INV_')) {
      console.log('Test invoice detected, returning mock invoice details');
      
      return NextResponse.json({
        success: true,
        invoice: {
          invoice_id: invoiceId,
          qr_image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRFU1QgUVJDb2RlPC90ZXh0Pjwvc3ZnPg==',
          qr_text: `https://test.qpay.mn/pay/${invoiceId}`,
          deeplink: `https://test.qpay.mn/pay/${invoiceId}`,
          urls: {
            web: `https://test.qpay.mn/pay/${invoiceId}`,
            deeplink: `https://test.qpay.mn/pay/${invoiceId}`
          },
          testMode: true
        }
      });
    }

    // For real invoices, try to get from QPay
    try {
      // Get invoice details from QPay
      const qpayService = getQPayService();
      const invoice = await qpayService.getInvoice(invoiceId);

      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        invoice: invoice
      });
    } catch (qpayError: any) {
      console.error('QPay service error:', qpayError);
      
      // If QPay fails, return a fallback response
      return NextResponse.json({
        success: false,
        error: 'QPay service unavailable',
        message: 'Unable to fetch invoice details from QPay',
        invoiceId: invoiceId,
        note: 'This might be a test invoice or QPay service is down'
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error('Error getting invoice details:', error);
    return NextResponse.json({ 
      error: 'Failed to get invoice details',
      details: error.message 
    }, { status: 500 });
  }
} 