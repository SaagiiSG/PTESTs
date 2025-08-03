import { NextRequest, NextResponse } from 'next/server';
import { qpayService } from '@/lib/qpay';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing QPay payment check...');
    
    // Test with a sample invoice ID
    const testInvoiceId = 'af277fdc-1944-4c86-9d08-8b6e62d92cb7';
    
    console.log('Testing with invoice ID:', testInvoiceId);
    
    try {
      const result = await qpayService.checkPayment(testInvoiceId);
      console.log('Payment check result:', result);
      
      return NextResponse.json({
        success: true,
        result: result
      });
    } catch (error: any) {
      console.error('Payment check error:', error.message);
      
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }
    
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: error.message || 'Test failed',
      success: false 
    }, { status: 500 });
  }
} 