import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import User from "@/app/models/user";
import Course from "@/app/models/course";
import Test from "@/app/models/tests";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: "Not logged in." },
        { status: 401 }
      );
    }
    
    await connectMongoose();
  
  // Get user with populated purchased courses and tests
  const user = await User.findById(session.user.id)
    .populate('purchasedCourses')
    .populate('purchasedTests')
    .lean();
  
  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }
  
  // Format purchased courses
  const purchasedCourses = (user.purchasedCourses || []).map((course: any) => ({
    course,
    purchasedAt: new Date() // Since we don't store purchase date in user model, use current date
  }));
  
  // Format purchased tests
  const purchasedTests = (user.purchasedTests || []).map((test: any) => ({
    test,
    purchasedAt: new Date() // Since we don't store purchase date in user model, use current date
  }));
  
  return NextResponse.json({ 
    courses: purchasedCourses,
    tests: purchasedTests
  });
  } catch (error) {
    console.error('Error in purchased-courses API:', error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
} 