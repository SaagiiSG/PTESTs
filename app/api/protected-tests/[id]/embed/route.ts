import { NextResponse, NextRequest } from 'next/server';
import Test, { ITest } from '@/app/models/tests';
import { safeConnectMongoose } from '@/lib/mongodb';
import { auth } from '@/auth';
import { decrypt } from '@/lib/encryption';
import { processEmbedCode } from '@/lib/embedCodeUtils';
import { Types } from 'mongoose';

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Comprehensive build-time prevention
  // During build time, MONGODB_URI is not available
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  // Additional check for build environment
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  // Safety check - if we can't connect to MongoDB, don't proceed
  let connection;
  try {
    connection = await safeConnectMongoose();
    if (!connection) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
  } catch (error) {
    // If connection fails, return early
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const { id } = await params;
  console.log('Params:', params); // Log for debugging

  // Validate ID
  if (!id || id === 'undefined' || !Types.ObjectId.isValid(id)) {
    console.log('Validation failed - ID:', id);
    return NextResponse.json({ error: 'Invalid or missing ID' }, { status: 400 });
  }

  try {
    const test = await Test.findById(id).lean<ITest>();
    if (!test) {
      console.log('Test not found for ID:', id);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Robust check for embedCode - ensure it's a valid encrypted string
    if (!test.embedCode || typeof test.embedCode !== 'string' || !test.embedCode.includes(':')) {
      console.log('No valid embed code found for test ID:', id, 'embedCode:', test.embedCode);
      return NextResponse.json({ error: 'No embed code available' }, { status: 404 });
    }

    // Only call decrypt if we have a valid encrypted string
    let embedCode = '';
    let wasDecrypted = false;
    
    try {
      embedCode = decrypt(test.embedCode);
      wasDecrypted = true;
      console.log('✅ Successfully decrypted embed code, length:', embedCode.length);
    } catch (e) {
      console.error('Decryption error:', e);
      
      // If it's an environment variable issue
      if (e instanceof Error && e.message.includes('EMBED_CODE_SECRET')) {
        return NextResponse.json({ error: 'Service temporarily unavailable - encryption not configured' }, { status: 503 });
      }
      
      // If decryption fails, try to use the original content
      console.log('⚠️ Attempting to use original embed code as fallback...');
      embedCode = test.embedCode;
      wasDecrypted = false;
      
      // If the original content is still encrypted (contains ':'), return an error
      if (embedCode.includes(':')) {
        return NextResponse.json({ 
          error: 'Failed to decrypt embed code - please contact support',
          details: 'The embed code appears to be encrypted with a different key'
        }, { status: 500 });
      }
    }

    // Process the embed code to convert it to iframe format if needed
    const processedEmbedCode = processEmbedCode(embedCode, true);
    
    console.log('📊 Embed Code Processing Summary:');
    console.log('   Original length:', embedCode.length);
    console.log('   Processed length:', processedEmbedCode.length);
    console.log('   Was decrypted:', wasDecrypted);
    console.log('   Was converted:', embedCode !== processedEmbedCode);
    
    if (embedCode !== processedEmbedCode) {
      console.log('   ✅ Embed code was converted to iframe format');
    } else {
      console.log('   ℹ️  Embed code was already in iframe format or no conversion needed');
    }

    return NextResponse.json({ embedCode: processedEmbedCode });
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}