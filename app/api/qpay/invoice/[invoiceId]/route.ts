import { NextRequest, NextResponse } from 'next/server';
import { qpayService } from '@/lib/qpay';

export async function GET(
  req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params;

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    console.log('Getting invoice details for:', invoiceId);

    // Get invoice details from QPay
    const invoice = await qpayService.getInvoice(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoice: invoice
    });

  } catch (error: any) {
    console.error('Error getting invoice details:', error);
    return NextResponse.json({ 
      error: 'Failed to get invoice details',
      details: error.message 
    }, { status: 500 });
  }
} 