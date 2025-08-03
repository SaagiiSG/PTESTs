import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    return NextResponse.json({
      success: true,
      receivedData: body,
      priceAnalysis: {
        price: body.price,
        priceType: typeof body.price,
        isZero: body.price === 0,
        isNull: body.price === null,
        isUndefined: body.price === undefined,
        isNaN: isNaN(body.price),
        isValid: body.price && !isNaN(body.price) && body.price > 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to parse request',
      details: error.message
    }, { status: 400 });
  }
} 