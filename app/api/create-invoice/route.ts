import { NextRequest, NextResponse } from 'next/server';

const QPAY_CLIENT_ID = process.env.QPAY_CLIENT_ID || 'dummy_client_id';
const QPAY_CLIENT_SECRET = process.env.QPAY_CLIENT_SECRET || 'dummy_client_secret';
const QPAY_BASE_URL = 'https://merchant-sandbox.qpay.mn/v2';

async function getQPayToken() {
  const res = await fetch(`${QPAY_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: QPAY_CLIENT_ID,
      client_secret: QPAY_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });
  if (!res.ok) throw new Error('Failed to authenticate with QPay');
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { amount, description } = await req.json();
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    // 1. Authenticate
    const { access_token } = await getQPayToken();
    // 2. Create invoice
    const invoiceRes = await fetch(`${QPAY_BASE_URL}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        invoice_code: 'TEST_INVOICE', // Replace with your QPay invoice code
        sender_invoice_no: `INV-${Date.now()}`,
        amount: Number(amount),
        invoice_description: description || 'Custom payment',
        callback_url: process.env.QPAY_CALLBACK_URL || 'https://yourdomain.mn/api/qpay-callback',
      }),
    });
    if (!invoiceRes.ok) {
      const err = await invoiceRes.text();
      return NextResponse.json({ error: 'Failed to create invoice', details: err }, { status: 500 });
    }
    const invoice = await invoiceRes.json();
    // 3. Return QR code and payment info
    return NextResponse.json({
      qr_image: invoice.qr_image,
      qr_text: invoice.qr_text,
      deeplink: invoice.deeplink,
      invoice_id: invoice.invoice_id,
      invoice,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
} 