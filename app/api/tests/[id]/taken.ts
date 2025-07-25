import { NextResponse } from 'next/server';
import Test from '@/app/models/tests';
import { connectMongoose } from '@/lib/mongodb';
import { Types } from 'mongoose';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  await connectMongoose();
  try {
    const updated = await Test.findByIdAndUpdate(
      id,
      { $inc: { takenCount: 1 } },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    return NextResponse.json({ takenCount: updated.takenCount });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to increment takenCount', details: error?.message }, { status: 500 });
  }
} 