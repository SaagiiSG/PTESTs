import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    QPAY_INVOICE_CODE: process.env.QPAY_INVOICE_CODE,
    QPAY_CLIENT_ID: process.env.QPAY_CLIENT_ID,
    QPAY_CLIENT_SECRET: process.env.QPAY_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    QPAY_BASE_URL: process.env.QPAY_BASE_URL,
    QPAY_CALLBACK_URL: process.env.QPAY_CALLBACK_URL,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: Date.now(),
    testInvoiceCode: `${process.env.QPAY_INVOICE_CODE || 'JAVZAN_B_INVOICE'}${Date.now()}`
  });
} 