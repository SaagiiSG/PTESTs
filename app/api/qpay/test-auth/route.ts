import { NextRequest, NextResponse } from 'next/server';
import { qpayService } from '@/lib/qpay';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing QPay authentication...');
    
    // Test authentication
    const token = await qpayService['getAccessToken']();
    
    return NextResponse.json({
      success: true,
      message: 'QPay authentication successful',
      token: token ? '***' : 'NOT_SET',
      environment: {
        baseUrl: process.env.QPAY_BASE_URL,
        clientId: process.env.QPAY_CLIENT_ID,
        clientSecret: process.env.QPAY_CLIENT_SECRET ? '***' : 'NOT_SET',
        invoiceCode: process.env.QPAY_INVOICE_CODE,
      }
    });

  } catch (error: any) {
    console.error('QPay authentication test failed:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      environment: {
        baseUrl: process.env.QPAY_BASE_URL,
        clientId: process.env.QPAY_CLIENT_ID,
        clientSecret: process.env.QPAY_CLIENT_SECRET ? '***' : 'NOT_SET',
        invoiceCode: process.env.QPAY_INVOICE_CODE,
      }
    }, { status: 500 });
  }
} 