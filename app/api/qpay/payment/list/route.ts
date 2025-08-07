import { NextRequest, NextResponse } from 'next/server';
import { getTestQPayService, QPayPaymentListRequest } from '@/lib/qpay-service';

export async function POST(req: NextRequest) {
  try {
    const { 
      object_type, 
      object_id, 
      merchant_branch_code, 
      merchant_terminal_code, 
      merchant_staff_code,
      page_number = 1,
      page_limit = 100
    } = await req.json();
    
    if (!object_type || !object_id) {
      return NextResponse.json({ 
        error: 'Object type and object ID are required' 
      }, { status: 400 });
    }

    const listData: QPayPaymentListRequest = {
      object_type,
      object_id,
      merchant_branch_code,
      merchant_terminal_code,
      merchant_staff_code,
      offset: {
        page_number,
        page_limit: Math.min(page_limit, 100) // QPay limit is 100
      }
    };

    const qpayService = getTestQPayService();
  const paymentList = await qpayService.getPaymentList(listData);
    
    return NextResponse.json({
      success: true,
      payments: paymentList.rows,
      pagination: {
        page_number,
        page_limit
      }
    });

  } catch (error: any) {
    console.error('QPay payment list error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to get payment list',
      success: false 
    }, { status: 500 });
  }
} 