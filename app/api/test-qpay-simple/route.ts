import { NextRequest, NextResponse } from 'next/server';
import { getQPayService } from '@/lib/qpay';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing QPay service...');
    
    // Test authentication first
    console.log('Testing QPay authentication...');
    const qpayService = getQPayService();
  const token = await qpayService['getAccessToken']();
    console.log('QPay authentication successful, token obtained');
    
    // Test creating a simple invoice
    console.log('Testing QPay invoice creation...');
    const envInvoiceCode = process.env.QPAY_INVOICE_CODE || 'JAVZAN_B_INVOICE';
    const testInvoiceData = {
      invoice_code: envInvoiceCode,
      sender_invoice_no: `SINV${Date.now()}`,
      invoice_receiver_code: 'JAVZAN_B',
      invoice_description: 'Test payment',
      amount: 1000,
      callback_url: `${req.nextUrl.origin.replace(':3000', ':3002')}/api/qpay-callback`,
      calculate_vat: false,
      enable_expiry: false,
    };
    
    console.log('Creating test invoice with data:', testInvoiceData);
    const invoice = await qpayService.createInvoice(testInvoiceData);
    
    console.log('QPay test successful:', {
      invoice_id: invoice.invoice_id,
      qr_image: invoice.qr_image ? 'Generated' : 'Not generated',
      qr_text: invoice.qr_text ? 'Generated' : 'Not generated'
    });
    
    return NextResponse.json({
      success: true,
      message: 'QPay test successful',
      invoice_id: invoice.invoice_id,
      qr_generated: !!invoice.qr_image
    });
    
  } catch (error: any) {
    console.error('QPay test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
} 