import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Log the callback for now. In production, handle status update, e.g., update DB.
  console.log('QPay callback received:', body);
  return NextResponse.json({ ok: true });
} 