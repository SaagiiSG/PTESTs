import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: any) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: 'POST API is working',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to parse JSON',
      details: error
    }, { status: 400 });
  }
} 