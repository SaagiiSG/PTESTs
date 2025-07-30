import { NextResponse, NextRequest } from 'next/server';
import Test, { ITest } from '@/app/models/tests';
import { connectMongoose } from '@/lib/mongodb';
import { auth } from '@/auth';
import { decrypt } from '@/lib/encryption';
import { Types } from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('Params:', params); // Log for debugging

  // Validate ID
  if (!id || id === 'undefined' || !Types.ObjectId.isValid(id)) {
    console.log('Validation failed - ID:', id);
    return NextResponse.json({ error: 'Invalid or missing ID' }, { status: 400 });
  }

  try {
    await connectMongoose();
    const test = await Test.findById(id).lean<ITest>();
    if (!test) {
      console.log('Test not found for ID:', id);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let embedCode = '';
    try {
      embedCode = decrypt(test.embedCode); // Use typed embedCode
    } catch (e) {
      console.error('Decryption error:', e);
      return NextResponse.json({ error: 'Failed to decrypt embed code' }, { status: 500 });
    }

    return NextResponse.json({ embedCode });
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}