import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService, getCourseQPayService } from '@/lib/qpay-service';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing QPay credentials...');
    
    // Test environment variables
    const envVars = {
      QPAY_TEST_CLIENT_ID: process.env.QPAY_TEST_CLIENT_ID,
      QPAY_TEST_CLIENT_SECRET: process.env.QPAY_TEST_CLIENT_SECRET ? '***' : 'NOT_SET',
      QPAY_TEST_INVOICE_CODE: process.env.QPAY_TEST_INVOICE_CODE,
      QPAY_CALLBACK_URL: process.env.QPAY_CALLBACK_URL,
      QPAY_COURSE_CLIENT_ID: process.env.QPAY_COURSE_CLIENT_ID,
      QPAY_COURSE_CLIENT_SECRET: process.env.QPAY_COURSE_CLIENT_SECRET ? '***' : 'NOT_SET',
      QPAY_COURSE_INVOICE_CODE: process.env.QPAY_COURSE_INVOICE_CODE,
    };

    console.log('Environment variables:', envVars);

    // Test service instantiation
    const testService = getTestQPayService();
    const courseService = getCourseQPayService();

    return NextResponse.json({
      success: true,
      environment_variables: envVars,
      message: 'Credentials loaded successfully'
    });

  } catch (error: any) {
    console.error('Credential test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test credentials'
    }, { status: 500 });
  }
} 