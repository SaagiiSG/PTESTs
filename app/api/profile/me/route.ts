import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User, { IUser } from "@/app/models/user";

export async function GET(req: Request) {
  const session = await auth();
  console.log("SESSION:", session);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { message: "Not logged in." },
      { status: 401 }
    );
  }

  

  await connectMongoose();

  const user = await User.findById(session.user.id).lean() as IUser | null;
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
    dateOfBirth: user.dateOfBirth,
    education: user.education,
    family: user.family,
    position: user.position,
    isAdmin: user.isAdmin || false,
    purchasedCourses: user.purchasedCourses || [],
  });
}