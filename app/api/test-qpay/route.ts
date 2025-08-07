import { NextResponse } from 'next/server';
import { getTestQPayService } from '@/lib/qpay-service';

export async function GET() {
  try {
    console.log('Testing QPay authentication...');
    
    // Check environment variables
    const envCheck = {
      QPAY_CLIENT_ID: process.env.QPAY_CLIENT_ID || 'NOT_SET',
      QPAY_CLIENT_SECRET: process.env.QPAY_CLIENT_SECRET || 'NOT_SET',
      QPAY_BASE_URL: process.env.QPAY_BASE_URL || 'NOT_SET',
      QPAY_INVOICE_CODE: process.env.QPAY_INVOICE_CODE || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'development'
    };

    console.log('Environment variables:', {
      ...envCheck,
      QPAY_CLIENT_SECRET: envCheck.QPAY_CLIENT_SECRET === 'SET' ? 'PLACEHOLDER_VALUE' : '***'
    });

    // Check if credentials are properly set
    if (envCheck.QPAY_CLIENT_SECRET === 'SET' || envCheck.QPAY_CLIENT_SECRET === 'NOT_SET') {
      return NextResponse.json({
        success: false,
        error: 'QPay credentials not properly configured',
        details: 'QPAY_CLIENT_SECRET is set to placeholder value "SET"',
        envCheck: {
          ...envCheck,
          QPAY_CLIENT_SECRET: 'PLACEHOLDER_VALUE'
        }
      }, { status: 400 });
    }

    // Try to get QPay service instance
    try {
      const qpayService = getTestQPayService();
      console.log('QPay service instance created successfully');
      
      // Try to get access token (this will test authentication)
      const accessToken = await (qpayService as any).getAccessToken();
      
      return NextResponse.json({
        success: true,
        message: 'QPay authentication successful',
        accessToken: accessToken ? '***' : 'NOT_OBTAINED',
        envCheck: {
          ...envCheck,
          QPAY_CLIENT_SECRET: '***'
        }
      });
      
    } catch (authError: any) {
      console.error('QPay authentication failed:', authError);
      
      return NextResponse.json({
        success: false,
        error: 'QPay authentication failed',
        details: authError.message,
        envCheck: {
          ...envCheck,
          QPAY_CLIENT_SECRET: '***'
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('QPay test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'QPay test failed',
      details: error.message
    }, { status: 500 });
  }
} 