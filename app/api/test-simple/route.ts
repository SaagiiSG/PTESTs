import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Test endpoint received:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      received: data
    });
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: error.message || 'Test failed',
      success: false 
    }, { status: 500 });
  }
} 