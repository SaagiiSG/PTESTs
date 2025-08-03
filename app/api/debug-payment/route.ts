import { NextRequest, NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/payment-storage';
import Payment from '@/app/models/payment';
import { connectMongoose } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoice_id');
    
    if (!invoiceId) {
      return NextResponse.json({ 
        error: 'Invoice ID is required. Use ?invoice_id=your_invoice_id' 
      }, { status: 400 });
    }

    console.log('Debug payment check for invoice:', invoiceId);

    // Check memory cache
    const memoryPayment = await getPaymentStatus(invoiceId);
    
    // Check database directly
    await connectMongoose();
    const dbPayment = await Payment.findOne({ object_id: invoiceId });

    const debugInfo = {
      invoice_id: invoiceId,
      memory_cache: memoryPayment ? {
        found: true,
        payment_id: memoryPayment.payment_id,
        status: memoryPayment.payment_status,
        amount: memoryPayment.payment_amount
      } : {
        found: false
      },
      database: dbPayment ? {
        found: true,
        payment_id: dbPayment.payment_id,
        status: dbPayment.payment_status,
        amount: dbPayment.payment_amount,
        created_at: dbPayment.createdAt,
        updated_at: dbPayment.updatedAt
      } : {
        found: false
      },
      all_payments_in_db: await Payment.countDocuments(),
      recent_payments: await Payment.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('object_id payment_status payment_amount createdAt')
        .lean()
    };

    return NextResponse.json({
      success: true,
      debug_info: debugInfo
    });

  } catch (error: any) {
    console.error('Debug payment error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to debug payment',
      success: false 
    }, { status: 500 });
  }
} 