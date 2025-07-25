import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Not logged in." },
      { status: 401 }
    );
  }

  const data = await req.json();

  await connectMongoose();

  const user = await User.findByIdAndUpdate(
    session.user.id,
    {
      name: data.name,
      email: data.email,
      age: data.age,
      gender: data.gender,
    },
    { new: true }
  ).lean();

  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    age: user.age,
    gender: user.gender,
  });
}
