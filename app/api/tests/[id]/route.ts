import { NextResponse } from 'next/server';
import Test from '@/app/models/tests';
import { connectMongoose } from '@/lib/mongodb';
import { auth } from '@/auth';
import { encrypt } from '@/lib/encryption';
import { Types } from 'mongoose';

interface AdminUser {
  isAdmin?: boolean;
  [key: string]: any;
}

// Update a test
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as AdminUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = params;
  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  await connectMongoose();
  try {
    const data = await req.json();
    if (!data.title || !data.description?.mn || !data.description?.en || !data.embedCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const encryptedEmbedCode = encrypt(data.embedCode);
    const updated = await Test.findByIdAndUpdate(
      id,
      {
        title: data.title,
        description: {
          mn: data.description.mn,
          en: data.description.en,
        },
        embedCode: encryptedEmbedCode,
      },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update test', details: error?.message }, { status: 500 });
  }
}

// Delete a test
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user as AdminUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = params;
  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  await connectMongoose();
  try {
    const deleted = await Test.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Test deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete test', details: error?.message }, { status: 500 });
  }
} 