import { NextRequest, NextResponse } from 'next/server';
import User from '@/app/models/user';
import { connectMongoose } from '@/lib/mongodb';

export async function GET() {
  await connectMongoose();
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req) {
  // Not implemented
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}