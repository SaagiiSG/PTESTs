import { NextResponse } from 'next/server';
import Test from '@/app/models/tests';
import { safeConnectMongoose } from '@/lib/mongodb';
import { auth } from '@/auth';
import { encrypt } from '@/lib/encryption';
import { Types } from 'mongoose';

interface AdminUser {
  isAdmin?: boolean;
  [key: string]: any;
}

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

// Get a single test by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const { id } = await params;
  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  
  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const test = await Test.findById(id).select('-embedCode'); // Don't expose embed code
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    return NextResponse.json(test);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch test', details: error?.message }, { status: 500 });
  }
}

// Update a test
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const session = await auth();
  const user = session?.user as AdminUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  
  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const data = await req.json();
    if (!data.title || !data.description?.mn || !data.description?.en || !data.embedCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    let encryptedEmbedCode;
    try {
      encryptedEmbedCode = encrypt(data.embedCode);
    } catch (error) {
      return NextResponse.json({ error: 'Encryption failed - environment not properly configured' }, { status: 500 });
    }
    
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
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const session = await auth();
  const user = session?.user as AdminUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  
  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

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

// Update a test (PATCH for partial updates)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const session = await auth();
  const user = session?.user as AdminUser;
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
  
  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const data = await req.json();
    console.log('📝 Updating test:', id, 'with data:', data);
    
    const updatedTest = await Test.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedTest) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    console.log('✅ Test updated successfully:', updatedTest.title);
    return NextResponse.json(updatedTest);
  } catch (error: any) {
    console.error('❌ Error updating test:', error);
    return NextResponse.json({ error: 'Failed to update test', details: error?.message }, { status: 500 });
  }
} 