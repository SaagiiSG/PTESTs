import { NextResponse } from 'next/server';
import Test from '@/app/models/tests';
import { connectMongoose } from '@/lib/mongodb';
import { auth } from '@/auth';
import { encrypt } from '@/lib/encryption';

interface AdminUser {
  isAdmin?: boolean;
  [key: string]: any;
}

// Create a new test
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as AdminUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  await connectMongoose();
  try {
    const data = await req.json();
    // Validate required fields
    if (!data.title || !data.description?.mn || !data.description?.en || !data.embedCode || typeof data.price !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const encryptedEmbedCode = encrypt(data.embedCode);
    const test = await Test.create({
      title: data.title,
      description: {
        mn: data.description.mn,
        en: data.description.en,
      },
      embedCode: encryptedEmbedCode,
      price: data.price,
      thumbnailUrl: data.thumbnailUrl,
      uniqueCodes: Array.isArray(data.uniqueCodes)
        ? data.uniqueCodes.map((code: string) => ({ code, used: false }))
        : [],
    });
    return NextResponse.json(test, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create test', details: error?.message }, { status: 500 });
  }
}

// List all tests
export async function GET() {
  await connectMongoose();
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    return NextResponse.json(tests);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch tests', details: error?.message }, { status: 500 });
  }
} 