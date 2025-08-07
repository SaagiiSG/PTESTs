import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService } from '@/lib/qpay-service';

export async function POST(req: NextRequest) {
  try {
    const { payment_id, callback_url, note } = await req.json();
    
    if (!payment_id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const qpayService = getTestQPayService();
  const refundResult = await qpayService.refundPayment(payment_id, callback_url, note);
    
    return NextResponse.json({
      success: true,
      refund: refundResult,
      message: 'Payment refunded successfully'
    });

  } catch (error: any) {
    console.error('QPay payment refund error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to refund payment',
      success: false 
    }, { status: 500 });
  }
} 