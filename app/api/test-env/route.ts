import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    envVars: {
      QPAY_CLIENT_ID: process.env.QPAY_CLIENT_ID || 'NOT_SET',
      QPAY_CLIENT_SECRET: process.env.QPAY_CLIENT_SECRET ? 'SET' : 'NOT_SET',
      QPAY_BASE_URL: process.env.QPAY_BASE_URL || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date().toISOString()
  });
} 