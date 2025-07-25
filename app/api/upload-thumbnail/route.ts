import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs'; // Required for file system access

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.split('.').pop();
  const fileName = `thumbnail_${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public');
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);
  const url = `/` + fileName;
  return NextResponse.json({ url });
} 