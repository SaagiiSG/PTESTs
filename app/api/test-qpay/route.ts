import { NextRequest, NextResponse } from 'next/server';
import { qpayService } from '@/lib/qpay';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing QPay connection...');
    
    // Test authentication
    const token = await qpayService['getAccessToken']();
    console.log('QPay token obtained:', token ? 'SUCCESS' : 'FAILED');
    
    // Generate proper invoice code format
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const invoiceCode = `TEST${timestamp}${randomStr}`;
    const senderInvoiceNo = `SINV${timestamp}${randomStr}`;
    
    // Test invoice creation with minimal data
    const testInvoiceData = {
      invoice_code: invoiceCode,
      sender_invoice_no: senderInvoiceNo,
      invoice_receiver_code: 'JAVZAN_B', // Use the correct QPay merchant code
      invoice_description: 'Test payment',
      amount: 1000,
      callback_url: 'https://example.com/callback',
      calculate_vat: false,
      enable_expiry: false,
    };
    
    console.log('Creating test invoice with data:', testInvoiceData);
    
    const invoice = await qpayService.createInvoice(testInvoiceData);
    
    console.log('Test invoice created successfully:', invoice);
    
    return NextResponse.json({
      success: true,
      message: 'QPay connection test successful',
      invoice: invoice
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