import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService } from '@/lib/qpay-service';

export async function POST(req: NextRequest) {
  try {
    console.log('=== DEBUG QPay Public ===');
    
    // Check environment variables
    console.log('Environment check:');
    console.log('- QPAY_CLIENT_ID:', process.env.QPAY_CLIENT_ID);
    console.log('- QPAY_CLIENT_SECRET:', process.env.QPAY_CLIENT_SECRET ? 'SET' : 'NOT_SET');
    console.log('- QPAY_BASE_URL:', process.env.QPAY_BASE_URL);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
    // Test QPay service initialization
    console.log('Testing QPay service initialization...');
          const qpayService = getTestQPayService();
    console.log('QPay service initialized successfully');
    
    // Test authentication
    console.log('Testing QPay authentication...');
    const token = await qpayService['getAccessToken']();
    console.log('QPay authentication successful, token obtained');
    
    // Test invoice creation
    console.log('Testing QPay invoice creation...');
    const invoiceRequest = {
      invoice_code: 'JAVZAN_B_INVOICE',
      sender_invoice_no: `SINV${Date.now()}`,
      invoice_receiver_code: 'JAVZAN_B',
      invoice_description: 'Debug test payment',
      amount: 1000,
      callback_url: `${req.nextUrl.origin}/api/qpay-callback`,
      calculate_vat: false,
      enable_expiry: false
    };
    
    console.log('Creating invoice with data:', invoiceRequest);
    const invoice = await qpayService.createInvoice(invoiceRequest);
    
    console.log('QPay invoice created successfully:', {
      invoice_id: invoice.invoice_id,
      qr_image: invoice.qr_image ? 'Generated' : 'Not generated',
      qr_text: invoice.qr_text ? 'Generated' : 'Not generated'
    });
    
    return NextResponse.json({
      success: true,
      message: 'QPay debug successful',
      environment: {
        QPAY_CLIENT_ID: process.env.QPAY_CLIENT_ID,
        QPAY_CLIENT_SECRET: process.env.QPAY_CLIENT_SECRET ? 'SET' : 'NOT_SET',
        QPAY_BASE_URL: process.env.QPAY_BASE_URL,
        NODE_ENV: process.env.NODE_ENV
      },
      invoice: {
        invoice_id: invoice.invoice_id,
        qr_generated: !!invoice.qr_image
      }
    });
    
  } catch (error: any) {
    console.error('QPay debug failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString(),
      environment: {
        QPAY_CLIENT_ID: process.env.QPAY_CLIENT_ID,
        QPAY_CLIENT_SECRET: process.env.QPAY_CLIENT_SECRET ? 'SET' : 'NOT_SET',
        QPAY_BASE_URL: process.env.QPAY_BASE_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
} 