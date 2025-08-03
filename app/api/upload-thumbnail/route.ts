import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs'; // Required for file system access

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `thumbnail_${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public');
    const filePath = path.join(uploadDir, fileName);
    
    // Write file
    await fs.writeFile(filePath, buffer);
    
    // Return the public URL
    const url = `/${fileName}`;
    
    console.log(`Thumbnail uploaded successfully: ${fileName}`);
    
    return NextResponse.json({ 
      url,
      filename: fileName,
      size: file.size,
      type: file.type
    });
    
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload thumbnail. Please try again.' 
    }, { status: 500 });
  }
} 