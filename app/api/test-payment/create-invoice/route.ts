import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService } from '@/lib/qpay-service';

export async function POST(req: NextRequest) {
  try {
    const { amount, description, receiverCode } = await req.json();
    
    if (!amount || !description || !receiverCode) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: amount, description, receiverCode'
      }, { status: 400 });
    }

    console.log('Creating test payment invoice:', { amount, description, receiverCode });

    const qpayService = getTestQPayService();
    
    // Generate unique invoice number
    const senderInvoiceNo = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const invoiceData = {
      sender_invoice_no: senderInvoiceNo,
      invoice_receiver_code: receiverCode,
      invoice_description: description,
      amount: amount,
      lines: [
        {
          line_description: description,
          line_quantity: 1,
          line_unit_price: amount,
          amount: amount
        }
      ]
    };

    const result = await qpayService.createInvoice(invoiceData);
    
    console.log('Test payment invoice created successfully:', result);

    return NextResponse.json({
      success: true,
      invoice_id: result.invoice_id,
      qr_image: result.qr_image,
      qr_text: result.qr_text,
      deeplink: result.deeplink,
      urls: result.urls
    });

  } catch (error: any) {
    console.error('Test payment invoice creation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create test payment invoice'
    }, { status: 500 });
  }
} 