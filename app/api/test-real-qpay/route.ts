import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService } from '@/lib/qpay-service';

export async function POST(req: NextRequest) {
  try {
    console.log('Testing real QPay invoice creation...');
    
    const { amount, description, receiverCode } = await req.json();
    
    console.log('Received parameters:', { amount, description, receiverCode });
    
    // Test authentication first
    console.log('Testing QPay authentication...');
    const qpayService = getTestQPayService();
    const token = await qpayService['getAccessToken']();
    console.log('QPay authentication successful, token obtained');
    
    // Test creating a real invoice
    console.log('Testing QPay invoice creation...');
    const invoiceRequest = {
      invoice_code: `PSYCHOMETRICS_INVOICE_${Date.now()}`,
      sender_invoice_no: `SINV${Date.now()}`,
      invoice_receiver_code: receiverCode || 'JAVZAN_B',
      invoice_description: description || 'Test payment',
      amount: amount || 1000,
      callback_url: `${req.nextUrl.origin}/api/qpay-callback`,
      calculate_vat: false,
      enable_expiry: false
    };
    
    console.log('Creating real invoice with data:', invoiceRequest);
    const invoice = await qpayService.createInvoice(invoiceRequest);
    
    console.log('Real QPay invoice created successfully:', {
      invoice_id: invoice.invoice_id,
      qr_image: invoice.qr_image ? 'Generated' : 'Not generated',
      qr_text: invoice.qr_text ? 'Generated' : 'Not generated'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Real QPay invoice created successfully',
      isTestMode: false,
      invoice_id: invoice.invoice_id,
      qr_image: invoice.qr_image,
      qr_text: invoice.qr_text,
      deeplink: invoice.urls?.deeplink || invoice.qr_text,
      web_url: invoice.urls?.web || invoice.qr_text,
      amount: amount || 1000,
      testMode: false
    });
    
  } catch (error: any) {
    console.error('Real QPay test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString(),
      isTestMode: true
    }, { status: 500 });
  }
} 