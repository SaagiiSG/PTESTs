import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { safeConnectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  const { phoneNumber, password } = await req.json();

  const connection = await safeConnectMongoose();
  if (!connection) {
    return NextResponse.json(
      { message: "Database connection failed." },
      { status: 500 }
    );
  }

  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json(
      { message: "Invalid credentials." },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    { userId: user._id, phoneNumber: user.phoneNumber },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const res = NextResponse.json({ message: "Login successful." });

  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: false, // set to true in production
    sameSite: "lax",
    path: "/",
  });

  return res;
}