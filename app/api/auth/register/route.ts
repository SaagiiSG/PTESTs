import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { safeConnectMongoose } from '@/lib/mongodb';
import User from "@/app/models/user";

// Force this route to be dynamic only (not executed during build)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Prevent execution during build time
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  const {
    name,
    phoneNumber,
    email,
    password,
    age,
    gender,
  } = await req.json();

  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists." },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    name,
    phoneNumber,
    email,
    password: hashed,
    age,
    gender,
  });

  return NextResponse.json({ message: "User registered." });
}