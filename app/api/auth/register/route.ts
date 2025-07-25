import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";

export async function POST(req: Request) {
  const {
    name,
    phoneNumber,
    email,
    password,
    age,
    gender,
  } = await req.json();

  await connectMongoose();

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